import { Hono } from "hono";
import { appConfig } from "@/lib/config";
import { auth } from "@/lib/auth";
import { cors } from "hono/cors";
import { locationRoutes } from "@/features/location/@routes";
import { deviceRoutes } from "@/features/device/@routes";
import { AppEnv } from "@/lib/types";

const app = new Hono<AppEnv>();

app.use(
  "*",
  cors({
    origin: appConfig.corsOrigins,
    allowHeaders: ["Authorization", "Content-Type"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    credentials: true,
    maxAge: 600,
  }),
);

app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    c.set("user", null);
    c.set("session", null);
    await next();
    return;
  }
  c.set("user", session.user);
  c.set("session", session.session);
  await next();
});
app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/session", (c) => {
  const session = c.get("session");
  const user = c.get("user");

  if (!user) return c.body(null, 401);
  return c.json({
    session,
    user,
  });
});

const routes = [locationRoutes, deviceRoutes];

routes.forEach((route) => {
  app.basePath("/api/v1").route("/", route);
});

export default {
  port: appConfig.port,
  fetch: app.fetch,
};
