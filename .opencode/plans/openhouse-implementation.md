# Open House Features Implementation Plan

> **Project**: Migrating open house features from `/apps/openhouse` to `/apps/frontend-base`
> **Approach**: Hono RPC for type-safe API calls, mobile-first design, shadcn components
> **Date**: Thu Mar 19 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture & Patterns](#architecture--patterns)
3. [Route Structure](#route-structure)
4. [Phase 1: Foundation Setup](#phase-1-foundation-setup)
5. [Phase 2: Dependencies](#phase-2-dependencies)
6. [Phase 3: Schema Definitions](#phase-3-schema-definitions)
7. [Phase 4: API Layer](#phase-4-api-layer)
8. [Phase 5: Query & Mutation Hooks](#phase-5-query--mutation-hooks)
9. [Phase 6: Mobile-First Layout Updates](#phase-6-mobile-first-layout-updates)
10. [Phase 7: Authenticated Routes](#phase-7-authenticated-routes)
11. [Phase 8: Public Routes](#phase-8-public-routes)
12. [Phase 9: Components](#phase-9-components)
13. [Phase 10: Testing](#phase-10-testing)
14. [Common Patterns Reference](#common-patterns-reference)

---

## Overview

### Goals
1. Implement open house CRUD operations (list, create, detail, leads)
2. Public visitor sign-in page (no auth required)
3. QR code generation and flyer printing
4. Mobile-first responsive design
5. Use Hono RPC for type-safe API calls
6. Follow existing codebase patterns in frontend-base

### Key Features

| Feature | Description | Route | Auth Required |
|---------|-------------|--------|---------------|
| Dashboard | List of all open houses (upcoming/past) | `/openhouse` | ✅ Yes |
| Create | Create new open house form | `/openhouse/new` | ✅ Yes |
| Detail | Open house details with tabs | `/openhouse/:id` | ✅ Yes |
| Sign-In | Public visitor sign-in | `/public/open-houses/sign-in/:id` | ❌ No |

---

## Architecture & Patterns

### Backend API Routes

**Mount Points:**
- Authenticated: `/api/open-houses` (hyphenated)
- Public: `/api/public/open-houses`

**IMPORTANT: Public routes in frontend must match this path exactly:**
`/public/open-houses/sign-in/:openHouseId` (NOT `/sign-in/:openHouseId`)

**Endpoints:**

| Method | Path | Auth | Description |
|--------|------|-------|-------------|
| GET | `/api/open-houses` | ✅ | List all open houses |
| GET | `/api/open-houses/:id` | ✅ | Get single open house |
| GET | `/api/open-houses/:id/leads` | ✅ | Get leads for open house |
| POST | `/api/open-houses` | ✅ | Create open house |
| GET | `/api/public/open-houses/:id` | ❌ | Get public open house info |
| POST | `/api/public/open-houses/:id/sign-in` | ❌ | Create lead (visitor sign-in) |

**Response Format:**
```typescript
// All successful responses wrap data in { data: ... }
{ data: OpenHouse[] }
{ data: OpenHouse }
{ data: OpenHouseLead }

// Error responses use HTTPException
{ message: "Error message" }  // with 4xx/5xx status
```

### Hono RPC Client Pattern

**Important: Hyphenated routes use bracket notation**

```typescript
import { hc } from "hono/client"
import type { AppType } from "@apps/api/src"
import { env } from "@/lib/env"

export const apiClient = hc<AppType>(env.VITE_API_URL + "/", {
    fetch: (input, init) => fetch(input, {
        ...init,
        credentials: 'include',  // Required for cookie-based auth
    }),
})

// Usage examples:
const res1 = await apiClient.api["open-houses"].$get()
const data1 = await res1.json()  // { data: OpenHouse[] }

const res2 = await apiClient.api["open-houses"][":id"].$get({ param: { id: "123" } })
const data2 = await res2.json()  // { data: OpenHouse }

const res3 = await apiClient.api["open-houses"][":id"].leads.$get({ param: { id: "123" } })
const data3 = await res3.json()  // { data: OpenHouseLead[] }

const res4 = await apiClient.api["open-houses"].$post({ json: { ... } })
const data4 = await res4.json()  // { data: OpenHouse }

const res5 = await apiClient.api.public["open-houses"][":id"]["sign-in"].$post({
    param: { id: "123" },
    json: { ... }
})
const data5 = await res5.json()  // { data: OpenHouseLead }
```

### Form Pattern (TanStack Form + Zod)

**No adapter needed!** Pass Zod schema directly to `validators.onSubmit`:

```tsx
import { useForm } from '@tanstack/react-form'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'
import { isFieldInvalid } from '@/lib/utils'
import { CreateOpenHouseSchema } from '@/lib/schemas/openhouse.schema'

const form = useForm({
    defaultValues: {
        propertyAddress: '',
        listingPrice: 0,
        date: '',
        startTime: '',
        endTime: '',
        listingImageUrl: '',
        notes: '',
    },
    validators: {
        onSubmit: CreateOpenHouseSchema,  // Direct Zod schema
    },
    onSubmit: async ({ value }) => {
        await onSubmit(value)
        form.reset()
    },
})

// Field pattern:
<form.Field name="fieldName">
    {(field) => {
        const { invalid, errors } = isFieldInvalid(field)
        return (
            <Field data-invalid={invalid}>
                <FieldLabel htmlFor={field.name}>Label</FieldLabel>
                <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={invalid}
                />
                {invalid && <FieldError>{errors.join(', ')}</FieldError>}
            </Field>
        )
    }}
</form.Field>

// Checkbox field:
<form.Field name="workingWithAgent" type="boolean">
    {(field) => (
        <Field className="flex items-center gap-2">
            <Checkbox
                id={field.name}
                checked={field.state.value}
                onCheckedChange={(checked) => field.handleChange(checked === true)}
            />
            <label htmlFor={field.name} className="text-sm font-medium cursor-pointer">
                Working with agent?
            </label>
        </Field>
    )}
</form.Field>

// Submit button:
<form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
    {([canSubmit, isSubmitting]) => (
        <Button type="submit" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Submit'}
        </Button>
    )}
</form.Subscribe>
```

### Query Options Pattern

**IMPORTANT: Two patterns for different use cases:**

```typescript
import { queryOptions, useQuery } from '@tanstack/react-query'
import { openhouseApi } from '@/lib/api/openhouse.api'

// Pattern 1: queryOptions() factory - for useSuspenseQuery in route loaders
export function useOpenHouse(id: string) {
    return queryOptions({
        queryKey: ['openhouses', id],
        queryFn: () => openhouseApi.getOpenHouse(id),
        enabled: !!id,
    })
}

// Pattern 2: useQuery() - for direct use in components (no loader)
export function useOpenHouses() {
    return useQuery({
        queryKey: ['openhouses'],
        queryFn: () => openhouseApi.getOpenHouses(),
        staleTime: 5 * 60 * 1000,  // 5 minutes
    })
}
```

**When to use which:**
- **useQuery()**: List pages, pages without loaders
- **queryOptions()**: Detail pages with loaders, combined with `useSuspenseQuery()` in component

### Route Loader Pattern

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { useOpenHouse, useOpenHouseLeads } from '@/lib/queries/openhouse'

export const Route = createFileRoute('/(protected)/(organization)/openhouse/$openHouseId')({
    loader: async ({ context: { queryClient }, params }) => {
        await queryClient.ensureQueryData(useOpenHouse(params.openHouseId))
        await queryClient.ensureQueryData(useOpenHouseLeads(params.openHouseId))
    },
    errorComponent: OpenHouseDetailError,
    component: OpenHouseDetailPage,
})

// In component:
const routeApi = getRouteApi('/(protected)/(organization)/openhouse/$openHouseId')
const { openHouseId } = routeApi.useParams()
const { data: openHouse } = useSuspenseQuery(useOpenHouse(openHouseId))
const { data: leads } = useSuspenseQuery(useOpenHouseLeads(openHouseId))
```

### Mutation Pattern

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useCreateOpenHouse() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateOpenHouseInput) => openhouseApi.createOpenHouse(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['openhouses'] })
        },
        onError: (error) => {
            console.error('Failed to create open house:', error)
            // TODO: Add toast notification
        },
    })
}
```

### UI State Management

```typescript
// Use UI store for mobile menu, sidebar state
import { useUIStore } from '@/lib/stores/uiStore'

const mobileMenuOpen = useUIStore((s) => s.mobileMenuOpen)
const toggleMobileMenu = useUIStore((s) => s.toggleMobileMenu)
const closeMobileMenu = useUIStore((s) => s.closeMobileMenu)
```

---

## Route Structure

```
src/routes/
├── __root.tsx                                    # Root layout
├── index.tsx                                      # Redirect to /dashboard
├── (protected)/                                   # Auth required
│   ├── route.tsx                                  # ProtectedLayout + auth guard
│   ├── create-organization.tsx                     # Fallback route
│   └── (organization)/                            # Org required
│       ├── route.tsx                              # OrganizationLayout + org guard
│       ├── dashboard.tsx                           # Dashboard (exists)
│       ├── tasks/                                 # Tasks (exists)
│       │   ├── index.tsx                          # Tasks list
│       │   └── $taskId.tsx                       # Task detail
│       └── openhouse/                             # NEW: Open houses
│           ├── index.tsx                           # Open house list (dashboard)
│           ├── new.tsx                             # Create open house
│           └── $openHouseId.tsx                   # Open house detail
├── auth/                                         # Auth routes (exist)
│   ├── index.tsx
│   ├── login.tsx
│   └── sign-up.tsx
└── public/                                        # NEW: Public routes
    └── open-houses/
        └── sign-in/
            └── $openHouseId.tsx                   # Visitor sign-in (no auth)
```

**Route Guards:**

| Route | Guard | Condition |
|-------|-------|-----------|
| `/` | - | Redirect to `/dashboard` |
| `/auth/*` | - | No guard (public) |
| `/(protected)/*` | ProtectedLayout | Requires `session.user` |
| `/(protected)/(organization)/*` | OrganizationLayout | Requires `session.session.activeOrganizationId` |
| `/public/*` | - | No guard (public) |

---

## Phase 1: Foundation Setup

### 1.1 Create Environment Variables

**File:** `src/lib/env.ts`

```typescript
import { z } from 'zod/v4'

const envSchema = z.object({
    VITE_API_URL: z.url().default('https://api.rs.hauntednuke.com/api'),
})

const env = envSchema.parse(import.meta.env)
export { env }
```

**File:** `.env`

```env
VITE_API_URL=https://api.rs.hauntednuke.com/api
```

### 1.2 Fix Hono Client

**File:** `src/lib/api/client.ts`

```typescript
import { hc } from "hono/client"
import type { AppType } from "@apps/api/src"

// NOTE: Keep URL hardcoded for now (don't use env.VITE_API_URL)
export const apiClient = hc<AppType>('https://api.rs.hauntednuke.com/', {
    fetch: (input, init) => fetch(input, {
        ...init,
        credentials: 'include',
    }),
})
```

**Changes:**
- Fix variable name: `apiCient` → `apiClient`
- Add `credentials: 'include'` for cookie-based auth
- Export the client
- NOTE: URL hardcoded for now (per user preference)

### 1.3 Add Utility Functions

**File:** `src/lib/utils.ts`

Add to existing exports:

```typescript
export function formatCurrency(value: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(value)
}
```

### 1.4 Update UI Store

**File:** `src/lib/stores/uiStore.ts`

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UIState {
    sidebarCollapsed: boolean
    mobileMenuOpen: boolean
    toggleSidebar: () => void
    toggleMobileMenu: () => void
    closeMobileMenu: () => void
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            sidebarCollapsed: false,
            mobileMenuOpen: false,
            toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
            toggleMobileMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
            closeMobileMenu: () => set({ mobileMenuOpen: false }),
        }),
        { name: 'ui-storage' },
    ),
)
```

**Changes:**
- Add `mobileMenuOpen` state
- Add `toggleMobileMenu` action
- Add `closeMobileMenu` action

---

## Phase 2: Dependencies

### 2.1 Install QR Code Library

```bash
pnpm --filter @apps/frontend-base add qrcode @types/qrcode
```

### 2.2 Install Shadcn Components

```bash
npx shadcn@latest add sheet tabs table checkbox skeleton
```

**Components being added:**
- `sheet` - Mobile drawer navigation
- `tabs` - Detail page tabs
- `table` - Leads display (desktop)
- `checkbox` - "Working with agent" field
- `skeleton` - Loading states

---

## Phase 3: Schema Definitions

**File:** `src/lib/schemas/openhouse.schema.ts`

```typescript
import { z } from 'zod/v4'

// ============================================================================
// OpenHouse Schemas
// ============================================================================

export const openHouseSchema = z.object({
    id: z.string().uuid(),
    organizationId: z.string().uuid(),
    createdByUserId: z.string().uuid(),
    propertyAddress: z.string().min(1, 'Property address is required'),
    listingPrice: z.number().positive('Price must be positive'),
    date: z.date(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
    listingImageUrl: z.string().url().nullable(),
    notes: z.string().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export const createOpenHouseSchema = z.object({
    propertyAddress: z.string().min(1, 'Property address is required'),
    listingPrice: z.number().positive('Price must be positive'),
    date: z.string().min(1, 'Date is required'),  // String for date input
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
    listingImageUrl: z.string().url().or(z.literal('')).nullable(),
    notes: z.string().nullable(),
}).refine((data) => data.startTime < data.endTime, {
    message: 'End time must be after start time',
    path: ['endTime'],
})

// ============================================================================
// OpenHouseLead Schemas
// ============================================================================

export const openHouseLeadSchema = z.object({
    id: z.string().uuid(),
    openHouseId: z.string().uuid(),
    organizationId: z.string().uuid(),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email().nullable(),
    phone: z.string().nullable(),
    workingWithAgent: z.boolean(),
    submittedAt: z.date(),
})

export const createOpenHouseLeadSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email().or(z.literal('')).nullable(),
    phone: z.string().or(z.literal('')).nullable(),
    workingWithAgent: z.boolean().default(false),
}).refine((data) => data.email || data.phone, {
    message: 'Either email or phone is required',
    path: ['email'],
})

// ============================================================================
// PublicOpenHouse Schema
// ============================================================================

export const publicOpenHouseSchema = z.object({
    id: z.string().uuid(),
    propertyAddress: z.string().min(1),
    date: z.date(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
    formConfig: z.any().nullable(),  // Form config, if implemented later
})

// ============================================================================
// Type Exports
// ============================================================================

export type OpenHouse = z.infer<typeof openHouseSchema>
export type CreateOpenHouseInput = z.infer<typeof createOpenHouseSchema>
export type OpenHouseLead = z.infer<typeof openHouseLeadSchema>
export type CreateOpenHouseLeadInput = z.infer<typeof createOpenHouseLeadSchema>
export type PublicOpenHouse = z.infer<typeof publicOpenHouseSchema>

// ============================================================================
// OpenHouseLead Schemas
// ============================================================================

export const OpenHouseLeadSchema = z.object({
    id: z.string().uuid(),
    openHouseId: z.string().uuid(),
    organizationId: z.string().uuid(),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email().nullable(),
    phone: z.string().nullable(),
    workingWithAgent: z.boolean(),
    submittedAt: z.date(),
})

export const CreateOpenHouseLeadSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email().or(z.literal('')).nullable(),
    phone: z.string().or(z.literal('')).nullable(),
    workingWithAgent: z.boolean().default(false),
}).refine((data) => data.email || data.phone, {
    message: 'Either email or phone is required',
    path: ['email'],
})

// ============================================================================
// PublicOpenHouse Schema
// ============================================================================

export const PublicOpenHouseSchema = z.object({
    id: z.string().uuid(),
    propertyAddress: z.string().min(1),
    date: z.date(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
    formConfig: z.any().nullable(),  // Form config, if implemented later
})

// ============================================================================
// Type Exports
// ============================================================================

export type OpenHouse = z.infer<typeof OpenHouseSchema>
export type CreateOpenHouseInput = z.infer<typeof CreateOpenHouseSchema>
export type OpenHouseLead = z.infer<typeof OpenHouseLeadSchema>
export type CreateOpenHouseLeadInput = z.infer<typeof CreateOpenHouseLeadSchema>
export type PublicOpenHouse = z.infer<typeof PublicOpenHouseSchema>
```

**Notes:**
- `CreateOpenHouseInput.date` is string (for date input), backend will coerce to Date
- `listingImageUrl` accepts empty string or URL, nullable
- `email` and `phone` accept empty string, validate that at least one is provided

---

## Phase 4: API Layer

**File:** `src/lib/api/openhouse.api.ts`

```typescript
import { apiClient } from './client'
import type { CreateOpenHouseInput, CreateOpenHouseLeadInput } from '@/lib/schemas/openhouse.schema'

export const openhouseApi = {
    // Authenticated routes
    getOpenHouses: async () => {
        const res = await apiClient.api["open-houses"].$get()
        if (!res.ok) {
            throw new Error('Failed to fetch open houses')
        }
        const data = await res.json()
        return data.data
    },

    getOpenHouse: async (id: string) => {
        const res = await apiClient.api["open-houses"][":id"].$get({ param: { id } })
        if (!res.ok) {
            throw new Error('Failed to fetch open house')
        }
        const data = await res.json()
        return data.data
    },

    createOpenHouse: async (data: CreateOpenHouseInput) => {
        const res = await apiClient.api["open-houses"].$post({ json: data })
        if (!res.ok) {
            throw new Error('Failed to create open house')
        }
        const resData = await res.json()
        return resData.data
    },

    getOpenHouseLeads: async (id: string) => {
        const res = await apiClient.api["open-houses"][":id"].leads.$get({ param: { id } })
        if (!res.ok) {
            throw new Error('Failed to fetch leads')
        }
        const data = await res.json()
        return data.data
    },

    // Public routes
    getPublicOpenHouse: async (id: string) => {
        const res = await apiClient.api.public["open-houses"][":id"].$get({ param: { id } })
        if (!res.ok) {
            throw new Error('Failed to fetch public open house')
        }
        const data = await res.json()
        return data.data
    },

    createOpenHouseLead: async (id: string, data: CreateOpenHouseLeadInput) => {
        const res = await apiClient.api.public["open-houses"][":id"]["sign-in"].$post({
            param: { id },
            json: data,
        })
        if (!res.ok) {
            throw new Error('Failed to create lead')
        }
        const resData = await res.json()
        return resData.data
    },
}
```

**Key Points:**
- Use bracket notation for hyphenated routes: `["open-houses"]`
- Check `res.ok` before parsing JSON
- Extract `.data` from response wrapper
- Type assertions for better type inference (backend responses should match)

---

## Phase 5: Query & Mutation Hooks

### 5.1 Query Options

**File:** `src/lib/queries/openhouse.ts`

```typescript
import { queryOptions } from '@tanstack/react-query'
import { openhouseApi } from '@/lib/api/openhouse.api'
import type { OpenHouse, OpenHouseLead, PublicOpenHouse } from '@/lib/schemas/openhouse.schema'

// For list page (direct useQuery)
export function useOpenHouses() {
    return queryOptions({
        queryKey: ['openhouses'],
        queryFn: () => openhouseApi.getOpenHouses(),
        staleTime: 5 * 60 * 1000,  // 5 minutes
    })
}

// For detail page loader (useSuspenseQuery)
export function useOpenHouse(id: string) {
    return queryOptions({
        queryKey: ['openhouses', id],
        queryFn: () => openhouseApi.getOpenHouse(id),
        enabled: !!id,
    })
}

// For leads in detail page loader (useSuspenseQuery)
export function useOpenHouseLeads(openHouseId: string) {
    return queryOptions({
        queryKey: ['openhouses', openHouseId, 'leads'],
        queryFn: () => openhouseApi.getOpenHouseLeads(openHouseId),
        enabled: !!openHouseId,
    })
}

// For public sign-in page loader
export function usePublicOpenHouse(id: string) {
    return queryOptions({
        queryKey: ['public', 'openhouses', id],
        queryFn: () => openhouseApi.getPublicOpenHouse(id),
        enabled: !!id,
    })
}
```

**Note:** All use `queryOptions()` pattern for use with `useSuspenseQuery` in route loaders.

### 5.2 Mutation Hooks

**File:** `src/lib/mutations/openhouse.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { openhouseApi } from '@/lib/api/openhouse.api'
import type { CreateOpenHouseInput, CreateOpenHouseLeadInput } from '@/lib/schemas/openhouse.schema'

export function useCreateOpenHouse() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateOpenHouseInput) => openhouseApi.createOpenHouse(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['openhouses'] })
        },
        onError: (error) => {
            console.error('Failed to create open house:', error)
            // TODO: Add toast notification
        },
    })
}

export function useCreateOpenHouseLead(openHouseId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateOpenHouseLeadInput) => openhouseApi.createOpenHouseLead(openHouseId, data),
        onSuccess: () => {
            // Invalidate leads query for this open house
            queryClient.invalidateQueries({ queryKey: ['openhouses', openHouseId, 'leads'] })
        },
        onError: (error) => {
            console.error('Failed to create lead:', error)
            // TODO: Add toast notification
        },
    })
}
```

---

## Phase 6: Mobile-First Layout Updates

### 6.1 Update TopBar

**File:** `src/components/layout/TopBar.tsx`

```typescript
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { ChartLine, ListChecks, Home } from 'lucide-react'
import { useUIStore } from '@/lib/stores/uiStore'
import { authClient } from '@/lib/api/auth-client'

const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: ChartLine },
    { to: '/tasks', label: 'Tasks', icon: ListChecks },
    { to: '/openhouse', label: 'Open Houses', icon: Home },
]

