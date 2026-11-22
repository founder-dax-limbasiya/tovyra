import { useCallback, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ActionButton, Card, Notice, Page, Tag } from "../../components/ui";
import { theme } from "../../constants/theme";
import { loadProviderConfig, loadProviderSummary, type ProviderSummary } from "../../lib/providers/config";
import {
  createAssistantResponse,
  type ChatTurn,
  type ModelToolCall,
} from "../../lib/providers/openai-compatible";
import { executeApprovedLocalTool, isSupportedLocalTool } from "../../lib/providers/tool-registry";
import { recordActivity } from "../../lib/storage/activity";

interface ChatMessage extends ChatTurn {
  id: string;
}

interface PendingApproval {
  call: ModelToolCall;
  status: "pending" | "approved" | "rejected" | "failed";
  result?: string;
}

function createMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toolTitle(name: string): string {
  if (name === "create_task") return "Create a task";
  if (name === "save_memory") return "Save a memory";
  return name;
}

function readableToolResult(content: string | null): string {
  if (!content) return "";
  try {
    const parsed = JSON.parse(content) as { result?: unknown; error?: unknown };
    if (typeof parsed.result === "string") return parsed.result;
    if (typeof parsed.error === "string") return parsed.error;
  } catch {
    // Display non-JSON tool output as received.
  }
  return content;
}

function prettyToolArguments(call: ModelToolCall): string {
  try {
    return JSON.stringify(JSON.parse(call.function.arguments), null, 2);
  } catch {
    return call.function.arguments.slice(0, 1200);
  }
}

