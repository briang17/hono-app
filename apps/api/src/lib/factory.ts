import { createFactory } from "hono/factory";
import type { AuthEnv, HonoEnv } from "./types";

// For routes that require authentication
export const authFactory = createFactory<AuthEnv>();

// For public routes (no auth required)
export const publicFactory = createFactory<HonoEnv>();
