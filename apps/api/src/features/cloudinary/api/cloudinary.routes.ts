import { authMiddleware } from "@middlewares/auth.middleware";
import { orgMiddleware } from "@middlewares/org.middleware";
import { Hono } from "hono";
import { getConfigHandlers, getSignatureHandlers } from "./cloudinary.handlers";

const cloudinaryRoutes = new Hono()
    .use(authMiddleware)
    .use(orgMiddleware)
    .get("/config", ...getConfigHandlers)
    .post("/signature", ...getSignatureHandlers);

export { cloudinaryRoutes };
