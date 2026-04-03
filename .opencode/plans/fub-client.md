# Follow Up Boss Client — Implementation Plan

## Context

When a visitor signs in at an open house, the lead data needs to be sent to Follow Up Boss (FUB) as a "Visited Open House" event. This creates the contact in FUB, assigns the correct agent, triggers automations, and notifies the agent. If the lead has custom form responses, they should be sent as a note attached to the created person.

The system follows the same pattern as `packages/emailer`: a BullMQ Redis queue with a separate worker process. The API publishes jobs (fire-and-forget), the worker consumes and executes them against the FUB API.

---

## Status

- [ ] Phase 1: Update `packages/env`
- [ ] Phase 2: Create `packages/fub-client`
- [ ] Phase 3: Update `tsconfig.base.json`
- [ ] Phase 4: Update `apps/api` handler
- [ ] Phase 5: Update `AGENTS.md`

---

## Phase 1: Update `packages/env/index.ts`

Replace the existing `fubClientEnvScope` (currently only has `RATE: z.coerce.number().default(80)`) with:

```typescript
const fubClientEnvScope = {
    name: "fubClient",
    schema: z.object({
        FUB_API_KEY: z.string().min(1),
        FUB_SYSTEM_KEY: z.string().min(1),
        FUB_SYSTEM: z.string().min(1),
        REDIS_HOST: z.string().default("localhost"),
        REDIS_PORT: z.coerce.number().default(6380),
    }),
};
```

- `FUB_API_KEY` — used as HTTP Basic Auth username (password blank)
- `FUB_SYSTEM_KEY` — sent as `X-System-Key` header
- `FUB_SYSTEM` — sent as `X-System` header
- `REDIS_HOST` / `REDIS_PORT` — BullMQ connection (same pattern as emailer)

The validated export `fubClientEnv` continues to be exported from `packages/env/index.ts`.

---

## Phase 2: Create `packages/fub-client/`

### File list (9 files)

| # | File | Purpose |
|---|---|---|
| 1 | `package.json` | Package definition + dependencies |
| 2 | `tsconfig.json` | Extends base tsconfig |
| 3 | `connection.ts` | Redis connection config |
| 4 | `logger.ts` | Pino logger (pretty in dev, file in prod) |
| 5 | `fub-api.ts` | Axios instance with FUB auth + headers |
| 6 | `types.ts` | Zod schemas for job data |
| 7 | `queue-producer.ts` | BullMQ queue + `addFubEventJob()` |
| 8 | `worker.ts` | Worker that processes FUB event jobs |
| 9 | `worker-process.ts` | Entry point + signal handlers |
| 10 | `index.ts` | Public exports |

---

### 2.1 `package.json`

```json
{
    "name": "@packages/fub-client",
    "version": "1.0.0",
    "description": "Follow Up Boss API client with BullMQ worker",
    "main": "index.js",
    "scripts": {
        "worker": "bun run worker-process.ts",
        "test": "echo \"Error: no test specified\" && exit 1"
    },
    "keywords": [],
    "author": "",
    "license": "ISC",
    "packageManager": "pnpm@10.28.1",
    "dependencies": {
        "@packages/env": "workspace:*",
        "axios": "^1.7.9",
        "bullmq": "^5.67.3",
        "ioredis": "^5.9.2",
        "pino": "^9.6.0",
        "zod": "^4.3.6"
    },
    "devDependencies": {
        "pino-pretty": "^13.0.0"
    }
}
```

- `axios` — HTTP client for FUB API requests
- `bullmq` + `ioredis` — queue infrastructure (same versions as emailer)
- `pino` — structured logging
- `pino-pretty` — dev-only pretty printing (devDependency)

---

### 2.2 `tsconfig.json`

```json
{
    "extends": "../../tsconfig.base.json"
}
```

---

### 2.3 `connection.ts`

Same pattern as `packages/emailer/connection.ts`:

```typescript
import { type RedisOptions } from "ioredis";
import { fubClientEnv } from "@packages/env";

export const connection: RedisOptions = {
    host: fubClientEnv.REDIS_HOST,
    port: fubClientEnv.REDIS_PORT,
};
```

---

### 2.4 `logger.ts`

Pino logger with environment-aware transport:

```typescript
import pino from "pino";
import { globalEnv } from "@packages/env";

const logger = globalEnv.NODE_ENV === "development"
    ? pino({
        transport: {
            target: "pino-pretty",
            options: { colorize: true },
        },
    })
    : pino(pino.destination({ dest: "logs/fub-worker.log", mkdir: true }));

export { logger };
```

- **Development:** `pino-pretty` with colorized output to stdout
- **Production:** JSON NDJSON to `logs/fub-worker.log` (relative to CWD, `mkdir: true` creates the directory)
- Uses `globalEnv.NODE_ENV` to switch modes (already validated in `@packages/env`)

---

### 2.5 `fub-api.ts`

Pre-configured Axios instance for FUB API:

```typescript
import axios from "axios";
import { fubClientEnv } from "@packages/env";

const fubApi = axios.create({
    baseURL: "https://api.followupboss.com/v1",
    auth: {
        username: fubClientEnv.FUB_API_KEY,
        password: "",
    },
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-System-Key": fubClientEnv.FUB_SYSTEM_KEY,
        "X-System": fubClientEnv.FUB_SYSTEM,
    },
    timeout: 30000,
});

export { fubApi };
```

- **Authentication:** HTTP Basic Auth with API key as username, empty password
- **Headers:** `X-System-Key` and `X-System` for system identification
- **Timeout:** 30s (generous for rate-limited API)
- No response interceptors needed — the worker handles errors directly

---

### 2.6 `types.ts`

Zod schemas for the job data. The property schema is fully expanded so future fields (area, lot, granular address) just need mapping in the handler, not schema changes here.

```typescript
import { z } from "zod";

export const FubPersonSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().optional(),
    phone: z.string().optional(),
    contacted: z.boolean().default(false),
    stage: z.string().default("Attempted Contact"),
    source: z.string().default("Sphere"),
    price: z.number().optional(),
    assignedUserId: z.number(),
    emails: z.array(z.object({ value: z.string() })).optional(),
    phones: z.array(z.object({ value: z.string() })).optional(),
    tags: z.array(z.string()).default([]),
});

export const FubPropertySchema = z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    code: z.string().optional(),
    price: z.number().optional(),
    type: z.string().optional(),
    bedrooms: z.string().optional(),
    bathrooms: z.string().optional(),
    area: z.string().optional(),
    lot: z.string().optional(),
});

export const FubEventJobDataSchema = z.object({
    person: FubPersonSchema,
    property: FubPropertySchema.optional(),
    type: z.string().default("Visited Open House"),
    system: z.string().default("ANEWCo"),
    source: z.string().default("Sphere"),
    message: z.string().optional(),
    description: z.string().optional(),
    note: z
        .object({
            subject: z.string(),
            body: z.string(),
        })
        .nullable()
        .optional(),
});

export type FubEventJobData = z.infer<typeof FubEventJobDataSchema>;
```

**Key design decisions:**

- `assignedUserId` is `z.number()` — FUB API expects numeric user ID (parsed from `agent.fubId` string in DB)
- `person.emails` / `person.phones` are arrays of `{ value: string }` — FUB format
- `person.tags` defaults to `[]` — city tag will be a single `push` when address parsing lands
- `property.area` and `property.lot` are optional strings — ready for future `squareFootage` / `lotSize` DB columns
- `property.city` / `state` / `code` are optional — ready for when `propertyAddress` gets split
- `note` is nullable/optional — only sent when lead has custom form responses
- `system` and `source` have defaults ("ANEWCo" and "Sphere") — always the same for this event type
- `type` defaults to `"Visited Open House"` — always the same for this flow

