import type { ComponentProps, ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable, type TextStyle, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../constants/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

export function Page({ title, subtitle, eyebrow, children }: { title: string; subtitle?: string; eyebrow?: string; children: ReactNode }) {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.brandBar}>
          <View style={styles.brandMark}><Ionicons name="sparkles-outline" size={16} color={theme.colors.accent} /></View>
          <Text style={styles.brandName}>OTHRI</Text>
          <View style={styles.brandDivider} />
          <Text style={styles.brandMeta}>PERSONAL INTELLIGENCE</Text>
          <View style={styles.previewTag}><View style={styles.previewDot} /><Text style={styles.previewText}>PREVIEW</Text></View>
        </View>
        <View style={styles.pageHeader}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          <Text style={styles.pageTitle}>{title}</Text>
          {subtitle ? <Text style={styles.pageSubtitle}>{subtitle}</Text> : null}
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ title, detail }: { title: string; detail?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {detail ? <Text style={styles.sectionDetail}>{detail}</Text> : null}
    </View>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <Text style={styles.eyebrow}>{children}</Text>;
}

export function BodyText({ children, style }: { children: ReactNode; style?: TextStyle }) {
  return <Text style={[styles.bodyText, style]}>{children}</Text>;
}

export function Tag({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "accent" | "blue" | "warning" }) {
  const color = tone === "accent" ? theme.colors.accent : tone === "blue" ? theme.colors.blue : tone === "warning" ? theme.colors.orange : theme.colors.muted;
  const backgroundColor = tone === "accent" ? theme.colors.accentDark : theme.colors.surfaceSoft;
  return <View style={[styles.tag, { backgroundColor }]}><Text style={[styles.tagText, { color }]}>{label}</Text></View>;
}

export function ActionButton({ title, onPress, icon, secondary = false, disabled = false }: { title: string; onPress?: () => void; icon?: IconName; secondary?: boolean; disabled?: boolean }) {
  return (
    <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.actionButton, secondary && styles.secondaryButton, disabled && styles.disabledButton, pressed && !disabled && { opacity: 0.78 }]}>
      {icon ? <Ionicons name={icon} size={16} color={secondary ? theme.colors.text : theme.colors.background} /> : null}
      <Text style={[styles.actionText, secondary && styles.secondaryText]}>{title}</Text>
    </Pressable>
  );
}

export function ListRow({ icon, title, detail, right, onPress }: { icon: IconName; title: string; detail?: string; right?: ReactNode; onPress?: () => void }) {
  const content = (
    <>
      <View style={styles.rowIcon}><Ionicons name={icon} size={18} color={theme.colors.accent} /></View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        {detail ? <Text style={styles.rowDetail}>{detail}</Text> : null}
      </View>
      {right ?? (onPress ? <Ionicons name="chevron-forward" size={16} color={theme.colors.faint} /> : null)}
    </>
  );
  return onPress ? <Pressable onPress={onPress} style={({ pressed }) => [styles.listRow, pressed && { opacity: 0.75 }]}>{content}</Pressable> : <View style={styles.listRow}>{content}</View>;
}

export function Notice({ title, detail, icon = "information-circle-outline" }: { title: string; detail: string; icon?: IconName }) {
  return (
    <View style={styles.notice}>
      <Ionicons name={icon} size={19} color={theme.colors.blue} />
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={styles.noticeTitle}>{title}</Text>
        <Text style={styles.noticeDetail}>{detail}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  brandBar: { minHeight: 38, flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 4 },
  brandMark: { width: 30, height: 30, borderRadius: 10, backgroundColor: theme.colors.accentDark, alignItems: "center", justifyContent: "center" },
  brandName: { color: theme.colors.text, fontSize: 13, fontWeight: "800", letterSpacing: 2.1 },
  brandDivider: { width: 1, height: 16, backgroundColor: theme.colors.border, marginHorizontal: 2 },
  brandMeta: { flex: 1, color: theme.colors.faint, fontSize: 8, fontWeight: "700", letterSpacing: 1 },
  previewTag: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 20, backgroundColor: theme.colors.surfaceSoft },
  previewDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: theme.colors.orange },
  previewText: { color: theme.colors.muted, fontSize: 8, fontWeight: "800", letterSpacing: 0.7 },
  page: { paddingHorizontal: 21, paddingTop: 20, paddingBottom: 34, gap: 18 },
  pageHeader: { gap: 8, marginBottom: 4 },
  eyebrow: { color: theme.colors.accent, fontSize: 10, fontWeight: "800", letterSpacing: 1.8 },
  pageTitle: { color: theme.colors.text, fontSize: 31, lineHeight: 37, fontWeight: "700", letterSpacing: -0.8 },
  pageSubtitle: { color: theme.colors.muted, fontSize: 13, lineHeight: 20, maxWidth: 340 },
  card: { padding: 16, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.card, gap: 12 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 5 },
  sectionTitle: { color: theme.colors.text, fontSize: 16, fontWeight: "700" },
  sectionDetail: { color: theme.colors.muted, fontSize: 9, fontWeight: "700", letterSpacing: 1.1 },
  bodyText: { color: theme.colors.muted, fontSize: 13, lineHeight: 20 },
  tag: { alignSelf: "flex-start", paddingHorizontal: 9, paddingVertical: 5, borderRadius: theme.radius.pill },
  tagText: { fontSize: 9, fontWeight: "800", letterSpacing: 0.6 },
  actionButton: { minHeight: 42, paddingHorizontal: 14, borderRadius: 13, backgroundColor: theme.colors.accent, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  secondaryButton: { backgroundColor: theme.colors.surfaceSoft, borderWidth: 1, borderColor: theme.colors.border },
  disabledButton: { opacity: 0.45 },
  actionText: { color: theme.colors.background, fontSize: 12, fontWeight: "800" },
  secondaryText: { color: theme.colors.text },
  listRow: { minHeight: 61, flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  rowIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: theme.colors.surfaceSoft, alignItems: "center", justifyContent: "center" },
  rowCopy: { flex: 1, gap: 3 },
  rowTitle: { color: theme.colors.text, fontSize: 13, fontWeight: "700" },
  rowDetail: { color: theme.colors.muted, fontSize: 10, lineHeight: 15 },
  notice: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 13, backgroundColor: "#111C2A", borderRadius: 14, borderWidth: 1, borderColor: "#233852" },
  noticeTitle: { color: theme.colors.text, fontSize: 11, fontWeight: "700" },
  noticeDetail: { color: theme.colors.muted, fontSize: 10, lineHeight: 15 },
});
