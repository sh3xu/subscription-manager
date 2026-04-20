import { openDatabaseSync, SQLiteDatabase } from 'expo-sqlite';

import { runMigrations } from '@/db/migrations';

let db: SQLiteDatabase | null = null;

export function getDb() {
  if (!db) {
    db = openDatabaseSync('subscriptions.db');
  }
  return db;
}

export async function initializeDb() {
  const database = getDb();
  await runMigrations(database);
  return database;
}
