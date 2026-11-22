import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card, ListRow, Notice, Page, SectionTitle, Tag } from "../../components/ui";
import { theme } from "../../constants/theme";

const memoryTypes = [
  { icon: "person-outline" as const, title: "Profile", detail: "Preferences and information you choose to share" },
  { icon: "heart-outline" as const, title: "Preferences", detail: "Your preferred ways of working" },
  { icon: "flag-outline" as const, title: "Goals", detail: "Longer-term goals and priorities" },
  { icon: "bookmark-outline" as const, title: "Saved context", detail: "Facts you explicitly choose to keep" },
];

export default function MemoryScreen() {
  return (
    <Page eyebrow="PERSONAL CONTEXT" title="Memory" subtitle="A transparent view of what OTHRI may remember, with controls that stay in your hands.">
      <Card style={styles.memoryHero}>
        <View style={styles.heroTop}>
          <View style={styles.memoryIcon}><Ionicons name="brain-outline" size={23} color={theme.colors.accent} /></View>
          <Tag label="NOT CONNECTED" tone="warning" />
        </View>
        <Text style={styles.heroTitle}>Your memory belongs to you.</Text>
        <Text style={styles.heroCopy}>No personal memories are stored by this mobile prototype. A backend memory service and inspect, edit, export and delete controls still need to be implemented.</Text>
      </Card>

      <SectionTitle title="Planned memory categories" detail="DESIGN PREVIEW" />
      <Card style={{ gap: 2 }}>
        {memoryTypes.map((item) => <ListRow key={item.title} icon={item.icon} title={item.title} detail={item.detail} right={<Tag label="PLANNED" />} />)}
      </Card>

      <SectionTitle title="Privacy controls" />
      <Notice title="No hidden memory writes" detail="The current app does not save these categories to a server or device database. This screen is a design preview, not a live memory manager." icon="lock-closed-outline" />
      <View style={styles.controlRow}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={styles.controlTitle}>Inspect before saving</Text>
          <Text style={styles.controlDetail}>Review the exact memory entry before it is stored.</Text>
        </View>
        <Ionicons name="eye-outline" size={19} color={theme.colors.accent} />
      </View>
      <View style={styles.controlRow}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={styles.controlTitle}>Edit and delete anytime</Text>
          <Text style={styles.controlDetail}>Memory should have clear retention and deletion controls.</Text>
        </View>
        <Ionicons name="trash-outline" size={19} color={theme.colors.accent} />
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  memoryHero: { padding: 18 },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  memoryIcon: { width: 46, height: 46, borderRadius: 16, backgroundColor: theme.colors.accentDark, alignItems: "center", justifyContent: "center" },
  heroTitle: { color: theme.colors.text, fontSize: 19, lineHeight: 25, fontWeight: "700" },
  heroCopy: { color: theme.colors.muted, fontSize: 11, lineHeight: 18 },
  controlRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 15, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
  controlTitle: { color: theme.colors.text, fontSize: 12, fontWeight: "700" },
  controlDetail: { color: theme.colors.muted, fontSize: 10, lineHeight: 15 },
});
