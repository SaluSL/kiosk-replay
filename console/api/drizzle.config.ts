import { appConfig } from "@/lib/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/database/schema",
  out: "./src/lib/database/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: `file:${appConfig.databasePath}`,
  },
});
