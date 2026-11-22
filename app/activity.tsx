import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ActionButton, Card, Notice, Page, Tag } from "../components/ui";
import { theme } from "../constants/theme";
import { listActivityEntries, type LocalActivityRecord } from "../lib/storage/activity";

export default function ActivityScreen() {
  const [events, setEvents] = useState<LocalActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      setError("");
      setEvents(await listActivityEntries());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load local activity.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <Page eyebrow="TRANSPARENCY" title="Activity" subtitle="A local record of memory, task and approved tool changes.">
      <Notice title="Local audit events" detail="This history records local memory and task changes, plus approval outcomes for the two local chat tools. External tool execution is not available." icon="shield-checkmark-outline" />
      {error ? <Notice title="Could not load activity" detail={error} icon="alert-circle-outline" /> : null}
      {loading ? (
        <View style={styles.loading}><ActivityIndicator color={theme.colors.accent} /><Text style={styles.loadingText}>Loading activity...</Text></View>
      ) : events.length === 0 ? (
        <Card style={styles.emptyCard}>
          <View style={styles.emptyIcon}><Ionicons name="pulse-outline" size={27} color={theme.colors.accent} /></View>
          <Tag label="NO EVENTS YET" tone="warning" />
          <Text style={styles.emptyTitle}>Your activity will appear here.</Text>
          <Text style={styles.emptyBody}>Save or delete a memory to create your first local activity record.</Text>
        </Card>
      ) : (
        <View style={styles.timeline}>
          {events.map((event, index) => (
            <View key={event.id} style={styles.eventRow}>
              <View style={styles.eventRail}>
                <View style={styles.eventIcon}>
                  <Ionicons name={event.eventType.includes("deleted") ? "trash-outline" : event.eventType.includes("rejected") || event.eventType.includes("failed") ? "alert-circle-outline" : event.eventType.startsWith("task_") ? "checkbox-outline" : event.eventType.startsWith("tool_") ? "shield-checkmark-outline" : "bookmark-outline"} size={16} color={theme.colors.accent} />
                </View>
                {index < events.length - 1 ? <View style={styles.eventLine} /> : null}
              </View>
              <View style={styles.eventCopy}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventDetail}>{event.detail}</Text>
                <Text style={styles.eventDate}>{new Date(event.createdAt).toLocaleString()}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
      <ActionButton title="Back to home" secondary icon="home-outline" onPress={() => router.replace("/(tabs)")} />
    </Page>
  );
}

const styles = StyleSheet.create({
  loading: { flexDirection: "row", alignItems: "center", gap: 10, padding: 15 },
  loadingText: { color: theme.colors.muted, fontSize: 11 },
  emptyCard: { alignItems: "center", paddingVertical: 29, paddingHorizontal: 20 },
  emptyIcon: { width: 68, height: 68, borderRadius: 23, backgroundColor: theme.colors.accentDark, alignItems: "center", justifyContent: "center" },
  emptyTitle: { color: theme.colors.text, fontSize: 18, fontWeight: "700", textAlign: "center" },
  emptyBody: { color: theme.colors.muted, fontSize: 11, lineHeight: 18, textAlign: "center" },
  timeline: { gap: 1 },
  eventRow: { flexDirection: "row", gap: 12, minHeight: 80 },
  eventRail: { width: 35, alignItems: "center" },
  eventIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: theme.colors.surfaceSoft, borderWidth: 1, borderColor: theme.colors.border, alignItems: "center", justifyContent: "center", zIndex: 1 },
  eventLine: { position: "absolute", top: 34, bottom: -1, width: 1, backgroundColor: theme.colors.border },
  eventCopy: { flex: 1, paddingTop: 2, paddingBottom: 19, gap: 4 },
  eventTitle: { color: theme.colors.text, fontSize: 12, fontWeight: "700" },
  eventDetail: { color: theme.colors.muted, fontSize: 10, lineHeight: 15 },
  eventDate: { color: theme.colors.faint, fontSize: 9 },
});
