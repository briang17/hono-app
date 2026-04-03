# ABAC Authorization — Implementation Plan

## Context

The current RBAC system uses better-auth's `createAccessControl` with three static roles (`owner`, `admin`, `agent`). RBAC answers "does this role have access to this resource type?" but cannot answer "can this specific user act on this specific resource?" — for example, an agent with `openhouse: ["update"]` can currently update any open house in the org, not just their own.

ABAC (Attribute-Based Access Control) layers on top of RBAC to evaluate fine-grained rules based on resource attributes (ownership, status) and user context (role, org membership). RBAC stays as the coarse gate at the middleware level; ABAC enforces business rules at the service layer.

---

## Status

- [ ] Backend: shared types
- [ ] Backend: orgMiddleware role resolution
- [ ] Backend: agent RBAC widening
- [ ] Backend: openhouse policy
- [ ] Backend: agent policy
- [ ] Backend: entity + service + handler changes
- [ ] Backend: lead visibility scoping
- [ ] Frontend: Can component extension
- [ ] Frontend: API types + queries
- [ ] Frontend: page component updates
- [ ] AGENTS.md update

---

## Architecture

### Two-Layer Auth Pipeline

```
Request → authMiddleware (validates session, sets user + session on context)
        → orgMiddleware (checks activeOrganizationId, resolves member role, sets organizationId + role on context)
        → rbacMiddleware (coarse role check — "can this role access this resource type at all?")
        → Handler (extracts PolicyContext from Hono context, passes to service)
        → Service (loads resource, evaluates ABAC policy, attaches _permissions to response or throws 403)
```

### Decision Matrix

| Layer | Answers | Example |
|-------|---------|---------|
| RBAC | Can an agent view open houses at all? | Yes — `openhouse: ["view"]` |
| ABAC | Can agent X edit open house Y? | Only if X created Y, or X is admin/owner |

### Where Policies Live

Per-feature policy files co-located with domain logic. No centralized policy module — domain expertise stays close to the rules.

---

## Phase 1: Shared ABAC Types

### Create `packages/auth/lib/abac.types.ts`

```typescript
export interface PolicyContext {
    userId: string;
    organizationId: string;
    role: string;
}

export type WithPermissions<T, P extends Record<string, boolean>> = T & {
    _permissions: P;
};
```

This file is intentionally small — just the contract shared between backend policies and frontend types. No helpers, no domain knowledge.

---

## Phase 2: Extend orgMiddleware to Resolve Role

### Modify `apps/api/src/middlewares/org.middleware.ts`

Currently the middleware only extracts `activeOrganizationId` from the session. We need the user's role within the active organization for `PolicyContext`.

**Changes:**
1. Import `db` from `@packages/database` and `member` from `@packages/database/src/schemas/auth.schema`
2. Query the `member` table: `SELECT role FROM member WHERE userId = ? AND organizationId = ?`
3. Set `role` on the Hono context alongside `organizationId`
4. If no member record found, throw 403 (user is not a member of this org)

**Updated `OrgVariables` type:**

```typescript
export type OrgVariables = AuthVariables & {
    organizationId: string;
    role: string;
};
```

**Implementation sketch:**

```typescript
import { db } from "@packages/database";
import { member } from "@packages/database/src/schemas/auth.schema";
import { eq, and } from "drizzle-orm";

export const orgMiddleware = createMiddleware<{ Variables: OrgVariables }>(
    async (c, next) => {
        const session = c.get("session");
        const user = c.get("user");
        const organizationId = session.activeOrganizationId;

        if (!organizationId) {
            throw new HTTPException(codes.FORBIDDEN, {
                message: "No active organization selected. Please create or select one.",
            });
        }

        const [memberRecord] = await db
            .select({ role: member.role })
            .from(member)
            .where(
                and(
                    eq(member.userId, user.id),
                    eq(member.organizationId, organizationId),
                ),
            )
            .limit(1);

        if (!memberRecord) {
            throw new HTTPException(codes.FORBIDDEN, {
                message: "You are not a member of this organization.",
            });
        }

        c.set("organizationId", organizationId);
        c.set("role", memberRecord.role);
        return await next();
    },
);
```