export default function ChatScreen() {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [provider, setProvider] = useState<ProviderSummary | null>(null);
  const [providerLoading, setProviderLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [approvalBusy, setApprovalBusy] = useState(false);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setProviderLoading(true);
      void loadProviderSummary()
        .then((saved) => { if (active) setProvider(saved); })
        .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Could not read provider settings."); })
        .finally(() => { if (active) setProviderLoading(false); });
      return () => { active = false; };
    }, [])
  );

  const runModelTurn = async (config: NonNullable<Awaited<ReturnType<typeof loadProviderConfig>>>, conversation: ChatTurn[]) => {
    setBusy(true);
    setError("");
    try {
      const response = await createAssistantResponse(config, conversation);
      if (response.toolCalls.length > 0) {
        setMessages((current) => [
          ...current,
          {
            id: createMessageId(),
            role: "assistant",
            content: response.content,
            toolCalls: response.toolCalls,
          },
        ]);
        setPendingApprovals(response.toolCalls.map((call) => ({ call, status: "pending" })));
      } else {
        setMessages((current) => [
          ...current,
          { id: createMessageId(), role: "assistant", content: response.content },
        ]);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The model request failed.");
    } finally {
      setBusy(false);
    }
  };

  const send = async () => {
    const text = draft.trim();
    if (!text || busy || approvalBusy || pendingApprovals.length > 0) return;

    setError("");
    setNotice("");

    let config: Awaited<ReturnType<typeof loadProviderConfig>>;
    try {
      config = await loadProviderConfig();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not read provider settings.");
      return;
    }

    if (!config) {
      setNotice("Set up a model provider first. Your draft has not been sent.");
      router.push("/(tabs)/settings");
      return;
    }

    const userMessage: ChatMessage = { id: createMessageId(), role: "user", content: text };
    const nextConversation: ChatTurn[] = [
      ...messages.map(({ id: _id, ...turn }) => turn),
      { role: "user", content: text },
    ];

    setMessages((current) => [...current, userMessage]);
    setDraft("");
    await runModelTurn(config, nextConversation);
  };

  const resolveApproval = async (callId: string, approved: boolean) => {
    if (approvalBusy || busy) return;
    const target = pendingApprovals.find((item) => item.call.id === callId && item.status === "pending");
    if (!target) return;

    setApprovalBusy(true);
    setError("");

    let status: PendingApproval["status"] = approved ? "approved" : "rejected";
    let result: string;

    if (approved) {
      if (!isSupportedLocalTool(target.call)) {
        status = "failed";
        result = JSON.stringify({ ok: false, error: "This tool is not allowed in OTHRI." });
      } else {
        try {
          result = await executeApprovedLocalTool(target.call);
          try {
            await recordActivity("tool_approved", "Local action approved", `Approved ${target.call.function.name} after reviewing its arguments.`);
          } catch {
            // The approved local operation is more important than optional audit logging.
          }
        } catch (cause) {
          status = "failed";
          result = JSON.stringify({
            ok: false,
            error: cause instanceof Error ? cause.message : "The local action failed.",
          });
          try {
            await recordActivity("tool_failed", "Local action failed", `Execution of ${target.call.function.name} failed after approval.`);
          } catch {
            // Keep the execution error visible even if the audit write fails.
          }
        }
      }
    } else {
      result = JSON.stringify({ ok: false, error: "The user declined this action. Do not claim it was completed." });
      try {
        await recordActivity("tool_rejected", "Local action declined", `Declined ${target.call.function.name}.`);
      } catch {
        // The rejection result still goes back to the model.
      }
    }

    const updated = pendingApprovals.map((item) =>
      item.call.id === callId ? { ...item, status, result } : item
    );
    setPendingApprovals(updated);

    if (updated.every((item) => item.status !== "pending")) {
      const toolMessages: ChatMessage[] = updated.map((item) => ({
        id: createMessageId(),
        role: "tool",
        name: item.call.function.name,
        toolCallId: item.call.id,
        content: item.result ?? JSON.stringify({ ok: false, error: "No tool result was recorded." }),
      }));
      setMessages((current) => [...current, ...toolMessages]);
      setPendingApprovals([]);

      try {
        const config = await loadProviderConfig();
        if (config) {
          const nextConversation: ChatTurn[] = [
            ...messages.map(({ id: _id, ...turn }) => turn),
            ...toolMessages.map(({ id: _id, ...turn }) => turn),
          ];
          await runModelTurn(config, nextConversation);
        } else {
          setError("The local action was handled, but the model connection was removed before OTHRI could continue.");
        }
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Could not continue the conversation.");
      }
    }

    setApprovalBusy(false);
  };

  const clearConversation = () => {
    if (busy || approvalBusy || pendingApprovals.length > 0) return;
    setMessages([]);
    setError("");
    setNotice("This conversation was cleared from the current screen. Chat history is not stored on disk.");
  };

  return (
    <Page eyebrow="CONVERSATION SPACE" title="Chat" subtitle="A direct connection to the model endpoint you choose.">
      <View style={styles.chatHeader}>
        <View style={styles.assistantOrb}><Ionicons name="sparkles" size={23} color={theme.colors.accent} /></View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={styles.assistantTitle}>OTHRI Assistant</Text>
          <Text style={styles.assistantSubtitle}>{provider ? provider.model : "No model configured"}</Text>
        </View>
        <Tag label={providerLoading ? "LOADING" : provider ? "BYOK READY" : "OFFLINE"} tone={provider ? "accent" : "warning"} />
      </View>

      {!provider ? (
        <Notice title="Connect your own model" detail="Configure an OpenAI-compatible endpoint in Settings. A self-hosted Ollama server can be used on your private network. No prompt is sent before setup." icon="link-outline" />
      ) : null}

      {messages.length === 0 ? (
        <Card style={styles.welcome}>
          <Text style={styles.welcomeTitle}>What’s on your mind?</Text>
          <Text style={styles.welcomeBody}>Ask a question, work through an idea or prepare a plan. OTHRI sends your message only to the endpoint you saved in Settings.</Text>
          <Pressable onPress={() => setDraft("Help me organise my week into manageable priorities.")} style={styles.suggestion}>
            <Text style={styles.suggestionText}>“Help me organise my week”</Text>
          </Pressable>
          <Pressable onPress={() => setDraft("Add a task to review my project plan tomorrow.")} style={styles.suggestion}>
            <Text style={styles.suggestionText}>“Add a task to my list”</Text>
          </Pressable>
          <Pressable onPress={() => setDraft("Remember that I prefer concise project updates.")} style={styles.suggestion}>
            <Text style={styles.suggestionText}>“Remember a preference”</Text>
          </Pressable>
        </Card>
      ) : (
        <View style={styles.transcript}>
          {messages.map((message) => (
            <View key={message.id} style={[styles.messageRow, message.role === "user" && styles.userMessageRow]}>
              <View style={[styles.messageBubble, message.role === "user" ? styles.userBubble : styles.assistantBubble, message.role === "tool" && styles.toolBubble]}>
                <Text style={styles.messageRole}>{message.role === "user" ? "YOU" : message.role === "tool" ? "ACTION RESULT" : "OTHRI"}</Text>
                <Text selectable style={styles.messageText}>
                  {message.role === "tool" ? readableToolResult(message.content) : message.content || (message.toolCalls?.length ? "I have proposed an action. Please review it below." : "")}
                </Text>
              </View>
            </View>
          ))}
          {busy ? (
            <View style={styles.thinking}><ActivityIndicator size="small" color={theme.colors.accent} /><Text style={styles.thinkingText}>Waiting for your model...</Text></View>
          ) : null}
          {!busy && pendingApprovals.length === 0 ? (
            <Pressable onPress={clearConversation} style={styles.clearConversation}>
              <Ionicons name="trash-outline" size={13} color={theme.colors.faint} />
              <Text style={styles.clearText}>Clear conversation</Text>
            </Pressable>
          ) : null}
        </View>
      )}

      {pendingApprovals.map((item) => (
        <Card key={item.call.id} style={styles.approvalCard}>
          <View style={styles.approvalTop}>
            <Tag label="YOUR APPROVAL REQUIRED" tone="warning" />
            <Ionicons name="shield-checkmark-outline" size={18} color={theme.colors.orange} />
          </View>
          <Text style={styles.approvalTitle}>{toolTitle(item.call.function.name)}</Text>
          <Text style={styles.approvalDescription}>
            {item.call.function.name === "create_task"
              ? "This will add a task to local storage on this phone."
              : item.call.function.name === "save_memory"
                ? "This will save a memory entry in local storage on this phone."
                : "This tool is not in OTHRI's allowlist and cannot be executed."}
          </Text>
          <View style={styles.argumentsBox}>
            <Text style={styles.argumentsLabel}>EXACT REQUESTED ARGUMENTS</Text>
            <Text selectable style={styles.argumentsText}>{prettyToolArguments(item.call)}</Text>
          </View>
          {item.status === "pending" ? (
            <View style={styles.approvalActions}>
              <View style={{ flex: 1 }}>
                <ActionButton title={approvalBusy ? "Please wait..." : "Approve"} icon="checkmark" onPress={() => { void resolveApproval(item.call.id, true); }} disabled={approvalBusy || busy || !isSupportedLocalTool(item.call)} />
              </View>
              <View style={{ flex: 1 }}>
                <ActionButton title="Reject" secondary icon="close" onPress={() => { void resolveApproval(item.call.id, false); }} disabled={approvalBusy || busy} />
              </View>
            </View>
          ) : (
            <Tag label={item.status.toUpperCase()} tone={item.status === "approved" ? "accent" : "warning"} />
          )}
        </Card>
      ))}

      {messages.length > 0 && pendingApprovals.length > 0 ? (
        <Notice title="Chat paused for approval" detail="The model cannot execute these actions itself. Resolve every request above before the conversation continues." icon="pause-circle-outline" />
      ) : null}

      <Card style={styles.composer}>
        <Text style={styles.composerLabel}>MESSAGE</Text>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder={pendingApprovals.length ? "Resolve pending approvals first..." : "Write a message..."}
          placeholderTextColor={theme.colors.faint}
          multiline
          textAlignVertical="top"
          editable={!busy && !approvalBusy && pendingApprovals.length === 0}
          style={styles.input}
          onSubmitEditing={() => { void send(); }}
        />
        <View style={styles.composerFooter}>
          <Text style={styles.footerHint}>Only approved local actions can change this device</Text>
          <Pressable disabled={!draft.trim() || busy || approvalBusy || pendingApprovals.length > 0} onPress={() => { void send(); }} style={({ pressed }) => [styles.sendButton, (!draft.trim() || busy || approvalBusy || pendingApprovals.length > 0) && styles.sendDisabled, pressed && { opacity: 0.75 }]}>
            {busy ? <ActivityIndicator size="small" color={theme.colors.background} /> : <Ionicons name="arrow-up" size={18} color={theme.colors.background} />}
          </Pressable>
        </View>
      </Card>

      {error ? <Notice title="Conversation error" detail={error} icon="alert-circle-outline" /> : null}
      {notice ? <Notice title="Note" detail={notice} icon="information-circle-outline" /> : null}
      <ActionButton title="Provider settings" secondary icon="settings-outline" onPress={() => router.push("/(tabs)/settings")} />
      <Text style={styles.privacyHint}>Chat history stays in screen memory only. Model prompts are sent to the provider you configured. Tool calls require your approval before local changes.</Text>
    </Page>
  );
}

