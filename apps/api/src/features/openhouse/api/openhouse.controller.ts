import { codes } from "@config/constants";
import { DbFormConfigRepository } from "@formconfig/infra/db.form-config.repository";
import type { AppContext, AuthContext } from "@lib/types";
import { HTTPException } from "hono/http-exception";
import { DbOpenHouseRepository } from "../infra/db.openhouse.repository";
import { OpenHouseService } from "../service/openhouse.service";
import type {
    CreateOpenHouseCtx,
    CreateOpenHouseLeadCtx,
    GetOpenHouseCtx,
    GetOpenHouseLeadsCtx,
    GetOpenHousesCtx,
    GetPublicOpenHouseCtx,
} from "./openhouse.schemas";

const repository = new DbOpenHouseRepository();
const formConfigRepository = new DbFormConfigRepository();
const service = new OpenHouseService(repository, formConfigRepository);

export const openhouseController = {
    createOpenHouse: async (c: AuthContext<CreateOpenHouseCtx>) => {
        const userId = c.get("session").userId;
        const organizationId = c.get("session").activeOrganizationId;

        if (!organizationId) {
            //LoggerService.traceRequest().info(`request with user without organizationId:`)
            throw new HTTPException(codes.UNAUTHORIZED, {
                message: "Unauthorized",
            });
        }

        const data = c.req.valid("json");

        const openHouse = await service.createOpenHouse(
            data,
            organizationId,
            userId,
        );

        return c.json({ data: openHouse }, codes.CREATED);
    },

    getOpenHouses: async (c: AuthContext<GetOpenHousesCtx>) => {
        const userId = c.get("session").userId;
        const organizationId = c.get("session").activeOrganizationId;

        if (!organizationId) {
            throw new HTTPException(codes.UNAUTHORIZED, {
                message: "Unauthorized",
            });
        }
        const openHouses = await service.getOpenHouses(organizationId, userId);
        return c.json({ data: openHouses });
    },

    getOpenHouse: async (c: AuthContext<GetOpenHouseCtx>) => {
        const organizationId = c.get("session").activeOrganizationId;
        if (!organizationId) {
            throw new HTTPException(codes.UNAUTHORIZED, {
                message: "Unauthorized",
            });
        }

        const { id } = c.req.valid("param");

        const openHouse = await service.getOpenHouse(id);
        if (!openHouse || openHouse.organizationId !== organizationId) {
            throw new HTTPException(codes.NOT_FOUND, {
                message: "Open house not found",
            });
        }

        return c.json({ data: openHouse });
    },

    getPublicOpenHouse: async (c: AppContext<GetPublicOpenHouseCtx>) => {
        const { id } = c.req.valid("param");
        const openHouse = await service.getPublicOpenHouseWithFormConfig(id);

        if (!openHouse) {
            throw new HTTPException(codes.NOT_FOUND, {
                message: "Open house not found",
            });
        }

        return c.json({ data: openHouse });
    },

    createOpenHouseLead: async (c: AppContext<CreateOpenHouseLeadCtx>) => {
        const { id: openHouseId } = c.req.valid("param");
        const openHouse = await service.getOpenHouse(openHouseId);

        if (!openHouse) {
            throw new HTTPException(codes.NOT_FOUND, {
                message: "Open house not found",
            });
        }

        const data = c.req.valid("json");

        try {
            const lead = await service.createOpenHouseLead(
                openHouseId,
                data,
                openHouse.organizationId,
            );

            return c.json({ data: lead }, codes.CREATED);
        } catch (error) {
            if (error instanceof HTTPException) {
                throw error;
            }
            throw new HTTPException(codes.INTERNAL_SERVER_ERROR, {
                message: "Failed to create lead",
            });
        }
    },

    getOpenHouseLeads: async (c: AuthContext<GetOpenHouseLeadsCtx>) => {
        const organizationId = c.get("session").activeOrganizationId;

        if (!organizationId) {
            throw new HTTPException(codes.UNAUTHORIZED, {
                message: "Unauthorized",
            });
        }

        const { id } = c.req.valid("param");
        const leads = await service.getOpenHouseLeadsOrg(id, organizationId);

        return c.json({ data: leads });
    },
};
