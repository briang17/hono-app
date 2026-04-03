# Team Open Houses Implementation Plan

> **Feature**: Org-wide open house listing with agent attribution
> **Date**: Thu Apr 02 2026
> **Status**: Planning

---

## Table of Contents

1. [Overview](#overview)
2. [Backend Changes](#backend-changes)
3. [Frontend Changes](#frontend-changes)
4. [File-by-File Implementation](#file-by-file-implementation)
5. [Verification](#verification)

---

## Overview

### Goal

Add a "Team Open Houses" page where org members can see all open houses across the organization (not just their own). Cards are more compact than the existing `OpenHouseCard` and display the **agent name** (from the `agent` table, not `user.name`) who created each open house.

### Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Whose open houses? | All org members' (including own) | Single source of truth, simpler |
| Navigation | New sidebar item `/team-openhouses` | Separate page, distinct from "My Open Houses" |
| Agent name source | `agent` table (`firstName` + `lastName`) | Agent identity, not user identity |
| Fallback if no agent | `user.name` from auth schema | Owner/admin may not have agent record |
| Card style | Compact (h-32 image, no footer button) | More info density for team overview |

### Data Flow

```
Frontend route -> TeamOpenHouseListPage
  -> useSuspenseQuery(useTeamOpenHouses())
    -> openhouseApi.getTeamOpenHouses()
      -> GET /api/open-houses/team
        -> OpenHouseService.getTeamOpenHouses(orgId)
          -> DbOpenHouseRepository.findByOrg(orgId)
            -> SELECT from open_house
               LEFT JOIN agent (on created_by_user_id = agent.user_id)
               LEFT JOIN user (on created_by_user_id = user.id)
               WHERE organization_id = ?
               ORDER BY date DESC, created_at DESC
            -> For each result: fetch images
            -> Return OpenHouseWithCreator[]
```

---

## Backend Changes

### 1. Domain: Add `OpenHouseWithCreator` type

**File**: `apps/api/src/features/openhouse/domain/openhouse.entity.ts`

Add after the existing `PublicOpenHouse` type (~line 163):

```typescript
export const OpenHouseWithCreatorSchema = OpenHouseSchema.extend({
    creatorFirstName: z.string().nullable(),
    creatorLastName: z.string().nullable(),
});

export type OpenHouseWithCreator = z.infer<typeof OpenHouseWithCreatorSchema>;
```

This extends the base `OpenHouse` type with agent name fields. Both are nullable because a user might not have an agent record.

### 2. Repository Interface: Add `findByOrg`

**File**: `apps/api/src/features/openhouse/domain/interface.openhouse.repository.ts`

Add to `IOpenHouseRepository` interface:

```typescript
findByOrg(organizationId: Id): Promise<OpenHouseWithCreator[]>;
```

Import `OpenHouseWithCreator` from the entity file.

### 3. Repository Implementation: `findByOrg`

**File**: `apps/api/src/features/openhouse/infra/db.openhouse.repository.ts`

Add imports:
```typescript
import { agent as agentTable } from "@packages/database/src/schemas/agent.schema";
import { user as userTable } from "@packages/database/src/schemas/auth.schema";
```

Add method:

```typescript
async findByOrg(organizationId: string): Promise<OpenHouseWithCreator[]> {
    const results = await db
        .select({
            id: openHouse.id,
            organizationId: openHouse.organizationId,
            createdByUserId: openHouse.createdByUserId,
            propertyAddress: openHouse.propertyAddress,
            listingPrice: openHouse.listingPrice,
            date: openHouse.date,
            startTime: openHouse.startTime,
            endTime: openHouse.endTime,
            bedrooms: openHouse.bedrooms,
            bathrooms: openHouse.bathrooms,
            features: openHouse.features,
            notes: openHouse.notes,
            createdAt: openHouse.createdAt,
            updatedAt: openHouse.updatedAt,
            creatorFirstName: agentTable.firstName,
            creatorLastName: agentTable.lastName,
        })
        .from(openHouse)
        .leftJoin(
            agentTable,
            eq(openHouse.createdByUserId, agentTable.userId),
        )
        .where(eq(openHouse.organizationId, organizationId))
        .orderBy(desc(openHouse.date), desc(openHouse.createdAt));

    return Promise.all(
        results.map(async (result) => {
            const images = await this.findImagesByOpenHouseId(result.id);
            return OpenHouseWithCreatorFactory.fromDb({
                ...result,
                images,
            });
        }),
    );
}
```

**Important**: If `agentTable.firstName` is null (no agent record for this user), the frontend will need to handle that gracefully. We do NOT fall back to `user.name` in the query to keep it simple — the frontend can show "Unknown" or omit the name. If we later want the fallback, we can add a second left join to `user` and use SQL `COALESCE`.

**Actually**, let's include the fallback in the query. It's one extra join and avoids frontend complexity:

```typescript
async findByOrg(organizationId: string): Promise<OpenHouseWithCreator[]> {
    const results = await db
        .select({
            // ... all open_house columns (same as above)
            creatorFirstName: agentTable.firstName,
            creatorLastName: agentTable.lastName,
        })
        .from(openHouse)
        .leftJoin(
            agentTable,
            eq(openHouse.createdByUserId, agentTable.userId),
        )
        .where(eq(openHouse.organizationId, organizationId))
        .orderBy(desc(openHouse.date), desc(openHouse.createdAt));

    return Promise.all(
        results.map(async (result) => {
            const images = await this.findImagesByOpenHouseId(result.id);
            return OpenHouseFactory.fromDbWithCreator({
                ...result,
                images,
            });
        }),
    );
}
```

Wait — we need a factory method. Let's add `OpenHouseFactory.fromDbWithCreator` that validates against `OpenHouseWithCreatorSchema`:

```typescript
// In openhouse.entity.ts, add to OpenHouseFactory:
fromDbWithCreator: (params: z.input<typeof OpenHouseWithCreatorSchema>): OpenHouseWithCreator => {
    return OpenHouseWithCreatorSchema.parse(params);
},
```

### 4. Service: Add `getTeamOpenHouses`

**File**: `apps/api/src/features/openhouse/service/openhouse.service.ts`

Add method:

```typescript
async getTeamOpenHouses(organizationId: string): Promise<OpenHouseWithCreator[]> {
    return await this.repository.findByOrg(organizationId);
}
```

Import `OpenHouseWithCreator` from the entity file.

### 5. Handler + Route: `GET /team`

**File**: `apps/api/src/features/openhouse/api/openhouse.handlers.ts`

Add handler:

```typescript
export const getTeamOpenHousesHandlers = orgFactory.createHandlers(
    rbacMiddleware({ openhouse: ["view"] }),
    async (c) => {
        const organizationId = c.get("organizationId");

        const openHouses = await service.getTeamOpenHouses(organizationId);
        return c.json({ data: openHouses });
    },
);
```

**File**: `apps/api/src/features/openhouse/api/openhouse.routes.ts`

Add route BEFORE the `/:id` routes (to avoid "team" being captured as an `:id` param):

```typescript
const openhouseRoutes = new Hono()
    .use(authMiddleware)
    .use(orgMiddleware)
    .get("/", ...getOpenHousesHandlers)
    .get("/team", ...getTeamOpenHousesHandlers)  // <-- NEW, before /:id
    .get("/:id", ...getOpenHouseHandlers)
    // ... rest unchanged
```

Import `getTeamOpenHousesHandlers` in the routes file.

---

## Frontend Changes

### 6. Schema: Add `TeamOpenHouse` type

**File**: `apps/frontend-base/src/lib/schemas/openhouse.schema.ts`

Add after the existing `OpenHouse` type (~line 146):

```typescript
export const teamOpenHouseSchema = openHouseSchema.extend({
    creatorFirstName: z.string().nullable(),
    creatorLastName: z.string().nullable(),
});

export type TeamOpenHouse = z.infer<typeof teamOpenHouseSchema>;
```

### 7. API Client: Add `getTeamOpenHouses`

**File**: `apps/frontend-base/src/lib/api/openhouse.api.ts`

Add method to `openhouseApi` object:

```typescript
getTeamOpenHouses: async () => {
    const res = await apiClient.api['open-houses'].team.$get()
    if (!res.ok) {
        throw new Error('Failed to fetch team open houses')
    }
    const data = await res.json()
    return data.data
},
```

### 8. Query Options: Add `useTeamOpenHouses`

**File**: `apps/frontend-base/src/lib/queries/openhouse.ts`

Add:

```typescript
export function useTeamOpenHouses() {
    return queryOptions({
        queryKey: ['team-openhouses'],
        queryFn: () => openhouseApi.getTeamOpenHouses(),
        staleTime: 300000,
    })
}
```

### 9. Route: Team Open Houses index

**New file**: `apps/frontend-base/src/routes/(protected)/(organization)/team-openhouses/index.tsx`

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { TeamOpenHouseListPage } from '@/pages/team-openhouse/TeamOpenHouseListPage'

export const Route = createFileRoute('/(protected)/(organization)/team-openhouses/')({
    component: TeamOpenHouseListPage,
})
```

### 10. Compact Card Component: `TeamOpenHouseCard`

**New file**: `apps/frontend-base/src/pages/team-openhouse/components/TeamOpenHouseCard.tsx`

Compact version of `OpenHouseCard`:
- Smaller image area: `h-32` instead of `h-48`
- No "View Details" footer button — entire card clickable
- Shows agent name: "by John D." (first name + last initial)
- Same info: address, price badge, date badge, time, bed/bath

```tsx
import { format } from 'date-fns'
import { Bath, Bed, Home, User } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { imagePresets, mainImageUrl } from '@/lib/cloudinary-url'
import type { TeamOpenHouse } from '@/lib/schemas/openhouse.schema'
import { formatCurrency } from '@/lib/utils'

interface TeamOpenHouseCardProps {
    openHouse: TeamOpenHouse
    onClick: () => void
}

export function TeamOpenHouseCard({ openHouse, onClick }: TeamOpenHouseCardProps) {
    const imageUrl = mainImageUrl(openHouse.images, imagePresets.card)

    const agentDisplayName = openHouse.creatorFirstName && openHouse.creatorLastName
        ? `${openHouse.creatorFirstName} ${openHouse.creatorLastName.charAt(0)}.`
        : openHouse.creatorFirstName ?? null

    return (
        <Card
            className="overflow-hidden hover:shadow-lg hover:border-re-gold/30 transition-all duration-200 cursor-pointer group"
            onClick={onClick}
        >
            <div className="relative h-32 overflow-hidden bg-muted">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={openHouse.propertyAddress}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                        <Home className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                )}
                <div className="absolute top-2 right-2">
                    <span className="px-2 py-0.5 text-xs font-medium text-white bg-re-navy/90 backdrop-blur-sm rounded-full">
                        {format(new Date(openHouse.date), 'MMM d')}
                    </span>
                </div>
            </div>
            <CardContent className="p-3 space-y-1.5">
                <h3 className="font-semibold text-sm text-re-navy line-clamp-1 group-hover:text-re-gold transition-colors">
                    {openHouse.propertyAddress}
                </h3>
                <div className="flex items-baseline justify-between">
                    <span className="text-lg font-bold text-re-gold">
                        {formatCurrency(openHouse.listingPrice)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {openHouse.startTime} - {openHouse.endTime}
                    </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                        {openHouse.bedrooms != null && (
                            <span className="flex items-center gap-0.5">
                                <Bed className="h-3 w-3" />
                                {openHouse.bedrooms} bd
                            </span>
                        )}
                        {openHouse.bathrooms != null && (
                            <span className="flex items-center gap-0.5">
                                <Bath className="h-3 w-3" />
                                {openHouse.bathrooms} ba
                            </span>
                        )}
                    </div>
                    {agentDisplayName && (
                        <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {agentDisplayName}
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
```

### 11. Page: `TeamOpenHouseListPage`

**New file**: `apps/frontend-base/src/pages/team-openhouse/TeamOpenHouseListPage.tsx`

Similar to `OpenHouseListPage` but:
- Title: "Team Open Houses", subtitle: "All open houses in your organization"
- No "New Open House" or "Form Builder" buttons
- Uses `TeamOpenHouseCard` instead of `OpenHouseCard`
- Groups into upcoming/past (same logic)
- Empty state: "No open houses in your organization yet"

```tsx
import { useSuspenseQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { isPast, isToday } from 'date-fns'
import { useTeamOpenHouses } from '@/lib/queries/openhouse'
import type { TeamOpenHouse } from '@/lib/schemas/openhouse.schema'
import { TeamOpenHouseCard } from './components/TeamOpenHouseCard'

export function TeamOpenHouseListPage() {
    const navigate = useNavigate()
    const { data: openhouses } = useSuspenseQuery(useTeamOpenHouses())

    const handleViewOpenHouse = (id: string) => {
        navigate({ to: '/openhouse/$openHouseId', params: { openHouseId: id } })
    }

    const groupOpenHouses = (list: TeamOpenHouse[]) => {
        const upcoming: TeamOpenHouse[] = []
        const past: TeamOpenHouse[] = []

        list.forEach((oh) => {
            const eventDate = new Date(oh.date)
            if (isPast(eventDate) && !isToday(eventDate)) {
                past.push(oh)
            } else {
                upcoming.push(oh)
            }
        })

        return { upcoming, past }
    }

    const { upcoming, past } = openhouses ? groupOpenHouses(openhouses) : { upcoming: [], past: [] }

    return (
        <div className="w-full space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Team Open Houses</h1>
                <p className="text-muted-foreground mt-1">All open houses in your organization</p>
            </div>

            {upcoming.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Upcoming</h2>
                    <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {upcoming.map((oh) => (
                            <TeamOpenHouseCard
                                key={oh.id}
                                openHouse={oh}
                                onClick={() => handleViewOpenHouse(oh.id)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {past.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Past</h2>
                    <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {past.map((oh) => (
                            <TeamOpenHouseCard
                                key={oh.id}
                                openHouse={oh}
                                onClick={() => handleViewOpenHouse(oh.id)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {upcoming.length === 0 && past.length === 0 && (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center max-w-md">
                        <div className="text-4xl mb-4">🏠</div>
                        <h3 className="text-lg font-semibold mb-2">No open houses yet</h3>
                        <p className="text-muted-foreground">
                            Your team hasn't created any open houses yet.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
```

Note: Grid uses `xl:grid-cols-4` (4 columns at xl) instead of the original's `lg:grid-cols-3`, since cards are more compact.

### 12. Navigation: Sidebar + TopBar

**File**: `apps/frontend-base/src/components/layout/Sidebar.tsx`

Add to `navItems` array:

```typescript
import { Building2, Home, Users } from 'lucide-react'

const navItems = [
    { to: '/openhouse', label: 'Open Houses', icon: Home, permission: { openhouse: ["view"] } },
    { to: '/team-openhouses', label: 'Team Open Houses', icon: Building2, permission: { openhouse: ["view"] } },
    { to: '/agents', label: 'Agents', icon: Users, permission: { agent: ["view"] } },
];
```

**File**: `apps/frontend-base/src/components/layout/TopBar.tsx`

Same change — add the `Building2` icon import and the nav item to the mobile menu's `navItems` array. The TopBar has its own inline `navItems` that must be kept in sync with the Sidebar.

---

## File-by-File Implementation

### Order of implementation

1. **Backend domain**: `openhouse.entity.ts` — add type + factory method
2. **Backend repo interface**: `interface.openhouse.repository.ts` — add method signature
3. **Backend repo impl**: `db.openhouse.repository.ts` — add `findByOrg` with agent join
4. **Backend service**: `openhouse.service.ts` — add `getTeamOpenHouses`
5. **Backend handler**: `openhouse.handlers.ts` — add handler
6. **Backend routes**: `openhouse.routes.ts` — add `/team` route
7. **Frontend schema**: `openhouse.schema.ts` — add `TeamOpenHouse` type
8. **Frontend API**: `openhouse.api.ts` — add `getTeamOpenHouses`
9. **Frontend queries**: `openhouse.ts` — add `useTeamOpenHouses`
10. **Frontend card component**: `TeamOpenHouseCard.tsx`
11. **Frontend page**: `TeamOpenHouseListPage.tsx`
12. **Frontend route**: `team-openhouses/index.tsx`
13. **Navigation**: `Sidebar.tsx` + `TopBar.tsx`

### Files to create (new)

| File | Purpose |
|------|---------|
| `apps/frontend-base/src/routes/(protected)/(organization)/team-openhouses/index.tsx` | Route definition |
| `apps/frontend-base/src/pages/team-openhouse/TeamOpenHouseListPage.tsx` | Page component |
| `apps/frontend-base/src/pages/team-openhouse/components/TeamOpenHouseCard.tsx` | Compact card component |

### Files to modify (existing)

| File | Change |
|------|--------|
| `apps/api/src/features/openhouse/domain/openhouse.entity.ts` | Add `OpenHouseWithCreator` type + `OpenHouseWithCreatorSchema` + factory method |
| `apps/api/src/features/openhouse/domain/interface.openhouse.repository.ts` | Add `findByOrg` to interface |
| `apps/api/src/features/openhouse/infra/db.openhouse.repository.ts` | Implement `findByOrg` with agent join |
| `apps/api/src/features/openhouse/service/openhouse.service.ts` | Add `getTeamOpenHouses` |
| `apps/api/src/features/openhouse/api/openhouse.handlers.ts` | Add `getTeamOpenHousesHandlers` |
| `apps/api/src/features/openhouse/api/openhouse.routes.ts` | Add `/team` route + import handler |
| `apps/frontend-base/src/lib/schemas/openhouse.schema.ts` | Add `teamOpenHouseSchema` + `TeamOpenHouse` type |
| `apps/frontend-base/src/lib/api/openhouse.api.ts` | Add `getTeamOpenHouses` method |
| `apps/frontend-base/src/lib/queries/openhouse.ts` | Add `useTeamOpenHouses` |
| `apps/frontend-base/src/components/layout/Sidebar.tsx` | Add nav item |
| `apps/frontend-base/src/components/layout/TopBar.tsx` | Add nav item (mobile menu) |

---

## Verification

### Manual testing checklist

1. Run dev server: `pnpm --filter @apps/api dev` + frontend dev
2. Navigate to `/team-openhouses` — should load without errors
3. Verify all org open houses appear (including your own)
4. Verify agent names show correctly on cards
5. Verify cards are compact (smaller image, no footer button)
6. Click a card — should navigate to `/openhouse/$id` detail page
7. Verify upcoming/past grouping works
8. Verify empty state when no open houses exist
9. Verify sidebar nav shows "Team Open Houses" with Building2 icon
10. Verify mobile menu in TopBar also shows the new nav item
11. Verify RBAC: only users with `openhouse:view` permission see the nav item

### Code quality

```bash
pnpm --filter @apps/api biome check --write
pnpm --filter @apps/frontend-base biome check --write
```
