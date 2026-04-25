import { Hono } from "hono";
import { AppEnvProtected } from "@/lib/types";
import { db } from "@/lib/database/db";
import { device } from "@/lib/database/schema/core";
import { eq } from "drizzle-orm";
import { ApiMsgResponse } from "@/lib/helpers/responses/api-msg-response";
import { ApiDataResponse } from "@/lib/helpers/responses/api-data-response";

export const deviceGetRoute = new Hono<AppEnvProtected>();

/*
 * ----------------------------------------------------------------------------
 * Route handler
 * ----------------------------------------------------------------------------
 */

deviceGetRoute.get("/:id", async (c) => {
  const session = c.get("session");

  const device = await getDeviceById(c.req.param("id"));
  if (!device || device.organizationId !== session.activeOrganizationId) {
    return c.json(
      new ApiMsgResponse("Device not found", "api.device.notFound"),
      404,
    );
  }

  return c.json(new ApiDataResponse(device), 200);
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
