import { authMiddleware } from "@middlewares/auth.middleware";
import { orgMiddleware } from "@middlewares/org.middleware";
import { Hono } from "hono";
import {
    createAgentHandlers,
    deactivateAgentHandlers,
    deleteAgentHandlers,
    getAgentHandlers,
    getAgentsHandlers,
    getMyAgentHandlers,
    reactivateAgentHandlers,
    updateAgentHandlers,
    updateMyAgentHandlers,
} from "./agent.handlers";

const agentRoutes = new Hono()
    .use(authMiddleware)
    .use(orgMiddleware)
    .get("/me", ...getMyAgentHandlers)
    .patch("/me", ...updateMyAgentHandlers)
    .get("/", ...getAgentsHandlers)
    .get("/:id", ...getAgentHandlers)
    .post("/", ...createAgentHandlers)
    .patch("/:id", ...updateAgentHandlers)
    .delete("/:id", ...deleteAgentHandlers)
    .post("/:id/deactivate", ...deactivateAgentHandlers)
    .post("/:id/reactivate", ...reactivateAgentHandlers);

export { agentRoutes };
