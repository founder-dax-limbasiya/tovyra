import { useState } from "react";
import { router } from "expo-router";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ActionButton, Card, Notice, Page, SectionTitle, Tag } from "../../components/ui";
import { theme } from "../../constants/theme";

const agents = [
  { id: "planner", name: "Project Planner", category: "PRODUCTIVITY", icon: "git-branch-outline" as const, description: "Turn a goal into milestones, tasks and a clear next step.", detail: "A planning agent should ask about your deadline and constraints, then draft a plan for your approval." },
  { id: "researcher", name: "Research Partner", category: "RESEARCH", icon: "search-outline" as const, description: "Organise sources, compare evidence and identify open questions.", detail: "A research agent should cite sources and distinguish facts from assumptions." },
  { id: "writer", name: "Writing Partner", category: "CREATION", icon: "create-outline" as const, description: "Help structure briefs, drafts and messages in your chosen tone.", detail: "A writing agent should preserve your intent and let you review every draft." },
  { id: "organiser", name: "Personal Organiser", category: "PERSONAL", icon: "calendar-clear-outline" as const, description: "Prepare checklists and routines around your priorities.", detail: "An organiser should never create calendar events or send messages without permission." },
];

export default function AgentsScreen() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <Page eyebrow="YOUR DIGITAL TEAM" title="Agents" subtitle="Focused assistants for different kinds of work. Each agent will run through a permission-controlled backend.">
      <Notice title="Agent execution is not connected" detail="These are product templates, not running agents. The interface will only show a run state after a real backend confirms it." icon="shield-checkmark-outline" />
      <SectionTitle title="Agent catalogue" detail="4 CONCEPTS" />
      {agents.map((agent) => (
        <Pressable key={agent.id} onPress={() => setSelected(selected === agent.id ? null : agent.id)} style={({ pressed }) => [styles.agentCard, selected === agent.id && styles.agentSelected, pressed && { opacity: 0.8 }]}>
          <View style={styles.agentTop}>
            <View style={styles.agentIcon}><Ionicons name={agent.icon} size={20} color={theme.colors.accent} /></View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.agentName}>{agent.name}</Text>
              <Text style={styles.agentCategory}>{agent.category}</Text>
            </View>
            <Tag label="TEMPLATE" tone="warning" />
          </View>
          <Text style={styles.agentDescription}>{agent.description}</Text>
          {selected === agent.id ? (
            <View style={styles.expanded}>
              <Text style={styles.expandedText}>{agent.detail}</Text>
              <Text style={styles.unavailable}>Execution becomes available after model and tool connections are implemented.</Text>
            </View>
          ) : null}
          <View style={styles.cardFooter}>
            <Text style={styles.learnMore}>{selected === agent.id ? "Show less" : "View details"}</Text>
            <Ionicons name={selected === agent.id ? "chevron-up" : "chevron-down"} size={15} color={theme.colors.blue} />
          </View>
        </Pressable>
      ))}
      <Card>
        <Text style={styles.bottomTitle}>Your agents, your permissions</Text>
        <Text style={styles.bottomCopy}>When tool execution is added, each agent will receive only the permissions you grant. Sensitive actions will require a separate approval.</Text>
        <ActionButton title="Review security settings" secondary icon="shield-checkmark-outline" onPress={() => router.push("/(tabs)/settings")} />
      </Card>
    </Page>
  );
}

const styles = StyleSheet.create({
  agentCard: { borderRadius: 18, padding: 15, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, gap: 11 },
  agentSelected: { borderColor: theme.colors.accent },
  agentTop: { flexDirection: "row", alignItems: "center", gap: 11 },
  agentIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: theme.colors.surfaceSoft, alignItems: "center", justifyContent: "center" },
  agentName: { color: theme.colors.text, fontSize: 13, fontWeight: "700" },
  agentCategory: { color: theme.colors.faint, fontSize: 9, fontWeight: "800", letterSpacing: 1.2 },
  agentDescription: { color: theme.colors.muted, fontSize: 11, lineHeight: 17 },
  expanded: { borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 10, gap: 7 },
  expandedText: { color: theme.colors.text, fontSize: 11, lineHeight: 17 },
  unavailable: { color: theme.colors.orange, fontSize: 10, lineHeight: 15 },
  cardFooter: { flexDirection: "row", alignItems: "center", gap: 5 },
  learnMore: { color: theme.colors.blue, fontSize: 10, fontWeight: "700" },
  bottomTitle: { color: theme.colors.text, fontSize: 13, fontWeight: "700" },
  bottomCopy: { color: theme.colors.muted, fontSize: 11, lineHeight: 17 },
});
