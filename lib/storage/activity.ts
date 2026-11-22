import { getLocalDatabase } from "./database";

export interface LocalActivityRecord {
  id: string;
  eventType: string;
  title: string;
  detail: string;
  createdAt: string;
}

function createId(): string {
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function recordActivity(eventType: string, title: string, detail: string): Promise<void> {
  const database = await getLocalDatabase();
  await database.runAsync(
    `INSERT INTO activity_entries (id, event_type, title, detail, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    createId(),
    eventType,
    title,
    detail,
    new Date().toISOString()
  );
}

export async function listActivityEntries(): Promise<LocalActivityRecord[]> {
  const database = await getLocalDatabase();
  return database.getAllAsync<LocalActivityRecord>(
    `SELECT id,
            event_type AS eventType,
            title,
            detail,
            created_at AS createdAt
       FROM activity_entries
      ORDER BY created_at DESC
      LIMIT 100`
  );
}
