import { log } from "@/lib/logger";

const getEnv = (
  key: string,
  required: boolean = true,
  defaultValue: string | undefined = undefined,
) => {
  const value = process.env[key];
  if (!value && required) {
    log.error(`${key} is not set`);
    throw new Error(`${key} is not set`);
  }
  if (!value && !required) {
    log.warn(`${key} is not set, using default value`);
    return defaultValue;
  }

  return value;
};

const env = {
  PORT: getEnv("PORT", false, "3000"),
  BASE_URL: getEnv("BASE_URL"),
  BETTER_AUTH_SECRET: getEnv("BETTER_AUTH_SECRET"),
  CORS_ORIGINS: getEnv("CORS_ORIGINS")!
    .split(",")
    .map((origin) => origin.trim()),
  DATABASE_PATH: getEnv("DATABASE_PATH", false, "db.sqlite"),
};

export const appConfig = {
  port: env.PORT,
  baseUrl: env.BASE_URL,
  corsOrigins: env.CORS_ORIGINS,
  betterAuthSecret: env.BETTER_AUTH_SECRET,
  betterAuthUrl: env.BASE_URL,
  databasePath: env.DATABASE_PATH,
};
