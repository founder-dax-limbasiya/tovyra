import { router } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ActionButton, Card, Notice, Page, SectionTitle, Tag, ListRow } from "../components/ui";
import { theme } from "../constants/theme";

const integrations = [
  { icon: "globe-outline" as const, title: "Browser actions", detail: "Search, open pages and interact with websites" },
  { icon: "folder-open-outline" as const, title: "Files and storage", detail: "Read, write, upload and share files" },
  { icon: "calendar-outline" as const, title: "Calendar and reminders", detail: "Create or change schedules" },
  { icon: "chatbubble-ellipses-outline" as const, title: "Messaging", detail: "Send messages or publish content" },
  { icon: "phone-portrait-outline" as const, title: "Device actions", detail: "Use selected Android capabilities" },
];

export default function PermissionsScreen() {
  return (
    <Page eyebrow="USER CONTROL" title="Permissions" subtitle="Review what an agent may access before it can take action.">
      <Card style={styles.policyCard}>
        <View style={styles.policyTop}>
          <View style={styles.policyIcon}><Ionicons name="shield-checkmark-outline" size={23} color={theme.colors.accent} /></View>
          <Tag label="DEFAULT DENY" tone="accent" />
        </View>
        <Text style={styles.policyTitle}>Nothing gets access by default.</Text>
        <Text style={styles.policyDescription}>Every integration will start disconnected. An agent must request a narrow permission for a specific action, and sensitive actions must wait for your explicit approval.</Text>
      </Card>

      <SectionTitle title="Connected integrations" detail="0 CONNECTED" />
      <Card style={{ gap: 2 }}>
        {integrations.map((item) => (
          <ListRow key={item.title} icon={item.icon} title={item.title} detail={item.detail} right={<Tag label="DISCONNECTED" tone="warning" />} />
        ))}
      </Card>

      <SectionTitle title="Before approving an action" />
      <View style={styles.ruleRow}>
        <View style={styles.ruleNumber}><Text style={styles.ruleNumberText}>01</Text></View>
        <View style={styles.ruleCopy}><Text style={styles.ruleTitle}>See the exact action</Text><Text style={styles.ruleDetail}>What will happen, where, and to which account or file.</Text></View>
      </View>
      <View style={styles.ruleRow}>
        <View style={styles.ruleNumber}><Text style={styles.ruleNumberText}>02</Text></View>
        <View style={styles.ruleCopy}><Text style={styles.ruleTitle}>Review the requested scope</Text><Text style={styles.ruleDetail}>Only the minimum access required for that action.</Text></View>
      </View>
      <View style={styles.ruleRow}>
        <View style={styles.ruleNumber}><Text style={styles.ruleNumberText}>03</Text></View>
        <View style={styles.ruleCopy}><Text style={styles.ruleTitle}>Approve once, not forever</Text><Text style={styles.ruleDetail}>Approvals should be specific, time-limited and auditable.</Text></View>
      </View>

      <Notice title="Approval gateway is not connected" detail="This is the permission centre design. No tools can execute actions, and there are no pending approvals in this build." icon="information-circle-outline" />
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
});
