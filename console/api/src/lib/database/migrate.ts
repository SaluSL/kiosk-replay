import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import { appConfig } from "@/lib/config";

const sqlite = new Database(appConfig.databasePath);
const db = drizzle(sqlite);
migrate(db, { migrationsFolder: "./src/lib/database/migrations" });
