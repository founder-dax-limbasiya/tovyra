import type { MemoryRecord } from "../../types/domain";
import { getLocalDatabase } from "./database";
import { recordActivity } from "./activity";

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function listMemoryEntries(): Promise<MemoryRecord[]> {
  const database = await getLocalDatabase();
  return database.getAllAsync<MemoryRecord>(
    `SELECT id, category, content,
            created_at AS createdAt,
            updated_at AS updatedAt,
            source
       FROM memory_entries
      ORDER BY created_at DESC
      LIMIT 250`
  );
}

export async function addMemoryEntry(
  category: MemoryRecord["category"],
  content: string
): Promise<void> {
  const normalized = content.trim();
  if (!normalized) throw new Error("Write a memory before saving it.");
  if (normalized.length > 1000) throw new Error("Memories must be 1,000 characters or fewer.");

  const database = await getLocalDatabase();
  const now = new Date().toISOString();
  await database.runAsync(
    `INSERT INTO memory_entries (id, category, content, created_at, updated_at, source)
     VALUES (?, ?, ?, ?, ?, 'user')`,
    createId("mem"),
    category,
    normalized,
    now,
    now
  );
  await recordActivity("memory_created", "Memory saved", `Saved a ${category} entry on this device.`);
}

export async function deleteMemoryEntry(id: string): Promise<void> {
  const database = await getLocalDatabase();
  await database.runAsync("DELETE FROM memory_entries WHERE id = ?", id);
  await recordActivity("memory_deleted", "Memory deleted", "A saved memory entry was deleted from this device.");
}
