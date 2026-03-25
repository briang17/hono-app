import {
    DeactivateAgentParamsSchema,
    DeleteAgentParamsSchema,
    GetAgentParamsSchema,
    ReactivateAgentParamsSchema,
    UpdateAgentParamsSchema,
} from "@agent/api/agent.schemas";
import { NewAgentSchema, UpdateAgentSchema } from "@agent/domain/agent.entity";
import { DbAgentRepository } from "@agent/infra/db.agent.repository";
import { AgentService } from "@agent/service/agent.service";
import { codes } from "@config/constants";
import { zValidator } from "@hono/zod-validator";
import { orgFactory } from "@lib/factory";
import { rbacMiddleware } from "@middlewares/rbac.middleware";
import { auth } from "@packages/auth";

const repository = new DbAgentRepository();
const service = new AgentService(repository);

export const getAgentsHandlers = orgFactory.createHandlers(
    rbacMiddleware({ agent: ["view"] }),
    async (c) => {
        const organizationId = c.get("organizationId");
        const agents = await service.getAgents(organizationId);
        return c.json({ data: agents });
    },
);

export const getAgentHandlers = orgFactory.createHandlers(
    zValidator("param", GetAgentParamsSchema),
    rbacMiddleware({ agent: ["view"] }),
    async (c) => {
        const organizationId = c.get("organizationId");
        const { id } = c.req.valid("param");
        const agent = await service.getAgent(id, organizationId);
        return c.json({ data: agent });
    },
);

export const createAgentHandlers = orgFactory.createHandlers(
    zValidator("json", NewAgentSchema),
    rbacMiddleware({ agent: ["create"] }),
    async (c) => {
        const organizationId = c.get("organizationId");
        const data = c.req.valid("json");

        const agent = await service.createAgent(data, organizationId);

        await auth.api.createInvitation({
            body: { email: data.email, role: "agent", organizationId },
            headers: c.req.raw.headers,
        });

        return c.json({ data: agent }, codes.CREATED);
    },
);

export const updateAgentHandlers = orgFactory.createHandlers(
    zValidator("param", UpdateAgentParamsSchema),
    zValidator("json", UpdateAgentSchema),
    rbacMiddleware({ agent: ["update"] }),
    async (c) => {
        const organizationId = c.get("organizationId");
        const { id } = c.req.valid("param");
        const data = c.req.valid("json");
        const agent = await service.updateAgent(id, organizationId, data);
        return c.json({ data: agent });
    },
);

export const deleteAgentHandlers = orgFactory.createHandlers(
    zValidator("param", DeleteAgentParamsSchema),
    rbacMiddleware({ agent: ["delete"] }),
    async (c) => {
        const organizationId = c.get("organizationId");
        const { id } = c.req.valid("param");
        console.log("DELETING AGENT:@@@@@")
        console.log({organizationId, id});
        await service.deleteAgent(id, organizationId);
        return c.status(codes.OK).body("");
    },
);

export const deactivateAgentHandlers = orgFactory.createHandlers(
    zValidator("param", DeactivateAgentParamsSchema),
    rbacMiddleware({ agent: ["deactivate"] }),
    async (c) => {
        const organizationId = c.get("organizationId");
        const { id } = c.req.valid("param");
        const agent = await service.deactivateAgent(id, organizationId);
        return c.json({ data: agent });
    },
);

export const reactivateAgentHandlers = orgFactory.createHandlers(
    zValidator("param", ReactivateAgentParamsSchema),
    rbacMiddleware({ agent: ["deactivate"] }),
    async (c) => {
        const organizationId = c.get("organizationId");
        const { id } = c.req.valid("param");
        const agent = await service.reactivateAgent(id, organizationId);
        return c.json({ data: agent });
    },
);