export function TopBar() {
    const { data: session, isPending } = authClient.useSession()
    const mobileMenuOpen = useUIStore((s) => s.mobileMenuOpen)
    const toggleMobileMenu = useUIStore((s) => s.toggleMobileMenu)

    const handleLogout = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    window.location.href = '/auth/login'
                },
            },
        })
    }

    if (isPending) {
        return (
            <header className="border-b border-border bg-background">
                <div className="flex h-16 items-center justify-between px-6">
                    <span>Loading...</span>
                </div>
            </header>
        )
    }

    return (
        <header className="border-b border-border bg-background">
            <div className="flex h-16 items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <Sheet open={mobileMenuOpen} onOpenChange={toggleMobileMenu}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="lg:hidden">
                                <Menu />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-64">
                            <nav className="flex flex-col gap-1 mt-8">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        onClick={() => toggleMobileMenu()}
                                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent"
                                        activeProps={{ className: 'bg-accent font-semibold' }}
                                    >
                                        <item.icon strokeWidth={1.5} size={20} />
                                        <span>{item.label}</span>
                                    </Link>
                                ))}
                            </nav>
                        </SheetContent>
                    </Sheet>
                    <h1 className="text-xl font-semibold tracking-tight">Task Manager</h1>
                </div>
                <div className="flex items-center gap-4">
                    {session?.user && (
                        <>
                            <span className="text-sm text-muted-foreground hidden sm:inline">
                                {session.user.email}
                            </span>
                            <Button variant="outline" onClick={handleLogout}>
                                Logout
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}
```

**Changes:**
- Import `Sheet` from shadcn
- Add mobile hamburger menu button (hidden on `lg:`)
- Create mobile drawer with navigation links
- Import `Home` icon for Open Houses
- Hide email on mobile (hidden `sm:`)

### 6.2 Update OrganizationLayout

**File:** `src/components/layout/OrganizationLayout.tsx`

```typescript
import { Outlet } from '@tanstack/react-router'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { cn } from '@/lib/utils'

export function OrganizationLayout() {
    return (
        <div className="flex h-screen w-full flex-col bg-background">
            <TopBar />
            <div className="flex flex-1 w-full overflow-hidden">
                <aside className={cn('hidden lg:flex border-r border-border transition-all duration-200')}>
                    <Sidebar />
                </aside>
                <main className="flex-1 w-full min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
```

**Changes:**
- Hide sidebar on mobile with `hidden lg:flex`
- Adjust main padding: `p-4 sm:p-6 lg:p-8` (smaller on mobile)
- Remove `w-64` from aside (let Sidebar handle width)

### 6.3 Update Sidebar

**File:** `src/components/layout/Sidebar.tsx`

```typescript
import { Link } from '@tanstack/react-router'
import { ChartLine, ListChecks, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
    className?: string
}

export function Sidebar({ className }: SidebarProps) {
    const navItems = [
        { to: '/dashboard', label: 'Dashboard', icon: ChartLine },
        { to: '/tasks', label: 'Tasks', icon: ListChecks },
        { to: '/openhouse', label: 'Open Houses', icon: Home },
    ]

    return (
        <aside className={cn('w-64 border-r border-border', className)}>
            <nav className="flex flex-col gap-1 p-4">
                {navItems.map((item) => (
                    <Link
                        key={item.to}
                        to={item.to}
                        className={cn(
                            'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200',
                            'hover:bg-accent hover:text-accent-foreground',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                            'focus-visible:ring-offset-background active:bg-accent',
                        )}
                        activeProps={{ className: 'bg-accent text-accent-foreground font-semibold' }}
                    >
                        {<item.icon strokeWidth={1.5} size={24} />}
                        <span>{item.label}</span>
                    </Link>
                ))}
            </nav>
        </aside>
    )
}
```

**Changes:**
- Add `Home` icon import
- Add Open Houses to navItems

---

## Phase 7: Authenticated Routes

### 7.1 Dashboard (List)

**File:** `src/routes/(protected)/(organization)/openhouse/index.tsx`

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { OpenHouseListPage } from '@/pages/openhouse/OpenHouseListPage'

export const Route = createFileRoute('/(protected)/(organization)/openhouse/')({
    component: OpenHouseListPage,
})
```

**NOTE: Use absolute import `@/pages/...` instead of relative `../../../`

**File:** `src/pages/openhouse/OpenHouseListPage.tsx`

```typescript
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { useOpenHouses } from '@/lib/queries/openhouse'
import { useCreateOpenHouse } from '@/lib/mutations/openhouse'
import { CreateOpenHouseForm } from './components/CreateOpenHouseForm'
import { OpenHouseCard } from './components/OpenHouseCard'
import { isPast, isToday, isFuture } from 'date-fns'

export function OpenHouseListPage() {
    const navigate = useNavigate()
    const { data: openhouses, isLoading } = useOpenHouses()
    const createOpenHouse = useCreateOpenHouse()
    const [createFormOpen, setCreateFormOpen] = useState(false)

    const handleCreateOpenHouse = async (values: any) => {
        await createOpenHouse.mutateAsync(values)
        setCreateFormOpen(false)
    }

    const handleViewOpenHouse = (id: string) => {
        navigate({ to: '/openhouse/$openHouseId', params: { openHouseId: id } })
    }

    const groupOpenHouses = (list: any[]) => {
        const upcoming: any[] = []
        const past: any[] = []

        const now = new Date()

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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-muted-foreground">Loading open houses...</div>
            </div>
        )
    }

    const { upcoming, past } = openhouses ? groupOpenHouses(openhouses) : { upcoming: [], past: [] }

    return (
        <div className="w-full space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Open Houses</h1>
                    <p className="text-muted-foreground mt-1">Manage your open houses</p>
                </div>
                <Dialog open={createFormOpen} onOpenChange={setCreateFormOpen}>
                    <DialogTrigger asChild>
                        <Button>New Open House</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Create Open House</DialogTitle>
                        </DialogHeader>
                        <CreateOpenHouseForm onSubmit={handleCreateOpenHouse} submitLabel="Create" />
                    </DialogContent>
                </Dialog>
            </div>

            {upcoming.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Upcoming</h2>
                    <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {upcoming.map((oh) => (
                            <OpenHouseCard key={oh.id} openHouse={oh} onClick={() => handleViewOpenHouse(oh.id)} />
                        ))}
                    </div>
                </div>
            )}

            {past.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Past</h2>
                    <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {past.map((oh) => (
                            <OpenHouseCard key={oh.id} openHouse={oh} onClick={() => handleViewOpenHouse(oh.id)} />
                        ))}
                    </div>
                </div>
            )}

            {upcoming.length === 0 && past.length === 0 && (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center max-w-md">
                        <div className="text-4xl mb-4">🏠</div>
                        <h3 className="text-lg font-semibold mb-2">No open houses yet</h3>
                        <p className="text-muted-foreground mb-4">
                            Create your first open house to start collecting leads.
                        </p>
                        <Dialog open={createFormOpen} onOpenChange={setCreateFormOpen}>
                            <DialogTrigger asChild>
                                <Button>Create Your First Open House</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>Create Open House</DialogTitle>
                                </DialogHeader>
                                <CreateOpenHouseForm onSubmit={handleCreateOpenHouse} submitLabel="Create" />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            )}
        </div>
    )
}
```

**Key Points:**
- Groups by upcoming (today + future) vs past
- Mobile-first grid: 1 col mobile, 2 col sm+, 3 col lg+
- Dialog for create form
- Empty state with emoji

### 7.2 Create Page

**File:** `src/routes/(protected)/(organization)/openhouse/new.tsx`

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { CreateOpenHousePage } from '@/pages/openhouse/CreateOpenHousePage'

export const Route = createFileRoute('/(protected)/(organization)/openhouse/new')({
    component: CreateOpenHousePage,
})
```

**NOTE: Use absolute import `@/pages/...` instead of relative `../../../`

**File:** `src/pages/openhouse/CreateOpenHousePage.tsx`

```typescript
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useCreateOpenHouse } from '@/lib/mutations/openhouse'
import { CreateOpenHouseForm } from './components/CreateOpenHouseForm'

export function CreateOpenHousePage() {
    const navigate = useNavigate()
    const createOpenHouse = useCreateOpenHouse()

    const handleSubmit = async (values: any) => {
        const result = await createOpenHouse.mutateAsync(values)
        navigate({ to: '/openhouse/$openHouseId', params: { openHouseId: result.id } })
    }

    return (
        <div className="w-full max-w-2xl mx-auto space-y-8">
            <Button variant="ghost" onClick={() => navigate({ to: '/openhouse' })}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Open Houses
            </Button>

            <div>
                <h1 className="text-3xl font-bold tracking-tight">Create Open House</h1>
                <p className="text-muted-foreground mt-1">Fill in the details for your open house</p>
            </div>

            <CreateOpenHouseForm onSubmit={handleSubmit} submitLabel="Create Open House" />
        </div>
    )
}
```

### 7.3 Detail Page

**File:** `src/routes/(protected)/(organization)/openhouse/$openHouseId.tsx`

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { useOpenHouse, useOpenHouseLeads } from '@/lib/queries/openhouse'
import { OpenHouseDetailError, OpenHouseDetailPage } from '@/pages/openhouse/OpenHouseDetailPage'

export const Route = createFileRoute('/(protected)/(organization)/openhouse/$openHouseId')({
    loader: async ({ context: { queryClient }, params }) => {
        await queryClient.ensureQueryData(useOpenHouse(params.openHouseId))
        await queryClient.ensureQueryData(useOpenHouseLeads(params.openHouseId))
    },
    errorComponent: OpenHouseDetailError,
    component: OpenHouseDetailPage,
})
```

**File:** `src/pages/openhouse/OpenHouseDetailPage.tsx`

```typescript
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Frown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useOpenHouse, useOpenHouseLeads } from '@/lib/queries/openhouse'
import { cn } from '@/lib/utils'
import { QRCodeDisplay } from './components/QRCodeDisplay'
import { LeadList } from './components/LeadList'
import { formatCurrency, format } from '@/lib/utils'

export function OpenHouseDetailError() {
    const navigate = useNavigate()
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
                <div className="text-4xl mb-4">
                    <Frown size={48} strokeWidth={1.5} className={cn('mx-auto text-destructive')} />
                </div>
                <h3 className="text-lg font-semibold mb-2">Open House not found</h3>
                <p className="text-muted-foreground mb-4">
                    The open house you're looking for doesn't exist or has been deleted.
                </p>
                <Button variant="outline" onClick={() => navigate({ to: '/openhouse' })}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Open Houses
                </Button>
            </div>
        </div>
    )
}

export function OpenHouseDetailPage() {
    const routeApi = getRouteApi('/(protected)/(organization)/openhouse/$openHouseId')
    const navigate = useNavigate()

    const { openHouseId } = routeApi.useParams()
    const { data: openHouse } = useSuspenseQuery(useOpenHouse(openHouseId))
    const { data: leads } = useSuspenseQuery(useOpenHouseLeads(openHouseId))

    const signInUrl = `${window.location.origin}/public/open-houses/sign-in/${openHouseId}`

    return (
        <div className="w-full space-y-8">
            <Button variant="ghost" onClick={() => navigate({ to: '/openhouse' })}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Open Houses
            </Button>

            <div>
                <h1 className="text-3xl font-bold tracking-tight">{openHouse.propertyAddress}</h1>
                <p className="text-muted-foreground mt-1">
                    {format(new Date(openHouse.date), 'MMMM d, yyyy')} • {openHouse.startTime} - {openHouse.endTime}
                </p>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full sm:w-auto overflow-x-auto">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="qr">QR & Flyer</TabsTrigger>
                    <TabsTrigger value="leads">
                        Leads {leads.length > 0 && `(${leads.length})`}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Property Address</h3>
                            <p className="text-muted-foreground">{openHouse.propertyAddress}</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Date & Time</h3>
                            <p className="text-muted-foreground">
                                {format(new Date(openHouse.date), 'MMMM d, yyyy')}<br />
                                {openHouse.startTime} - {openHouse.endTime}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Listing Price</h3>
                            <p className="text-muted-foreground text-2xl font-semibold">
                                {formatCurrency(openHouse.listingPrice)}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Leads Collected</h3>
                            <p className="text-muted-foreground text-2xl font-semibold">{leads.length}</p>
                        </div>
                    </div>

                    {openHouse.notes && (
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Notes</h3>
                            <p className="text-muted-foreground">{openHouse.notes}</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Public Sign-In Link</h3>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <code className="flex-1 p-3 rounded-md bg-muted text-sm overflow-x-auto text-xs sm:text-sm">
                                {signInUrl}
                            </code>
                            <Button variant="outline" onClick={() => navigator.clipboard.writeText(signInUrl)}>
                                Copy
                            </Button>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="qr" className="mt-6">
                    <QRCodeDisplay url={signInUrl} openHouse={openHouse} />
                </TabsContent>

                <TabsContent value="leads" className="mt-6">
                    <LeadList leads={leads} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
```

---

## Phase 8: Public Routes

### 8.1 Visitor Sign-In Page

**File:** `src/routes/public/open-houses/sign-in/$openHouseId.tsx`

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { usePublicOpenHouse } from '@/lib/queries/openhouse'
import { VisitorSignInPage, VisitorSignInError } from '@/pages/openhouse/VisitorSignInPage'

export const Route = createFileRoute('/public/open-houses/sign-in/$openHouseId')({
    loader: async ({ context: { queryClient }, params }) => {
        await queryClient.ensureQueryData(usePublicOpenHouse(params.openHouseId))
    },
    errorComponent: VisitorSignInError,
    component: VisitorSignInPage,
})
```

**NOTE: Use absolute import `@/pages/...` instead of relative `../../../`

**File:** `src/pages/openhouse/VisitorSignInPage.tsx`

```typescript
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { Frown, CheckCircle2 } from 'lucide-react'
import { useCreateOpenHouseLead } from '@/lib/mutations/openhouse'
import { usePublicOpenHouse } from '@/lib/queries/openhouse'
import { CreateOpenHouseLeadForm } from './components/CreateOpenHouseLeadForm'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { useState } from 'react'

export function VisitorSignInError() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center max-w-md px-4">
                <div className="text-4xl mb-4">
                    <Frown size={48} strokeWidth={1.5} className={cn('mx-auto text-destructive')} />
                </div>
                <h3 className="text-lg font-semibold mb-2">Open House not found</h3>
                <p className="text-muted-foreground">
                    The open house you're looking for doesn't exist.
                </p>
            </div>
        </div>
    )
}

