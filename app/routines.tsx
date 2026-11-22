import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ActionButton, Notice, Page, Tag } from "../components/ui";
import { theme } from "../constants/theme";

const templates = [
  { id: "morning", title: "Morning briefing", icon: "sunny-outline" as const, description: "Collect today's priorities, calendar items and reminders into one review.", steps: ["Read approved calendar sources", "Summarise priorities", "Ask before creating or changing events"] },
  { id: "weekly", title: "Weekly reset", icon: "calendar-outline" as const, description: "Review open tasks and prepare a plan for the week ahead.", steps: ["Review task sources", "Group work by priority", "Present a draft plan for approval"] },
  { id: "research", title: "Research digest", icon: "newspaper-outline" as const, description: "Collect selected sources and organise key findings.", steps: ["Use explicitly selected sources", "Summarise and cite evidence", "Flag uncertain or missing information"] },
];

export default function RoutinesScreen() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <Page eyebrow="REPEATABLE WORKFLOWS" title="Routines" subtitle="Build repeatable processes that stay visible and under your control.">
      <Notice title="Scheduling engine not connected" detail="These are workflow concepts only. Nothing is scheduled, running in the background or accessing your accounts." icon="time-outline" />
      {templates.map((item) => (
        <Pressable key={item.id} onPress={() => setExpanded(expanded === item.id ? null : item.id)} style={({ pressed }) => [styles.routineCard, pressed && { opacity: 0.8 }]}>
          <View style={styles.routineHeader}>
            <View style={styles.routineIcon}><Ionicons name={item.icon} size={20} color={theme.colors.accent} /></View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.routineTitle}>{item.title}</Text>
              <Text style={styles.routineDesc}>{item.description}</Text>
            </View>
            <Tag label="DRAFT" tone="warning" />
          </View>
          {expanded === item.id ? (
            <View style={styles.steps}>
              <Text style={styles.stepsHeading}>PROPOSED STEPS</Text>
              {item.steps.map((step, index) => (
                <View key={step} style={styles.stepRow}>
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
              <Text style={styles.notActive}>This routine is not active and cannot be scheduled yet.</Text>
            </View>
          ) : null}
          <View style={styles.expandFooter}>
            <Text style={styles.expandText}>{expanded === item.id ? "Hide details" : "View steps"}</Text>
            <Ionicons name={expanded === item.id ? "chevron-up" : "chevron-down"} size={15} color={theme.colors.blue} />
          </View>
        </Pressable>
      ))}
      <ActionButton title="Back to home" secondary icon="home-outline" onPress={() => router.replace("/(tabs)")} />
    </Page>
  );
}

const styles = StyleSheet.create({
  routineCard: { padding: 15, borderRadius: 18, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, gap: 12 },
  routineHeader: { flexDirection: "row", alignItems: "flex-start", gap: 11 },
  routineIcon: { width: 41, height: 41, borderRadius: 14, backgroundColor: theme.colors.surfaceSoft, alignItems: "center", justifyContent: "center" },
  routineTitle: { color: theme.colors.text, fontSize: 13, fontWeight: "700" },
  routineDesc: { color: theme.colors.muted, fontSize: 10, lineHeight: 16 },
  steps: { borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 11, gap: 10 },
  stepsHeading: { color: theme.colors.faint, fontSize: 9, fontWeight: "800", letterSpacing: 1.2 },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  stepNumber: { width: 22, height: 22, borderRadius: 8, backgroundColor: theme.colors.surfaceSoft, color: theme.colors.accent, textAlign: "center", textAlignVertical: "center", fontSize: 10, fontWeight: "800" },
  stepText: { flex: 1, color: theme.colors.text, fontSize: 10, lineHeight: 15 },
  notActive: { color: theme.colors.orange, fontSize: 10, lineHeight: 15 },
  expandFooter: { flexDirection: "row", alignItems: "center", gap: 5 },
  expandText: { color: theme.colors.blue, fontSize: 10, fontWeight: "700" },
});