const styles = StyleSheet.create({
  chatHeader: { flexDirection: "row", alignItems: "center", gap: 11 },
  assistantOrb: { width: 44, height: 44, borderRadius: 16, backgroundColor: theme.colors.accentDark, alignItems: "center", justifyContent: "center" },
  assistantTitle: { color: theme.colors.text, fontSize: 13, fontWeight: "700" },
  assistantSubtitle: { color: theme.colors.muted, fontSize: 10 },
  welcome: { padding: 18 },
  welcomeTitle: { color: theme.colors.text, fontSize: 19, fontWeight: "700" },
  welcomeBody: { color: theme.colors.muted, fontSize: 12, lineHeight: 19 },
  suggestion: { padding: 11, borderRadius: 12, backgroundColor: theme.colors.surfaceSoft },
  suggestionText: { color: theme.colors.blue, fontSize: 11 },
  transcript: { gap: 13 },
  messageRow: { flexDirection: "row", justifyContent: "flex-start" },
  userMessageRow: { justifyContent: "flex-end" },
  messageBubble: { maxWidth: "92%", minWidth: "45%", padding: 13, borderRadius: 16, gap: 7 },
  userBubble: { backgroundColor: theme.colors.surfaceSoft, borderBottomRightRadius: 5 },
  assistantBubble: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderBottomLeftRadius: 5 },
  toolBubble: { backgroundColor: "#132118", borderColor: "#2C4B35" },
  messageRole: { color: theme.colors.faint, fontSize: 8, fontWeight: "800", letterSpacing: 1.1 },
  messageText: { color: theme.colors.text, fontSize: 12, lineHeight: 19 },
  thinking: { flexDirection: "row", alignItems: "center", gap: 9, padding: 8 },
  thinkingText: { color: theme.colors.muted, fontSize: 10 },
  clearConversation: { flexDirection: "row", alignItems: "center", alignSelf: "flex-end", gap: 6, padding: 7 },
  clearText: { color: theme.colors.faint, fontSize: 9 },
  approvalCard: { borderColor: "#6A552E", gap: 11 },
  approvalTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  approvalTitle: { color: theme.colors.text, fontSize: 15, fontWeight: "700" },
  approvalDescription: { color: theme.colors.muted, fontSize: 11, lineHeight: 17 },
  argumentsBox: { padding: 11, backgroundColor: theme.colors.background, borderRadius: 11, borderWidth: 1, borderColor: theme.colors.border, gap: 7 },
  argumentsLabel: { color: theme.colors.faint, fontSize: 8, fontWeight: "800", letterSpacing: 1.1 },
  argumentsText: { color: theme.colors.blue, fontSize: 10, lineHeight: 16, fontFamily: "monospace" },
  approvalActions: { flexDirection: "row", gap: 8 },
  composer: { gap: 10 },
  composerLabel: { color: theme.colors.muted, fontSize: 9, fontWeight: "800", letterSpacing: 1.4 },
  input: { minHeight: 95, maxHeight: 180, color: theme.colors.text, fontSize: 14, lineHeight: 21 },
  composerFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  footerHint: { color: theme.colors.faint, fontSize: 9, flex: 1, paddingRight: 10 },
  sendButton: { width: 39, height: 39, borderRadius: 14, backgroundColor: theme.colors.accent, alignItems: "center", justifyContent: "center" },
  sendDisabled: { opacity: 0.4 },
  privacyHint: { color: theme.colors.faint, fontSize: 9, lineHeight: 14, textAlign: "center", paddingHorizontal: 12 },
});
