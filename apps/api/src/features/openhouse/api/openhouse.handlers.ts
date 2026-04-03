import { DbAgentRepository } from "@agent/infra/db.agent.repository";
import { codes } from "@config/constants";
import type { FormConfig } from "@formconfig/domain/form-config.entity";
import { DbFormConfigRepository } from "@formconfig/infra/db.form-config.repository";
import { zValidator } from "@hono/zod-validator";
import { orgFactory, publicFactory } from "@lib/factory";
import { rbacMiddleware } from "@middlewares/rbac.middleware";
import {
    CreateOpenHouseLeadParamsSchema,
    GetOpenHouseLeadsParamsSchema,
    GetOpenHouseParamsSchema,
    GetPublicOpenHouseParamsSchema,
} from "@openhouse/api/openhouse.schemas";
import {
    type NewOpenHouseLeadInput,
    NewOpenHouseLeadSchema,
    NewOpenHouseSchema,
    type OpenHouse,
    UpdateOpenHouseSchema,
} from "@openhouse/domain/openhouse.entity";
import { DbOpenHouseRepository } from "@openhouse/infra/db.openhouse.repository";
import { OpenHouseService } from "@openhouse/service/openhouse.service";
import { addFubEventJob } from "@packages/fub-client";
import { HTTPException } from "hono/http-exception";

const repository = new DbOpenHouseRepository();
const formConfigRepository = new DbFormConfigRepository();
const agentRepository = new DbAgentRepository();
const service = new OpenHouseService(repository, formConfigRepository);

function formatLeadNote(
    responses:
        | Record<string, string | number | string[] | number[]>
        | null
        | undefined,
    formConfig: FormConfig | null,
): { subject: string; body: string } | null {
    if (!responses || !formConfig || Object.keys(responses).length === 0) {
        return null;
    }

    const questionMap = new Map(formConfig.questions.map((q) => [q.id, q]));
    const lines: string[] = [];

    for (const [questionId, value] of Object.entries(responses)) {
        const question = questionMap.get(questionId);
        const label = question?.label ?? "Unknown Question";
        const displayValue = Array.isArray(value)
            ? value.join(", ")
            : String(value);
        lines.push(`${label}: ${displayValue}`);
    }

    return {
        subject: "Lead's custom form responses",
        body: lines.join("\n"),
    };
}

async function publishFubEventJob(
    openHouse: OpenHouse,
    data: NewOpenHouseLeadInput,
) {
    const agent = await agentRepository.findByUserId(openHouse.createdByUserId);
    if (!agent?.fubId) return;

    const formConfig = await formConfigRepository.getByOrg(
        openHouse.organizationId,
    );
    const note = formatLeadNote(data.responses, formConfig);

    await addFubEventJob({
        person: {
            firstName: data.firstName,
            lastName: data.lastName,
            assignedUserId: Number(agent.fubId),
            emails: data.email ? [{ value: data.email }] : undefined,
            phones: data.phone ? [{ value: data.phone }] : undefined,
            tags: [],
            source: "Sphere",
        },
        property: {
            street: openHouse.propertyAddress,
            price: openHouse.listingPrice,
            bedrooms: openHouse.bedrooms?.toString(),
            bathrooms: openHouse.bathrooms?.toString(),
        },
        type: "Visited Open House",
        system: "ANEWCo",
        source: "Sphere",
        message: "Lead signed in at Open House.",
        note,
    });
}

export const createOpenHouseHandlers = orgFactory.createHandlers(
    zValidator("json", NewOpenHouseSchema),
    rbacMiddleware({ openhouse: ["create"] }),
    async (c) => {
        const userId = c.get("session").userId;
        const organizationId = c.get("organizationId");

        const data = c.req.valid("json");

        const openHouse = await service.createOpenHouse(
            data,
            organizationId,
            userId,
        );

        return c.json({ data: openHouse }, codes.CREATED);
    },
);

export const updateOpenHouseHandlers = orgFactory.createHandlers(
    zValidator("param", GetOpenHouseParamsSchema),
    zValidator("json", UpdateOpenHouseSchema),
    rbacMiddleware({ openhouse: ["update"] }),
    async (c) => {
        const organizationId = c.get("organizationId");
        const { id } = c.req.valid("param");
        const data = c.req.valid("json");

        const openHouse = await service.updateOpenHouse(
            id,
            organizationId,
            data,
        );

        return c.json({ data: openHouse });
    },
);

export const deleteOpenHouseHandlers = orgFactory.createHandlers(
    zValidator("param", GetOpenHouseParamsSchema),
    rbacMiddleware({ openhouse: ["delete"] }),
    async (c) => {
        const organizationId = c.get("organizationId");
        const { id } = c.req.valid("param");

        await service.deleteOpenHouse(id, organizationId);

        return c.json({ data: { id } });
    },
);

export const getOpenHousesHandlers = orgFactory.createHandlers(
    rbacMiddleware({ openhouse: ["view"] }),
    async (c) => {
        const userId = c.get("session").userId;
        const organizationId = c.get("organizationId");

        const openHouses = await service.getOpenHouses(organizationId, userId);
        return c.json({ data: openHouses });
    },
);

export const getTeamOpenHousesHandlers = orgFactory.createHandlers(
    rbacMiddleware({ openhouse: ["view"] }),
    async (c) => {
        const organizationId = c.get("organizationId");

        const openHouses = await service.getTeamOpenHouses(organizationId);
        return c.json({ data: openHouses });
    },
);

export const getOpenHouseHandlers = orgFactory.createHandlers(
    zValidator("param", GetOpenHouseParamsSchema),
    rbacMiddleware({ openhouse: ["view"] }),
    async (c) => {
        const organizationId = c.get("organizationId");

        const { id } = c.req.valid("param");

        const openHouse = await service.getOpenHouse(id);
        if (!openHouse || openHouse.organizationId !== organizationId) {
            throw new HTTPException(codes.NOT_FOUND, {
                message: "Open house not found",
            });
        }

        return c.json({ data: openHouse });
    },
);

export const getOpenHouseLeadsHandlers = orgFactory.createHandlers(
    zValidator("param", GetOpenHouseLeadsParamsSchema),
    rbacMiddleware({ lead: ["view"] }),
    async (c) => {
        const organizationId = c.get("organizationId");

        const { id } = c.req.valid("param");
        const result = await service.getOpenHouseLeadsWithFormConfig(
            id,
            organizationId,
        );

        return c.json({ data: result });
    },
);

export const getPublicOpenHouseHandlers = publicFactory.createHandlers(
    zValidator("param", GetPublicOpenHouseParamsSchema),
    async (c) => {
        const { id } = c.req.valid("param");
        const openHouse = await service.getPublicOpenHouseWithFormConfig(id);

        if (!openHouse) {
            throw new HTTPException(codes.NOT_FOUND, {
                message: "Open house not found",
            });
        }

        return c.json({ data: openHouse });
    },
);

export const createOpenHouseLeadHandlers = publicFactory.createHandlers(
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

            publishFubEventJob(openHouse, data).catch((err) => {
                console.error("[FUB] Failed to publish event job:", err);
            });

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
