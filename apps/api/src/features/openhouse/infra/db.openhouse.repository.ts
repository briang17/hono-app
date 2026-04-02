import type { Id } from "@features/common/values";
import type { FormConfig } from "@formconfig/domain/form-config.entity";
import { db } from "@packages/database";
import { organizationFormConfig } from "@packages/database/src/schemas/form-config.schema";
import {
    openHouse,
    openHouseImage,
    openHouseLead,
} from "@packages/database/src/schemas/openhouse.schema";
import { and, desc, eq } from "drizzle-orm";
import type { IOpenHouseRepository } from "../domain/interface.openhouse.repository";
import {
    type NewOpenHouseImageInput,
    type OpenHouse,
    OpenHouseFactory,
    type OpenHouseImage,
    type OpenHouseLead,
    OpenHouseLeadFactory,
    type PublicOpenHouse,
} from "../domain/openhouse.entity";

export class DbOpenHouseRepository implements IOpenHouseRepository {
    async create(params: Omit<OpenHouse, "images">) {
        const [result] = await db.insert(openHouse).values(params).returning();

        if (!result) throw new Error();

        return OpenHouseFactory.fromDb({ ...result, images: [] });
    }

    async findById(id: Id) {
        const [result] = await db
            .select()
            .from(openHouse)
            .where(eq(openHouse.id, id))
            .limit(1);

        if (!result) return null;

        const images = await this.findImagesByOpenHouseId(id);
        return OpenHouseFactory.fromDb({ ...result, images });
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

        return Promise.all(
            results.map(async (result) => {
                const images = await this.findImagesByOpenHouseId(result.id);
                return OpenHouseFactory.fromDb({ ...result, images });
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

        const images = await this.findImagesByOpenHouseId(id);
        return OpenHouseFactory.fromDb({ ...result, images });
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

        const images = await this.findImagesByOpenHouseId(id);

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
            images,
        };
    }

    async createImages(
        openHouseId: string,
        images: NewOpenHouseImageInput[],
    ): Promise<OpenHouseImage[]> {
        if (images.length === 0) return [];
        const values = images.map((img) => ({
            ...img,
            openHouseId,
        }));
        const results = await db
            .insert(openHouseImage)
            .values(values)
            .returning();
        return results.map((r) => ({
            id: r.id,
            openHouseId: r.openHouseId,
            url: r.url,
            publicId: r.publicId,
            isMain: r.isMain,
            orderIndex: r.orderIndex,
            createdAt: r.createdAt,
        }));
    }

    async findImagesByOpenHouseId(
        openHouseId: string,
    ): Promise<OpenHouseImage[]> {
        const results = await db
            .select()
            .from(openHouseImage)
            .where(eq(openHouseImage.openHouseId, openHouseId))
            .orderBy(openHouseImage.orderIndex, openHouseImage.createdAt);
        return results.map((r) => ({
            id: r.id,
            openHouseId: r.openHouseId,
            url: r.url,
            publicId: r.publicId,
            isMain: r.isMain,
            orderIndex: r.orderIndex,
            createdAt: r.createdAt,
        }));
    }

    async findImagePublicIdsByOpenHouseId(
        openHouseId: string,
    ): Promise<string[]> {
        const results = await db
            .select({ publicId: openHouseImage.publicId })
            .from(openHouseImage)
            .where(eq(openHouseImage.openHouseId, openHouseId));
        return results.map((r) => r.publicId);
    }

    async delete(openHouseId: string): Promise<void> {
        await db.delete(openHouse).where(eq(openHouse.id, openHouseId));
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
