# Agent Feature — Implementation Plan

## Context

Agents are real estate agents belonging to an organization. They have separate records from users: the `user` record handles auth/credentials/role, the `agent` record handles public-facing profile info. An agent is created by an admin/owner via an invitation flow — the agent record exists immediately (with `userId: null`) and the user account is linked after the invited person accepts the invitation and signs up.

---

## Status

- [x] Backend complete (`packages/database`, `packages/auth`, `apps/api`)
- [ ] Frontend (`apps/frontend-base`)

---

## Backend — COMPLETED

### Database (`packages/database/src/schemas/agent.schema.ts`)

Table: `agent`
- `id` uuid PK `defaultRandom()`
- `userId` uuid nullable FK → `user.id` `SET NULL` — null until invitation accepted
- `organizationId` uuid NOT NULL FK → `organization.id` `CASCADE DELETE`
- `email` text NOT NULL — stores invited email, used as hook correlation key
- `firstName` text NOT NULL
- `lastName` text NOT NULL
- `phone` text nullable
- `fubId` text nullable — FollowUpBoss ID
- `isActive` boolean NOT NULL default `true`
- `createdAt` timestamp `defaultNow()`
- `updatedAt` timestamp `$onUpdate()`
- Unique index: `(organizationId, email)`

Relations: `agentRelations` (agent → one user, one organization), `userAgentRelations` (augments user), `organizationAgentRelations` (augments organization)

Migration applied: `drizzle/0003_sad_doctor_spectrum.sql`

### Auth (`packages/auth/lib/`)

**`permissions.ts`** — added `agent` resource:
```typescript
agent: ["create", "view", "update", "delete", "deactivate"]
```
- `owner` + `admin` roles: all 5 actions
- `agent` role: no agent permissions (agents cannot manage other agents)

**`auth.ts`** — added `sendInvitationEmail` stub to `organization()` plugin:
```typescript
async sendInvitationEmail(data) {
    console.log(`[invitation] send to ${data.email} for org ${data.organization.name}, id: ${data.id}`)
}
```
Phase 2: replace stub with real email implementation.

### API (`apps/api/src/features/agent/`)

**Domain:**
- `domain/agent.entity.ts` — `AgentSchema`, `NewAgentSchema`, `UpdateAgentSchema`, `AgentWithUserSchema`, `AgentFactory`
- `domain/interface.agent.repository.ts` — `IAgentRepository` interface

**Infra:**
- `infra/db.agent.repository.ts` — `DbAgentRepository` implements `IAgentRepository`
  - `findByOrganization`: left joins `user` on `userId` to populate `userName`
  - `linkUser(organizationId, email, userId)`: for Phase 2 hook

**Service:**
- `service/agent.service.ts` — `AgentService`
  - `createAgent` is a pure domain operation (persist only)
  - Invitation call lives in the handler, not the service (HTTP concerns belong at the API layer)

**API:**
- `api/agent.schemas.ts` — URL param schemas
- `api/agent.handlers.ts` — handlers; `createAgentHandlers` calls `auth.api.createInvitation` with `c.req.raw.headers` after persisting the agent
- `api/agent.routes.ts` — all routes under `authMiddleware` + `orgMiddleware`

**Endpoints:**
| Method | Path | RBAC | Description |
|---|---|---|---|
| GET | `/api/agents` | `agent:view` | List all agents for org (returns `AgentWithUser[]`) |
| GET | `/api/agents/:id` | `agent:view` | Get single agent |
| POST | `/api/agents` | `agent:create` | Create agent record + send org invitation |
| PATCH | `/api/agents/:id` | `agent:update` | Update agent profile |
| DELETE | `/api/agents/:id` | `agent:delete` | Delete agent record |
| POST | `/api/agents/:id/deactivate` | `agent:deactivate` | Set `isActive = false` |
| POST | `/api/agents/:id/reactivate` | `agent:deactivate` | Set `isActive = true` |

