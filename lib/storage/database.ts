import * as SQLite from "expo-sqlite";

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getLocalDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = (async () => {
      const database = await SQLite.openDatabaseAsync("othri.db");
      await database.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS memory_entries (
          id TEXT PRIMARY KEY NOT NULL,
          category TEXT NOT NULL CHECK(category IN ('profile', 'preference', 'goal', 'context')),
          content TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          source TEXT NOT NULL DEFAULT 'user' CHECK(source IN ('user', 'approved_import'))
        );
        CREATE INDEX IF NOT EXISTS memory_entries_created_at_idx
          ON memory_entries(created_at DESC);

        CREATE TABLE IF NOT EXISTS activity_entries (
          id TEXT PRIMARY KEY NOT NULL,
          event_type TEXT NOT NULL,
          title TEXT NOT NULL,
          detail TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS activity_entries_created_at_idx
          ON activity_entries(created_at DESC);
      `);
      return database;
    })();
  }

  try {
    return await databasePromise;
  } catch (error) {
    databasePromise = null;
    throw error;
  }
}
