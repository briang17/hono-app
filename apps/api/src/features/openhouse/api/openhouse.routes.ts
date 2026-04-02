import { authMiddleware } from "@middlewares/auth.middleware";
import { orgMiddleware } from "@middlewares/org.middleware";
import { Hono } from "hono";
import {
    createOpenHouseHandlers,
    createOpenHouseLeadHandlers,
    deleteOpenHouseHandlers,
    getOpenHouseHandlers,
    getOpenHouseLeadsHandlers,
    getOpenHousesHandlers,
    getPublicOpenHouseHandlers,
} from "./openhouse.handlers";

const openhouseRoutes = new Hono()
    .use(authMiddleware)
    .use(orgMiddleware)
    .get("/", ...getOpenHousesHandlers)
    .get("/:id", ...getOpenHouseHandlers)
    .get("/:id/leads", ...getOpenHouseLeadsHandlers)
    .post("/", ...createOpenHouseHandlers)
    .delete("/:id", ...deleteOpenHouseHandlers);

const publicOpenHouseRoutes = new Hono()
    .get("/:id", ...getPublicOpenHouseHandlers)
    .post("/:id/sign-in", ...createOpenHouseLeadHandlers);

export { openhouseRoutes, publicOpenHouseRoutes };
