import { db } from "@packages/database";
import { organizationFormConfig } from "@packages/database/src/schemas/form-config.schema";
import { openHouse, openHouseLead, } from "@packages/database/src/schemas/openhouse.schema";
import { and, desc, eq } from "drizzle-orm";
import { OpenHouseFactory, OpenHouseLeadFactory, } from "../domain/openhouse.entity";
export class DbOpenHouseRepository {
    async create(params) {
        const [result] = await db.insert(openHouse).values(params).returning();
        if (!result)
            throw new Error();
        return OpenHouseFactory.fromDb(result);
    }
    async findById(id) {
        const [result] = await db
            .select()
            .from(openHouse)
            .where(eq(openHouse.id, id))
            .limit(1);
        if (!result)
            return null;
        return OpenHouseFactory.fromDb(result);
    }
    async findByOrgAndUser(organizationId, userId) {
        const results = await db
            .select()
            .from(openHouse)
            .where(and(eq(openHouse.organizationId, organizationId), eq(openHouse.createdByUserId, userId)))
            .orderBy(desc(openHouse.date), desc(openHouse.createdAt));
        return results.map((result) => OpenHouseFactory.fromDb(result));
    }
    async findPublicById(id) {
        const [result] = await db
            .select()
            .from(openHouse)
            .where(eq(openHouse.id, id))
            .limit(1);
        if (!result)
            return null;
        return OpenHouseFactory.fromDb(result);
    }
    async findPublicByIdWithFormConfig(id) {
        const [result] = await db
            .select({
            id: openHouse.id,
            propertyAddress: openHouse.propertyAddress,
            date: openHouse.date,
            startTime: openHouse.startTime,
            endTime: openHouse.endTime,
            formConfig: organizationFormConfig,
            listingImageUrl: openHouse.listingImageUrl,
        })
            .from(openHouse)
            .leftJoin(organizationFormConfig, eq(organizationFormConfig.organizationId, openHouse.organizationId))
            .where(eq(openHouse.id, id))
            .limit(1);
        if (!result)
            return null;
        return {
            id: result.id,
            propertyAddress: result.propertyAddress,
            date: result.date,
            startTime: result.startTime,
            endTime: result.endTime,
            formConfig: result.formConfig
                ? {
                    id: result.formConfig.id,
                    organizationId: result.formConfig.organizationId,
                    questions: result.formConfig
                        .questions,
                    createdAt: result.formConfig.createdAt,
                    updatedAt: result.formConfig.updatedAt,
                }
                : null,
            listingImageUrl: result.listingImageUrl ?? null,
        };
    }
    async createLead(params) {
        const [result] = await db
            .insert(openHouseLead)
            .values({
            ...params,
            responses: params.responses,
        })
            .returning();
        if (!result)
            throw new Error();
        return OpenHouseLeadFactory.fromDb({
            ...result,
            responses: result.responses,
        });
    }
    async findLeadsByOpenHouseId(openHouseId) {
        const results = await db
            .select()
            .from(openHouseLead)
            .where(eq(openHouseLead.openHouseId, openHouseId))
            .orderBy(openHouseLead.submittedAt);
        return results.map((result) => OpenHouseLeadFactory.fromDb({
            ...result,
            responses: result.responses,
        }));
    }
    async findLeadsByOpenHouseIdAndOrg(openHouseId, organizationId) {
        const results = await db
            .select()
            .from(openHouseLead)
            .where(and(eq(openHouseLead.openHouseId, openHouseId), eq(openHouseLead.organizationId, organizationId)))
            .orderBy(openHouseLead.submittedAt);
        return results.map((result) => OpenHouseLeadFactory.fromDb({
            ...result,
            responses: result.responses,
        }));
    }
}
