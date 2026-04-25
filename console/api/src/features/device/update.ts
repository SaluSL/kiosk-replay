import { db } from "@/lib/database/db";
import { device } from "@/lib/database/schema/core";
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { AppEnvProtected } from "@/lib/types";
import { eq } from "drizzle-orm";
import { ApiMsgResponse } from "@/lib/helpers/responses/api-msg-response";

export const deviceUpdateRoute = new Hono<AppEnvProtected>();

/*
 * ----------------------------------------------------------------------------
 * Schema
 * ----------------------------------------------------------------------------
 */
const deviceUpdateSchema = z.object({
  alias: z.string().min(1).max(255).optional(),
  fullName: z.string().optional(),
  locationId: z.string().optional(),
});

/*
 * ----------------------------------------------------------------------------
 * Route handler
 * ----------------------------------------------------------------------------
 */
deviceUpdateRoute.post(
  "/:id",
  zValidator("json", deviceUpdateSchema),
  async (c) => {
    const body = await c.req.json();
    const session = c.get("session");

    const orgId = session.activeOrganizationId;

    const d = await getDeviceById(c.req.param("id"));

    if (!d || d.organizationId !== orgId) {
      return c.json(
        new ApiMsgResponse("Device not found", "api.device.notFound"),
        404,
      );
    }

    if (
      body.alias &&
      d.alias !== body.alias &&
      (await deviceWithAliasExists(body.alias))
    ) {
      return c.json(
        new ApiMsgResponse(
          "Device with the alias already exists",
          "api.device.aliasExists",
        ),
        400,
      );
    }

    const newDevice = await updateDevice(
      c.req.param("id"),
      body.alias ?? d.alias,
      body.locationId ?? d.locationId,
      body.fullName ?? d.fullName,
    );

    return c.json(
      new ApiMsgResponse(
        "Device updated successfully",
        "api.device.updated",
        newDevice,
      ),
      201,
    );
  },
);

/*
 * ----------------------------------------------------------------------------
 * Command
 * ----------------------------------------------------------------------------
 */
export const updateDevice = async (
  deviceId: string,
  alias: string,
  locationId?: string,
  fullName: string = "",
) => {
  const updatedDevice = await db
    .update(device)
    .set({
      alias,
      fullName,
      locationId,
    })
    .where(eq(device.id, deviceId))
    .returning();
  return updatedDevice[0];
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

export const getDeviceById = async (id: string) => {
  const d = await db.query.device.findFirst({
    where: eq(device.id, id),
  });
  return d;
};
