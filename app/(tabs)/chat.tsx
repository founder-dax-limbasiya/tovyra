import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ActionButton, Card, Notice, Page, Tag } from "../../components/ui";
import { theme } from "../../constants/theme";

export default function ChatScreen() {
  const params = useLocalSearchParams<{ draft?: string }>();
  const incoming = typeof params.draft === "string" ? params.draft : "";
  const [draft, setDraft] = useState(incoming);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (incoming) setDraft(incoming);
  }, [incoming]);

  const prepareMessage = () => {
    if (!draft.trim()) return;
    setNotice("Your text is still on this screen. No model is connected, so nothing has been sent.");
  };

  return (
    <Page eyebrow="CONVERSATION SPACE" title="Chat" subtitle="A focused place to think with your personal assistant.">
      <View style={styles.chatHeader}>
        <View style={styles.assistantOrb}><Ionicons name="sparkles" size={23} color={theme.colors.accent} /></View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={styles.assistantTitle}>OTHRI Assistant</Text>
          <Text style={styles.assistantSubtitle}>Local interface preview</Text>
        </View>
        <Tag label="OFFLINE" tone="warning" />
      </View>

      <Card style={styles.welcome}>
        <Text style={styles.welcomeTitle}>What’s on your mind?</Text>
        <Text style={styles.welcomeBody}>Use this space to shape an idea, plan a project or prepare a task. OTHRI will not pretend to answer until a real model provider is configured.</Text>
        <View style={styles.suggestion}><Text style={styles.suggestionText}>“Help me organise my week”</Text></View>
        <View style={styles.suggestion}><Text style={styles.suggestionText}>“Break this project into steps”</Text></View>
        <View style={styles.suggestion}><Text style={styles.suggestionText}>“Remember a preference I choose”</Text></View>
      </Card>

      <Card style={styles.composer}>
        <Text style={styles.composerLabel}>MESSAGE DRAFT</Text>
        <TextInput
          value={draft}
          onChangeText={(value) => { setDraft(value); setNotice(""); }}
          placeholder="Write a message..."
          placeholderTextColor={theme.colors.faint}
          multiline
          textAlignVertical="top"
          style={styles.input}
        />
        <View style={styles.composerFooter}>
          <Text style={styles.footerHint}>Not sent until a provider is connected</Text>
          <Pressable onPress={prepareMessage} style={({ pressed }) => [styles.sendButton, pressed && { opacity: 0.75 }]}>
            <Ionicons name="arrow-up" size={18} color={theme.colors.background} />
          </Pressable>
        </View>
      </Card>
      {notice ? <Notice title="Draft kept locally in this screen" detail={notice} icon="information-circle-outline" /> : null}
      <ActionButton title="Provider setup" secondary icon="link-outline" onPress={() => router.push("/(tabs)/settings")} />
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
  composer: { gap: 10 },
  composerLabel: { color: theme.colors.muted, fontSize: 9, fontWeight: "800", letterSpacing: 1.4 },
  input: { minHeight: 116, color: theme.colors.text, fontSize: 14, lineHeight: 21 },
  composerFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  footerHint: { color: theme.colors.faint, fontSize: 9, flex: 1, paddingRight: 10 },
  sendButton: { width: 39, height: 39, borderRadius: 14, backgroundColor: theme.colors.accent, alignItems: "center", justifyContent: "center" },
});
