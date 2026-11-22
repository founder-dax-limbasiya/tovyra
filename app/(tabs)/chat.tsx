import { useCallback, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ActionButton, Card, Notice, Page, Tag } from "../../components/ui";
import { theme } from "../../constants/theme";
import { loadProviderConfig, loadProviderSummary, type ProviderSummary } from "../../lib/providers/config";
import { createAssistantReply, type ChatTurn } from "../../lib/providers/openai-compatible";

interface ChatMessage extends ChatTurn {
  id: string;
}

function createMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function ChatScreen() {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [provider, setProvider] = useState<ProviderSummary | null>(null);
  const [providerLoading, setProviderLoading] = useState(true);
  const [busy, setBusy] = useState(false);
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

  const send = async () => {
    const text = draft.trim();
    if (!text || busy) return;

    setError("");
    setNotice("");

    let config;
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
      ...messages.map(({ role, content }) => ({ role, content })),
      { role: "user", content: text },
    ];

    setMessages((current) => [...current, userMessage]);
    setDraft("");
    setBusy(true);

    try {
      const reply = await createAssistantReply(config, nextConversation);
      setMessages((current) => [...current, { id: createMessageId(), role: "assistant", content: reply }]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The model request failed.");
    } finally {
      setBusy(false);
    }
  };

  const clearConversation = () => {
    if (busy) return;
    setMessages([]);
    setError("");
    setNotice("This conversation was cleared from the current screen. No chat history is stored on disk yet.");
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
        <Notice title="Connect your own model" detail="Configure an OpenAI-compatible endpoint in Settings. You can use a self-hosted Ollama server on your private network. No prompt is sent before setup." icon="link-outline" />
      ) : null}

      {messages.length === 0 ? (
        <Card style={styles.welcome}>
          <Text style={styles.welcomeTitle}>What’s on your mind?</Text>
          <Text style={styles.welcomeBody}>Ask a question, work through an idea or prepare a plan. OTHRI only sends your message to the endpoint you saved in Settings.</Text>
          <Pressable onPress={() => setDraft("Help me organise my week into manageable priorities.")} style={styles.suggestion}>
            <Text style={styles.suggestionText}>“Help me organise my week”</Text>
          </Pressable>
          <Pressable onPress={() => setDraft("Break this project into small, practical steps.")} style={styles.suggestion}>
            <Text style={styles.suggestionText}>“Break this project into steps”</Text>
          </Pressable>
          <Pressable onPress={() => setDraft("Help me think through a new product idea.")} style={styles.suggestion}>
            <Text style={styles.suggestionText}>“Explore a product idea”</Text>
          </Pressable>
        </Card>
      ) : (
        <View style={styles.transcript}>
          {messages.map((message) => (
            <View key={message.id} style={[styles.messageRow, message.role === "user" && styles.userMessageRow]}>
              <View style={[styles.messageBubble, message.role === "user" ? styles.userBubble : styles.assistantBubble]}>
                <Text style={styles.messageRole}>{message.role === "user" ? "YOU" : "OTHRI"}</Text>
                <Text selectable style={styles.messageText}>{message.content}</Text>
              </View>
            </View>
          ))}
          {busy ? (
            <View style={styles.thinking}><ActivityIndicator size="small" color={theme.colors.accent} /><Text style={styles.thinkingText}>Waiting for your model...</Text></View>
          ) : null}
          {!busy ? <Pressable onPress={clearConversation} style={styles.clearConversation}><Ionicons name="trash-outline" size={13} color={theme.colors.faint} /><Text style={styles.clearText}>Clear conversation</Text></Pressable> : null}
        </View>
      )}

      <Card style={styles.composer}>
        <Text style={styles.composerLabel}>MESSAGE</Text>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Write a message..."
          placeholderTextColor={theme.colors.faint}
          multiline
          textAlignVertical="top"
          editable={!busy}
          style={styles.input}
          onSubmitEditing={() => { void send(); }}
        />
        <View style={styles.composerFooter}>
          <Text style={styles.footerHint}>Sent only to your saved provider</Text>
          <Pressable disabled={!draft.trim() || busy} onPress={() => { void send(); }} style={({ pressed }) => [styles.sendButton, (!draft.trim() || busy) && styles.sendDisabled, pressed && { opacity: 0.75 }]}>
            {busy ? <ActivityIndicator size="small" color={theme.colors.background} /> : <Ionicons name="arrow-up" size={18} color={theme.colors.background} />}
          </Pressable>
        </View>
      </Card>

      {error ? <Notice title="Message not completed" detail={error} icon="alert-circle-outline" /> : null}
      {notice ? <Notice title="Note" detail={notice} icon="information-circle-outline" /> : null}
      <ActionButton title="Provider settings" secondary icon="settings-outline" onPress={() => router.push("/(tabs)/settings")} />
      <Text style={styles.privacyHint}>Chat history stays in memory only for this screen session. It is not saved to local storage yet.</Text>
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
  messageRole: { color: theme.colors.faint, fontSize: 8, fontWeight: "800", letterSpacing: 1.1 },
  messageText: { color: theme.colors.text, fontSize: 12, lineHeight: 19 },
  thinking: { flexDirection: "row", alignItems: "center", gap: 9, padding: 8 },
  thinkingText: { color: theme.colors.muted, fontSize: 10 },
  clearConversation: { flexDirection: "row", alignItems: "center", alignSelf: "flex-end", gap: 6, padding: 7 },
  clearText: { color: theme.colors.faint, fontSize: 9 },
  composer: { gap: 10 },
  composerLabel: { color: theme.colors.muted, fontSize: 9, fontWeight: "800", letterSpacing: 1.4 },
  input: { minHeight: 95, maxHeight: 180, color: theme.colors.text, fontSize: 14, lineHeight: 21 },
  composerFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  footerHint: { color: theme.colors.faint, fontSize: 9, flex: 1, paddingRight: 10 },
  sendButton: { width: 39, height: 39, borderRadius: 14, backgroundColor: theme.colors.accent, alignItems: "center", justifyContent: "center" },
  sendDisabled: { opacity: 0.4 },
  privacyHint: { color: theme.colors.faint, fontSize: 9, lineHeight: 14, textAlign: "center", paddingHorizontal: 12 },
});
