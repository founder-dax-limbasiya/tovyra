import type { TaskRecord } from "../../types/domain";
import { getLocalDatabase } from "./database";
import { recordActivity } from "./activity";

function createId(): string {
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function listLocalTasks(): Promise<TaskRecord[]> {
  const database = await getLocalDatabase();
  return database.getAllAsync<TaskRecord>(
    `SELECT id, title, description, status,
            created_at AS createdAt,
            updated_at AS updatedAt
       FROM local_tasks
      ORDER BY
        CASE status WHEN 'queued' THEN 0 WHEN 'running' THEN 1 WHEN 'waiting_for_approval' THEN 2 WHEN 'failed' THEN 3 ELSE 4 END,
        created_at DESC
      LIMIT 250`
  );
}

export async function createLocalTask(title: string, description = ""): Promise<void> {
  const cleanTitle = title.trim();
  const cleanDescription = description.trim();
  if (!cleanTitle) throw new Error("Add a task title first.");
  if (cleanTitle.length > 120) throw new Error("Task titles must be 120 characters or fewer.");
  if (cleanDescription.length > 1000) throw new Error("Task descriptions must be 1,000 characters or fewer.");

  const database = await getLocalDatabase();
  const now = new Date().toISOString();
  await database.runAsync(
    `INSERT INTO local_tasks (id, title, description, status, created_at, updated_at)
     VALUES (?, ?, ?, 'queued', ?, ?)`,
    createId(),
    cleanTitle,
    cleanDescription,
    now,
    now
  );
  try {
    await recordActivity("task_created", "Task added", `Added "${cleanTitle}" to this device.`);
  } catch {
    // Keep task creation independent of optional audit logging.
  }
}

export async function setLocalTaskStatus(id: string, status: TaskRecord["status"]): Promise<void> {
  const database = await getLocalDatabase();
  const result = await database.runAsync(
    "UPDATE local_tasks SET status = ?, updated_at = ? WHERE id = ?",
    status,
    new Date().toISOString(),
    id
  );
  if (result.changes > 0) {
    try {
      await recordActivity("task_status_changed", "Task updated", `Changed a local task to ${status}.`);
    } catch {
      // The task update takes precedence over optional audit logging.
    }
  }
}

export async function deleteLocalTask(id: string): Promise<void> {
  const database = await getLocalDatabase();
  const result = await database.runAsync("DELETE FROM local_tasks WHERE id = ?", id);
  if (result.changes > 0) {
    try {
      await recordActivity("task_deleted", "Task deleted", "A local task was deleted from this device.");
    } catch {
      // Deletion takes precedence over optional audit logging.
    }
  }
}
