import {
    CreateFormConfigBodySchema,
    DeleteFormConfigParamsSchema,
    UpdateFormConfigBodySchema,
    UpdateFormConfigParamsSchema,
} from "@formconfig/api/form-config.schemas";
import { zValidator } from "@hono/zod-validator";
import { authMiddleware } from "@middlewares/auth.middleware";
import { Hono } from "hono";
import { formConfigController } from "./form-config.controller";

const formConfigRoutes = new Hono()
    .use(authMiddleware)
    .get("/", formConfigController.getFormConfig)
    .post(
        "/",
        zValidator("json", CreateFormConfigBodySchema),
        formConfigController.createFormConfig,
    )
    .put(
        "/:id",
        zValidator("param", UpdateFormConfigParamsSchema),
        zValidator("json", UpdateFormConfigBodySchema),
        formConfigController.updateFormConfig,
    )
    .delete(
        "/:id",
        zValidator("param", DeleteFormConfigParamsSchema),
        formConfigController.deleteFormConfig,
    );

export { formConfigRoutes };
