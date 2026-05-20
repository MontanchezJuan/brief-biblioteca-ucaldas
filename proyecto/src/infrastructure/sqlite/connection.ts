import { mkdirSync } from "fs";
import path from "path";
import { DatabaseSync } from "node:sqlite";
import { schemaSql } from "./schema";

let database: DatabaseSync | undefined;
let transactionDepth = 0;

export function getDatabasePath(): string {
  return process.env.SQLITE_PATH ?? path.join(process.cwd(), "data", "biblioteca.sqlite");
}

export function getDatabase(): DatabaseSync {
  if (!database) {
    const databasePath = getDatabasePath();
    if (databasePath !== ":memory:") {
      mkdirSync(path.dirname(databasePath), { recursive: true });
    }
    database = new DatabaseSync(databasePath);
    database.exec("PRAGMA foreign_keys = ON;");
    initializeDatabase(database);
  }
  return database;
}

export function initializeDatabase(db = getDatabase()): void {
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(schemaSql);
}

export function closeDatabase(): void {
  if (!database) return;
  database.close();
  database = undefined;
  transactionDepth = 0;
}

export function runInTransaction<T>(operation: () => T): T {
  const db = getDatabase();
  const nested = transactionDepth > 0;

  if (!nested) db.exec("BEGIN;");
  transactionDepth += 1;

  try {
    const result = operation();
    transactionDepth -= 1;
    if (!nested) db.exec("COMMIT;");
    return result;
  } catch (error) {
    transactionDepth -= 1;
    if (!nested) db.exec("ROLLBACK;");
    throw error;
  }
}
