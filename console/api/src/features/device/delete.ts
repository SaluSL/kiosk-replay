import { Hono } from "hono";
import { AppEnvProtected } from "@/lib/types";
import { db } from "@/lib/database/db";
import { device } from "@/lib/database/schema/core";
import { eq } from "drizzle-orm";
import { ApiMsgResponse } from "@/lib/helpers/responses/api-msg-response";

export const deviceDeleteRoute = new Hono<AppEnvProtected>();

/*
 * ----------------------------------------------------------------------------
 * Route handler
 * ----------------------------------------------------------------------------
 */

deviceDeleteRoute.delete("/:id", async (c) => {
  const session = c.get("session");

  const device = await getDeviceById(c.req.param("id"));
  if (!device || device.organizationId !== session.activeOrganizationId) {
    return c.json(
      new ApiMsgResponse("Device not found", "api.device.notFound"),
      404,
    );
  }

  await deleteDeviceById(c.req.param("id"));

  return c.json(
    new ApiMsgResponse("Device deleted successfully", "api.device.deleted"),
    200,
  );
});

/*
 * ----------------------------------------------------------------------------
 * Command
 * ----------------------------------------------------------------------------
 */
export const deleteDeviceById = async (id: string) => {
  await db.delete(device).where(eq(device.id, id));
};

/*
 * ----------------------------------------------------------------------------
 * Helpers
 * ----------------------------------------------------------------------------
 */
export const getDeviceById = async (id: string) => {
  const d = await db.query.device.findFirst({
    where: eq(device.id, id),
  });
  return d;
};
