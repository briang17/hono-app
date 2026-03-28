import { createFactory } from "hono/factory";
// For routes that require authentication
export const authFactory = createFactory();
// For public routes (no auth required)
export const publicFactory = createFactory();
// For routes that require authentication + organization context
export const orgFactory = createFactory();