**App registration:** `apps/api/src/index.ts` — `.route("/api/agents", agentRoutes)`
**tsconfig alias:** `apps/api/tsconfig.json` — `"@agent/*": ["src/features/agent/*"]`

### Phase 2 (deferred — `packages/auth`)

Add `afterAcceptInvitation` hook to `organization()` plugin config in `auth.ts`:
```typescript
organizationHooks: {
    afterAcceptInvitation: async ({ invitation, user, organization }) => {
        // Look up agent by (organizationId, email) — the correlation key
        // db.update(agent).set({ userId: user.id })
        //   .where(and(eq(agent.organizationId, organization.id), eq(agent.email, invitation.email)))
    }
}
```
`IAgentRepository.linkUser(organizationId, email, userId)` and `DbAgentRepository.linkUser` are already implemented — Phase 2 only modifies `packages/auth`.

---

## Frontend — TO IMPLEMENT

### Design System Reference

**Palette:** `re-gold` (primary accent, CTAs, price highlights) + `re-navy` (headings, card titles). Semantic tokens for status: `success`, `warning`, `destructive`, `muted`.

**Depth strategy:** Borders-only. No heavy shadows. Cards use `ring-1 ring-foreground/10`. Signature: `border-l-4 border-l-re-gold` on accented cards.

**Typography hierarchy:**
- Page title: `text-3xl font-bold tracking-tight text-re-navy`
- Section label / table header: `text-muted-foreground`
- Card title: `text-base font-medium text-re-navy`
- Meta: `text-sm text-muted-foreground`

**Spacing base unit:** 4px — all spacing multiples of 4. Page sections: `space-y-8`. Form fields: `space-y-4`.

**Interaction states:** `transition-all duration-200` on all interactive elements. Hover: `hover:bg-muted/50` (table rows) or `hover:text-re-gold` (ghost buttons in cards).

**Status / account badges** — use semantic inline-span pattern:
```tsx
// Active (isActive = true, userId != null):
<span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border bg-success/10 text-success border-success/20">
  Active
</span>

// Inactive (isActive = false):
<span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border bg-muted text-muted-foreground border-border">
  Inactive
</span>

// Invitation Pending (userId = null):
<span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border bg-warning/10 text-warning border-warning/20">
  Invitation Pending
</span>
```

**Empty state pattern:**
```tsx
<div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center max-w-md">
        <div className="text-4xl mb-4">🏢</div>
        <h3 className="text-lg font-semibold mb-2">No agents yet</h3>
        <p className="text-muted-foreground mb-4">
            Invite your first agent to get started.
        </p>
        <Can permission={{ agent: ['create'] }}>
            <Button onClick={() => setCreateOpen(true)}>Invite Agent</Button>
        </Can>
    </div>
</div>
```

**Full-screen centered state pattern** (for AcceptInvitationPage — mirrors VisitorSignInPage):
```tsx
<div className="flex items-center justify-center min-h-screen">
    <div className="text-center max-w-md px-4">
        {/* icon + heading + message */}
    </div>
</div>
```

**Error state pattern** (mirrors VisitorSignInError / OpenHouseDetailError):
```tsx
<div className="flex items-center justify-center min-h-screen">
    <div className="text-center max-w-md px-4">
        <Frown size={48} strokeWidth={1.5} className="mx-auto text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Could not accept invitation</h3>
        <p className="text-muted-foreground mb-4">
            This invitation may have expired or already been used.
        </p>
        <Button variant="outline" onClick={() => navigate({ to: '/dashboard' })}>
            Go to Dashboard
        </Button>
    </div>
</div>
```

**Action buttons in table rows:** `size="sm" variant="ghost"` — keeps row density tight.

---

### Key decisions

