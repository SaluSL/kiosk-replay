import { db } from "@/lib/database/db";
import { device } from "@/lib/database/schema/core";
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { AppEnvProtected } from "@/lib/types";
import { eq } from "drizzle-orm";
import { ApiMsgResponse } from "@/lib/helpers/responses/api-msg-response";

export const deviceAddRoute = new Hono<AppEnvProtected>();

/*
 * ----------------------------------------------------------------------------
 * Schema
 * ----------------------------------------------------------------------------
 */
const deviceAddSchema = z.object({
  alias: z.string().min(1).max(255),
  fullName: z.string().optional(),
  locationId: z.string().optional(),
});

/*
 * ----------------------------------------------------------------------------
 * Route handler
 * ----------------------------------------------------------------------------
 */
deviceAddRoute.post("/", zValidator("json", deviceAddSchema), async (c) => {
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

  if (await deviceWithAliasExists(body.alias)) {
    return c.json(
      new ApiMsgResponse(
        "Device with the alias already exists",
        "api.device.aliasExists",
      ),
      400,
    );
  }

  const newDevice = await addDevice(
    body.alias,
    orgId,
    body.locationId,
    body.fullName,
  );
  return c.json(
    new ApiMsgResponse(
      "Device created successfully",
      "api.device.created",
      newDevice,
    ),
    201,
  );
});

/*
 * ----------------------------------------------------------------------------
 * Command
 * ----------------------------------------------------------------------------
 */
export const addDevice = async (
  alias: string,
  organizationId: string,
  locationId?: string,
  fullName: string = "",
) => {
  const newDevice = await db
    .insert(device)
    .values({
      alias,
      fullName,
      organizationId,
      locationId,
    })
    .returning();
  return newDevice;
};

/*
 * ----------------------------------------------------------------------------
 * Helpers
 * ----------------------------------------------------------------------------
 */
export const deviceWithAliasExists = async (alias: string) => {
  const existingDevice = await db.query.device.findFirst({
    where: eq(device.alias, alias),
  });
  return !!existingDevice;
};
