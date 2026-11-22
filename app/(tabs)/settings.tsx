import { router } from "expo-router";
import { Card, ListRow, Notice, Page, SectionTitle, Tag } from "../../components/ui";
import { theme } from "../../constants/theme";
import { Text, View, StyleSheet } from "react-native";

export default function SettingsScreen() {
  return (
    <Page eyebrow="CONTROL CENTRE" title="Settings" subtitle="Manage how OTHRI connects, what it can access and how your data is handled.">
      <Card style={styles.providerCard}>
        <View style={styles.providerTop}>
          <View style={styles.providerBadge}><Text style={styles.providerGlyph}>✳</Text></View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.providerTitle}>AI model provider</Text>
            <Text style={styles.providerSubtitle}>Connect a provider through a secure backend.</Text>
          </View>
          <Tag label="NOT SET UP" tone="warning" />
        </View>
        <Notice title="No API key field in the mobile app" detail="Provider credentials must be stored on a trusted backend, never hard-coded into the Android bundle or committed to Git." icon="key-outline" />
      </Card>

      <SectionTitle title="Workspace" />
      <Card style={{ gap: 2 }}>
        <ListRow icon="hardware-chip-outline" title="Model providers" detail="Provider adapters and server-side credentials" right={<Tag label="PLANNED" />} />
        <ListRow icon="extension-puzzle-outline" title="Connected tools" detail="Review available integrations and scopes" right={<Tag label="PLANNED" />} />
        <ListRow icon="shield-checkmark-outline" title="Permissions" detail="Approval rules for external actions" right={<Tag label="PLANNED" />} />
      </Card>

      <SectionTitle title="Privacy and data" />
      <Card style={{ gap: 2 }}>
        <ListRow icon="lock-closed-outline" title="Privacy controls" detail="Data export, deletion and retention" right={<Tag label="PLANNED" />} />
        <ListRow icon="cloud-offline-outline" title="Local-first mode" detail="Understand what stays on your device" right={<Tag label="PLANNED" />} />
        <ListRow icon="document-text-outline" title="Activity audit" detail="See what tools did and who approved it" onPress={() => router.push("/activity")} />
      </Card>

      <SectionTitle title="More" />
      <Card style={{ gap: 2 }}>
        <ListRow icon="repeat-outline" title="Routines" detail="Review workflow templates" onPress={() => router.push("/routines")} />
        <ListRow icon="logo-github" title="Source repository" detail="Open the OTHRI mobile source" />
        <ListRow icon="information-circle-outline" title="About OTHRI" detail="Early mobile foundation · v0.1.0" />
      </Card>
      <Text style={styles.footer}>OTHRI is an early prototype. Provider connectivity, authentication, cloud sync and tool execution are not yet active.</Text>
    </Page>
  );
}

const styles = StyleSheet.create({
  providerCard: { gap: 14 },
  providerTop: { flexDirection: "row", alignItems: "center", gap: 11 },
  providerBadge: { width: 43, height: 43, borderRadius: 15, backgroundColor: theme.colors.accentDark, alignItems: "center", justifyContent: "center" },
  providerGlyph: { color: theme.colors.accent, fontSize: 22 },
  providerTitle: { color: theme.colors.text, fontSize: 13, fontWeight: "700" },
  providerSubtitle: { color: theme.colors.muted, fontSize: 10, lineHeight: 15 },
  footer: { color: theme.colors.faint, fontSize: 10, lineHeight: 16, textAlign: "center", paddingHorizontal: 12, paddingVertical: 10 },
});