1. **No detail page** — agent editing opens a `<Dialog>` in-page from `AgentsPage`
2. **Pre-TanStack Table** — use existing `src/components/ui/table.tsx` for the agents list
3. **No `@agent` path alias** — frontend schemas are defined locally in `src/lib/schemas/`, not imported from the API
4. **Form pattern** — three-level split (matches SignUpPage / LoginPage / CreateOrganizationPage):
   - `validators.onSubmit`: Zod schema (sync validation)
   - `validators.onSubmitAsync`: HTTP call directly inside the form (no prop) — throws `Error` on failure, surfaces in `errorMap.onSubmit`
   - `onSubmit`: post-success side effect (close dialog) — only runs if async did not throw
5. **Mutation called inside form** — `useCreateAgent()` / `useUpdateAgent()` are called at the top of `AgentsPage` and passed as the mutation fn reference into `AgentForm`. The form's `onSubmitAsync` calls the mutation directly, not via a prop.

### Invitation + account creation flow

```
1. Admin: POST /api/agents  →  agent record (userId=null) + invitation email (stub logs to console for now)
2. Invitee: clicks link  →  /invite/accept?invitationId=xxx&email=xxx
3. AcceptInvitationPage: no session  →  redirect to /auth/sign-up?invitationId=xxx&email=xxx&redirect=/invite/accept?invitationId=xxx
4. SignUpPage: pre-fills + disables email field, signs up via authClient.signUp.email()
5. SignUpPage onSubmit: detects invitationId  →  navigate to /invite/accept?invitationId=xxx
6. AcceptInvitationPage: now has session  →  authClient.organization.acceptInvitation({ invitationId })
7. better-auth: adds user as org member with role "agent"
8. (Phase 2 hook): links userId on agent record
9. AcceptInvitationPage: navigate to /dashboard
```

Key constraint: `acceptInvitation` has `requireSession: true` in better-auth — user MUST be authenticated before calling it. The redirect chain above satisfies this.

---

## Frontend Files

### New files (9)

#### `src/lib/schemas/agent.schema.ts`

```typescript
import { z } from 'zod/v4'

export const agentSchema = z.object({
    id: z.uuid(),
    userId: z.uuid().nullable(),
    organizationId: z.uuid(),
    email: z.email(),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().nullable(),
    fubId: z.string().nullable(),
    isActive: z.boolean(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
})

export const agentWithUserSchema = agentSchema.extend({
    userName: z.string().nullable(),
})

export const createAgentSchema = agentSchema.pick({
    email: true,
    firstName: true,
    lastName: true,
    phone: true,
    fubId: true,
})

// email excluded from updates — it's the invitation correlation key
export const updateAgentSchema = createAgentSchema.omit({ email: true }).partial()

export type Agent = z.infer<typeof agentSchema>
export type AgentWithUser = z.infer<typeof agentWithUserSchema>
export type CreateAgentInput = z.infer<typeof createAgentSchema>
export type UpdateAgentInput = z.infer<typeof updateAgentSchema>
```

---

#### `src/lib/api/agent.api.ts`

Pattern: identical to `openhouse.api.ts`. Uses `apiClient.api.agents` (Hono RPC client, type-safe from `AppType`).

```typescript
import type { CreateAgentInput, UpdateAgentInput } from '@/lib/schemas/agent.schema'
import { apiClient } from './client'

export const agentApi = {
    getAgents: async () => {
        const res = await apiClient.api.agents.$get()
        if (!res.ok) throw new Error('Failed to fetch agents')
        return (await res.json()).data
    },
    getAgent: async (id: string) => {
        const res = await apiClient.api.agents[':id'].$get({ param: { id } })
        if (!res.ok) throw new Error('Failed to fetch agent')
        return (await res.json()).data
    },
    createAgent: async (data: CreateAgentInput) => {
        const res = await apiClient.api.agents.$post({ json: data })
        if (!res.ok) throw new Error('Failed to create agent')
        return (await res.json()).data
    },
    updateAgent: async (id: string, data: UpdateAgentInput) => {
        const res = await apiClient.api.agents[':id'].$patch({ param: { id }, json: data })
        if (!res.ok) throw new Error('Failed to update agent')
        return (await res.json()).data
    },
    deleteAgent: async (id: string) => {
        const res = await apiClient.api.agents[':id'].$delete({ param: { id } })
        if (!res.ok) throw new Error('Failed to delete agent')
    },
    deactivateAgent: async (id: string) => {
        const res = await apiClient.api.agents[':id'].deactivate.$post({ param: { id } })
        if (!res.ok) throw new Error('Failed to deactivate agent')
        return (await res.json()).data
    },
    reactivateAgent: async (id: string) => {
        const res = await apiClient.api.agents[':id'].reactivate.$post({ param: { id } })
        if (!res.ok) throw new Error('Failed to reactivate agent')
        return (await res.json()).data
    },
}
```

