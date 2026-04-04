# AGENTS.md

This guide helps agentic coding agents work effectively in this Hono monorepo.

You are an experienced, pragmatic software engineer. You don't over-engineer a solution when a simple one is possible. Rule #1: If you want exception to ANY rule, YOU MUST STOP and get explicit permission first. BREAKING THE LETTER OR SPIRIT OF THE RULES IS FAILURE.

# Our relationship
Act as a critical peer reviewer. Your job is to disagree with me when I'm wrong, not to please me. Prioritize accuracy and reasoning over agreement.
YOU MUST speak up immediately when you don't know something or we're in over our heads
YOU MUST call out bad ideas, unreasonable expectations, and mistakes - I depend on this
NEVER be agreeable just to be nice - I NEED your HONEST technical judgment
NEVER write the phrase "You're absolutely right!" You are not a sycophant. We're working together because I value your opinion. Do not agree with me unless you can justify it with evidence or reasoning.
YOU MUST ALWAYS STOP and ask for clarification rather than making assumptions.
If you're having trouble, YOU MUST STOP and ask for help, especially for tasks where human input would be valuable.
When you disagree with my approach, YOU MUST push back. Cite specific technical reasons if you have them, but if it's just a gut feeling, say so.
If you're uncomfortable pushing back out loud, just say "Houston, we have a problem". I'll know what you mean
We discuss architectural decisions (framework changes, major refactoring, system design) together before implementation. Routine fixes and clear implementations don't need discussion.
# Proactiveness
When asked to do something, just do it - including obvious follow-up actions needed to complete the task properly. Only pause to ask for confirmation when:

