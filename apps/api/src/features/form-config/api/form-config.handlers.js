import { codes } from "@config/constants";
import { DbFormConfigRepository } from "@formconfig/infra/db.form-config.repository";
import { FormConfigService } from "@formconfig/service/form-config.service";
import { zValidator } from "@hono/zod-validator";
import { orgFactory } from "@lib/factory";
import { rbacMiddleware } from "@middlewares/rbac.middleware";
import { HTTPException } from "hono/http-exception";
import { CreateFormConfigBodySchema, DeleteFormConfigParamsSchema, UpdateFormConfigBodySchema, UpdateFormConfigParamsSchema, } from "./form-config.schemas";
const repository = new DbFormConfigRepository();
const service = new FormConfigService(repository);
export const getFormConfigHandlers = orgFactory.createHandlers(rbacMiddleware({ form_config: ["view"] }), async (c) => {
    const organizationId = c.get("organizationId");
    const config = await service.getFormConfig(organizationId);
    if (!config) {
        throw new HTTPException(codes.NOT_FOUND, {
            message: "Form config not found",
        });
    }
    return c.json({ data: config });
});
export const createFormConfigHandlers = orgFactory.createHandlers(zValidator("json", CreateFormConfigBodySchema), rbacMiddleware({ form_config: ["create"] }), async (c) => {
    const organizationId = c.get("organizationId");
    const data = c.req.valid("json");
    const existingConfig = await service.getFormConfig(organizationId);
    if (existingConfig) {
        throw new HTTPException(codes.CONFLICT, {
            message: "Form config already exists for this organization",
        });
    }
    const config = await service.createFormConfig(organizationId, data.questions);
    return c.json({ data: config }, codes.CREATED);
});
export const updateFormConfigHandlers = orgFactory.createHandlers(zValidator("param", UpdateFormConfigParamsSchema), zValidator("json", UpdateFormConfigBodySchema), rbacMiddleware({ form_config: ["update"] }), async (c) => {
    const organizationId = c.get("organizationId");
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");
    const existingConfig = await service.getFormConfig(organizationId);
    if (!existingConfig || existingConfig.id !== id) {
        throw new HTTPException(codes.NOT_FOUND, {
            message: "Form config not found",
        });
    }
    const config = await service.updateFormConfig(id, data.questions);
    if (!config) {
        throw new HTTPException(codes.NOT_FOUND, {
            message: "Form config not found",
        });
    }
    return c.json({ data: config });
});
export const deleteFormConfigHandlers = orgFactory.createHandlers(zValidator("param", DeleteFormConfigParamsSchema), rbacMiddleware({ form_config: ["delete"] }), async (c) => {
    const organizationId = c.get("organizationId");
    const { id } = c.req.valid("param");
    const existingConfig = await service.getFormConfig(organizationId);
    if (!existingConfig || existingConfig.id !== id) {
        throw new HTTPException(codes.NOT_FOUND, {
            message: "Form config not found",
        });
    }
    await service.deleteFormConfig(id);
    return c.json({ message: "Form config deleted successfully" });
});
