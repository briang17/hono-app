import { authMiddleware } from "@middlewares/auth.middleware";
import { orgMiddleware } from "@middlewares/org.middleware";
import { Hono } from "hono";
import {
    createFormConfigHandlers,
    deleteFormConfigHandlers,
    getFormConfigHandlers,
    updateFormConfigHandlers,
} from "./form-config.handlers";

const formConfigRoutes = new Hono()
    .use(authMiddleware)
    .use(orgMiddleware)
    .get("/", ...getFormConfigHandlers)
    .post("/", ...createFormConfigHandlers)
    .put("/:id", ...updateFormConfigHandlers)
    .delete("/:id", ...deleteFormConfigHandlers);

export { formConfigRoutes };
