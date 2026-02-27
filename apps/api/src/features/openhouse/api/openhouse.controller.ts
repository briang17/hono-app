import { HTTPException } from "hono/http-exception";
import { DbOpenHouseRepository } from "../infra/db.openhouse.repository";
import { OpenHouseService } from "../service/openhouse.service";
import type {
	CreateOpenHouseCtx,
	CreateOpenHouseLeadCtx,
	GetOpenHouseCtx,
	GetOpenHouseLeadsCtx,
	GetOpenHousesCtx,
	GetPublicOpenHouseCtx
} from "./openhouse.schemas";
import { AppContext, AuthContext } from "@lib/types";

const repository = new DbOpenHouseRepository();
const service = new OpenHouseService(repository);

export const openhouseController = {
	createOpenHouse: async (c: AuthContext<CreateOpenHouseCtx>) => {
		const userId = c.get("session").userId;
		const organizationId = c.get("session").activeOrganizationId;

		if (!organizationId) {
			//LoggerService.traceRequest().info(`request with user without organizationId:`)
			throw new HTTPException(401, { message: "Unauthorized" });
		}

		const data = c.req.valid("json");

		const openHouse = await service.createOpenHouse(
			data,
			organizationId,
			userId,
		);

		return c.json({ data: openHouse }, 201);
	},

	getOpenHouses: async (c: AuthContext<GetOpenHousesCtx>) => {
		const userId = c.get("session").userId;
		const organizationId = c.get("session").activeOrganizationId;

		if (!organizationId) {
			throw new HTTPException(401, { message: "Unauthorized" });
		}
		console.log(`GETS TO CALL SERVICE`);
		const openHouses = await service.getOpenHouses(organizationId, userId);
		return c.json({ data: openHouses });
	},

	getOpenHouse: async (c: AuthContext<GetOpenHouseCtx>) => {
		const organizationId = c.get("session").activeOrganizationId;
		if (!organizationId) {
			throw new HTTPException(401, { message: "Unauthorized" });
		}

		const { id } = c.req.valid("param");
		
		const openHouse = await service.getOpenHouse(id);
		if (!openHouse || openHouse.organizationId !== organizationId) {
			throw new HTTPException(404, { message: "Open house not found" });
		}

		return c.json({ data: openHouse });
	},

	getPublicOpenHouse: async (c: AppContext<GetPublicOpenHouseCtx>) => {
		const { id } = c.req.valid("param");
		const openHouse = await service.getPublicOpenHouse(id);

		if (!openHouse) {
			throw new HTTPException(404, { message: "Open house not found" });
		}

		return c.json({ data: openHouse });
	},

	createOpenHouseLead: async (c: AppContext<CreateOpenHouseLeadCtx>) => {
		const { id: openHouseId } = c.req.valid('param');
		const openHouse = await service.getOpenHouse(openHouseId);

		if (!openHouse) {
			throw new HTTPException(404, { message: "Open house not found" });
		}

		const data = c.req.valid("json");
		const lead = await service.createOpenHouseLead(
			openHouseId,
			data,
			openHouse.organizationId,
		);

		return c.json({ data: lead }, 201);
	},

	getOpenHouseLeads: async (c: AuthContext<GetOpenHouseLeadsCtx>) => {
		const organizationId = c.get("session").activeOrganizationId;

		if (!organizationId) {
			throw new HTTPException(401, { message: "Unauthorized" });
		}

		const { id } = c.req.valid("param");
		const leads = await service.getOpenHouseLeadsOrg(id, organizationId);

		return c.json({ data: leads });
	},
};
