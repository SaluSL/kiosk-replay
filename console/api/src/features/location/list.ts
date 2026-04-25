import { Hono } from "hono";
import { AppEnvProtected } from "@/lib/types";
import { db } from "@/lib/database/db";
import { location } from "@/lib/database/schema/core";
import { eq } from "drizzle-orm";
import { ApiMsgResponse } from "@/lib/helpers/responses/api-msg-response";
import { ApiDataResponse } from "@/lib/helpers/responses/api-data-response";

export const locationListRoute = new Hono<AppEnvProtected>();

/*
 * ----------------------------------------------------------------------------
 * Route handler
 * ----------------------------------------------------------------------------
 */

locationListRoute.get("/", async (c) => {
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

  const locations = await listLocations(session.activeOrganizationId);
  return c.json(new ApiDataResponse(locations), 200);
});

/*
 * ----------------------------------------------------------------------------
 * Query
 * ----------------------------------------------------------------------------
 */
export const listLocations = async (organizationId: string) => {
  const locations = await db.query.location.findMany({
    where: eq(location.organizationId, organizationId),
  });
  return locations;
};