export function VisitorSignInPage() {
    const routeApi = getRouteApi('/public/open-houses/sign-in/$openHouseId')
    const { openHouseId } = routeApi.useParams()
    const { data: openHouse } = useSuspenseQuery(usePublicOpenHouse(openHouseId))
    const createLead = useCreateOpenHouseLead(openHouseId)
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = async (values: any) => {
        await createLead.mutateAsync(values)
        setSubmitted(true)
    }

    if (submitted) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center max-w-md px-4">
                    <div className="text-4xl mb-4">
                        <CheckCircle2 size={48} strokeWidth={1.5} className={cn('mx-auto text-green-600')} />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Thank you!</h2>
                    <p className="text-muted-foreground">
                        You've been signed in. The agent will be in touch soon.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/30 p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Sign In</h1>
                    <p className="text-muted-foreground">
                        {openHouse.propertyAddress}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {format(new Date(openHouse.date), 'MMMM d, yyyy')} • {openHouse.startTime} - {openHouse.endTime}
                    </p>
                </div>

                <CreateOpenHouseLeadForm onSubmit={handleSubmit} submitLabel="Sign In" />
            </div>
        </div>
    )
}
```

---

## Phase 9: Components

### 9.1 OpenHouseCard

**File:** `src/components/openhouse/OpenHouseCard.tsx`

```typescript
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { format } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'

