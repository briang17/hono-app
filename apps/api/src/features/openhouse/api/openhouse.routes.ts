import { authMiddleware } from "@middlewares/auth.middleware";
import { Hono } from "hono";
import { openhouseController } from "./openhouse.controller";
import {
  CreateOpenHouseLeadParamsSchema,
  GetOpenHouseLeadsParamsSchema,
	GetOpenHouseParamsSchema,
  GetPublicOpenHouseParamsSchema,
} from "@openhouse/api/openhouse.schemas";
import { NewOpenHouseLeadSchema, NewOpenHouseSchema } from "@openhouse/domain/openhouse.entity";
import { zValidator } from "@hono/zod-validator";

const openhouseRoutes = new Hono();

openhouseRoutes.use(authMiddleware);

openhouseRoutes.get("/",openhouseController.getOpenHouses);

openhouseRoutes.get(
  "/:id",
  zValidator("param", GetOpenHouseParamsSchema),
  openhouseController.getOpenHouse
);

openhouseRoutes.get(
  "/:id/leads",
  zValidator("param",GetOpenHouseLeadsParamsSchema),
  openhouseController.getOpenHouseLeads
);

openhouseRoutes.post(
  "/",
  zValidator("json", NewOpenHouseSchema),
  openhouseController.createOpenHouse
);



const publicOpenHouseRoutes = new Hono();

// public routes
publicOpenHouseRoutes.get(
  "/:id",
  zValidator("param", GetPublicOpenHouseParamsSchema),
  openhouseController.getPublicOpenHouse
);

publicOpenHouseRoutes.post(
  "/:id/sign-in", // ??CHANGE THIS TO sign-up
  zValidator("param", CreateOpenHouseLeadParamsSchema),
  zValidator("json", NewOpenHouseLeadSchema),
  openhouseController.createOpenHouseLead
);

export { openhouseRoutes, publicOpenHouseRoutes };
