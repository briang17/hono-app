import { codes } from "@config/constants";
import { DbFormConfigRepository } from "@formconfig/infra/db.form-config.repository";
import { zValidator } from "@hono/zod-validator";
import { orgFactory, publicFactory } from "@lib/factory";
import { rbacMiddleware } from "@middlewares/rbac.middleware";
import { CreateOpenHouseLeadParamsSchema, GetOpenHouseLeadsParamsSchema, GetOpenHouseParamsSchema, GetPublicOpenHouseParamsSchema, } from "@openhouse/api/openhouse.schemas";
import { NewOpenHouseLeadSchema, NewOpenHouseSchema, } from "@openhouse/domain/openhouse.entity";
import { DbOpenHouseRepository } from "@openhouse/infra/db.openhouse.repository";
import { OpenHouseService } from "@openhouse/service/openhouse.service";
import { HTTPException } from "hono/http-exception";
const repository = new DbOpenHouseRepository();
const formConfigRepository = new DbFormConfigRepository();
const service = new OpenHouseService(repository, formConfigRepository);
export const createOpenHouseHandlers = orgFactory.createHandlers(zValidator("json", NewOpenHouseSchema), rbacMiddleware({ openhouse: ["create"] }), async (c) => {
    const userId = c.get("session").userId;
    const organizationId = c.get("organizationId");
    const data = c.req.valid("json");
    const openHouse = await service.createOpenHouse(data, organizationId, userId);
    return c.json({ data: openHouse }, codes.CREATED);
});
export const getOpenHousesHandlers = orgFactory.createHandlers(rbacMiddleware({ openhouse: ["view"] }), async (c) => {
    const userId = c.get("session").userId;
    const organizationId = c.get("organizationId");
    const openHouses = await service.getOpenHouses(organizationId, userId);
    return c.json({ data: openHouses });
});
export const getOpenHouseHandlers = orgFactory.createHandlers(zValidator("param", GetOpenHouseParamsSchema), rbacMiddleware({ openhouse: ["view"] }), async (c) => {
    const organizationId = c.get("organizationId");
    const { id } = c.req.valid("param");
    const openHouse = await service.getOpenHouse(id);
    if (!openHouse || openHouse.organizationId !== organizationId) {
        throw new HTTPException(codes.NOT_FOUND, {
            message: "Open house not found",
        });
    }
    return c.json({ data: openHouse });
});
export const deleteOpenHouseHandlers = orgFactory.createHandlers(zValidator("param", GetOpenHouseParamsSchema), rbacMiddleware({ openhouse: ["delete"] }), async (c) => {
    const organizationId = c.get("organizationId");
    const { id } = c.req.valid("param");
    await service.deleteOpenHouse(id, organizationId);
    return c.json({ data: { id } });
});
export const getOpenHouseLeadsHandlers = orgFactory.createHandlers(zValidator("param", GetOpenHouseLeadsParamsSchema), rbacMiddleware({ lead: ["view"] }), async (c) => {
    const organizationId = c.get("organizationId");
    const { id } = c.req.valid("param");
    const result = await service.getOpenHouseLeadsWithFormConfig(id, organizationId);
    return c.json({ data: result });
});
export const getPublicOpenHouseHandlers = publicFactory.createHandlers(zValidator("param", GetPublicOpenHouseParamsSchema), async (c) => {
    const { id } = c.req.valid("param");
    const openHouse = await service.getPublicOpenHouseWithFormConfig(id);
    if (!openHouse) {
        throw new HTTPException(codes.NOT_FOUND, {
            message: "Open house not found",
        });
    }
    return c.json({ data: openHouse });
});
export const createOpenHouseLeadHandlers = publicFactory.createHandlers(zValidator("param", CreateOpenHouseLeadParamsSchema), zValidator("json", NewOpenHouseLeadSchema), async (c) => {
    const { id: openHouseId } = c.req.valid("param");
    const openHouse = await service.getOpenHouse(openHouseId);
    if (!openHouse) {
        throw new HTTPException(codes.NOT_FOUND, {
            message: "Open house not found",
        });
    }
    const data = c.req.valid("json");
    try {
        const lead = await service.createOpenHouseLead(openHouseId, data, openHouse.organizationId);
        return c.json({ data: lead }, codes.CREATED);
    }
    catch (error) {
        if (error instanceof HTTPException) {
            throw error;
        }
        throw new HTTPException(codes.INTERNAL_SERVER_ERROR, {
            message: "Failed to create lead",
        });
    }
});
