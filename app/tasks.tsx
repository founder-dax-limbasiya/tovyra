import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ActionButton, Card, Notice, Page, SectionTitle, Tag } from "../components/ui";
import { theme } from "../constants/theme";
import { createLocalTask, deleteLocalTask, listLocalTasks, setLocalTaskStatus } from "../lib/storage/tasks";
import type { TaskRecord } from "../types/domain";

export default function TasksScreen() {
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = async () => {
    try {
      setError("");
      setTasks(await listLocalTasks());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load tasks on this device.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void refresh(); }, []);

  const addTask = async () => {
    if (!title.trim() || saving) return;
    try {
      setSaving(true);
      setError("");
      await createLocalTask(title, description);
      setTitle("");
      setDescription("");
      setNotice("Task saved on this device.");
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save this task.");
    } finally {
      setSaving(false);
    }
  };

  const toggleTask = async (task: TaskRecord) => {
    try {
      setError("");
      const next = task.status === "completed" ? "queued" : "completed";
      await setLocalTaskStatus(task.id, next);
      setNotice(next === "completed" ? "Task marked complete." : "Task moved back to your list.");
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update this task.");
    }
  };

  const removeTask = (task: TaskRecord) => {
    Alert.alert("Delete task?", `Delete "${task.title}" from this device?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => {
        void (async () => {
          try {
            await deleteLocalTask(task.id);
            setNotice("Task deleted.");
            await refresh();
          } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not delete this task.");
          }
        })();
      } },
    ]);
  };

  const completedCount = tasks.filter((task) => task.status === "completed").length;
  const openCount = tasks.length - completedCount;

  return (
    <Page eyebrow="PERSONAL WORKSPACE" title="Tasks" subtitle="A simple offline list for your goals and next actions. Agent-generated tasks can plug into this list later.">
      <View style={styles.metrics}>
        <Card style={styles.metricCard}><Text style={styles.metricValue}>{openCount}</Text><Text style={styles.metricLabel}>OPEN</Text></Card>
        <Card style={styles.metricCard}><Text style={[styles.metricValue, { color: theme.colors.accent }]}>{completedCount}</Text><Text style={styles.metricLabel}>DONE</Text></Card>
      </View>

      <SectionTitle title="Add a task" detail="SAVED ON DEVICE" />
      <Card style={styles.editor}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="What needs to get done?"
          placeholderTextColor={theme.colors.faint}
          maxLength={120}
          style={styles.titleInput}
          returnKeyType="next"
        />
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Add a note (optional)"
          placeholderTextColor={theme.colors.faint}
          maxLength={1000}
          multiline
          textAlignVertical="top"
          style={styles.descriptionInput}
        />
        <View style={styles.editorFooter}>
          <Text style={styles.counter}>{title.length}/120</Text>
          <View style={{ width: 130 }}>
            <ActionButton title={saving ? "Saving..." : "Add task"} icon="add" onPress={addTask} disabled={!title.trim() || saving} />
          </View>
        </View>
      </Card>

      {notice ? <Notice title="Done" detail={notice} icon="checkmark-circle-outline" /> : null}
      {error ? <Notice title="Task error" detail={error} icon="alert-circle-outline" /> : null}

      <SectionTitle title="Your tasks" detail={`${tasks.length} TOTAL`} />
      {loading ? (
        <View style={styles.loading}><ActivityIndicator color={theme.colors.accent} /><Text style={styles.loadingText}>Loading tasks...</Text></View>
      ) : tasks.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Ionicons name="checkmark-done-outline" size={27} color={theme.colors.faint} />
          <Text style={styles.emptyTitle}>A clear slate.</Text>
          <Text style={styles.emptyCopy}>Add a task above. Your list stays on this phone, even when you're offline.</Text>
        </Card>
      ) : (
        tasks.map((task) => (
          <Card key={task.id} style={styles.taskCard}>
            <View style={styles.taskTop}>
              <Pressable onPress={() => { void toggleTask(task); }} style={[styles.checkButton, task.status === "completed" && styles.checkButtonDone]} accessibilityLabel={task.status === "completed" ? "Reopen task" : "Complete task"}>
                {task.status === "completed" ? <Ionicons name="checkmark" size={16} color={theme.colors.background} /> : null}
              </Pressable>
              <View style={styles.taskCopy}>
                <Text style={[styles.taskTitle, task.status === "completed" && styles.taskTitleDone]}>{task.title}</Text>
                {task.description ? <Text style={styles.taskDescription}>{task.description}</Text> : null}
                <View style={styles.taskMeta}><Tag label={task.status === "completed" ? "COMPLETED" : "OPEN"} tone={task.status === "completed" ? "accent" : "blue"} /><Text style={styles.taskDate}>{new Date(task.updatedAt).toLocaleDateString()}</Text></View>
              </View>
              <Pressable onPress={() => removeTask(task)} hitSlop={10} style={styles.deleteButton} accessibilityLabel="Delete task">
                <Ionicons name="trash-outline" size={16} color={theme.colors.faint} />
              </Pressable>
            </View>
          </Card>
        ))
      )}

      <Notice title="Offline for now" detail="Tasks are stored on this device. They are not synced, assigned to agents or scheduled in the background yet." icon="cloud-offline-outline" />
      <ActionButton title="Back to home" secondary icon="home-outline" onPress={() => router.replace("/(tabs)")} />
    </Page>
  );
}

const styles = StyleSheet.create({
  metrics: { flexDirection: "row", gap: 10 },
  metricCard: { flex: 1, alignItems: "flex-start", gap: 5, paddingVertical: 13 },
  metricValue: { color: theme.colors.text, fontSize: 24, fontWeight: "800" },
  metricLabel: { color: theme.colors.faint, fontSize: 9, fontWeight: "800", letterSpacing: 1.1 },
  editor: { gap: 11 },
  titleInput: { color: theme.colors.text, fontSize: 14, paddingVertical: 7 },
  descriptionInput: { minHeight: 54, color: theme.colors.muted, fontSize: 11, lineHeight: 17, padding: 11, backgroundColor: theme.colors.background, borderRadius: 11, borderWidth: 1, borderColor: theme.colors.border },
  editorFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  counter: { color: theme.colors.faint, fontSize: 9 },
  loading: { flexDirection: "row", gap: 10, alignItems: "center", padding: 15 },
  loadingText: { color: theme.colors.muted, fontSize: 11 },
  emptyCard: { alignItems: "center", paddingVertical: 25 },
  emptyTitle: { color: theme.colors.text, fontSize: 15, fontWeight: "700" },
  emptyCopy: { color: theme.colors.muted, fontSize: 10, lineHeight: 16, textAlign: "center", maxWidth: 250 },
  taskCard: { padding: 14 },
  taskTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  checkButton: { width: 26, height: 26, borderRadius: 9, borderWidth: 1.5, borderColor: theme.colors.faint, alignItems: "center", justifyContent: "center" },
  checkButtonDone: { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent },
  taskCopy: { flex: 1, gap: 7 },
  taskTitle: { color: theme.colors.text, fontSize: 12, fontWeight: "700", lineHeight: 17 },
  taskTitleDone: { color: theme.colors.muted, textDecorationLine: "line-through" },
  taskDescription: { color: theme.colors.muted, fontSize: 10, lineHeight: 15 },
  taskMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  taskDate: { color: theme.colors.faint, fontSize: 9 },
  deleteButton: { width: 29, height: 29, borderRadius: 9, backgroundColor: theme.colors.surfaceSoft, alignItems: "center", justifyContent: "center" },
});
