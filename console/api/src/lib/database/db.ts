import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import { appConfig } from "@/lib/config";
import * as auth from "./schema/auth";
import * as core from "./schema/core";

const sqlite = new Database(appConfig.databasePath);
export const db = drizzle(sqlite, { schema: { ...auth, ...core } });
