import { db } from "@/lib/database/db";
import { location } from "@/lib/database/schema/core";
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { AppEnvProtected } from "@/lib/types";
import { ApiMsgResponse } from "@/lib/helpers/responses/api-msg-response";

export const locationAddRoute = new Hono<AppEnvProtected>();

/*
 * ----------------------------------------------------------------------------
 * Schema
 * ----------------------------------------------------------------------------
 */
const locationAddSchema = z.object({
  name: z.string().min(1).max(255),
});

/*
 * ----------------------------------------------------------------------------
 * Route handler
 * ----------------------------------------------------------------------------
 */
locationAddRoute.post("/", zValidator("json", locationAddSchema), async (c) => {
  const body = await c.req.json();
  const session = c.get("session");

  const orgId = session.activeOrganizationId;

  if (!orgId) {
    return c.json(
      new ApiMsgResponse(
        "Active organization not set for this session",
        "api.organization.notSet",
      ),
      404,
    );
  }

  const newLocation = await addLocation(body.name, orgId);
  return c.json(
    new ApiMsgResponse(
      "Location created successfully",
      "api.location.created",
      newLocation,
    ),
    201,
  );
});

/*
 * ----------------------------------------------------------------------------
 * Command
 * ----------------------------------------------------------------------------
 */
export const addLocation = async (name: string, organizationId: string) => {
  const newLocation = await db
    .insert(location)
    .values({
      name,
      organizationId,
    })
    .returning();
  return newLocation;
};
