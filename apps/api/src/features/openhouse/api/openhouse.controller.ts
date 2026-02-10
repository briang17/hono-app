import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { DbOpenHouseRepository } from "../infra/db.openhouse.repository";
import { OpenHouseService } from "../service/openhouse.service";
import type {
	CreateOpenHouseInput,
	CreateOpenHouseLeadInput,
} from "./openhouse.schemas";

const repository = new DbOpenHouseRepository();
const service = new OpenHouseService(repository);

export const openhouseController = {
	createOpenHouse: async (c: Context) => {
		const userId = c.get("session")?.userId;
		const organizationId = c.get("session")?.activeOrganizationId;

		if (!userId || !organizationId) {
			throw new HTTPException(401, { message: "Unauthorized" });
		}

		const data = c.get("validatedData") as CreateOpenHouseInput;
		const openHouse = await service.createOpenHouse(
			data,
			organizationId,
			userId,
		);

		return c.json({ data: openHouse }, 201);
	},

	getOpenHouses: async (c: Context) => {
		const userId = c.get("session")?.userId;
		const organizationId = c.get("session")?.activeOrganizationId;

		if (!userId || !organizationId) {
			throw new HTTPException(401, { message: "Unauthorized" });
		}

		const openHouses = await service.getOpenHouses(organizationId, userId);
		return c.json({ data: openHouses });
	},

	getOpenHouse: async (c: Context) => {
		const userId = c.get("session")?.userId;
		const organizationId = c.get("session")?.activeOrganizationId;

		if (!userId || !organizationId) {
			throw new HTTPException(401, { message: "Unauthorized" });
		}

		const { id } = c.get("params");
		const openHouse = await service.getOpenHouse(id);

		if (!openHouse || openHouse.organizationId !== organizationId) {
			throw new HTTPException(404, { message: "Open house not found" });
		}

		return c.json({ data: openHouse });
	},

	getPublicOpenHouse: async (c: Context) => {
		const { id } = c.get("params");
		const openHouse = await service.getPublicOpenHouse(id);

		if (!openHouse) {
			throw new HTTPException(404, { message: "Open house not found" });
		}

		return c.json({ data: openHouse });
	},

	createOpenHouseLead: async (c: Context) => {
		const { id: openHouseId } = c.get("params");
		const openHouse = await service.getOpenHouse(openHouseId);

		if (!openHouse) {
			throw new HTTPException(404, { message: "Open house not found" });
		}

		const data = c.get("validatedData") as CreateOpenHouseLeadInput;
		const lead = await service.createOpenHouseLead(
			openHouseId,
			data,
			openHouse.organizationId,
		);

		return c.json({ data: lead }, 201);
	},

	getOpenHouseLeads: async (c: Context) => {
		const organizationId = c.get("session")?.activeOrganizationId;

		if (!organizationId) {
			throw new HTTPException(401, { message: "Unauthorized" });
		}

		const { id } = c.get("params");
		const leads = await service.getOpenHouseLeadsOrg(id, organizationId);

		return c.json({ data: leads });
	},
};