**Performance note:** This adds one DB query per org-scoped request. The `member` table is small and indexed on `(userId, organizationId)`. If this becomes a bottleneck later, we can cache the role in the session (better-auth stores it on member creation/update).

**Downstream types to update:**

- `apps/api/src/lib/types.ts` — `OrgEnv` type should reflect the new `role` variable
- `apps/api/src/lib/factory.ts` — no change needed (already uses `OrgEnv`)

---

## Phase 3: Widen Agent RBAC Permissions

### Modify `packages/auth/lib/permissions.ts`

Currently agents have `openhouse: ["create", "view"]`. With ABAC handling scoping, we widen this to include update and delete — the policy layer will enforce ownership.

**Change:**

```typescript
export const agent = ac.newRole({
    ...memberAc.statements,
    openhouse: ["create", "view", "update", "delete"],
    lead: ["view"],
    form_config: ["view"],
});
```

This means RBAC now answers "can an agent interact with open houses?" (yes) and ABAC answers "can this agent edit *this* open house?" (only if they created it).

**Impact on existing routes:** The `rbacMiddleware` calls in `openhouse.handlers.ts` will now allow agents through on update/delete routes. The ABAC enforcement in the service layer prevents unauthorized mutations. No frontend change needed for this — the RBAC check was already passing for owner/admin.

---

## Phase 4: Per-Feature Policy Files

### Create `apps/api/src/features/openhouse/domain/openhouse.policy.ts`

```typescript
import type { PolicyContext } from "@packages/auth/lib/abac.types";

export interface OpenHousePermissionsResult {
    canEdit: boolean;
    canDelete: boolean;
    canViewLeads: boolean;
    canExportLeads: boolean;
}

const isOwnerOrAdmin = (ctx: PolicyContext): boolean => {
    return ctx.role === "owner" || ctx.role === "admin";
};

export function evaluateOpenHousePermissions(
    ctx: PolicyContext,
    resource: { createdByUserId: string },
): OpenHousePermissionsResult {
    const privileged = isOwnerOrAdmin(ctx);
    const owns = resource.createdByUserId === ctx.userId;

    return {
        canEdit: privileged || owns,
        canDelete: privileged || owns,
        canViewLeads: privileged || owns,
        canExportLeads: privileged,
    };
}

export function canEditOpenHouse(
    ctx: PolicyContext,
    resource: { createdByUserId: string },
): boolean {
    return evaluateOpenHousePermissions(ctx, resource).canEdit;
}

export function canDeleteOpenHouse(
    ctx: PolicyContext,
    resource: { createdByUserId: string },
): boolean {
    return evaluateOpenHousePermissions(ctx, resource).canDelete;
}

export function canViewOpenHouseLeads(
    ctx: PolicyContext,
    resource: { createdByUserId: string },
): boolean {
    return evaluateOpenHousePermissions(ctx, resource).canViewLeads;
}
```

**Rules:**

