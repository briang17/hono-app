import { zValidator } from "@hono/zod-validator";
import { authMiddleware } from "@middlewares/auth.middleware";
import { orgMiddleware } from "@middlewares/org.middleware";
import { rbacMiddleware } from "@middlewares/rbac.middleware";
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
    .use(orgMiddleware)
    .get(
        "/",
        rbacMiddleware({ openhouse: ["view"] }),
        openhouseController.getOpenHouses,
    )
    .get(
        "/:id",
        zValidator("param", GetOpenHouseParamsSchema),
        rbacMiddleware({ openhouse: ["view"] }),
        openhouseController.getOpenHouse,
    )
    .get(
        "/:id/leads",
        zValidator("param", GetOpenHouseLeadsParamsSchema),
        rbacMiddleware({ lead: ["view"] }),
        openhouseController.getOpenHouseLeads,
    )
    .post(
        "/",
        zValidator("json", NewOpenHouseSchema),
        rbacMiddleware({ openhouse: ["create"] }),
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