interface OpenHouseCardProps {
    openHouse: any
    onClick: () => void
}

export function OpenHouseCard({ openHouse, onClick }: OpenHouseCardProps) {
    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
            <CardContent className="p-4 space-y-3">
                <div>
                    <h3 className="font-semibold text-lg line-clamp-2">{openHouse.propertyAddress}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        {format(new Date(openHouse.date), 'MMMM d, yyyy')}
                    </p>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{formatCurrency(openHouse.listingPrice)}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                    {openHouse.startTime} - {openHouse.endTime}
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Button variant="ghost" className="w-full justify-between">
                    View Details
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    )
}
```

### 9.2 CreateOpenHouseForm

**File:** `src/components/openhouse/CreateOpenHouseForm.tsx`

```typescript
import { useForm } from '@tanstack/react-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'
import type { CreateOpenHouseInput } from '@/lib/schemas/openhouse.schema'
import { createOpenHouseSchema } from '@/lib/schemas/openhouse.schema'
import { isFieldInvalid } from '@/lib/utils'

interface CreateOpenHouseFormProps {
    onSubmit: (values: CreateOpenHouseInput) => void | Promise<void>
    submitLabel: string
}

// NOTE: Field-level validators (onChange) not included per user preference.
// TODO: Consider adding real-time validation using onChange validators in future.

