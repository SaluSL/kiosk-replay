import { Hono } from "hono";
import { AppEnvProtected } from "@/lib/types";
import { eventAddRoute } from "./add";

export const eventRoutes = new Hono<AppEnvProtected>();

eventRoutes.route("/", eventAddRoute);
