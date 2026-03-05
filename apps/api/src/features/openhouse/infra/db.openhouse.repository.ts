import type { Id } from "@features/common/values";
import { db } from "@packages/database";
import { organizationFormConfig } from "@packages/database/src/schemas/form-config.schema";
import {
    openHouse,
    openHouseLead,
} from "@packages/database/src/schemas/openhouse.schema";
import { and, desc, eq } from "drizzle-orm";
import type { IOpenHouseRepository } from "../domain/interface.openhouse.repository";
import {
    type FormConfig,
    type OpenHouse,
    OpenHouseFactory,
    type OpenHouseLead,
    OpenHouseLeadFactory,
    type PublicOpenHouse,
} from "../domain/openhouse.entity";

export class DbOpenHouseRepository implements IOpenHouseRepository {
    async create(params: OpenHouse) {
        const [result] = await db.insert(openHouse).values(params).returning();

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

        return results.map((result) => OpenHouseFactory.fromDb(result));
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

    async findPublicByIdWithFormConfig(
        id: string,
    ): Promise<PublicOpenHouse | null> {
        const [result] = await db
            .select({
                id: openHouse.id,
                propertyAddress: openHouse.propertyAddress,
                date: openHouse.date,
                startTime: openHouse.startTime,
                endTime: openHouse.endTime,
                formConfig: organizationFormConfig,
            })
            .from(openHouse)
            .leftJoin(
                organizationFormConfig,
                eq(
                    organizationFormConfig.organizationId,
                    openHouse.organizationId,
                ),
            )
            .where(eq(openHouse.id, id))
            .limit(1);

        if (!result) return null;

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
                          .questions as FormConfig["questions"],
                      createdAt: result.formConfig.createdAt,
                      updatedAt: result.formConfig.updatedAt,
                  }
                : null,
        };
    }

    async createLead(params: OpenHouseLead) {
        const [result] = await db
            .insert(openHouseLead)
            .values({
                ...params,
                responses: params.responses as unknown,
            })
            .returning();

        if (!result) throw new Error();

        return OpenHouseLeadFactory.fromDb({
            ...result,
            responses: result.responses as OpenHouseLead["responses"],
        });
    }

    async findLeadsByOpenHouseId(openHouseId: string) {
        const results = await db
            .select()
            .from(openHouseLead)
            .where(eq(openHouseLead.openHouseId, openHouseId))
            .orderBy(openHouseLead.submittedAt);

        return results.map((result) =>
            OpenHouseLeadFactory.fromDb({
                ...result,
                responses: result.responses as OpenHouseLead["responses"],
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
            OpenHouseLeadFactory.fromDb({
                ...result,
                responses: result.responses as OpenHouseLead["responses"],
            }),
        );
    }
}
