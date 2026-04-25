import { auth } from "./auth";
import { customEvent } from "@rrweb/types";

export type AppEnv = {
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
};

export type AppEnvProtected = AppEnv & {
  Variables: {
    user: typeof auth.$Infer.Session.user;
    session: typeof auth.$Infer.Session.session;
  };
};

export type customEventWithTime = customEvent & {
  timestamp: number;
  delay?: number;
};