---

#### `src/lib/queries/agent.ts`

```typescript
import { queryOptions } from '@tanstack/react-query'
import { agentApi } from '@/lib/api/agent.api'

export function useAgents() {
    return queryOptions({
        queryKey: ['agents'],
        queryFn: () => agentApi.getAgents(),
        staleTime: 300_000,
    })
}

export function useAgent(id: string) {
    return queryOptions({
        queryKey: ['agents', id],
        queryFn: () => agentApi.getAgent(id),
        enabled: !!id,
    })
}
```

---

#### `src/lib/mutations/agent.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { agentApi } from '@/lib/api/agent.api'
import type { CreateAgentInput, UpdateAgentInput } from '@/lib/schemas/agent.schema'

export function useCreateAgent() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: CreateAgentInput) => agentApi.createAgent(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agents'] }),
    })
}

export function useUpdateAgent(id: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: UpdateAgentInput) => agentApi.updateAgent(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['agents'] })
            queryClient.invalidateQueries({ queryKey: ['agents', id] })
        },
    })
}

export function useDeleteAgent() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => agentApi.deleteAgent(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agents'] }),
    })
}

export function useDeactivateAgent(id: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: () => agentApi.deactivateAgent(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['agents'] })
            queryClient.invalidateQueries({ queryKey: ['agents', id] })
        },
    })
}

export function useReactivateAgent(id: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: () => agentApi.reactivateAgent(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['agents'] })
            queryClient.invalidateQueries({ queryKey: ['agents', id] })
        },
    })
}
```

---

#### `src/pages/agent/components/AgentForm.tsx`

Two modes: `'create'` and `'edit'`. Email shown only in create mode (edit omits it — it's the invitation correlation key).

**The mutation is called directly inside the form's `onSubmitAsync`** — not passed as a prop. The mutation hook instance is passed in as `mutationFn`.

Props:
```typescript
interface AgentFormProps {
    mode: 'create' | 'edit'
    defaultValues?: UpdateAgentInput
    mutationFn: (value: CreateAgentInput | UpdateAgentInput) => Promise<unknown>
    onSuccess: () => void   // called after mutation + closes dialog
    submitLabel: string
}
```

Form structure (three-level split matching auth pages):
```typescript
const form = useForm({
    defaultValues: mode === 'create'
        ? { email: '', firstName: '', lastName: '', phone: '', fubId: '' }
        : { firstName: '', lastName: '', phone: '', fubId: '', ...defaultValues },
    validators: {
        onSubmit: mode === 'create' ? createAgentSchema : updateAgentSchema,
        onSubmitAsync: async ({ value }) => {
            await props.mutationFn(value)
            // thrown errors surface in errorMap.onSubmit
        },
    },
    onSubmit: props.onSuccess,  // only runs if onSubmitAsync did not throw
})
```

**Error banner** (placed above the submit button — same position as SignUpPage):
```tsx
<form.Subscribe selector={(state) => state.errorMap}>
    {(errorMap) =>
        errorMap.onSubmit ? (
            <p className="text-sm text-destructive">{errorMap.onSubmit.toString()}</p>
        ) : null
    }
