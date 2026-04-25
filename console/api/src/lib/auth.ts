import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { appConfig } from "@/lib/config";
import { db } from "@/lib/database/db";
import { organization } from "better-auth/plugins";
import { Context } from "hono";
import { AppEnv } from "./types";
import { eq } from "drizzle-orm";
import { member } from "./database/schema/auth";

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
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const orgId = await getInitialOrganizationForUser(session.userId);
          return {
            data: {
              ...session,
              activeOrganizationId: orgId,
            },
          };
        },
      },
    },
  },
});

const getInitialOrganizationForUser = async (userId: string) => {
  const m = await db.query.member.findFirst({
    where: eq(member.userId, userId),
  });

  if (!m) return null;

  return m.organizationId;
};

export const protectedRoutesMiddleware = async (
  c: Context<AppEnv>,
  next: () => Promise<void>,
) => {
  const session = c.get("session");
  const user = c.get("user");

  if (!session || !user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  return next();
};