export function CreateOpenHouseForm({ onSubmit, submitLabel }: CreateOpenHouseFormProps) {
    const form = useForm({
        defaultValues: {
            propertyAddress: '',
            listingPrice: 0,
            date: '',
            startTime: '',
            endTime: '',
            listingImageUrl: '',
            notes: '',
        },
        validators: {
            onSubmit: CreateOpenHouseSchema,
        },
        onSubmit: async ({ value }) => {
            await onSubmit(value)
            form.reset()
        },
    })

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                form.handleSubmit()
            }}
            className="space-y-4"
        >
            <form.Field name="propertyAddress">
                {(field) => {
                    const { invalid, errors } = isFieldInvalid(field)
                    return (
                        <Field data-invalid={invalid}>
                            <FieldLabel htmlFor={field.name}>Property Address</FieldLabel>
                            <Input
                                id={field.name}
                                type="text"
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur}
                                placeholder="123 Main St, City, State"
                                aria-invalid={invalid}
                            />
                            {invalid && <FieldError>{errors.join(', ')}</FieldError>}
                        </Field>
                    )
                }}
            </form.Field>

            <form.Field name="listingPrice">
                {(field) => {
                    const { invalid, errors } = isFieldInvalid(field)
                    return (
                        <Field data-invalid={invalid}>
                            <FieldLabel htmlFor={field.name}>Listing Price</FieldLabel>
                            <Input
                                id={field.name}
                                type="number"
                                value={field.state.value}
                                onChange={(e) => field.handleChange(Number(e.target.value))}
                                onBlur={field.handleBlur}
                                placeholder="500000"
                                min="0"
                                step="1"
                                aria-invalid={invalid}
                            />
                            {invalid && <FieldError>{errors.join(', ')}</FieldError>}
                        </Field>
                    )
                }}
            </form.Field>

            <form.Field name="date">
                {(field) => {
                    const { invalid, errors } = isFieldInvalid(field)
                    return (
                        <Field data-invalid={invalid}>
                            <FieldLabel htmlFor={field.name}>Date</FieldLabel>
                            <Input
                                id={field.name}
                                type="date"
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur}
                                aria-invalid={invalid}
                            />
                            {invalid && <FieldError>{errors.join(', ')}</FieldError>}
                        </Field>
                    )
                }}
            </form.Field>

            <div className="grid grid-cols-2 gap-4">
                <form.Field name="startTime">
                    {(field) => {
                        const { invalid, errors } = isFieldInvalid(field)
                        return (
                            <Field data-invalid={invalid}>
                                <FieldLabel htmlFor={field.name}>Start Time</FieldLabel>
                                <Input
                                    id={field.name}
                                    type="time"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    onBlur={field.handleBlur}
                                    aria-invalid={invalid}
                                />
                                {invalid && <FieldError>{errors.join(', ')}</FieldError>}
                            </Field>
                        )
                    }}
                </form.Field>

                <form.Field name="endTime">
                    {(field) => {
                        const { invalid, errors } = isFieldInvalid(field)
                        return (
                            <Field data-invalid={invalid}>
                                <FieldLabel htmlFor={field.name}>End Time</FieldLabel>
                                <Input
                                    id={field.name}
                                    type="time"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    onBlur={field.handleBlur}
                                    aria-invalid={invalid}
                                />
                                {invalid && <FieldError>{errors.join(', ')}</FieldError>}
                            </Field>
                        )
                    }}
                </form.Field>
            </div>

            <form.Field name="listingImageUrl">
                {(field) => {
                    const { invalid, errors } = isFieldInvalid(field)
                    return (
                        <Field data-invalid={invalid}>
                            <FieldLabel htmlFor={field.name}>Listing Image URL (optional)</FieldLabel>
                            <Input
                                id={field.name}
                                type="url"
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur}
                                placeholder="https://example.com/image.jpg"
                                aria-invalid={invalid}
                            />
                            {invalid && <FieldError>{errors.join(', ')}</FieldError>}
                        </Field>
                    )
                }}
            </form.Field>

            <form.Field name="notes">
                {(field) => {
                    const { invalid } = isFieldInvalid(field)
                    return (
                        <Field data-invalid={invalid}>
                            <FieldLabel htmlFor={field.name}>Notes (optional)</FieldLabel>
                            <Textarea
                                id={field.name}
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur}
                                placeholder="Additional information..."
                                rows={3}
                                aria-invalid={invalid}
                            />
                        </Field>
                    )
                }}
            </form.Field>

            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                {([canSubmit, isSubmitting]) => (
                    <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>
                        {isSubmitting ? 'Submitting...' : submitLabel}
                    </Button>
                )}
            </form.Subscribe>
        </form>
    )
}
```

### 9.3 CreateOpenHouseLeadForm

**File:** `src/components/openhouse/CreateOpenHouseLeadForm.tsx`

```typescript
import { useForm } from '@tanstack/react-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'
import type { CreateOpenHouseLeadInput } from '@/lib/schemas/openhouse.schema'
import { createOpenHouseLeadSchema } from '@/lib/schemas/openhouse.schema'
import { isFieldInvalid } from '@/lib/utils'

