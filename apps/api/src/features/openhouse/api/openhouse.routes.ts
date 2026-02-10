import { authMiddleware } from "@middlewares/auth.middleware";
import { createValidator } from "@middlewares/validation.middleware";
import { Hono } from "hono";
import { openhouseController } from "./openhouse.controller";
import {
	CreateOpenHouseLeadSchema,
	CreateOpenHouseSchema,
	OpenHouseIdParamsSchema,
} from "./openhouse.schemas";

const openhouseRoutes = new Hono();

const protectedRoutes = new Hono();
protectedRoutes.use("*", authMiddleware);

protectedRoutes.post(
	"/",
	createValidator(CreateOpenHouseSchema),
	openhouseController.createOpenHouse,
);

protectedRoutes.get("/", openhouseController.getOpenHouses);

protectedRoutes.get(
	"/:id",
	createValidator(OpenHouseIdParamsSchema, "params"),
	openhouseController.getOpenHouse,
);

protectedRoutes.get(
	"/:id/leads",
	createValidator(OpenHouseIdParamsSchema, "params"),
	openhouseController.getOpenHouseLeads,
);

openhouseRoutes.get(
	"/:id/public",
	createValidator(OpenHouseIdParamsSchema, "params"),
	openhouseController.getPublicOpenHouse,
);

openhouseRoutes.post(
	"/:id/sign-in",
	createValidator(OpenHouseIdParamsSchema, "params"),
	createValidator(CreateOpenHouseLeadSchema),
	openhouseController.createOpenHouseLead,
);

openhouseRoutes.route("/", protectedRoutes);

export { openhouseRoutes };
