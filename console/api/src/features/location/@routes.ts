import { Hono } from "hono";
import { AppEnvProtected } from "@/lib/types";
import { protectedRoutesMiddleware } from "@/lib/auth";
import { locationAddRoute } from "./add";
import { locationListRoute } from "./list";

export const locationRoutes = new Hono<AppEnvProtected>();

locationRoutes.use(protectedRoutesMiddleware);

const routes = [locationAddRoute, locationListRoute];

routes.forEach((route) => {
  locationRoutes.route("/", route);
});