</form.Subscribe>
```

Fields layout:
- **Create mode:** email (full width), firstName + lastName (two-col grid `grid gap-4 sm:grid-cols-2`), phone (full width, optional), fubId (full width, optional)
- **Edit mode:** firstName + lastName (two-col grid), phone (full width, optional), fubId (full width, optional)

All fields: `Field` + `FieldLabel` + `Input` + `FieldError` from `@/components/ui/field`. `isFieldInvalid(field)` helper for error state.

Nullable field inputs: `value={field.state.value ?? ''}` — handles null from edit defaultValues.

Optional field labels: append `" (optional)"` to `FieldLabel` text for phone and fubId.

Submit button:
```tsx
<form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
    {([canSubmit, isSubmitting]) => (
        <Button type="submit" disabled={!canSubmit || isSubmitting} className="w-full">
            {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
    )}
</form.Subscribe>
```

Full form wrapper:
```tsx
<form
    onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}
    className="space-y-4"
>
```

---

#### `src/pages/agent/AgentsPage.tsx`

Page header follows established pattern:
```tsx
<div className="w-full space-y-8">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-re-navy">Agents</h1>
            <p className="text-muted-foreground mt-1">Manage your organization's agents</p>
        </div>
        <Can permission={{ agent: ['create'] }}>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                    <Button>Invite Agent</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Invite Agent</DialogTitle>
                    </DialogHeader>
                    <AgentForm
                        mode="create"
                        mutationFn={createAgent.mutateAsync}
                        onSuccess={() => setCreateOpen(false)}
                        submitLabel="Send Invitation"
                    />
                </DialogContent>
            </Dialog>
        </Can>
    </div>
    {/* table or empty state */}
</div>
```

**Edit dialog** — controlled by `editTarget` state:
```tsx
<Dialog open={!!editTarget} onOpenChange={(open) => { if (!open) setEditTarget(null) }}>
    <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
            <DialogTitle>Edit Agent</DialogTitle>
        </DialogHeader>
        {editTarget && (
            <AgentForm
                mode="edit"
                defaultValues={editTarget}
                mutationFn={(data) => updateAgent(editTarget.id).mutateAsync(data as UpdateAgentInput)}
                onSuccess={() => setEditTarget(null)}
                submitLabel="Save Changes"
            />
        )}
    </DialogContent>
</Dialog>
```

Note: `useUpdateAgent(id)` takes the id at hook call time, so the update mutation is created inline per-row in the table actions — not at the page top level.

**Table using `ui/table.tsx`:**
```tsx
<Table>
    <TableHeader>
        <TableRow>
            <TableHead className="text-muted-foreground">Name</TableHead>
            <TableHead className="text-muted-foreground">Email</TableHead>
            <TableHead className="text-muted-foreground">Phone</TableHead>
            <TableHead className="text-muted-foreground">FUB ID</TableHead>
            <TableHead className="text-muted-foreground">Status</TableHead>
            <TableHead className="text-muted-foreground">Account</TableHead>
            <TableHead className="text-muted-foreground text-right">Actions</TableHead>
        </TableRow>
    </TableHeader>
    <TableBody>
        {agents.map((agent) => (
            <AgentRow
                key={agent.id}
                agent={agent}
                onEdit={() => setEditTarget(agent)}
                deleteAgent={deleteAgent}
            />
        ))}
    </TableBody>