---

### 2.7 `queue-producer.ts`

BullMQ queue definition + convenience function for publishing jobs:

```typescript
import { Queue } from "bullmq";
import { connection } from "./connection";
import type { FubEventJobData } from "./types";

export const fubQueue = new Queue<FubEventJobData>("fub-queue", {
    connection,
    defaultJobOptions: {
        attempts: 5,
        backoff: {
            type: "exponential",
            delay: 1000,
        },
        removeOnComplete: 100,
        removeOnFail: 500,
    },
});

export async function addFubEventJob(data: FubEventJobData) {
    return await fubQueue.add("send-fub-event", data);
}
```

- **Queue name:** `"fub-queue"` (distinct from emailer's `"email-queue"`)
- **Job name:** `"send-fub-event"`
- **Attempts:** 5 with exponential backoff starting at 1s (1s → 2s → 4s → 8s → 16s)
- **Cleanup:** keep last 100 completed, last 500 failed
- **Fire-and-forget:** the caller (API handler) does not `await` the result

---

### 2.8 `worker.ts`

Processes jobs from the `fub-queue`. Each job:
1. POSTs an event to `/v1/events` (creates/updates person + records event)
2. If `note` is provided, extracts `personId` from the event response and POSTs to `/v1/notes`

```typescript
import { type Job, Worker } from "bullmq";
import { fubApi } from "./fub-api";
import { connection } from "./connection";
import { logger } from "./logger";
import type { FubEventJobData } from "./types";

const QUEUE_NAME = "fub-queue";

const worker = new Worker<FubEventJobData>(
    QUEUE_NAME,
    async (job: Job<FubEventJobData>) => {
        const { person, property, type, system, source, message, description, note } = job.data;

        logger.info({ jobId: job.id, personName: `${person.firstName} ${person.lastName}` }, "Processing FUB event");

        const eventPayload: Record<string, unknown> = {
            person,
            type,
            system,
            source,
        };

        if (property) eventPayload.property = property;
        if (message) eventPayload.message = message;
        if (description) eventPayload.description = description;

        const eventResponse = await fubApi.post("/events", eventPayload);

        logger.info(
            { jobId: job.id, status: eventResponse.status, data: eventResponse.data },
            "FUB event created",
        );

        if (note && eventResponse.data) {
            const personId = eventResponse.data.personId ?? eventResponse.data.id;

            if (personId) {
                await fubApi.post("/notes", {
                    subject: note.subject,
                    body: note.body,
                    personId: personId,
                });

                logger.info(
                    { jobId: job.id, personId },
                    "FUB note created",
                );
            } else {
                logger.warn(
                    { jobId: job.id, responseData: eventResponse.data },
                    "No personId in event response, skipping note",
                );
            }
        }

        return { success: true };
    },
    {
        connection,
        concurrency: 1,
        limiter: {
            max: 20,
            duration: 10000,
        },
    },
);

worker.on("completed", (job) => {
    logger.info({ jobId: job.id }, "Job completed");
});

worker.on("failed", (job, err) => {
    logger.error({ jobId: job?.id, error: err.message }, "Job failed");
});

worker.on("error", (err) => {
    logger.error({ error: err.message }, "Worker error");
});

logger.info({ queue: QUEUE_NAME }, "FUB worker started");
```

**Key design decisions:**

- **Concurrency: 1** — serial execution avoids rate limit issues
- **Rate limiter:** 20 requests per 10 seconds — matches FUB's global rate limit context (250 per 10s is the max, but 20 is conservative and safe for the `notes` context which has a 10/10s limit)
- **Error handling:** BullMQ's built-in retry handles 5xx errors automatically via the exponential backoff config on the queue. 4xx errors (permanent) will exhaust retries and land in the failed queue for inspection.
- **Note creation:** Only attempted if `note` is non-null AND the event response contains a `personId`. The response field name is uncertain (FUB docs say `personId` but we also check `id` as fallback). We'll verify the actual response shape when we add response types later.
- **Logging:** All significant operations logged via Pino with structured fields

---

### 2.9 `worker-process.ts`

Entry point — mirrors `packages/emailer/worker-process.ts`:

```typescript
import "./worker";

import { logger } from "./logger";

logger.info("Starting FUB worker process...");

process.on("SIGTERM", () => {
    logger.info("SIGTERM received, shutting down...");
    process.exit(0);
});

process.on("SIGINT", () => {
    logger.info("SIGINT received, shutting down...");
    process.exit(0);
});
```

---

### 2.10 `index.ts`

Public API surface:

```typescript
export { addFubEventJob, fubQueue } from "./queue-producer";
export type { FubEventJobData } from "./types";
```

Only the queue producer function and types are exported. The worker, API client, and logger are internal to the package.

---

## Phase 3: Update `tsconfig.base.json`

Add path alias for the new package:

```jsonc
{
    "paths": {
        // ... existing aliases ...
        "@packages/fub-client": ["./packages/fub-client/*"]
    }
}
```

This allows `apps/api` to import from `@packages/fub-client`.

---

## Phase 4: Update `apps/api` — openhouse lead handler

### 4.1 What changes

Only one file is modified: `apps/api/src/features/openhouse/api/openhouse.handlers.ts`

The `createOpenHouseLeadHandlers` handler (line 148) gains a fire-and-forget FUB job publish after successful lead creation.

### 4.2 New imports

```typescript
import { DbAgentRepository } from "@agent/infra/db.agent.repository";
import { AgentService } from "@agent/service/agent.service";
import { addFubEventJob } from "@packages/fub-client";
```

### 4.3 New service instances (module-level, alongside existing ones)

```typescript
const agentRepository = new DbAgentRepository();
const agentService = new AgentService(agentRepository);
```

### 4.4 Handler modification

After the successful `service.createOpenHouseLead()` call (around line 164), add:

```typescript
// Fire-and-forget: send lead to Follow Up Boss
try {
    const agent = await agentRepository.findByUserId(openHouse.createdByUserId);
    if (agent?.fubId) {
        const formConfig = await formConfigRepository.getByOrg(openHouse.organizationId);

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
            description: undefined,
            note,
        });
    }
} catch (err) {
    // Intentionally swallowed — FUB sync is non-critical
    console.error("[FUB] Failed to publish event job:", err);
}
```

### 4.5 `formatLeadNote` helper

Defined at the top of the handler file (or extracted to a utility — keeping it local for now since it's only used here):

```typescript
function formatLeadNote(
    responses: Record<string, string | number | string[] | number[]> | null | undefined,
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
        const displayValue = Array.isArray(value) ? value.join(", ") : String(value);
        lines.push(`${label}: ${displayValue}`);
    }

    return {
        subject: "Lead's custom form responses",
        body: lines.join("\n"),
    };
}
```

This formats the lead's custom responses as `"Question Label: answer"` lines. It needs the `FormConfig` to resolve question IDs to human-readable labels.

### 4.6 Data flow

```
Visitor signs in at open house
    ↓
POST /api/open-houses/:id/sign-in (public endpoint)
    ↓
Handler validates input, creates lead in DB
    ↓
Handler looks up agent by openHouse.createdByUserId → agent.fubId
    ↓
If agent has fubId:
    1. Format note from lead responses + form config
    2. Build FubEventJobData with person, property, event, note
    3. addFubEventJob(data) — publishes to BullMQ, does not await
    ↓
Handler returns lead response to visitor (immediately)
    ↓
Worker picks up job:
    1. POST /v1/events → creates/updates person in FUB
    2. If note exists → POST /v1/notes → attaches note to person
```

### 4.7 Important constraints

- **Fire-and-forget:** `addFubEventJob` is awaited but wrapped in try/catch that swallows errors. The visitor's response is never blocked by FUB.
- **No fubId = no job:** If the agent doesn't have a FUB ID configured, the job is silently skipped. This is by design — not all agents may be in FUB.
- **Note is optional:** Only created when the lead has custom form responses AND the org has a form config.
- **Tag and address fields are pre-wired:** The `tags: []` and `property.city/state/code/area/lot` fields are ready for population. Adding them later requires only handler mapping changes, no schema changes in `fub-client`.

---

## Phase 5: Update `AGENTS.md`

### Architecture section — add to monorepo structure:

```
packages/
  fub-client/      # Follow Up Boss API client + BullMQ worker
```

### Commands section — add worker command:

```bash
# Follow Up Boss worker
pnpm --filter @packages/fub-client worker   # Start FUB event worker
```

### Patterns section — add FUB job pattern:

```markdown
**FUB Event Publishing**
\`\`\`typescript
import { addFubEventJob } from "@packages/fub-client";

// Fire-and-forget: publishes to BullMQ, worker handles API call
await addFubEventJob({
    person: { firstName, lastName, assignedUserId: Number(fubId), ... },
    property: { street, price, ... },
    type: "Visited Open House",
    system: "ANEWCo",
    source: "Sphere",
    note: { subject, body },  // optional
});
\`\`\`
```

---

## Future work (out of scope)

These are documented here so the schema and handler are designed to accommodate them with minimal changes:

### Address parsing

When `propertyAddress` gets split into components:
- Handler maps: `city → property.city`, `state → property.state`, `code → property.code`
- City extracted: `person.tags.push(city)` — literally one line
- No schema changes needed in `fub-client/types.ts`

### Square footage + lot size

When `openHouse` table gets new columns:
- `squareFootage` (integer) → handler maps to `property.area`
- `lotSize` (numeric) → handler maps to `property.lot`
- No schema changes needed — already optional strings in `FubPropertySchema`

### FUB response types

Currently the worker doesn't validate the FUB API response. When we add Zod schemas for the response shapes:
- `FubEventResponseSchema` with `personId`, `id`, etc.
- `FubNoteResponseSchema`
- These go in `types.ts` and are used in `worker.ts`

### Other FUB endpoints

The `fub-api.ts` Axios instance is reusable for any FUB endpoint. Future workers can be added for:
- `GET /v1/people` — sync contacts back
- `GET /v1/events` — read event history
- etc.

---

## Implementation order

1. Update `packages/env/index.ts` — replace `fubClientEnvScope`
2. Create `packages/fub-client/package.json`
3. Create `packages/fub-client/tsconfig.json`
4. Create `packages/fub-client/connection.ts`
5. Create `packages/fub-client/logger.ts`
6. Create `packages/fub-client/fub-api.ts`
7. Create `packages/fub-client/types.ts`
8. Create `packages/fub-client/queue-producer.ts`
9. Create `packages/fub-client/worker.ts`
10. Create `packages/fub-client/worker-process.ts`
11. Create `packages/fub-client/index.ts`
12. Update `tsconfig.base.json` — add `@packages/fub-client` alias
13. Run `pnpm install` — install new package + dependencies
14. Update `apps/api/src/features/openhouse/api/openhouse.handlers.ts` — add FUB job publish
15. Update `AGENTS.md` — document new package, commands, pattern
16. Run `pnpm --filter @packages/fub-client biome check --write` (if biome config needed)
17. Run `pnpm --filter @apps/api cq` — lint check

---

## Dependencies graph

```
packages/env ← packages/fub-client (env vars)
packages/env ← apps/api (env vars)
packages/fub-client ← apps/api (addFubEventJob import)
packages/database ← apps/api (agent.fubId lookup)
```

No circular dependencies. The fub-client package depends only on `@packages/env` (for config) and its own npm dependencies. The API depends on fub-client only for the queue producer (not the worker).
