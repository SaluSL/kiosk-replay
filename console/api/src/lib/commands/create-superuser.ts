import { parseArgs } from "util";
import { log } from "@/lib/logger";
import { auth } from "@/lib/auth";

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    email: {
      type: "string",
      required: true,
    },
    password: {
      type: "string",
      required: true,
    },
    orgName: {
      type: "string",
      required: true,
    },
    orgSlug: {
      type: "string",
      required: true,
    },
  },
  strict: true,
  allowPositionals: true,
});

if (!values.email || !values.password || !values.orgName || !values.orgSlug) {
  log.error(
    "Missing required arguments: --email, --password, --orgName or --orgSlug",
  );
  process.exit(1);
}

auth.api
  .signUpEmail({
    body: {
      email: values.email,
      password: values.password,
      name: values.email,
    },
  })
  .then((res) => {
    auth.api
      .createOrganization({
        body: {
          name: values.orgName!,
          slug: values.orgSlug!,
          userId: res.user.id,
        },
      })
      .then(() => {
        log.info("Superuser created successfully");
        process.exit(0);
      })
      .catch((err) => {
        log.error("Error creating organization");
        log.error(err);
        process.exit(1);
      });
  })
  .catch((err) => {
    log.error("Error creating superuser");
    log.error(err);
    process.exit(1);
  });
