import { Hono } from "hono";
import { AppEnvProtected } from "@/lib/types";
import { db } from "@/lib/database/db";
import { device } from "@/lib/database/schema/core";
import { eq } from "drizzle-orm";
import { ApiDataResponse } from "@/lib/helpers/responses/api-data-response";
import { ApiMsgResponse } from "@/lib/helpers/responses/api-msg-response";

export const deviceListRoute = new Hono<AppEnvProtected>();

/*
 * ----------------------------------------------------------------------------
 * Route handler
 * ----------------------------------------------------------------------------
 */

deviceListRoute.get("/", async (c) => {
  const session = c.get("session");

  if (!session.activeOrganizationId) {
    return c.json(
      new ApiMsgResponse(
        "Organization not found for this user",
        "api.organization.notFound",
      ),
      404,
    );
  }

  const devices = await listDevices(session.activeOrganizationId);
  return c.json(new ApiDataResponse(devices), 200);
});

/*
 * ----------------------------------------------------------------------------
 * Query
 * ----------------------------------------------------------------------------
 */
export const listDevices = async (organizationId: string) => {
  const devices = await db.query.device.findMany({
    where: eq(device.organizationId, organizationId),
  });
  return devices;
};
