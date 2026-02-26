import { authMiddleware } from "@middlewares/auth.middleware";
import { createValidator } from "@middlewares/validation.middleware";
import { Hono } from "hono";
import { openhouseController } from "./openhouse.controller";
import {
	CreateOpenHouseLeadSchema,
	CreateOpenHouseSchema,
	OpenHouseIdParamsSchema,
} from "./openhouse.schemas";
import { zValidator } from "@hono/zod-validator";
import { HonoEnv } from "@lib/types";

const openhouseRoutes = new Hono();



openhouseRoutes.post(
  "/",
  authMiddleware,
  zValidator("json", CreateOpenHouseSchema),
  openhouseController.createOpenHouse
);

openhouseRoutes.get("/", authMiddleware, openhouseController.getOpenHouses);

openhouseRoutes.get(
  "/:id",
  authMiddleware,
  createValidator(OpenHouseIdParamsSchema, "params"),
  openhouseController.getOpenHouse
);

openhouseRoutes.get(
  "/:id/leads",
  authMiddleware,
  createValidator(OpenHouseIdParamsSchema, "params"),
  openhouseController.getOpenHouseLeads
);

// public routes
openhouseRoutes.get(
  "/:id/public",
  createValidator(OpenHouseIdParamsSchema, "params"),
  openhouseController.getPublicOpenHouse
);

openhouseRoutes.post(
  "/:id/sign-in",
  createValidator(OpenHouseIdParamsSchema, "params"),
  createValidator(CreateOpenHouseLeadSchema),
  openhouseController.createOpenHouseLead
);

export { openhouseRoutes };
