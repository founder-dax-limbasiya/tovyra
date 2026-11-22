import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ActionButton, Card, Notice, Page, Tag } from "../components/ui";
import { theme } from "../constants/theme";

export default function ActivityScreen() {
  return (
    <Page eyebrow="TRANSPARENCY" title="Activity" subtitle="A clear history of tasks, approvals and tool actions.">
      <Card style={styles.emptyCard}>
        <View style={styles.emptyIcon}><Ionicons name="pulse-outline" size={27} color={theme.colors.accent} /></View>
        <Tag label="NO EVENTS YET" tone="warning" />
        <Text style={styles.emptyTitle}>Your activity will appear here.</Text>
        <Text style={styles.emptyBody}>There are no activity records because no agents or connected tools have run in this prototype.</Text>
      </Card>
      <Notice title="Audit trail is a core requirement" detail="When execution is introduced, every action should record its requested scope, approval, result and timestamp. Sensitive values should never appear in logs." icon="shield-checkmark-outline" />
      <ActionButton title="Back to home" secondary icon="home-outline" onPress={() => router.replace("/(tabs)")} />
    </Page>
  );
}

const styles = StyleSheet.create({
  emptyCard: { alignItems: "center", paddingVertical: 29, paddingHorizontal: 20 },
  emptyIcon: { width: 68, height: 68, borderRadius: 23, backgroundColor: theme.colors.accentDark, alignItems: "center", justifyContent: "center" },
  emptyTitle: { color: theme.colors.text, fontSize: 18, fontWeight: "750", textAlign: "center" },
  emptyBody: { color: theme.colors.muted, fontSize: 11, lineHeight: 18, textAlign: "center" },
});