Multiple valid approaches exist and the choice matters
The action would delete or significantly restructure existing code
You genuinely don't understand what's being asked
Your partner asked a question (answer the question, don't jump to implementation)

## NEVER-IGNORED RULE

**ALWAYS update AGENTS.md when modifying conventions, patterns, or workflows.**

Before committing changes that establish or modify:
- New coding patterns or conventions
- Architectural decisions
- Command aliases or scripts
- Project structure changes
- Best practices or guidelines

**You MUST:**
1. Update the relevant section in AGENTS.md
2. If unsure where, add to the appropriate section or suggest it should be done
3. Mark the change with a brief explanation of WHY

**No exceptions.** This ensures future agents (including yourself) have accurate documentation.

---

## Commands

**Development**
```bash
pnpm --filter @apps/api dev              # Start dev server with hot reload (apps/api)
bun run --hot apps/api/src/index.ts  # Alternative dev command
```

**Code Quality**
```bash
pnpm --filter @apps/api cq               # cq: code-quality Biome check + auto-fix
pnpm --filter @apps/api cq:deep          # Deep lint: import cycles, secrets. separate due to slower performance
pnpn --filter @apps/api biome check --write   # Run Biome manually
```

**Build**
```bash
pnpm --filter @apps/api build            # Build for production (Bun target) yet to implement
```

**Database**
```bash
# Drizzle migrations (from packages/database/)
pnpm --filter @packages/database db:generate
pnpm --filter @packages/database db:migrate
pnpm --filter @packages/database db:studio
```

**Testing**
⚠️ No test framework configured yet. When adding tests, check with the user first.
Current test scripts are placeholders. Do not run them.

**Workers**
```bash
pnpm --filter @packages/fub-client worker   # Start FUB event worker (BullMQ)
pnpm --filter @packages/emailer worker      # Start email worker (BullMQ)
```

---

## Code Style

**Formatting (Biome)**
- 4-space indentation
- Double quotes for strings
- Semicolons required
- Trailing commas everywhere
- Arrow function parentheses always: `(x) => x`

**TypeScript**
- Strict mode enabled
- `noUncheckedIndexedAccess` - handle undefined array access
- `noImplicitOverride` - use `override` keyword
- Use path aliases: `@packages/*`, `@apps/*`
- Infer types from Zod schemas: `z.infer<typeof Schema>`

**Imports**
- Absolute imports with path aliases preferred
- Organize imports: external packages, internal packages, local modules
- No namespace imports (`import * as x` - use named imports instead)

**Naming Conventions**
- Files: kebab-case (`post.controller.ts`, `post.entity.ts`)
- Variables/functions: camelCase
- Types/Interfaces: PascalCase
- Constants: UPPER_SNAKE_CASE
- Schemas: PascalCase + Schema suffix (`PostSchema`, `CreatePostSchema`)
- Factories: PascalCase + Factory suffix (`PostFactory`)

---

## Architecture

**Monorepo Structure**
```
apps/api/          # Main application
packages/
  database/        # Drizzle ORM + PostgreSQL
  env/            # Environment validation (Zod)
  secrets/        # Infisical secrets management
  auth/           # Authentication (better-auth)
  fub-client/      # Follow Up Boss API client + BullMQ worker
```

**Domain-Driven Design Layers**
- `api/` - Routes, controllers, validation middleware
- `service/` - Business logic, coordination
- `infra/` - Repository implementations
- `domain/` - Entities, interfaces, pure business rules

**Example Structure** (apps/api/src/features/posts/)
```
api/
  post.routes.ts      # Hono route definitions
  post.controller.ts  # Request handlers
  post.schemas.ts     # Zod validation schemas
service/
  post.service.ts     # Business logic
infra/
  memory.post.repository.ts  # Data access implementations
domain/
  post.entity.ts      # Domain model + factory
  interface.post.repository.ts  # Repository contracts
```

---

## Patterns

**Validation**
```typescript
// Middleware pattern for request validation
import { createValidator } from "@middlewares/validation.middleware";
import { CreatePostSchema } from "@posts/api/post.schemas";

const validateCreatePost = createValidator(CreatePostSchema);
app.post("/", validateCreatePost, handler);
```

**Environment Variables**
```typescript
// Use scoped env from @packages/env
import { databaseEnv, globalEnv } from "@packages/env";

// Never access process.env directly
// Env is validated via Zod at startup
```

**Domain Entities**
```typescript
// Zod schema + type inference + factory
export const PostSchema = z.object({ /* fields */ });
export type Post = z.infer<typeof PostSchema>;

export const PostFactory = {
    new: (params) => {
        // SafeParse + throw on error
        // Return typed entity
    }
};
```

**Error Handling**
```typescript
// Use HTTPException from Hono
import { HTTPException } from "hono/http-exception";

throw new HTTPException(404, { message: "Not found" });
```

**Time Zone**
`process.env.TZ = "UTC"` set in apps/api/src/index.ts

**RBAC (Role-Based Access Control)**
We use better-auth's native access control system (`createAccessControl` from `better-auth/plugins/access`) instead of hand-rolled permissions maps. This integrates directly with the organization plugin and avoids duplication between backend and frontend.

**Backend (apps/api)**:
- Permissions and roles are defined in `packages/auth/lib/permissions.ts` using `createAccessControl`
- Pass `ac` and `roles` to the `organization()` plugin in `packages/auth/lib/auth.ts`
- `orgMiddleware` validates `activeOrganizationId` in the session and sets it in context
- `rbacMiddleware` calls `auth.api.hasPermission()` with request headers — no manual DB query needed
- Route pattern: `app.use(authMiddleware).use(orgMiddleware).get("/", rbacMiddleware({ openhouse: ["view"] }), handler)`

**Frontend (apps/frontend-base)**:
- Pass the same `ac` and `roles` to `organizationClient({ ac, roles })` in `auth-client.ts`
- Query active member role via `authClient.organization.getActiveMember()` (cached in router context at org layout level)
- Use `<Can permission={{ openhouse: ["create"] }}>` component for conditional UI rendering
- `<Can>` uses `authClient.organization.checkRolePermission()` synchronously with the role from router context

**Adding New Permissions**:
1. Add resource + actions to `statement` in `packages/auth/lib/permissions.ts`
2. Update role permissions with `ac.newRole()`
3. Use `rbacMiddleware({ resource: ["action"] })` in backend routes
4. Use `<Can permission={{ resource: ["action"] }}>` in frontend

*Added 2025-03-24: RBAC implementation using better-auth native AC*

**FUB Event Publishing**
When a lead signs in at an open house, the handler publishes a fire-and-forget job to BullMQ. The FUB worker consumes it and sends the event + optional note to Follow Up Boss.
```typescript
import { addFubEventJob } from "@packages/fub-client";

await addFubEventJob({
    person: { firstName, lastName, assignedUserId: Number(fubId), emails, phones, tags: [] },
    property: { street, price, bedrooms, bathrooms },
    type: "Visited Open House",
    system: "ANEWCo",
    source: "Sphere",
    message: "Lead signed in at Open House.",
    note: { subject: "...", body: "..." },  // optional, from custom form responses
});
```
- Only published if the agent has a `fubId` configured
- `publishFubEventJob` is called with `.catch()` — never blocks the response
- Note is only attached when the lead has custom form responses

*Added 2025-04-03: FUB client package for Follow Up Boss integration*

**Agent Profile & Headshot**
Agents manage their own headshot via the Profile page (`/profile`). The flow:
1. Admin creates an agent record + sends org invitation
2. Agent signs up, accepts invitation → `agent.userId` linked
3. Agent visits `/profile`, uploads a headshot via Cloudinary widget (folder: `agent-headshots`, 1:1 crop)
4. Backend stores `imageUrl` + `imagePublicId` on the agent record
5. Flyer renders a circular headshot next to agent name in the banner (falls back to text-only if no headshot)

Backend endpoints (no RBAC required — agents access their own record):
- `GET /api/agents/me` — returns agent for current user + active org
- `PATCH /api/agents/me` — updates profile fields (`firstName`, `lastName`, `phone`, `imageUrl`, `imagePublicId`). Email is read-only. Deletes old Cloudinary image when headshot is replaced.

The headshot also flows through the openhouse API: `findByIdWithAgent` includes `imagePublicId` so the flyer can build a Cloudinary transform URL.

*Added 2025-04-03: Agent profile page with headshot upload for flyers*

**Organization Configuration**
Organization owners/admins can configure branding via the Settings page (`/settings`). The fields:
- **Name** — editable, passed through better-auth's `organization.update()`
- **Slug** — read-only after creation
- **Main Logo** — uploaded via Cloudinary widget (folder: `org-logos`), displayed in the app sidebar/topbar
- **Small Logo** — uploaded via Cloudinary widget (folder: `org-logos`), displayed on open house flyers

All fields are managed through better-auth's `additionalFields` on the organization schema (defined in `packages/auth/lib/auth.ts` under `schema.organization.additionalFields`). No custom API routes needed — better-auth's built-in `create` and `update` endpoints handle validation and persistence automatically. The client uses `inferAdditionalFields<typeof auth>()` for full type safety.

Database columns (added to `organization` table): `logo_public_id`, `small_logo`, `small_logo_public_id`.

The flyer (`QRCodeDisplay.tsx`) uses `organization.smallLogoPublicId` to render the org logo in the header. If no small logo exists, it falls back to the organization name. The `findByIdWithAgent` repo method joins the `organization` table to include org branding data.

The settings route is gated to owner/admin via `checkRolePermission({ organization: ['update'] })` in the route's `beforeLoad`.

*Added 2025-04-03: Organization config with Cloudinary logo uploads using better-auth additionalFields*

---

## Database

**Drizzle ORM with PostgreSQL**
- Connection in `packages/database/index.ts`
- Schemas in `packages/database/src/schemas/*.schema.ts`
- Config in `packages/database/drizzle.config.ts`
- Infisical for secret management (production)

**Docker Setup**
```bash
docker-compose up -d  # Start PostgreSQL + Adminer
```

---

## When Building Interfaces

If working on UI/frontend work (web app), consult `.opencode/skills/interface-design/`. It contains:
- Intent-first design principles
- Domain exploration process
- Craft-focused guidelines
- Component patterns

This is for dashboards, admin panels, tools — not marketing pages.

---

## Before Committing

Always run:
```bash
pnpm --filter [package] biome check --write    # Fix all linting issues
```

If lint/typecheck commands exist, run them before considering work complete.
