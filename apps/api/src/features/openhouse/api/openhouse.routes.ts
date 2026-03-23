import { zValidator } from "@hono/zod-validator";
import { authMiddleware } from "@middlewares/auth.middleware";
import {
    GetOpenHouseLeadsParamsSchema,
    GetOpenHouseParamsSchema,
    GetPublicOpenHouseParamsSchema,
} from "@openhouse/api/openhouse.schemas";
import { NewOpenHouseSchema } from "@openhouse/domain/openhouse.entity";
import { Hono } from "hono";
import { openhouseController } from "./openhouse.controller";
import { createOpenHouseLead } from "./openhouse.handlers";

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
    .post("/:id/sign-in", ...createOpenHouseLead);

export { openhouseRoutes, publicOpenHouseRoutes };
