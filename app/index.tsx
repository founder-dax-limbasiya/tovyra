import { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from "react-native";

const COLORS = {
  bg: "#090B10",
  panel: "#121722",
  panel2: "#171F2C",
  line: "#263142",
  text: "#F4F7FB",
  muted: "#929EAE",
  accent: "#B8F36B",
  blue: "#8CB9FF",
};

type Tab = "Home" | "Chat" | "Agents" | "Memory";

export default function HomeScreen() {
  const [tab, setTab] = useState<Tab>("Home");
  const [prompt, setPrompt] = useState("");

  const submitPrompt = () => {
    if (!prompt.trim()) return;
    setTab("Chat");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topbar}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}><View style={styles.brandDot} /></View>
          <Text style={styles.brand}>OTHRI</Text>
        </View>
        <Pressable style={styles.avatar} accessibilityLabel="Profile and settings">
          <Text style={styles.avatarText}>O</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {tab === "Home" && (
          <>
            <Text style={styles.eyebrow}>YOUR PERSONAL AI SPACE</Text>
            <Text style={styles.heading}>A little more{ "\n" }<Text style={styles.headingAccent}>you, amplified.</Text></Text>
            <Text style={styles.subheading}>Think, plan and get things moving — with an AI that works on your terms.</Text>

            <View style={styles.promptCard}>
              <Text style={styles.cardLabel}>START WITH A THOUGHT</Text>
              <TextInput
                value={prompt}
                onChangeText={setPrompt}
                placeholder="What would you like to do?"
                placeholderTextColor={COLORS.muted}
                style={styles.promptInput}
                multiline
                returnKeyType="send"
                onSubmitEditing={submitPrompt}
              />
              <View style={styles.promptFooter}>
                <Text style={styles.hint}>Your workspace starts here</Text>
                <Pressable onPress={submitPrompt} style={styles.sendButton}>
                  <Text style={styles.sendText}>Continue ↗</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your workspace</Text>
              <Text style={styles.sectionMeta}>GET STARTED</Text>
            </View>
            <View style={styles.grid}>
              <FeatureCard icon="✳" title="Agents" detail="Specialists for your tasks" tint={COLORS.accent} onPress={() => setTab("Agents")} />
              <FeatureCard icon="◉" title="Memory" detail="Context you can manage" tint={COLORS.blue} onPress={() => setTab("Memory")} />
              <FeatureCard icon="↗" title="Routines" detail="Repeatable workflows" tint="#D5A7FF" onPress={() => setTab("Agents")} />
              <FeatureCard icon="⌁" title="Activity" detail="See what has happened" tint="#FFBE85" onPress={() => setTab("Chat")} />
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Built around your control</Text>
            </View>
            <View style={styles.controlCard}>
              <View style={styles.controlIcon}><Text style={{ color: COLORS.accent, fontSize: 19 }}>✓</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.controlTitle}>Nothing acts behind your back</Text>
                <Text style={styles.controlBody}>External actions will ask for your approval before they happen.</Text>
              </View>
            </View>
          </>
        )}

        {tab === "Chat" && <EmptyState title="Your conversations" body="The chat workspace is being connected to the OTHRI orchestration backend. No fake AI responses here." />}
        {tab === "Agents" && <EmptyState title="Your agents" body="Agent profiles, tools, run controls and approval scopes will live here. Integrations are not connected yet." />}
        {tab === "Memory" && <EmptyState title="Your memory" body="A transparent memory space is planned here, with controls to inspect, edit and delete stored context." />}
      </ScrollView>

      <View style={styles.nav}>
        <NavButton label="Home" icon="⌂" active={tab === "Home"} onPress={() => setTab("Home")} />
        <NavButton label="Chat" icon="◌" active={tab === "Chat"} onPress={() => setTab("Chat")} />
        <NavButton label="Agents" icon="✳" active={tab === "Agents"} onPress={() => setTab("Agents")} />
        <NavButton label="Memory" icon="◉" active={tab === "Memory"} onPress={() => setTab("Memory")} />
      </View>
    </SafeAreaView>
  );
}

function FeatureCard({ icon, title, detail, tint, onPress }: { icon: string; title: string; detail: string; tint: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.featureCard, pressed && { opacity: 0.75 }]}>
      <Text style={[styles.featureIcon, { color: tint }]}>{icon}</Text>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDetail}>{detail}</Text>
    </Pressable>
  );
}

