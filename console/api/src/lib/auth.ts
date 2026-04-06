import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { appConfig } from "@/lib/config";
import { db } from "@/lib/database/db";
import { organization } from "better-auth/plugins";

export const auth = betterAuth({
  secret: appConfig.betterAuthSecret,
  url: appConfig.betterAuthUrl,
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  plugins: [organization()],
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: appConfig.corsOrigins,
  advanced: {
    database: {
      generateId: () => crypto.randomUUID(),
    },
  },
});
