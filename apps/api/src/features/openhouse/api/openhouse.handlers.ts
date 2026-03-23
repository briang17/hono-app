import { codes } from "@config/constants";
import { DbFormConfigRepository } from "@formconfig/infra/db.form-config.repository";
import { zValidator } from "@hono/zod-validator";
import { publicFactory } from "@lib/factory";
import { NewOpenHouseLeadSchema } from "@openhouse/domain/openhouse.entity";
import { DbOpenHouseRepository } from "@openhouse/infra/db.openhouse.repository";
import { OpenHouseService } from "@openhouse/service/openhouse.service";
import { HTTPException } from "hono/http-exception";
import { CreateOpenHouseLeadParamsSchema } from "./openhouse.schemas";

const repository = new DbOpenHouseRepository();
const formConfigRepository = new DbFormConfigRepository();
const service = new OpenHouseService(repository, formConfigRepository);

export const createOpenHouseLead = publicFactory.createHandlers(
    zValidator("param", CreateOpenHouseLeadParamsSchema),
    zValidator("json", NewOpenHouseLeadSchema),
    async (c) => {
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
);