</Table>
```

Extract `AgentRow` as a sub-component within the same file to isolate per-row mutation hooks (`useDeactivateAgent`, `useReactivateAgent`) cleanly:
```tsx
function AgentRow({ agent, onEdit, deleteAgent }) {
    const deactivate = useDeactivateAgent(agent.id)
    const reactivate = useReactivateAgent(agent.id)

    return (
        <TableRow>
            <TableCell className="font-medium text-re-navy">
                {agent.firstName} {agent.lastName}
            </TableCell>
            <TableCell className="text-muted-foreground">{agent.email}</TableCell>
            <TableCell className="text-muted-foreground">{agent.phone ?? '—'}</TableCell>
            <TableCell className="text-muted-foreground">{agent.fubId ?? '—'}</TableCell>
            <TableCell>
                {agent.isActive
                    ? <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border bg-success/10 text-success border-success/20">Active</span>
                    : <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border bg-muted text-muted-foreground border-border">Inactive</span>
                }
            </TableCell>
            <TableCell>
                {agent.userId
                    ? <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border bg-success/10 text-success border-success/20">Active</span>
                    : <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border bg-warning/10 text-warning border-warning/20">Invitation Pending</span>
                }
            </TableCell>
            <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                    <Can permission={{ agent: ['update'] }}>
                        <Button size="sm" variant="ghost" onClick={onEdit}>Edit</Button>
                    </Can>
                    <Can permission={{ agent: ['deactivate'] }}>
                        {agent.isActive
                            ? <Button size="sm" variant="ghost" onClick={() => deactivate.mutate()} disabled={deactivate.isPending}>Deactivate</Button>
                            : <Button size="sm" variant="ghost" onClick={() => reactivate.mutate()} disabled={reactivate.isPending}>Reactivate</Button>
                        }
                    </Can>
                    <Can permission={{ agent: ['delete'] }}>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => { if (window.confirm(`Remove ${agent.firstName} ${agent.lastName}?`)) deleteAgent.mutate(agent.id) }}
                            disabled={deleteAgent.isPending}
                        >
                            Delete
                        </Button>
                    </Can>
                </div>
            </TableCell>
        </TableRow>
    )
}
```

**Empty state** (shown when `agents.length === 0`):
```tsx
<div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center max-w-md">
        <div className="text-4xl mb-4">🏢</div>
        <h3 className="text-lg font-semibold mb-2">No agents yet</h3>
        <p className="text-muted-foreground mb-4">
            Invite your first agent to get started.
        </p>
        <Can permission={{ agent: ['create'] }}>
            <Button onClick={() => setCreateOpen(true)}>Invite Agent</Button>
        </Can>
    </div>
</div>
```

---

#### `src/pages/agent/AcceptInvitationPage.tsx`

Reads `invitationId` (required) and `email` (optional) from search params via `getRouteApi`.

Three UI states — all use `min-h-screen` centered layout:

**Loading / accepting** (session pending OR acceptance in progress):
```tsx
<div className="flex items-center justify-center min-h-screen">
    <div className="text-center max-w-md px-4">
        <p className="text-muted-foreground">Setting up your account…</p>
    </div>
</div>
```

**Error** (acceptance failed — mirrors VisitorSignInError):
```tsx
<div className="flex items-center justify-center min-h-screen">
    <div className="text-center max-w-md px-4">
        <Frown size={48} strokeWidth={1.5} className="mx-auto text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Could not accept invitation</h3>
        <p className="text-muted-foreground mb-4">
            This invitation may have expired or already been used.
        </p>
        <Button variant="outline" onClick={() => navigate({ to: '/dashboard' })}>
            Go to Dashboard
        </Button>
    </div>
</div>
```

**Redirecting** (no session — briefly shown before navigate fires):
```tsx
<div className="flex items-center justify-center min-h-screen">
    <div className="text-center max-w-md px-4">
        <p className="text-muted-foreground">Redirecting to sign up…</p>
    </div>
</div>
```

Logic (`useEffect` on session changes):
```typescript
useEffect(() => {
    if (session.isPending) return

    if (!session.data?.user) {
        navigate({
            to: '/auth/sign-up',
            search: { invitationId, email, redirect: `/invite/accept?invitationId=${invitationId}` },
        })
        return
    }

    authClient.organization.acceptInvitation({ invitationId })
        .then(({ error }) => {
            if (error) { setHasError(true); return }
            navigate({ to: '/dashboard' })
        })
        .catch(() => setHasError(true))
}, [session.isPending, session.data])
```

State: `const [hasError, setHasError] = useState(false)` — render error state when true.

---

#### `src/routes/(protected)/(organization)/agents/index.tsx`

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { useAgents } from '@/lib/queries/agent'
import { AgentsPage } from '@/pages/agent/AgentsPage'

export const Route = createFileRoute('/(protected)/(organization)/agents/')({
    loader: async ({ context: { queryClient } }) => {
        await queryClient.ensureQueryData(useAgents())
    },
    component: AgentsPage,
})
```

