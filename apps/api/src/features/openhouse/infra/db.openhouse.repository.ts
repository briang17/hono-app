import { db } from "@packages/database";
import {
	openHouse,
	openHouseLead,
} from "@packages/database/src/schemas/openhouse.schema";
import { and, desc, eq } from "drizzle-orm";
import type { IOpenHouseRepository } from "../domain/interface.openhouse.repository";
import {
	OpenHouseFactory,
	OpenHouseLeadFactory,
} from "../domain/openhouse.entity";

export class DbOpenHouseRepository implements IOpenHouseRepository {
	async create(params: {
		organizationId: string;
		createdByUserId: string;
		propertyAddress: string;
		listingPrice: number;
		date: Date;
		startTime: string;
		endTime: string;
		listingImageUrl: string | null;
		notes: string | null;
	}) {
		const [result] = await db
			.insert(openHouse)
			.values({
				organizationId: params.organizationId,
				createdByUserId: params.createdByUserId,
				propertyAddress: params.propertyAddress,
				listingPrice: params.listingPrice.toString(),
				date: params.date,
				startTime: params.startTime,
				endTime: params.endTime,
				listingImageUrl: params.listingImageUrl,
				notes: params.notes,
			})
			.returning();

		if (!result) throw new Error();

		return OpenHouseFactory.create({
			id: result.id,
			organizationId: result.organizationId,
			createdByUserId: result.createdByUserId,
			propertyAddress: result.propertyAddress,
			listingPrice: Number(result.listingPrice),
			date: result.date,
			startTime: result.startTime,
			endTime: result.endTime,
			listingImageUrl: result.listingImageUrl ?? null,
			notes: result.notes ?? null,
			createdAt: result.createdAt,
			updatedAt: result.updatedAt,
		});
	}

	async findById(id: string) {
		const [result] = await db
			.select()
			.from(openHouse)
			.where(eq(openHouse.id, id))
			.limit(1);

		if (!result) return null;

		return OpenHouseFactory.create({
			id: result.id,
			organizationId: result.organizationId,
			createdByUserId: result.createdByUserId,
			propertyAddress: result.propertyAddress,
			listingPrice: Number(result.listingPrice),
			date: result.date,
			startTime: result.startTime,
			endTime: result.endTime,
			listingImageUrl: result.listingImageUrl ?? null,
			notes: result.notes ?? null,
			createdAt: result.createdAt,
			updatedAt: result.updatedAt,
		});
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
			OpenHouseFactory.create({
				id: result.id,
				organizationId: result.organizationId,
				createdByUserId: result.createdByUserId,
				propertyAddress: result.propertyAddress,
				listingPrice: Number(result.listingPrice),
				date: result.date,
				startTime: result.startTime,
				endTime: result.endTime,
				listingImageUrl: result.listingImageUrl ?? null,
				notes: result.notes ?? null,
				createdAt: result.createdAt,
				updatedAt: result.updatedAt,
			}),
		);
	}

	async findPublicById(id: string) {
		const [result] = await db
			.select()
			.from(openHouse)
			.where(eq(openHouse.id, id))
			.limit(1);

		if (!result) return null;

		return OpenHouseFactory.create({
			id: result.id,
			organizationId: result.organizationId,
			createdByUserId: result.createdByUserId,
			propertyAddress: result.propertyAddress,
			listingPrice: Number(result.listingPrice),
			date: result.date,
			startTime: result.startTime,
			endTime: result.endTime,
			listingImageUrl: result.listingImageUrl ?? null,
			notes: result.notes ?? null,
			createdAt: result.createdAt,
			updatedAt: result.updatedAt,
		});
	}

	async createLead(params: {
		openHouseId: string;
		organizationId: string;
		firstName: string;
		lastName: string;
		email: string | null;
		phone: string | null;
		workingWithAgent: boolean;
	}) {
		const [result] = await db
			.insert(openHouseLead)
			.values({
				openHouseId: params.openHouseId,
				organizationId: params.organizationId,
				firstName: params.firstName,
				lastName: params.lastName,
				email: params.email,
				phone: params.phone,
				workingWithAgent: params.workingWithAgent,
			})
			.returning();

		if (!result) throw new Error();

		return OpenHouseLeadFactory.create({
			id: result.id,
			openHouseId: result.openHouseId,
			organizationId: result.organizationId,
			firstName: result.firstName,
			lastName: result.lastName,
			email: result.email ?? null,
			phone: result.phone ?? null,
			workingWithAgent: result.workingWithAgent,
			submittedAt: result.submittedAt,
		});
	}

	async findLeadsByOpenHouseId(openHouseId: string) {
		const results = await db
			.select()
			.from(openHouseLead)
			.where(eq(openHouseLead.openHouseId, openHouseId))
			.orderBy(openHouseLead.submittedAt);

		return results.map((result) =>
			OpenHouseLeadFactory.create({
				id: result.id,
				openHouseId: result.openHouseId,
				organizationId: result.organizationId,
				firstName: result.firstName,
				lastName: result.lastName,
				email: result.email ?? null,
				phone: result.phone ?? null,
				workingWithAgent: result.workingWithAgent,
				submittedAt: result.submittedAt,
			}),
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
			OpenHouseLeadFactory.create({
				id: result.id,
				openHouseId: result.openHouseId,
				organizationId: result.organizationId,
				firstName: result.firstName,
				lastName: result.lastName,
				email: result.email ?? null,
				phone: result.phone ?? null,
				workingWithAgent: result.workingWithAgent,
				submittedAt: result.submittedAt,
			}),
		);
	}
}
