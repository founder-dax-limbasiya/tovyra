import { router } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ActionButton, Card, Notice, Page, SectionTitle, Tag, ListRow } from "../components/ui";
import { theme } from "../constants/theme";

const localActions = [
  { icon: "checkmark-done-outline" as const, title: "Create a task", detail: "Add a task to this phone after you approve its exact title and description." },
  { icon: "bookmark-outline" as const, title: "Save a memory", detail: "Save a profile, preference, goal or context entry after you approve its content." },
];

const integrations = [
  { icon: "globe-outline" as const, title: "Browser actions", detail: "Search, open pages and interact with websites" },
  { icon: "folder-open-outline" as const, title: "Files and storage", detail: "Read, write, upload and share files" },
  { icon: "calendar-outline" as const, title: "Calendar and reminders", detail: "Create or change schedules" },
  { icon: "chatbubble-ellipses-outline" as const, title: "Messaging", detail: "Send messages or publish content" },
  { icon: "phone-portrait-outline" as const, title: "Device actions", detail: "Use selected Android capabilities" },
];

export default function PermissionsScreen() {
  return (
    <Page eyebrow="USER CONTROL" title="Permissions" subtitle="Review the small set of actions OTHRI can request, and the integrations that remain blocked.">
      <Card style={styles.policyCard}>
        <View style={styles.policyTop}>
          <View style={styles.policyIcon}><Ionicons name="shield-checkmark-outline" size={23} color={theme.colors.accent} /></View>
          <Tag label="DEFAULT DENY" tone="accent" />
        </View>
        <Text style={styles.policyTitle}>Nothing gets access by default.</Text>
        <Text style={styles.policyDescription}>The model can propose a local task or memory write. OTHRI shows the exact arguments and waits for your approval. No approval means no write.</Text>
      </Card>

      <SectionTitle title="Local actions" detail="2 AVAILABLE" />
      <Card style={{ gap: 2 }}>
        {localActions.map((item) => (
          <ListRow key={item.title} icon={item.icon} title={item.title} detail={item.detail} right={<Tag label="APPROVAL REQUIRED" tone="accent" />} />
        ))}
      </Card>

      <SectionTitle title="External integrations" detail="0 CONNECTED" />
      <Card style={{ gap: 2 }}>
        {integrations.map((item) => (
          <ListRow key={item.title} icon={item.icon} title={item.title} detail={item.detail} right={<Tag label="BLOCKED" tone="warning" />} />
        ))}
      </Card>

      <SectionTitle title="Before approving an action" />
      <View style={styles.ruleRow}>
        <View style={styles.ruleNumber}><Text style={styles.ruleNumberText}>01</Text></View>
        <View style={styles.ruleCopy}><Text style={styles.ruleTitle}>See the exact action</Text><Text style={styles.ruleDetail}>Review exactly what will be saved before approving it.</Text></View>
      </View>
      <View style={styles.ruleRow}>
        <View style={styles.ruleNumber}><Text style={styles.ruleNumberText}>02</Text></View>
        <View style={styles.ruleCopy}><Text style={styles.ruleTitle}>Approve each request separately</Text><Text style={styles.ruleDetail}>A previous approval does not authorize future actions.</Text></View>
      </View>
      <View style={styles.ruleRow}>
        <View style={styles.ruleNumber}><Text style={styles.ruleNumberText}>03</Text></View>
        <View style={styles.ruleCopy}><Text style={styles.ruleTitle}>Review the result</Text><Text style={styles.ruleDetail}>Local writes and approval outcomes are recorded in Activity.</Text></View>
      </View>

      <Notice title="Local approval flow is active" detail="Chat can request only create_task and save_memory. Browser, files, messaging, calendar, account and device integrations cannot execute actions in this build." icon="information-circle-outline" />
      <ActionButton title="View activity history" secondary icon="list-outline" onPress={() => router.push("/activity")} />
    </Page>
  );
}

const styles = StyleSheet.create({
  policyCard: { padding: 18 },
  policyTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  policyIcon: { width: 46, height: 46, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.accentDark },
  policyTitle: { color: theme.colors.text, fontSize: 19, lineHeight: 25, fontWeight: "700" },
  policyDescription: { color: theme.colors.muted, fontSize: 11, lineHeight: 18 },
  ruleRow: { flexDirection: "row", gap: 12, alignItems: "flex-start", paddingVertical: 7 },
  ruleNumber: { width: 30, height: 30, borderRadius: 10, backgroundColor: theme.colors.surfaceSoft, alignItems: "center", justifyContent: "center" },
  ruleNumberText: { color: theme.colors.accent, fontSize: 9, fontWeight: "800" },
  ruleCopy: { flex: 1, gap: 4, paddingTop: 2 },
  ruleTitle: { color: theme.colors.text, fontSize: 12, fontWeight: "700" },
  ruleDetail: { color: theme.colors.muted, fontSize: 10, lineHeight: 16 },
}
