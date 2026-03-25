import { createFactory } from "hono/factory";
import type { AuthEnv, HonoEnv, OrgEnv } from "./types";

// For routes that require authentication
export const authFactory = createFactory<AuthEnv>();

// For public routes (no auth required)
export const publicFactory = createFactory<HonoEnv>();

// For routes that require authentication + organization context
export const orgFactory = createFactory<OrgEnv>();
