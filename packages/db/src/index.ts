import { MongoClient, Db } from "mongodb";

let client: MongoClient | null = null;
let db: Db | null = null;

export { COLLECTIONS } from "./collections.js";
export type { CollectionName } from "./collections.js";
export { createIndexes } from "./indexes.js";

export async function connect(uri: string, dbName: string): Promise<Db> {
  if (db) return db;

  client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10_000,
    maxPoolSize: 10,
    autoSelectFamily: false,
  });

  await client.connect();
  db = client.db(dbName);
  return db;
}

export function getDb(): Db {
  if (!db) throw new Error("DB not connected. Call connect() first.");
  return db;
}

export async function disconnect(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

export async function ping(): Promise<boolean> {
  if (!db) return false;
  try {
    await db.command({ ping: 1 });
    return true;
  } catch {
    return false;
  }
}