---

#### `src/routes/(protected)/invite/accept.tsx`

Outside `(organization)` layout — no `activeOrganizationId` required. Inside `(protected)` — has session context.

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter'
import { z } from 'zod/v4'
import { AcceptInvitationPage } from '@/pages/agent/AcceptInvitationPage'

const InviteAcceptSearchSchema = z.object({
    invitationId: z.string(),
    email: z.string().optional().catch(undefined),
})

export const Route = createFileRoute('/(protected)/invite/accept')({
    validateSearch: zodValidator(InviteAcceptSearchSchema),
    component: AcceptInvitationPage,
})
```

---

### Modified files (3)

#### `src/routes/auth/sign-up.tsx`

Extend `SignUpSearchSchema`:
```typescript
const SignUpSearchSchema = z.object({
    redirect: z.string().default('').catch(''),
    invitationId: z.string().optional().catch(undefined),
    email: z.string().optional().catch(undefined),
})
```

---

#### `src/pages/auth/SignUpPage.tsx`

Two changes:
1. Read `invitationId` and `email` from search. Pre-fill `defaultValues.email` with `email ?? ''`. Disable the email input when `!!email` (invitation pre-fills it — `disabled={!!email}`).
2. In `onSubmit` (not `onSubmitAsync`): if `invitationId` present, navigate to `/invite/accept?invitationId=xxx`, otherwise use existing `redirect || '/dashboard'` logic.

`onSubmitAsync` is unchanged.

---

#### `src/components/layout/Sidebar.tsx`

Add Agents nav item wrapped in `<Can>`, after Open Houses:
```typescript
import { Users } from 'lucide-react'
import { Can } from '@/components/Can'

<Can permission={{ agent: ['view'] }}>
    <Link
        to="/agents"
        className={cn(
            'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md',
            'transition-all duration-200',
            'hover:bg-accent hover:text-accent-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'focus-visible:ring-offset-background',
            'active:bg-accent',
        )}
        activeProps={{ className: 'bg-accent text-accent-foreground font-semibold' }}
    >
        <Users strokeWidth={1.5} size={24} />
        <span>Agents</span>
    </Link>
</Can>
```

Existing nav items (Dashboard, Tasks, Open Houses) remain unconditional. The `<Can>` wrapper is the only structural change.

---

## Implementation Order

1. `src/lib/schemas/agent.schema.ts`
2. `src/lib/api/agent.api.ts`
3. `src/lib/queries/agent.ts`
4. `src/lib/mutations/agent.ts`
5. `src/routes/auth/sign-up.tsx` (extend search schema)
6. `src/pages/auth/SignUpPage.tsx` (invitation pre-fill + redirect)
7. `src/pages/agent/components/AgentForm.tsx`
8. `src/pages/agent/AgentsPage.tsx`
9. `src/pages/agent/AcceptInvitationPage.tsx`
10. `src/routes/(protected)/(organization)/agents/index.tsx`
11. `src/routes/(protected)/invite/accept.tsx`
12. `src/components/layout/Sidebar.tsx`
13. Run `pnpm --filter @apps/frontend-base biome check --write`

---

## Notes for future sessions

- TanStack Table implementation is deferred. The AgentsPage uses `ui/table.tsx` for now. When TanStack Table is added, the table section of `AgentsPage.tsx` (the `AgentRow` sub-component + `<Table>` wrapper) is the only thing that changes.
- Phase 2 (auth hook + real email): only `packages/auth/lib/auth.ts` changes. `DbAgentRepository.linkUser` is already implemented.
- `sendInvitationEmail` is currently a `console.log` stub. The actual link format will be: `https://app.rs.hauntednuke.com/invite/accept?invitationId=${data.id}&email=${data.email}`
- `useUpdateAgent(id)` is called per-row inside `AgentRow` (not at page level) because the id must be bound at hook call time.
