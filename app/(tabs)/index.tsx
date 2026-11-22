import { useState } from "react";
import { router } from "expo-router";
import { Pressable, Text, TextInput, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ActionButton, Card, Eyebrow, Notice, Page, SectionTitle, Tag } from "../../components/ui";
import { theme } from "../../constants/theme";

const features = [
  { icon: "sparkles-outline" as const, title: "Agent workspace", detail: "Explore specialist agents", color: theme.colors.accent, route: "/(tabs)/agents" as const },
  { icon: "albums-outline" as const, title: "Personal memory", detail: "Designed for transparent context", color: theme.colors.blue, route: "/(tabs)/memory" as const },
  { icon: "repeat-outline" as const, title: "Routines", detail: "Plan repeatable workflows", color: theme.colors.purple, route: "/routines" as const },
  { icon: "pulse-outline" as const, title: "Activity", detail: "Review events and task states", color: theme.colors.orange, route: "/activity" as const },
];

export default function HomeScreen() {
  const [prompt, setPrompt] = useState("");

  const openChat = () => {
    const value = prompt.trim();
    if (!value) {
      router.push("/(tabs)/chat");
      return;
    }
    router.push({ pathname: "/(tabs)/chat", params: { draft: value } });
  };

  return (
    <Page eyebrow="YOUR PERSONAL AI SPACE" title="A little more you, amplified." subtitle="Think, plan and get things moving — with an AI that works on your terms.">
      <Card style={styles.promptCard}>
        <View style={styles.promptHeading}>
          <Eyebrow>START WITH A THOUGHT</Eyebrow>
          <Tag label="PRIVATE WORKSPACE" tone="accent" />
        </View>
        <TextInput
          value={prompt}
          onChangeText={setPrompt}
          placeholder="What would you like to work on?"
          placeholderTextColor={theme.colors.faint}
          style={styles.promptInput}
          multiline
          textAlignVertical="top"
        />
        <ActionButton title="Open chat" icon="arrow-up" onPress={openChat} />
      </Card>

      <View style={styles.sectionBlock}>
        <SectionTitle title="Your workspace" detail="EXPLORE" />
        <View style={styles.grid}>
          {features.map((item) => (
            <Pressable key={item.title} onPress={() => router.push(item.route)} style={({ pressed }) => [styles.feature, pressed && { opacity: 0.75 }]}>
              <View style={[styles.featureIcon, { backgroundColor: theme.colors.surfaceSoft }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={styles.featureTitle}>{item.title}</Text>
              <Text style={styles.featureDetail}>{item.detail}</Text>
              <Ionicons name="arrow-up-right" size={15} color={theme.colors.faint} style={styles.featureArrow} />
            </Pressable>
          ))}
        </View>
      </View>

      <SectionTitle title="Built around your control" />
      <Notice title="Nothing acts behind your back" detail="External or irreversible actions are designed to require a clear, scoped approval before execution." icon="shield-checkmark-outline" />
      <Card style={styles.statusCard}>
        <View style={styles.statusTop}>
          <Text style={styles.statusTitle}>Foundation status</Text>
          <Tag label="EARLY BUILD" tone="warning" />
        </View>
        <Text style={styles.statusCopy}>The mobile interface is taking shape. Model connections, sign-in, persistent memory and real tool execution are not connected yet.</Text>
        <ActionButton title="Review app settings" secondary icon="settings-outline" onPress={() => router.push("/(tabs)/settings")} />
      </Card>
    </Page>
  );
}

const styles = StyleSheet.create({
  promptCard: { padding: 17 },
  promptHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  promptInput: { minHeight: 88, color: theme.colors.text, fontSize: 15, lineHeight: 22, paddingTop: 12 },
  sectionBlock: { gap: 13 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 11 },
  feature: { width: "48%", flexGrow: 1, minHeight: 145, padding: 14, borderRadius: 17, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, gap: 8 },
  featureIcon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  featureTitle: { color: theme.colors.text, fontSize: 12, fontWeight: "750" },
  featureDetail: { color: theme.colors.muted, fontSize: 10, lineHeight: 15, maxWidth: 130 },
  featureArrow: { position: "absolute", right: 13, top: 16 },
  statusCard: { gap: 11 },
  statusTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  statusTitle: { color: theme.colors.text, fontSize: 13, fontWeight: "700" },
  statusCopy: { color: theme.colors.muted, fontSize: 11, lineHeight: 17 },
});