interface CreateOpenHouseLeadFormProps {
    onSubmit: (values: CreateOpenHouseLeadInput) => void | Promise<void>
    submitLabel: string
}

// NOTE: Field-level validators (onChange) not included per user preference.
// TODO: Consider adding real-time validation using onChange validators in future.

export function CreateOpenHouseLeadForm({ onSubmit, submitLabel }: CreateOpenHouseLeadFormProps) {
    const form = useForm({
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            workingWithAgent: false,
        },
        validators: {
            onSubmit: CreateOpenHouseLeadSchema,
        },
        onSubmit: async ({ value }) => {
            await onSubmit(value)
            form.reset()
        },
    })

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                form.handleSubmit()
            }}
            className="space-y-4"
        >
            <form.Field name="firstName">
                {(field) => {
                    const { invalid, errors } = isFieldInvalid(field)
                    return (
                        <Field data-invalid={invalid}>
                            <FieldLabel htmlFor={field.name}>First Name</FieldLabel>
                            <Input
                                id={field.name}
                                type="text"
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur}
                                placeholder="John"
                                aria-invalid={invalid}
                            />
                            {invalid && <FieldError>{errors.join(', ')}</FieldError>}
                        </Field>
                    )
                }}
            </form.Field>

            <form.Field name="lastName">
                {(field) => {
                    const { invalid, errors } = isFieldInvalid(field)
                    return (
                        <Field data-invalid={invalid}>
                            <FieldLabel htmlFor={field.name}>Last Name</FieldLabel>
                            <Input
                                id={field.name}
                                type="text"
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur}
                                placeholder="Doe"
                                aria-invalid={invalid}
                            />
                            {invalid && <FieldError>{errors.join(', ')}</FieldError>}
                        </Field>
                    )
                }}
            </form.Field>

            <form.Field name="email">
                {(field) => {
                    const { invalid, errors } = isFieldInvalid(field)
                    return (
                        <Field data-invalid={invalid}>
                            <FieldLabel htmlFor={field.name}>Email (optional)</FieldLabel>
                            <Input
                                id={field.name}
                                type="email"
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur}
                                placeholder="john@example.com"
                                aria-invalid={invalid}
                            />
                            {invalid && <FieldError>{errors.join(', ')}</FieldError>}
                        </Field>
                    )
                }}
            </form.Field>

            <form.Field name="phone">
                {(field) => {
                    const { invalid, errors } = isFieldInvalid(field)
                    return (
                        <Field data-invalid={invalid}>
                            <FieldLabel htmlFor={field.name}>Phone (optional)</FieldLabel>
                            <Input
                                id={field.name}
                                type="tel"
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur}
                                placeholder="(555) 123-4567"
                                aria-invalid={invalid}
                            />
                            {invalid && <FieldError>{errors.join(', ')}</FieldError>}
                        </Field>
                    )
                }}
            </form.Field>

            <form.Field name="workingWithAgent" type="boolean">
                {(field) => (
                    <Field className="flex items-center gap-2">
                        <Checkbox
                            id={field.name}
                            checked={field.state.value}
                            onCheckedChange={(checked) => field.handleChange(checked === true)}
                        />
                        <label
                            htmlFor={field.name}
                            className="text-sm font-medium cursor-pointer"
                        >
                            Currently working with an agent?
                        </label>
                    </Field>
                )}
            </form.Field>

            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                {([canSubmit, isSubmitting]) => (
                    <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>
                        {isSubmitting ? 'Submitting...' : submitLabel}
                    </Button>
                )}
            </form.Subscribe>
        </form>
    )
}
```

### 9.4 QRCodeDisplay

**File:** `src/components/openhouse/QRCodeDisplay.tsx`

```typescript
import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, Printer, Share2 } from 'lucide-react'