| Action | owner/admin | agent (owns resource) | agent (doesn't own) |
|--------|-------------|----------------------|---------------------|
| canEdit | true | true | false |
| canDelete | true | true | false |
| canViewLeads | true | true | false |
| canExportLeads | true | false | false |

---

### Create `apps/api/src/features/agent/domain/agent.policy.ts`

```typescript
import type { PolicyContext } from "@packages/auth/lib/abac.types";

export interface AgentPermissionsResult {
    canEdit: boolean;
    canDelete: boolean;
    canDeactivate: boolean;
}

const isOwnerOrAdmin = (ctx: PolicyContext): boolean => {
    return ctx.role === "owner" || ctx.role === "admin";
};

export function evaluateAgentPermissions(
    ctx: PolicyContext,
    resource: { userId: string | null },
): AgentPermissionsResult {
    const privileged = isOwnerOrAdmin(ctx);
    const isSelf = resource.userId === ctx.userId;

    return {
        canEdit: privileged || isSelf,
        canDelete: privileged,
        canDeactivate: privileged || isSelf,
    };
}

export function canEditAgent(
    ctx: PolicyContext,
    resource: { userId: string | null },
): boolean {
    return evaluateAgentPermissions(ctx, resource).canEdit;
}

export function canDeleteAgent(
    ctx: PolicyContext,
    resource: { userId: string | null },
): boolean {
    return evaluateAgentPermissions(ctx, resource).canDelete;
}

export function canDeactivateAgent(
    ctx: PolicyContext,
    resource: { userId: string | null },
): boolean {
    return evaluateAgentPermissions(ctx, resource).canDeactivate;
}
```

**Rules:**

| Action | owner/admin | agent (self) | agent (other) |
|--------|-------------|-------------|---------------|
| canEdit | true | true | false |
| canDelete | true | false | false |
| canDeactivate | true | true | false |

Note: `agent.userId` is nullable (not linked until invitation accepted). An agent record with `userId: null` can only be managed by owner/admin — `isSelf` will be `false` since `null !== ctx.userId`.

---

## Phase 5: Entity + Service + Handler Changes

### 5a. OpenHouse Entity

**Modify `apps/api/src/features/openhouse/domain/openhouse.entity.ts`**

Add the permissions result type and a response type that includes permissions:

```typescript
import type { OpenHousePermissionsResult } from "./openhouse.policy";

export type OpenHouseWithPermissions = OpenHouse & {
    _permissions: OpenHousePermissionsResult;
};
export type OpenHouseWithCreatorAndPermissions = OpenHouseWithCreator & {
    _permissions: OpenHousePermissionsResult;
};
```

These are used in handler return types to type the API response.

---

### 5b. OpenHouse Service

**Modify `apps/api/src/features/openhouse/service/openhouse.service.ts`**

The service accepts `PolicyContext` on all methods that return or mutate resources. It evaluates permissions and either attaches `_permissions` (reads) or enforces them (mutations).

**Method changes:**

#### `getOpenHouse(id, organizationId)` → `getOpenHouse(id, organizationId, policyCtx)`

- Fetch the open house as before
- Call `evaluateOpenHousePermissions(policyCtx, openHouse)`
- Return `OpenHouseWithPermissions` (open house + `_permissions`)

#### `getOpenHouses(organizationId, userId)` → `getOpenHouses(organizationId, policyCtx)`

- Fetch open houses as before
- For each, compute `_permissions` using `evaluateOpenHousePermissions`
- Return array of `OpenHouseWithPermissions`

Note: The current `userId` parameter was used for `findByOrgAndUser` (my open houses view). With ABAC, the repo method stays the same for filtering, but permissions are computed per-item. The `userId` comes from `policyCtx.userId` instead of a separate parameter.

#### `getTeamOpenHouses(organizationId)` → `getTeamOpenHouses(organizationId, policyCtx)`

- Same pattern — compute `_permissions` per item

#### `getOpenHouseLeads(openHouseId, organizationId)` → `getOpenHouseLeads(openHouseId, organizationId, policyCtx)`

- Fetch the open house first to get `createdByUserId`
- Call `canViewOpenHouseLeads(policyCtx, openHouse)`
- If denied, throw `HTTPException(403)` with message "You can only view leads for open houses you created"
- If allowed, return leads as before

#### `updateOpenHouse(id, data, organizationId)` → `updateOpenHouse(id, data, organizationId, policyCtx)`

- Fetch the open house first to get `createdByUserId`
- Call `canEditOpenHouse(policyCtx, openHouse)`
- If denied, throw `HTTPException(403)` with message "You can only edit open houses you created"
- If allowed, proceed with update as before
- Return updated resource with `_permissions`

#### `deleteOpenHouse(id, organizationId)` → `deleteOpenHouse(id, organizationId, policyCtx)`

- Same pattern as update — enforce `canDeleteOpenHouse` before deletion
- Throw 403 if denied

**Implementation sketch for update:**

```typescript
async updateOpenHouse(
    id: string,
    data: UpdateOpenHouseInput,
    organizationId: string,
    ctx: PolicyContext,
): Promise<OpenHouseWithPermissions> {
    const existing = await this.repository.findByIdAndOrg(id, organizationId);
    if (!existing) {
        throw new HTTPException(404, { message: "Open house not found" });
    }

    if (!canEditOpenHouse(ctx, existing)) {
        throw new HTTPException(403, {
            message: "You can only edit open houses you created",
        });
    }

    const updated = await this.repository.update(id, data, organizationId);
    return {
        ...updated,
        _permissions: evaluateOpenHousePermissions(ctx, updated),
    };
}
```

---

### 5c. OpenHouse Handlers

**Modify `apps/api/src/features/openhouse/api/openhouse.handlers.ts`**

Extract `PolicyContext` from Hono context in each handler and pass to service:

```typescript
import type { PolicyContext } from "@packages/auth/lib/abac.types";

const getPolicyContext = (c: Context): PolicyContext => ({
    userId: c.get("user").id,
    organizationId: c.get("organizationId"),
    role: c.get("role"),
});
```

Every handler that calls a service method now constructs `getPolicyContext(c)` and passes it as the last argument.

**Example — updateOpenHouse handler:**

```typescript
export const updateOpenHouseHandlers = orgFactory.createHandlers(
    rbacMiddleware({ openhouse: ["update"] }),
    async (c) => {
        const { id } = c.req.valid("param");
        const data = c.req.valid("json");
        const ctx = getPolicyContext(c);
        const result = await openHouseService.updateOpenHouse(id, data, ctx.organizationId, ctx);
        return c.json({ data: result }, 200);
    },
);
```

---

### 5d. Agent Entity

**Modify `apps/api/src/features/agent/domain/agent.entity.ts`**

Add permission response types:

```typescript
import type { AgentPermissionsResult } from "./agent.policy";

export type AgentWithPermissions = Agent & {
    _permissions: AgentPermissionsResult;
};
export type AgentWithUserAndPermissions = AgentWithUser & {
    _permissions: AgentPermissionsResult;
};
```

---

### 5e. Agent Service

**Modify `apps/api/src/features/agent/service/agent.service.ts`**

Same pattern as OpenHouse — accept `PolicyContext`, compute `_permissions` on reads, enforce on mutations.

**Method changes:**

#### `getAgents(organizationId)` → `getAgents(organizationId, policyCtx)`

- Fetch agents as before (with user join)
- Compute `_permissions` per agent using `evaluateAgentPermissions`

#### `getAgent(id, organizationId)` → `getAgent(id, organizationId, policyCtx)`

- Fetch agent, compute `_permissions`

#### `updateAgent(id, data, organizationId)` → `updateAgent(id, data, organizationId, policyCtx)`

- Fetch existing agent
- Enforce `canEditAgent` — throw 403 if denied
- Proceed with update

#### `deleteAgent(id, organizationId)` → `deleteAgent(id, organizationId, policyCtx)`

- Enforce `canDeleteAgent` — throw 403 if denied
- Proceed with deletion (existing transaction logic unchanged)

#### `deactivateAgent(id, organizationId)` / `reactivateAgent(...)` → same pattern with `canDeactivateAgent`

**Note:** `createAgent` does NOT need ABAC — any user with `agent: ["create"]` RBAC permission can create agents. Creation has no existing resource to evaluate against.

---

### 5f. Agent Handlers

**Modify `apps/api/src/features/agent/api/agent.handlers.ts`**

Same `getPolicyContext(c)` helper pattern. Pass `PolicyContext` to all service methods except `createAgent`.

---

## Phase 6: Lead Visibility Scoping

### Modify `apps/api/src/features/openhouse/service/openhouse.service.ts`

The `getOpenHouseLeads` method gains ABAC enforcement (described in Phase 5b). Additionally:

### Modify `apps/api/src/features/openhouse/infra/db.openhouse.repository.ts`

No new repo method needed — the service already fetches the open house before returning leads (to verify it exists and belongs to the org). The ABAC check happens in the service layer on the fetched open house's `createdByUserId`.

For the **team open houses leads view** (if it exists or is added later): same pattern. The service fetches the open house, checks `canViewOpenHouseLeads`, and only then returns leads.

**Agent-scoped open house listing:** The existing `findByOrgAndUser(organizationId, userId)` method is already used for "my open houses" — this stays unchanged. Agents see only their own open houses in that view. The team view (`findByOrg`) shows all — ABAC permissions tell the frontend which ones can be edited.

---

## Phase 7: Frontend — Can Component

### Modify `apps/frontend-base/src/components/Can.tsx`

Add an optional `check` prop for server-computed ABAC results:

```typescript
import type { OrgRole } from "@packages/auth/client/index";
import type { ReactNode } from "react";
import { authClient } from "@/lib/api/auth-client";
import { useRouteContext } from "@tanstack/react-router";
import type { RBACParams } from "@packages/auth/lib/permissions";

interface Props {
    permission?: RBACParams;
    check?: boolean;
    children: ReactNode;
    fallback?: ReactNode;
}

export const Can = ({ permission, check, children, fallback = null }: Props) => {
    const { data: member } = useRouteContext({
        from: "/(protected)/(organization)",
        select: (context) => context.activeMember,
    });

    const rbacPass = permission
        ? authClient.organization.checkRolePermission({
              permissions: permission,
              role: (member?.role as OrgRole) ?? "agent",
          })
        : true;

    const abacPass = check !== undefined ? check : true;

    return rbacPass && abacPass ? <>{children}</> : <>{fallback}</>;
};
```

**Usage patterns:**

```tsx
{/* RBAC only (existing pattern — unchanged) */}
<Can permission={{ agent: ["create"] }}>
    <Button>Invite Agent</Button>
</Can>

{/* ABAC only (server-computed permission) */}
<Can check={openHouse._permissions.canEdit}>
    <Button>Edit</Button>
</Can>

{/* Both RBAC + ABAC */}
<Can permission={{ openhouse: ["update"] }} check={openHouse._permissions.canEdit}>
    <Button>Edit</Button>
</Can>
```

When both `permission` and `check` are provided, both must pass. When only one is provided, only that check applies. This maintains backward compatibility — all existing `<Can permission={...}>` usage works unchanged.

---

## Phase 8: Frontend — API Types + Queries

### Update response types

The backend API responses now include `_permissions`. Frontend Zod schemas and types need to reflect this.

**Modify `apps/frontend-base/src/lib/schemas/openhouse.schema.ts`:**

```typescript
import { z } from "zod/v4";

export const openHousePermissionsResultSchema = z.object({
    canEdit: z.boolean(),
    canDelete: z.boolean(),
    canViewLeads: z.boolean(),
    canExportLeads: z.boolean(),
});

// Extend existing schemas
export const openHouseWithPermissionsSchema = openHouseSchema.extend({
    _permissions: openHousePermissionsResultSchema,
});

export const openHouseWithCreatorAndPermissionsSchema = openHouseWithCreatorSchema.extend({
    _permissions: openHousePermissionsResultSchema,
});
```

**Modify `apps/frontend-base/src/lib/schemas/agent.schema.ts`:**

```typescript
export const agentPermissionsResultSchema = z.object({
    canEdit: z.boolean(),
    canDelete: z.boolean(),
    canDeactivate: z.boolean(),
});

export const agentWithUserAndPermissionsSchema = agentWithUserSchema.extend({
    _permissions: agentPermissionsResultSchema,
});
```

**Update API client functions** to parse responses with the new schemas (or the types will naturally include `_permissions` via the Hono RPC client since it derives types from the backend).

**No query key changes needed** — same cache keys, just richer data.

---

## Phase 9: Frontend — Page Component Updates

### OpenHouse Detail Page (`src/pages/openhouse/OpenHouseDetailPage.tsx`)

Gate edit/delete buttons with ABAC permissions:

```tsx
<Can check={openHouse._permissions.canEdit}>
    <Button onClick={() => navigate({ to: "/openhouse/$openHouseId/edit", params: { openHouseId } })}>
        Edit
    </Button>
</Can>
<Can check={openHouse._permissions.canDelete}>
    <Button variant="destructive" onClick={handleDelete}>Delete</Button>
</Can>
```

### OpenHouse List Pages (`CreateOpenHousePage`, `TeamOpenHouseListPage`)

Each `OpenHouseCard` or table row receives `_permissions` and conditionally renders action buttons:

```tsx
<Can check={openHouse._permissions.canEdit}>
    <Button size="sm" variant="ghost">Edit</Button>
</Can>
```

### OpenHouse Leads View

Gate export button:

```tsx
<Can check={openHouse._permissions.canExportLeads}>
    <Button>Export Leads</Button>
</Can>
```

### Agents Page (`src/pages/agent/AgentsPage.tsx`)

Replace RBAC-only `<Can permission={{ agent: ["update"] }}>` with ABAC-aware checks:

```tsx
<Can check={agent._permissions.canEdit}>
    <Button size="sm" variant="ghost" onClick={onEdit}>Edit</Button>
</Can>
<Can check={agent._permissions.canDelete}>
    <Button size="sm" variant="ghost" className="text-destructive">Delete</Button>
</Can>
<Can check={agent._permissions.canDeactivate}>
    {agent.isActive
        ? <Button size="sm" variant="ghost" onClick={() => deactivate.mutate()}>Deactivate</Button>
        : <Button size="sm" variant="ghost" onClick={() => reactivate.mutate()}>Reactivate</Button>
    }
</Can>
```

---

## File Change Summary

### New Files (3)

| File | Description |
|------|-------------|
| `packages/auth/lib/abac.types.ts` | `PolicyContext` interface, `WithPermissions` type |
| `apps/api/src/features/openhouse/domain/openhouse.policy.ts` | OpenHouse ABAC policy functions |
| `apps/api/src/features/agent/domain/agent.policy.ts` | Agent ABAC policy functions |

### Modified Files — Backend (8)

| File | Change |
|------|--------|
| `apps/api/src/middlewares/org.middleware.ts` | Resolve member role from DB, set on context |
| `apps/api/src/lib/types.ts` | Update `OrgEnv` with `role` variable |
| `packages/auth/lib/permissions.ts` | Widen agent role: add `openhouse: update, delete` |
| `apps/api/src/features/openhouse/domain/openhouse.entity.ts` | Add `OpenHouseWithPermissions` types |
| `apps/api/src/features/openhouse/service/openhouse.service.ts` | Accept `PolicyContext`, enforce ABAC on mutations, attach `_permissions` on reads |
| `apps/api/src/features/openhouse/api/openhouse.handlers.ts` | Extract `PolicyContext`, pass to service |
| `apps/api/src/features/agent/domain/agent.entity.ts` | Add `AgentWithPermissions` types |
| `apps/api/src/features/agent/service/agent.service.ts` | Accept `PolicyContext`, enforce ABAC, attach `_permissions` |

### Modified Files — Frontend (5-7)

| File | Change |
|------|--------|
| `apps/frontend-base/src/components/Can.tsx` | Add `check?: boolean` prop |
| `apps/frontend-base/src/lib/schemas/openhouse.schema.ts` | Add permission schemas |
| `apps/frontend-base/src/lib/schemas/agent.schema.ts` | Add permission schemas |
| `apps/frontend-base/src/pages/openhouse/OpenHouseDetailPage.tsx` | Use `_permissions` for action buttons |
| `apps/frontend-base/src/pages/openhouse/components/OpenHouseCard.tsx` | Use `_permissions` for card actions |
| `apps/frontend-base/src/pages/agent/AgentsPage.tsx` | Use `_permissions` for agent row actions |
| `apps/frontend-base/src/components/layout/Sidebar.tsx` | Potentially — if any nav items should also check ABAC |

---

## Implementation Order

1. `packages/auth/lib/abac.types.ts` — shared types (no dependencies)
2. `apps/api/src/middlewares/org.middleware.ts` + `apps/api/src/lib/types.ts` — role resolution
3. `packages/auth/lib/permissions.ts` — widen agent RBAC
4. `apps/api/src/features/openhouse/domain/openhouse.policy.ts` — policy functions
5. `apps/api/src/features/openhouse/domain/openhouse.entity.ts` — permission types
6. `apps/api/src/features/openhouse/service/openhouse.service.ts` — ABAC enforcement
7. `apps/api/src/features/openhouse/api/openhouse.handlers.ts` — wire PolicyContext
8. `apps/api/src/features/agent/domain/agent.policy.ts` — policy functions
9. `apps/api/src/features/agent/domain/agent.entity.ts` — permission types
10. `apps/api/src/features/agent/service/agent.service.ts` — ABAC enforcement
11. `apps/api/src/features/agent/api/agent.handlers.ts` — wire PolicyContext
12. Run `pnpm --filter @apps/api biome check --write` + verify build
13. `apps/frontend-base/src/components/Can.tsx` — add `check` prop
14. `apps/frontend-base/src/lib/schemas/openhouse.schema.ts` + `agent.schema.ts` — permission schemas
15. Frontend page components — wire `_permissions`
16. Run `pnpm --filter @apps/frontend-base biome check --write`
17. Update `AGENTS.md` — document ABAC pattern

---

## Design Decisions

### Why per-feature policy files instead of centralized?

Domain rules like "agent can only edit their own open houses" belong next to the domain entities. A centralized policy module would need to import domain types from every feature, creating coupling. Per-feature files keep the policy co-located with the entity it governs.

### Why server-computed permissions instead of async client checks?

1. **Consistency:** The server is the source of truth. Computing permissions at read time means the frontend always has up-to-date permissions — no stale client-side state.
2. **Simplicity:** No loading states, no extra API calls, no race conditions. Permissions travel with the data.
3. **Auditability:** Every permission decision is logged in the same request that fetched the data.

### Why widen RBAC instead of keeping it restrictive?

If RBAC blocks agents from `openhouse: ["update"]`, the route handler never executes — no opportunity for ABAC to check ownership. We'd need separate routes or conditional middleware logic. Widening RBAC and relying on ABAC for scoping keeps the middleware simple and the real authorization logic in one place (the policy files).

### Why resolve role in orgMiddleware instead of per-handler?

One query per request at the middleware level is cheaper than one query per handler. The role is needed by every ABAC check, so resolving it once at the middleware level is both more efficient and more consistent.

---

## Future Considerations

- **Caching the role in session:** If the member query in orgMiddleware becomes a bottleneck, better-auth supports storing the role on the session or member object. We can migrate later without changing the policy interface.
- **More ABAC rules:** As features grow, new policy files follow the same pattern. Each feature's `domain/` directory gets a `<feature>.policy.ts`.
- **Admin dashboard:** If an admin dashboard needs to show "all users who can edit this resource," the policy functions can be composed into a query builder.
- **Audit logging:** The policy functions are pure — they can be wrapped with logging to record every permission decision for compliance.

---

## Notes for Implementation

- `orgMiddleware` role query uses `drizzle-orm` directly (same as `auth.ts` session hooks). The `member` table is imported from `@packages/database/src/schemas/auth.schema`.
- The `_permissions` field is a convention, not a Drizzle column. It's computed and attached in the service layer, not stored in the database.
- The Hono RPC client automatically derives types from the backend route definitions, so frontend types for `_permissions` may flow through automatically. If not, the frontend Zod schemas provide a fallback.
- All ABAC checks happen after RBAC. The `rbacMiddleware` stays in place on every route. ABAC is additive, not a replacement.
- The `Can` component's `check` prop defaults to `true` when omitted, so existing `<Can permission={...}>` usage is unaffected.
