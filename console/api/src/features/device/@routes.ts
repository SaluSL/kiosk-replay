import { Hono } from "hono";
import { AppEnvProtected } from "@/lib/types";
import { protectedRoutesMiddleware } from "@/lib/auth";
import { deviceAddRoute } from "./add";
import { deviceListRoute } from "./list";
import { deviceDeleteRoute } from "./delete";
import { deviceGetRoute } from "./get";
import { deviceUpdateRoute } from "./update";

export const deviceRoutes = new Hono<AppEnvProtected>();

deviceRoutes.use(protectedRoutesMiddleware);

const routes = [
  deviceAddRoute,
  deviceListRoute,
  deviceDeleteRoute,
  deviceGetRoute,
  deviceUpdateRoute,
];

routes.forEach((route) => {
  deviceRoutes.route("/", route);
});