interface QRCodeDisplayProps {
    url: string
    openHouse: any
}

export function QRCodeDisplay({ url, openHouse }: QRCodeDisplayProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')

    useEffect(() => {
        const generateQRCode = async () => {
            if (canvasRef.current) {
                await QRCode.toCanvas(canvasRef.current, url, {
                    width: 256,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF',
                    },
                })
                const dataUrl = canvasRef.current.toDataURL('image/png')
                setQrCodeDataUrl(dataUrl)
            }
        }

        generateQRCode()
    }, [url])

    const handleDownload = () => {
        const link = document.createElement('a')
        link.download = `qrcode-${openHouse.id}.png`
        link.href = qrCodeDataUrl
        link.click()
    }

    const handlePrint = () => {
        const printWindow = window.open('', '_blank')
        if (printWindow) {
            const formattedDate = new Date(openHouse.date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
            })

            printWindow.document.write(`
                <html>
                    <head>
                        <title>Open House Flyer</title>
                        <style>
                            body {
                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                min-height: 100vh;
                                padding: 40px;
                                box-sizing: border-box;
                            }
                            .flyer {
                                border: 2px solid #1C2A52;
                                padding: 40px;
                                max-width: 500px;
                                text-align: center;
                            }
                            .address {
                                font-size: 24px;
                                font-weight: bold;
                                color: #1C2A52;
                                margin-bottom: 20px;
                            }
                            .info {
                                font-size: 18px;
                                color: #666;
                                margin-bottom: 30px;
                            }
                            .qrcode {
                                display: flex;
                                justify-content: center;
                                margin-bottom: 20px;
                            }
                            .scan-text {
                                font-size: 14px;
                                color: #999;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="flyer">
                            <div class="address">${openHouse.propertyAddress}</div>
                            <div class="info">
                                ${formattedDate}<br />
                                ${openHouse.startTime} - ${openHouse.endTime}
                            </div>
                            <div class="qrcode">
                                <img src="${qrCodeDataUrl}" width="200" height="200" />
                            </div>
                            <div class="scan-text">Scan to sign in</div>
                        </div>
                    </body>
                </html>
            `)
            printWindow.document.close()
            printWindow.print()
        }
    }

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Open House Sign-In',
                    text: `Sign in for the open house at ${openHouse.propertyAddress}`,
                    url: url,
                })
            } catch (err) {
                console.log('Share failed:', err)
            }
        } else {
            navigator.clipboard.writeText(url)
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>QR Code</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                    <canvas ref={canvasRef} className="border border-border rounded-lg" />
                    <div className="flex flex-wrap gap-2 justify-center">
                        <Button onClick={handleDownload} variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                        </Button>
                        <Button onClick={handlePrint} variant="outline">
                            <Printer className="mr-2 h-4 w-4" />
                            Print Flyer
                        </Button>
                        <Button onClick={handleShare} variant="outline">
                            <Share2 className="mr-2 h-4 w-4" />
                            Share
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="text-sm text-muted-foreground">
                <p>Share this QR code to allow visitors to sign in quickly.</p>
                <p className="mt-2">Visitors can scan it with their phone camera or any QR code reader.</p>
            </div>
        </div>
    )
}
```

### 9.5 LeadList

**File:** `src/components/openhouse/LeadList.tsx`

```typescript
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { format } from '@/lib/utils'

interface LeadListProps {
    leads: any[]
}