function NavButton({ label, icon, active, onPress }: { label: string; icon: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.navButton}>
      <Text style={[styles.navIcon, { color: active ? COLORS.accent : COLORS.muted }]}>{icon}</Text>
      <Text style={[styles.navLabel, { color: active ? COLORS.text : COLORS.muted }]}>{label}</Text>
    </Pressable>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyOrb}><Text style={styles.orbGlyph}>✳</Text></View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
      <View style={styles.comingSoon}><Text style={styles.comingSoonText}>FOUNDATION IN PROGRESS</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  topbar: { height: 62, paddingHorizontal: 22, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandMark: { width: 28, height: 28, borderRadius: 9, backgroundColor: COLORS.accent, alignItems: "center", justifyContent: "center" },
  brandDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: COLORS.bg },
  brand: { color: COLORS.text, fontSize: 15, fontWeight: "800", letterSpacing: 3 },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.panel2, borderWidth: 1, borderColor: COLORS.line, alignItems: "center", justifyContent: "center" },
  avatarText: { color: COLORS.text, fontWeight: "700" },
  content: { paddingHorizontal: 22, paddingTop: 22, paddingBottom: 34 },
  eyebrow: { color: COLORS.accent, fontSize: 10, fontWeight: "800", letterSpacing: 2.1, marginBottom: 16 },
  heading: { color: COLORS.text, fontSize: 39, lineHeight: 44, fontWeight: "700", letterSpacing: -1.6 },
  headingAccent: { color: COLORS.accent },
  subheading: { color: COLORS.muted, fontSize: 14, lineHeight: 21, marginTop: 13, maxWidth: 310 },
  promptCard: { backgroundColor: COLORS.panel, borderColor: COLORS.line, borderWidth: 1, borderRadius: 20, padding: 17, marginTop: 28 },
  cardLabel: { color: COLORS.muted, fontSize: 9, fontWeight: "800", letterSpacing: 1.5 },
  promptInput: { color: COLORS.text, fontSize: 16, minHeight: 64, marginTop: 10, textAlignVertical: "top" },
  promptFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  hint: { color: COLORS.muted, fontSize: 10 },
  sendButton: { backgroundColor: COLORS.accent, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  sendText: { color: COLORS.bg, fontWeight: "800", fontSize: 11 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 30, marginBottom: 13 },
  sectionTitle: { color: COLORS.text, fontSize: 16, fontWeight: "700" },
  sectionMeta: { color: COLORS.muted, fontSize: 9, letterSpacing: 1.2, fontWeight: "700" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 11 },
  featureCard: { width: "48%", flexGrow: 1, minHeight: 116, backgroundColor: COLORS.panel, borderColor: COLORS.line, borderWidth: 1, borderRadius: 17, padding: 15 },
  featureIcon: { fontSize: 21, marginBottom: 11 },
  featureTitle: { color: COLORS.text, fontSize: 14, fontWeight: "700" },
  featureDetail: { color: COLORS.muted, fontSize: 10, marginTop: 5 },
  controlCard: { flexDirection: "row", gap: 12, alignItems: "center", padding: 15, borderRadius: 17, backgroundColor: COLORS.panel, borderWidth: 1, borderColor: COLORS.line },
  controlIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: "#26351E", alignItems: "center", justifyContent: "center" },
  controlTitle: { color: COLORS.text, fontSize: 12, fontWeight: "700" },
  controlBody: { color: COLORS.muted, fontSize: 10, lineHeight: 15, marginTop: 4 },
  nav: { height: 72, borderTopWidth: 1, borderTopColor: COLORS.line, backgroundColor: COLORS.bg, flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingBottom: 4 },
  navButton: { minWidth: 60, alignItems: "center", justifyContent: "center", gap: 4 },
  navIcon: { fontSize: 20 },
  navLabel: { fontSize: 9, fontWeight: "600" },
  emptyState: { flex: 1, minHeight: 430, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  emptyOrb: { width: 76, height: 76, borderRadius: 26, backgroundColor: "#1E2B1A", alignItems: "center", justifyContent: "center", marginBottom: 22 },
  orbGlyph: { color: COLORS.accent, fontSize: 32 },
  emptyTitle: { color: COLORS.text, fontSize: 24, fontWeight: "700", textAlign: "center" },
  emptyBody: { color: COLORS.muted, fontSize: 13, lineHeight: 20, textAlign: "center", marginTop: 10, maxWidth: 300 },
  comingSoon: { borderWidth: 1, borderColor: COLORS.line, borderRadius: 30, paddingHorizontal: 13, paddingVertical: 8, marginTop: 22 },
  comingSoonText: { color: COLORS.accent, fontSize: 9, fontWeight: "800", letterSpacing: 1.2 }
});
