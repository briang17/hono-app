import { zValidator } from "@hono/zod-validator";
import { authMiddleware } from "@middlewares/auth.middleware";
import {
    CreateOpenHouseLeadParamsSchema,
    GetOpenHouseLeadsParamsSchema,
    GetOpenHouseParamsSchema,
    GetPublicOpenHouseParamsSchema,
} from "@openhouse/api/openhouse.schemas";
import {
    NewOpenHouseLeadSchema,
    NewOpenHouseSchema,
} from "@openhouse/domain/openhouse.entity";
import { Hono } from "hono";
import { openhouseController } from "./openhouse.controller";

const openhouseRoutes = new Hono()
    .use(authMiddleware)
    .get("/", openhouseController.getOpenHouses)
    .get(
        "/:id",
        zValidator("param", GetOpenHouseParamsSchema),
        openhouseController.getOpenHouse,
    )
    .get(
        "/:id/leads",
        zValidator("param", GetOpenHouseLeadsParamsSchema),
        openhouseController.getOpenHouseLeads,
    )
    .post(
        "/",
        zValidator("json", NewOpenHouseSchema),
        openhouseController.createOpenHouse,
    );

const publicOpenHouseRoutes = new Hono()
    .get(
        "/:id",
        zValidator("param", GetPublicOpenHouseParamsSchema),
        openhouseController.getPublicOpenHouse,
    )
    .post(
        "/:id/sign-in",
        zValidator("param", CreateOpenHouseLeadParamsSchema),
        zValidator("json", NewOpenHouseLeadSchema),
        openhouseController.createOpenHouseLead,
    );

export { openhouseRoutes, publicOpenHouseRoutes };