export function LeadList({ leads }: LeadListProps) {
    if (leads.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[200px]">
                <div className="text-center">
                    <p className="text-muted-foreground">No leads collected yet</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Mobile View - Cards */}
            <div className="space-y-4 sm:hidden">
                {leads.map((lead) => (
                    <Card key={lead.id}>
                        <CardContent className="p-4 space-y-2">
                            <div>
                                <h4 className="font-semibold">{lead.firstName} {lead.lastName}</h4>
                                <p className="text-sm text-muted-foreground">
                                    {format(new Date(lead.submittedAt), 'MMM d, yyyy • h:mm a')}
                                </p>
                            </div>
                            {lead.email && (
                                <p className="text-sm">
                                    <span className="text-muted-foreground">Email:</span> {lead.email}
                                </p>
                            )}
                            {lead.phone && (
                                <p className="text-sm">
                                    <span className="text-muted-foreground">Phone:</span> {lead.phone}
                                </p>
                            )}
                            {lead.workingWithAgent && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <span>✓ Working with an agent</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Desktop View - Table */}
            <div className="hidden sm:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Working with Agent</TableHead>
                            <TableHead>Submitted</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {leads.map((lead) => (
                            <TableRow key={lead.id}>
                                <TableCell className="font-medium">
                                    {lead.firstName} {lead.lastName}
                                </TableCell>
                                <TableCell>{lead.email || '-'}</TableCell>
                                <TableCell>{lead.phone || '-'}</TableCell>
                                <TableCell>
                                    {lead.workingWithAgent ? 'Yes' : 'No'}
                                </TableCell>
                                <TableCell>
                                    {format(new Date(lead.submittedAt), 'MMM d, yyyy • h:mm a')}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
```

**Key Points:**
- Mobile: Card view (hidden sm:hidden)
- Desktop: Table view (hidden sm:block)
- Empty state handling

---

## Phase 10: Testing

### 10.1 Manual Testing Checklist

**Authenticatd Flow:**
- [ ] Navigate to `/openhouse`
- [ ] View open house list (upcoming/past groups)
- [ ] Create new open house via dialog
- [ ] View open house detail page
- [ ] Switch between tabs (Overview, QR & Flyer, Leads)
- [ ] Download QR code
- [ ] Print flyer
- [ ] Copy sign-in link
- [ ] View leads table

**Public Flow:**
- [ ] Access public sign-in URL
- [ ] Submit valid lead (name + email OR phone)
- [ ] See error when missing both email and phone
- [ ] See success message after submission
- [ ] Verify lead appears in authenticated leads list

**Responsive Testing:**
- [ ] Test on mobile (375px)
- [ ] Test on tablet (768px)
- [ ] Test on desktop (1024px+)
- [ ] Test mobile drawer navigation
- [ ] Test sidebar visibility

**Validation Testing:**
- [ ] Create open house without required fields
- [ ] Create open house with end time before start time
- [ ] Create open house with negative price
- [ ] Submit lead without email OR phone

### 10.2 Linting & Type Checking

Run before committing:
```bash
pnpm --filter @apps/frontend-base biome check --write
pnpm --filter @apps/frontend-base tsc --noEmit
```

---

## Common Patterns Reference

### Import Patterns

```typescript
// React & Router
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { getRouteApi } from '@tanstack/react-router'

// React Query
import { useQuery, queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// TanStack Form
import { useForm } from '@tanstack/react-form'

// Components
import { Button } from '@/components/ui/button'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'

// Utilities
import { cn } from '@/lib/utils'
import { isFieldInvalid } from '@/lib/utils'
import { formatCurrency, format } from '@/lib/utils'

// Store
import { useUIStore } from '@/lib/stores/uiStore'

// API
import { apiClient } from '@/lib/api/client'
import { openhouseApi } from '@/lib/api/openhouse.api'
import { authClient } from '@/lib/api/auth-client'

// Schemas
import type { CreateOpenHouseInput, CreateOpenHouseLeadInput } from '@/lib/schemas/openhouse.schema'
import { CreateOpenHouseSchema, CreateOpenHouseLeadSchema } from '@/lib/schemas/openhouse.schema'

// Queries
import { useOpenHouses, useOpenHouse, useOpenHouseLeads, usePublicOpenHouse } from '@/lib/queries/openhouse'

// Mutations
import { useCreateOpenHouse, useCreateOpenHouseLead } from '@/lib/mutations/openhouse'

// Icons
import { ArrowLeft, Home, CheckCircle2, Frown, ChevronRight, Download, Printer, Share2 } from 'lucide-react'

// Date formatting
import { isPast, isToday } from 'date-fns'
```

### Responsive Grid Pattern

```typescript
// 1 column mobile, 2 sm, 3 lg
<div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
```

### Mobile-First Padding Pattern

```typescript
// Smaller on mobile, larger on desktop
<p className="p-4 sm:p-6 lg:p-8">
```

### Hidden/Visible Pattern

```typescript
// Mobile only
<div className="lg:hidden">Mobile content</div>

// Desktop only
<div className="hidden lg:block">Desktop content</div>

// Mobile and tablet only
<div className="sm:hidden">Mobile content</div>

// Tablet and desktop only
<div className="hidden sm:block">Desktop content</div>
```

### Loading State Pattern

```typescript
if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-muted-foreground">Loading...</div>
        </div>
    )
}
```

### Empty State Pattern

```typescript
if (items.length === 0) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
                <div className="text-4xl mb-4">🏠</div>
                <h3 className="text-lg font-semibold mb-2">No items yet</h3>
                <p className="text-muted-foreground mb-4">Description</p>
                <Button>Action</Button>
            </div>
        </div>
    )
}
```

### Error State Pattern

```typescript
export function ComponentError() {
    const navigate = useNavigate()
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
                <div className="text-4xl mb-4">
                    <Frown size={48} strokeWidth={1.5} className="text-destructive" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Not found</h3>
                <p className="text-muted-foreground mb-4">Description</p>
                <Button variant="outline" onClick={() => navigate({ to: '/somewhere' })}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
            </div>
        </div>
    )
}
```

### Navigation Pattern

```typescript
// Navigate with params
const navigate = useNavigate()
navigate({
    to: '/openhouse/$openHouseId',
    params: { openHouseId: '123' }
})

// Navigate without params
navigate({ to: '/openhouse' })
```

### Route Pattern

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useOpenHouse } from '@/lib/queries/openhouse'

// With loader
export const Route = createFileRoute('/(protected)/(organization)/openhouse/$openHouseId')({
    loader: async ({ context: { queryClient }, params }) => {
        await queryClient.ensureQueryData(useOpenHouse(params.openHouseId))
    },
    errorComponent: ComponentError,
    component: ComponentPage,
})

// Without loader
export const Route = createFileRoute('/(protected)/(organization)/openhouse/')({
    component: ComponentPage,
})

// In component with loader
const routeApi = getRouteApi('/(protected)/(organization)/openhouse/$openHouseId')
const { openHouseId } = routeApi.useParams()
const { data } = useSuspenseQuery(useOpenHouse(openHouseId))
```

---

## Implementation Checklist

### Phase 1: Foundation
- [ ] Create `src/lib/env.ts`
- [ ] Create `.env` with `VITE_API_URL`
- [ ] Fix `src/lib/api/client.ts` (add credentials, export, keep URL hardcoded)
- [ ] Add `formatCurrency` to `src/lib/utils.ts`
- [ ] Update `src/lib/stores/uiStore.ts`

### Phase 2: Dependencies
- [ ] Install `qrcode` and `@types/qrcode`
- [ ] Install shadcn components: `sheet`, `tabs`, `table`, `checkbox`, `skeleton`

### Phase 3: Schemas
- [ ] Create `src/lib/schemas/openhouse.schema.ts` (use camelCase: `openHouseSchema`, `createOpenHouseSchema`)

### Phase 4: API Layer
- [ ] Create `src/lib/api/openhouse.api.ts`

### Phase 5: Queries & Mutations
- [ ] Create `src/lib/queries/openhouse.ts` (use `useQuery()` for list, `queryOptions()` for loaders)
- [ ] Create `src/lib/mutations/openhouse.ts`

### Phase 6: Layout
- [ ] Update `src/components/layout/TopBar.tsx`
- [ ] Update `src/components/layout/OrganizationLayout.tsx`
- [ ] Update `src/components/layout/Sidebar.tsx`

### Phase 7: Authenticated Routes
- [ ] Create `src/routes/(protected)/(organization)/openhouse/index.tsx`
- [ ] Create `src/pages/openhouse/OpenHouseListPage.tsx`
- [ ] Create `src/routes/(protected)/(organization)/openhouse/new.tsx`
- [ ] Create `src/pages/openhouse/CreateOpenHousePage.tsx`
- [ ] Create `src/routes/(protected)/(organization)/openhouse/$openHouseId.tsx`
- [ ] Create `src/pages/openhouse/OpenHouseDetailPage.tsx`

### Phase 8: Public Routes
- [ ] Create `src/routes/public/open-houses/sign-in/$openHouseId.tsx`
- [ ] Create `src/pages/openhouse/VisitorSignInPage.tsx`

### Phase 9: Components
- [ ] Create `src/pages/openhouse/components/OpenHouseCard.tsx`
- [ ] Create `src/pages/openhouse/components/CreateOpenHouseForm.tsx`
- [ ] Create `src/pages/openhouse/components/CreateOpenHouseLeadForm.tsx`
- [ ] Create `src/pages/openhouse/components/QRCodeDisplay.tsx`
- [ ] Create `src/pages/openhouse/components/LeadList.tsx`

### Phase 10: Testing
- [ ] Manual testing checklist
- [ ] Linting & type checking

---

## Notes

### Design System
- Primary color: `#1C2A52` (dark blue)
- Accent color: `#D0AC61` (gold)
- Uses OKLCH color space
- Uses shadcn/ui components with Tailwind CSS v4

### Date Format
- `format(date, 'MMMM d, yyyy')` → "March 19, 2026"
- `format(date, 'MMM d, yyyy • h:mm a')` → "Mar 19, 2026 • 2:30 PM"

### Mobile-First Breakpoints
- Mobile: < 640px
- sm: 640px+
- lg: 1024px+

### Route Guard Flow
1. `/` → Redirect to `/dashboard`
2. `/auth/*` → No guard
3. `/(protected)/*` → Require `session.user`
4. `/(protected)/(organization)/*` → Require `session.session.activeOrganizationId`
5. `/public/*` → No guard

### Backend Response Format
All responses: `{ data: <payload> }`
All errors: HTTPException with status code and message

### Hono RPC Client
- Base URL: `env.VITE_API_URL + "/"`
- Credentials: `include` (for cookie-based auth)
- Hyphenated routes: `api["open-houses"]`
- Path params: `{ param: { id: "123" } }`
- Request body: `{ json: { ... } }`
- Response: `await res.json()` → `{ data: ... }`

---

**End of Implementation Plan**
