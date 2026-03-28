import { codes } from "@config/constants";
import { HTTPException } from "hono/http-exception";
import { DbFormConfigRepository } from "../infra/db.form-config.repository";
import { FormConfigService } from "../service/form-config.service";
const repository = new DbFormConfigRepository();
const service = new FormConfigService(repository);
export const formConfigController = {
    getFormConfig: async (c) => {
        const organizationId = c.get("session").activeOrganizationId;
        if (!organizationId) {
            throw new HTTPException(codes.UNAUTHORIZED, {
                message: "Unauthorized",
            });
        }
        const config = await service.getFormConfig(organizationId);
        if (!config) {
            throw new HTTPException(codes.NOT_FOUND, {
                message: "Form config not found",
            });
        }
        return c.json({ data: config });
    },
    createFormConfig: async (c) => {
        const organizationId = c.get("session").activeOrganizationId;
        if (!organizationId) {
            throw new HTTPException(codes.UNAUTHORIZED, {
                message: "Unauthorized",
            });
        }
        const data = c.req.valid("json");
        const existingConfig = await service.getFormConfig(organizationId);
        if (existingConfig) {
            throw new HTTPException(codes.CONFLICT, {
                message: "Form config already exists for this organization",
            });
        }
        const config = await service.createFormConfig(organizationId, data.questions);
        return c.json({ data: config }, codes.CREATED);
    },
    updateFormConfig: async (c) => {
        const organizationId = c.get("session").activeOrganizationId;
        if (!organizationId) {
            throw new HTTPException(codes.UNAUTHORIZED, {
                message: "Unauthorized",
            });
        }
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
    },
    deleteFormConfig: async (c) => {
        const organizationId = c.get("session").activeOrganizationId;
        if (!organizationId) {
            throw new HTTPException(codes.UNAUTHORIZED, {
                message: "Unauthorized",
            });
        }
        const { id } = c.req.valid("param");
        const existingConfig = await service.getFormConfig(organizationId);
        if (!existingConfig || existingConfig.id !== id) {
            throw new HTTPException(codes.NOT_FOUND, {
                message: "Form config not found",
            });
        }
        await service.deleteFormConfig(id);
        return c.json({ message: "Form config deleted successfully" });
    },
};
