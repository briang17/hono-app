import { db } from "@packages/database";
import {
	openHouse,
	openHouseLead,
} from "@packages/database/src/schemas/openhouse.schema";
import { and, desc, eq } from "drizzle-orm";
import type { IOpenHouseRepository } from "../domain/interface.openhouse.repository";
import {
	OpenHouse,
	OpenHouseFactory,
	OpenHouseLead,
	OpenHouseLeadFactory,
} from "../domain/openhouse.entity";
import { Id } from "@features/common/values";

export class DbOpenHouseRepository implements IOpenHouseRepository {
	async create(params: OpenHouse) {
		const [result] = await db
			.insert(openHouse)
			.values(params)
			.returning();

		if (!result) throw new Error();

		return OpenHouseFactory.fromDb(result);
	}

	async findById(id: Id) {
		const [result] = await db
			.select()
			.from(openHouse)
			.where(eq(openHouse.id, id))
			.limit(1);

		if (!result) return null;

		return OpenHouseFactory.fromDb(result);
	}

	async findByOrgAndUser(organizationId: string, userId: string) {
		const results = await db
			.select()
			.from(openHouse)
			.where(
				and(
					eq(openHouse.organizationId, organizationId),
					eq(openHouse.createdByUserId, userId),
				),
			)
			.orderBy(desc(openHouse.date), desc(openHouse.createdAt));

		return results.map((result) =>
			OpenHouseFactory.fromDb(result),
		);
	}

	async findPublicById(id: string) {
		const [result] = await db
			.select()
			.from(openHouse)
			.where(eq(openHouse.id, id))
			.limit(1);

		if (!result) return null;

		return OpenHouseFactory.fromDb(result);
	}

	async createLead(params: OpenHouseLead) {
		const [result] = await db
			.insert(openHouseLead)
			.values(params)
			.returning();

		if (!result) throw new Error();

		return OpenHouseLeadFactory.fromDb(result);
	}

	async findLeadsByOpenHouseId(openHouseId: string) {
		const results = await db
			.select()
			.from(openHouseLead)
			.where(eq(openHouseLead.openHouseId, openHouseId))
			.orderBy(openHouseLead.submittedAt);

		return results.map((result) =>
			OpenHouseLeadFactory.fromDb(result),
		);
	}

	async findLeadsByOpenHouseIdAndOrg(
		openHouseId: string,
		organizationId: string,
	) {
		const results = await db
			.select()
			.from(openHouseLead)
			.where(
				and(
					eq(openHouseLead.openHouseId, openHouseId),
					eq(openHouseLead.organizationId, organizationId),
				),
			)
			.orderBy(openHouseLead.submittedAt);

		return results.map((result) =>
			OpenHouseLeadFactory.fromDb(result),
		);
	}
}
