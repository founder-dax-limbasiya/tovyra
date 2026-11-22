import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ActionButton, Card, Notice, Page, SectionTitle, Tag } from "../../components/ui";
import { theme } from "../../constants/theme";
import { addMemoryEntry, deleteMemoryEntry, listMemoryEntries } from "../../lib/storage/memory";
import type { MemoryRecord } from "../../types/domain";

const categories: { id: MemoryRecord["category"]; label: string }[] = [
  { id: "preference", label: "Preference" },
  { id: "profile", label: "Profile" },
  { id: "goal", label: "Goal" },
  { id: "context", label: "Context" },
];

export default function MemoryScreen() {
  const [entries, setEntries] = useState<MemoryRecord[]>([]);
  const [category, setCategory] = useState<MemoryRecord["category"]>("preference");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = async () => {
    try {
      setError("");
      const nextEntries = await listMemoryEntries();
      setEntries(nextEntries);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load local memory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const save = async () => {
    if (!content.trim() || saving) return;
    try {
      setSaving(true);
      setError("");
      await addMemoryEntry(category, content);
      setContent("");
      setNotice("Saved to this device. It will still be here after you close the app.");
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save this memory.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    try {
      setError("");
      await deleteMemoryEntry(id);
      setNotice("Memory deleted from this device.");
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete this memory.");
    }
  };

  const confirmDelete = (entry: MemoryRecord) => {
    Alert.alert(
      "Delete this memory?",
      "This removes the entry from this device and cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => { void remove(entry.id); } },
      ]
    );
  };

  return (
    <Page eyebrow="PERSONAL CONTEXT" title="Memory" subtitle="Save useful context on this phone and stay in control of what OTHRI keeps.">
      <Card style={styles.memoryHero}>
        <View style={styles.heroTop}>
          <View style={styles.memoryIcon}><Ionicons name="brain-outline" size={23} color={theme.colors.accent} /></View>
          <Tag label="ON THIS DEVICE" tone="accent" />
        </View>
        <Text style={styles.heroTitle}>Your memory belongs to you.</Text>
        <Text style={styles.heroCopy}>Entries are stored in the app's local SQLite database. They are not synced to a cloud account or sent to an AI model.</Text>
      </Card>

      <SectionTitle title="Save a memory" detail="LOCAL STORAGE" />
      <Card style={styles.editor}>
        <View style={styles.categoryRow}>
          {categories.map((item) => (
            <Pressable key={item.id} onPress={() => setCategory(item.id)} style={[styles.categoryChip, category === item.id && styles.categoryChipActive]}>
              <Text style={[styles.categoryText, category === item.id && styles.categoryTextActive]}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="Example: I prefer concise project plans with clear next steps."
          placeholderTextColor={theme.colors.faint}
          maxLength={1000}
          multiline
          textAlignVertical="top"
          style={styles.memoryInput}
        />
        <View style={styles.editorFooter}>
          <Text style={styles.characterCount}>{content.length}/1,000</Text>
          <View style={{ width: 130 }}>
            <ActionButton title={saving ? "Saving..." : "Save memory"} icon="bookmark-outline" onPress={save} disabled={!content.trim() || saving} />
          </View>
        </View>
      </Card>

      {notice ? <Notice title="Done" detail={notice} icon="checkmark-circle-outline" /> : null}
      {error ? <Notice title="Storage error" detail={error} icon="alert-circle-outline" /> : null}

      <SectionTitle title="Saved memories" detail={`${entries.length} ON DEVICE`} />
      {loading ? (
        <View style={styles.loading}><ActivityIndicator color={theme.colors.accent} /><Text style={styles.loadingText}>Opening local memory...</Text></View>
      ) : entries.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Ionicons name="bookmark-outline" size={25} color={theme.colors.faint} />
          <Text style={styles.emptyTitle}>Nothing saved yet</Text>
          <Text style={styles.emptyCopy}>Add a preference, goal or useful piece of context above. You can remove it later.</Text>
        </Card>
      ) : (
        entries.map((entry) => (
          <Card key={entry.id} style={styles.entryCard}>
            <View style={styles.entryTop}>
              <Tag label={entry.category.toUpperCase()} tone="blue" />
              <Pressable onPress={() => confirmDelete(entry)} hitSlop={10} style={styles.deleteButton} accessibilityLabel="Delete memory">
                <Ionicons name="trash-outline" size={16} color={theme.colors.danger} />
              </Pressable>
            </View>
            <Text style={styles.entryContent}>{entry.content}</Text>
            <Text style={styles.entryDate}>Saved {new Date(entry.createdAt).toLocaleString()}</Text>
          </Card>
        ))
      )}

      <Notice title="Privacy note" detail="This prototype uses standard local SQLite storage, not SQLCipher encryption. Do not save passwords, API keys or highly sensitive information. Uninstalling the app may remove this local database." icon="lock-closed-outline" />
    </Page>
  );
}

const styles = StyleSheet.create({
  memoryHero: { padding: 18 },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  memoryIcon: { width: 46, height: 46, borderRadius: 16, backgroundColor: theme.colors.accentDark, alignItems: "center", justifyContent: "center" },
  heroTitle: { color: theme.colors.text, fontSize: 19, lineHeight: 25, fontWeight: "700" },
  heroCopy: { color: theme.colors.muted, fontSize: 11, lineHeight: 18 },
  editor: { gap: 13 },
  categoryRow: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  categoryChip: { paddingHorizontal: 11, paddingVertical: 8, borderRadius: 20, backgroundColor: theme.colors.surfaceSoft, borderWidth: 1, borderColor: theme.colors.border },
  categoryChipActive: { backgroundColor: theme.colors.accentDark, borderColor: theme.colors.accent },
  categoryText: { color: theme.colors.muted, fontSize: 10, fontWeight: "700" },
  categoryTextActive: { color: theme.colors.accent },
  memoryInput: { minHeight: 88, color: theme.colors.text, fontSize: 13, lineHeight: 20, padding: 12, backgroundColor: theme.colors.background, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border },
  editorFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  characterCount: { color: theme.colors.faint, fontSize: 9 },
  loading: { flexDirection: "row", alignItems: "center", gap: 10, padding: 15 },
  loadingText: { color: theme.colors.muted, fontSize: 11 },
  emptyCard: { alignItems: "center", padding: 23 },
  emptyTitle: { color: theme.colors.text, fontSize: 14, fontWeight: "700" },
  emptyCopy: { color: theme.colors.muted, fontSize: 10, lineHeight: 16, textAlign: "center", maxWidth: 250 },
  entryCard: { gap: 10 },
  entryTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  deleteButton: { width: 30, height: 30, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: theme.colors.surfaceSoft },
  entryContent: { color: theme.colors.text, fontSize: 12, lineHeight: 19 },
  entryDate: { color: theme.colors.faint, fontSize: 9 },
});
