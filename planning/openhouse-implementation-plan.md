# Open House Web App — Implementation Plan

## Overview

A mobile-first web app for real estate agents to create open house events, generate QR/sign-in experiences for visitors, and collect leads — integrated into an existing monorepo with shared auth, API, and database layers.

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend framework** | React + Vite |
| **Routing** | TanStack Router (Programmatic, not file-based) |
| **State management** | Zustand (auth), TanStack Query (server state) |
| **Forms** | TanStack Form + Zod validation |
| **HTTP client** | Axios (with separable layer for future proofing) |
| **UI Components** | Shadcn/Radix |
| **Date handling** | date-fns |
| **QR generation** | qrcode (client-side) |
| **Database** | PostgreSQL + Drizzle ORM |
| **Auth** | BetterAuth (mounted at `/api/auth/*`) |

---

## Phase 0: Foundation (Prerequisites)

### 0.1 Add Database Scripts

Edit `packages/database/package.json` to add:

```json
"scripts": {
  "db:generate": "drizzle-kit generate",
  "db:migrate": "drizzle-kit migrate",
  "db:studio": "drizzle-kit studio",
  "dev": "bun index.ts",
  "dev:env": "bun --env-file=../../.env index.ts"
}
```

### 0.2 Create Auth Package Export

Create `packages/auth/index.ts`:

```typescript
export { auth } from "./lib/auth";
```

### 0.3 Generate and Run Auth Database Migrations

Run the following commands:

```bash
pnpm --filter @packages/database db:generate  # Create migration from existing auth.schema.ts
pnpm --filter @packages/database db:migrate   # Apply migrations to PostgreSQL
```

### 0.4 Mount BetterAuth in API

**Create auth feature structure:**

`apps/api/src/features/auth/api/auth.routes.ts`:

```typescript
import { auth } from "@packages/auth";

// BetterAuth handler is exported from the auth instance
export const authHandler = auth.handler;
```

**Edit `apps/api/src/index.ts`:**

```typescript
import { authHandler } from "@features/auth/api/auth.routes";

// Mount BetterAuth at /api/auth/*
app.route("/api/auth", authHandler);
```

**Add dependency:**

Edit `apps/api/package.json` to move `@packages/auth` from devDependencies to dependencies.

---

## Phase 1: Open House Database Schema

### 1.1 Create Open House Schema

Create `packages/database/src/schemas/openhouse.schema.ts`:

```typescript
import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  numeric,
  uuid,
} from "drizzle-orm/pg-core";
import { user, organization } from "./auth.schema";

export const openHouse = pgTable("open_house", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  createdByUserId: uuid("created_by_user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  propertyAddress: text("property_address").notNull(),
  listingPrice: numeric("listing_price", { precision: 12, scale: 2 }).notNull(),
  date: timestamp("date", { mode: "date" }).notNull(),
  startTime: text("start_time").notNull(), // HH:MM format
  endTime: text("end_time").notNull(),     // HH:MM format
  listingImageUrl: text("listing_image_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const openHouseLead = pgTable("open_house_lead", {
  id: uuid("id").primaryKey().defaultRandom(),
  openHouseId: uuid("open_house_id")
    .notNull()
    .references(() => openHouse.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  workingWithAgent: boolean("working_with_agent").notNull().default(false),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

// Relations
export const openHouseRelations = relations(openHouse, ({ one, many }) => ({
  createdBy: one(user, {
    fields: [openHouse.createdByUserId],
    references: [user.id],
  }),
  organization: one(organization, {
    fields: [openHouse.organizationId],
    references: [organization.id],
  }),
  leads: many(openHouseLead),
}));

export const openHouseLeadRelations = relations(openHouseLead, ({ one }) => ({
  openHouse: one(openHouse, {
    fields: [openHouseLead.openHouseId],
    references: [openHouse.id],
  }),
  organization: one(organization, {
    fields: [openHouseLead.organizationId],
    references: [organization.id],
  }),
}));
```

### 1.2 Add Relations to Auth Schema

Edit `packages/database/src/schemas/auth.schema.ts` to add:

```typescript
import { openHouse } from "./openhouse.schema";

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  members: many(member),
  invitations: many(invitation),
  createdOpenHouses: many(openHouse), // Add this
}));

export const organizationRelations = relations(organization, ({ many }) => ({
  members: many(member),
  invitations: many(invitation),
  openHouses: many(openHouse), // Add this
}));
```

### 1.3 Generate and Apply Migration

Run:

```bash
pnpm --filter @packages/database db:generate
pnpm --filter @packages/database db:migrate
```

---

## Phase 2: API Endpoints

### Structure

```
apps/api/src/features/openhouse/
├── api/
│   ├── openhouse.routes.ts       # Route definitions
│   ├── openhouse.controller.ts   # Request handlers
│   └── openhouse.schemas.ts      # Zod validation schemas
├── service/
│   └── openhouse.service.ts      # Business logic
├── infra/
│   └── db.openhouse.repository.ts  # Drizzle data access
└── domain/
    ├── openhouse.entity.ts       # Domain models + factory
    └── interface.openhouse.repository.ts
```

### 2.1 Validation Schemas

`features/openhouse/api/openhouse.schemas.ts`:

```typescript
import { z } from "zod";

export const CreateOpenHouseSchema = z.object({
  propertyAddress: z.string().min(1, "Address is required"),
  listingPrice: z.number().positive("Price must be positive"),
  date: z.coerce.date(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
  listingImageUrl: z.string().url().optional().or(z.literal("")),
  notes: z.string().optional(),
}).refine(
  (data) => data.startTime < data.endTime,
  { message: "End time must be after start time", path: ["endTime"] }
);

export const CreateOpenHouseLeadSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  workingWithAgent: z.boolean().default(false),
}).refine(
  (data) => data.email || data.phone,
  { message: "Email or phone is required" }
);

export const OpenHouseIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export type CreateOpenHouseInput = z.infer<typeof CreateOpenHouseSchema>;
export type CreateOpenHouseLeadInput = z.infer<typeof CreateOpenHouseLeadSchema>;
```

### 2.2 Domain Entities

`features/openhouse/domain/openhouse.entity.ts`:

```typescript
import { z } from "zod";

const OpenHouseEntitySchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  createdByUserId: z.string().uuid(),
  propertyAddress: z.string(),
  listingPrice: z.number(),
  date: z.date(),
  startTime: z.string(),
  endTime: z.string(),
  listingImageUrl: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const OpenHouseLeadEntitySchema = z.object({
  id: z.string().uuid(),
  openHouseId: z.string().uuid(),
  organizationId: z.string().uuid(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  workingWithAgent: z.boolean(),
  submittedAt: z.date(),
});

export type OpenHouse = z.infer<typeof OpenHouseEntitySchema>;
export type OpenHouseLead = z.infer<typeof OpenHouseLeadEntitySchema>;

export const OpenHouseFactory = {
  create: (params: z.input<typeof OpenHouseEntitySchema>): OpenHouse => {
    return OpenHouseEntitySchema.parse(params);
  },
};

export const OpenHouseLeadFactory = {
  create: (params: OpenHouseLeadEntity.pick({...})>): OpenHouseLead => {
    return OpenHouseLeadEntitySchema.parse({
      id: uuidv7(),
      etc: params.etc
    });
  },
};
```

### 2.3 Repository Interface

`features/openhouse/domain/interface.openhouse.repository.ts`:

```typescript
import type { OpenHouse, OpenHouseLead } from "./openhouse.entity";

export interface IOpenHouseRepository {
  create(params: {
    organizationId: string;
    createdByUserId: string;
    propertyAddress: string;
    listingPrice: number;
    date: Date;
    startTime: string;
    endTime: string;
    listingImageUrl: string | null;
    notes: string | null;
  }): Promise<OpenHouse>;

  findById(id: string): Promise<OpenHouse | null>;

  findByOrgAndUser(organizationId: string, userId: string): Promise<OpenHouse[]>;

  findPublicById(id: string): Promise<OpenHouse | null>;

  createLead(params: {
    openHouseId: string;
    organizationId: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    workingWithAgent: boolean;
  }): Promise<OpenHouseLead>;

  findLeadsByOpenHouseId(openHouseId: string): Promise<OpenHouseLead[]>;

  findLeadsByOpenHouseIdAndOrg(openHouseId: string, organizationId: string): Promise<OpenHouseLead[]>;
}
```

### 2.4 Repository Implementation

`features/openhouse/infra/db.openhouse.repository.ts`:

```typescript
import { db } from "@packages/database";
import { openHouse, openHouseLead } from "@packages/database/src/schemas/openhouse.schema";
import { eq, and, desc } from "drizzle-orm";
import type { IOpenHouseRepository } from "../domain/interface.openhouse.repository";
import type { OpenHouse, OpenHouseLead } from "../domain/openhouse.entity";

export class DbOpenHouseRepository implements IOpenHouseRepository {
  async create(params: any): Promise<OpenHouse> {
    const [result] = await db
      .insert(openHouse)
      .values({
        organizationId: params.organizationId,
        createdByUserId: params.createdByUserId,
        propertyAddress: params.propertyAddress,
        listingPrice: params.listingPrice,
        date: params.date,
        startTime: params.startTime,
        endTime: params.endTime,
        listingImageUrl: params.listingImageUrl,
        notes: params.notes,
      })
      .returning();

    return result as OpenHouse;
  }

  async findById(id: string): Promise<OpenHouse | null> {
    const [result] = await db
      .select()
      .from(openHouse)
      .where(eq(openHouse.id, id))
      .limit(1);

    return result || null;
  }

  findByOrgAndUser(organizationId: string, userId: string): Promise<OpenHouse[]> {
    return db
      .select()
      .from(openHouse)
      .where(
        and(
          eq(openHouse.organizationId, organizationId),
          eq(openHouse.createdByUserId, userId)
        )
      )
      .orderBy(desc(openHouse.date), desc(openHouse.createdAt));
  }

  async findPublicById(id: string): Promise<OpenHouse | null> {
    const [result] = await db
      .select({
        id: openHouse.id,
        propertyAddress: openHouse.propertyAddress,
        date: openHouse.date,
        startTime: openHouse.startTime,
        endTime: openHouse.endTime,
      })
      .from(openHouse)
      .where(eq(openHouse.id, id))
      .limit(1);

    return result || null;
  }

  async createLead(params: any): Promise<OpenHouseLead> {
    const [result] = await db
      .insert(openHouseLead)
      .values({
        openHouseId: params.openHouseId,
        organizationId: params.organizationId,
        firstName: params.firstName,
        lastName: params.lastName,
        email: params.email,
        phone: params.phone,
        workingWithAgent: params.workingWithAgent,
      })
      .returning();

    return result as OpenHouseLead;
  }

  findLeadsByOpenHouseId(openHouseId: string): Promise<OpenHouseLead[]> {
    return db
      .select()
      .from(openHouseLead)
      .where(eq(openHouseLead.openHouseId, openHouseId))
      .orderBy(openHouseLead.submittedAt);
  }

  findLeadsByOpenHouseIdAndOrg(
    openHouseId: string,
    organizationId: string
  ): Promise<OpenHouseLead[]> {
    return db
      .select()
      .from(openHouseLead)
      .where(
        and(
          eq(openHouseLead.openHouseId, openHouseId),
          eq(openHouseLead.organizationId, organizationId)
        )
      )
      .orderBy(openHouseLead.submittedAt);
  }
}
```

### 2.5 Service Layer

`features/openhouse/service/openhouse.service.ts`:

```typescript
import type { IOpenHouseRepository } from "../domain/interface.openhouse.repository";
import type {
  CreateOpenHouseInput,
  CreateOpenHouseLeadInput,
} from "../api/openhouse.schemas";

export class OpenHouseService {
  constructor(private repository: IOpenHouseRepository) {}

  async createOpenHouse(
    data: CreateOpenHouseInput,
    organizationId: string,
    userId: string
  ) {
    return this.repository.create({
      ...data,
      organizationId,
      createdByUserId: userId,
    });
  }

  async getOpenHouses(organizationId: string, userId: string) {
    return this.repository.findByOrgAndUser(organizationId, userId);
  }

  async getOpenHouse(id: string) {
    return this.repository.findById(id);
  }

  async getPublicOpenHouse(id: string) {
    return this.repository.findPublicById(id);
  }

  async createOpenHouseLead(
    openHouseId: string,
    data: CreateOpenHouseLeadInput,
    organizationId: string
  ) {
    return this.repository.createLead({
      ...data,
      openHouseId,
      organizationId,
    });
  }

  async getOpenHouseLeads(openHouseId: string) {
    return this.repository.findLeadsByOpenHouseId(openHouseId);
  }

  async getOpenHouseLeadsOrg(openHouseId: string, organizationId: string) {
    return this.repository.findLeadsByOpenHouseIdAndOrg(openHouseId, organizationId);
  }
}
```

### 2.6 Controller

`features/openhouse/api/openhouse.controller.ts`:

```typescript
import { OpenHouseService } from "../service/openhouse.service";
import { DbOpenHouseRepository } from "../infra/db.openhouse.repository";
import type { CreateOpenHouseInput, CreateOpenHouseLeadInput } from "./openhouse.schemas";
import { HTTPException } from "hono/http-exception";

const repository = new DbOpenHouseRepository();
const service = new OpenHouseService(repository);

export const openhouseController = {
  createOpenHouse: async (c: any) => {
    const userId = c.get("session")?.userId;
    const organizationId = c.get("session")?.activeOrganizationId;

    if (!userId || !organizationId) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const data = c.get("validatedData") as CreateOpenHouseInput;
    const openHouse = await service.createOpenHouse(data, organizationId, userId);

    return c.json({ data: openHouse }, 201);
  },

  getOpenHouses: async (c: any) => {
    const userId = c.get("session")?.userId;
    const organizationId = c.get("session")?.activeOrganizationId;

    if (!userId || !organizationId) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const openHouses = await service.getOpenHouses(organizationId, userId);
    return c.json({ data: openHouses });
  },

  getOpenHouse: async (c: any) => {
    const userId = c.get("session")?.userId;
    const organizationId = c.get("session")?.activeOrganizationId;

    if (!userId || !organizationId) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const { id } = c.get("params");
    const openHouse = await service.getOpenHouse(id);

    if (!openHouse || openHouse.organizationId !== organizationId) {
      throw new HTTPException(404, { message: "Open house not found" });
    }

    return c.json({ data: openHouse });
  },

  getPublicOpenHouse: async (c: any) => {
    const { id } = c.get("params");
    const openHouse = await service.getPublicOpenHouse(id);

    if (!openHouse) {
      throw new HTTPException(404, { message: "Open house not found" });
    }

    return c.json({ data: openHouse });
  },

  createOpenHouseLead: async (c: any) => {
    const { id: openHouseId } = c.get("params");
    const openHouse = await service.getOpenHouse(openHouseId);

    if (!openHouse) {
      throw new HTTPException(404, { message: "Open house not found" });
    }

    const data = c.get("validatedData") as CreateOpenHouseLeadInput;
    const lead = await service.createOpenHouseLead(
      openHouseId,
      data,
      openHouse.organizationId
    );

    return c.json({ data: lead }, 201);
  },

  getOpenHouseLeads: async (c: any) => {
    const organizationId = c.get("session")?.activeOrganizationId;

    if (!organizationId) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const { id } = c.get("params");
    const leads = await service.getOpenHouseLeadsOrg(id, organizationId);

    return c.json({ data: leads });
  },
};
```

### 2.7 Routes

`features/openhouse/api/openhouse.routes.ts`:

```typescript
import { Hono } from "hono";
import { openhouseController } from "./openhouse.controller";
import { createValidator } from "@middlewares/validation.middleware";
import {
  CreateOpenHouseSchema,
  CreateOpenHouseLeadSchema,
  OpenHouseIdParamsSchema,
} from "./openhouse.schemas";
import { authMiddleware } from "@middlewares/auth.middleware";

const openhouseRoutes = new Hono();

// Auth middleware for protected routes
openhouseRoutes.use("*", authMiddleware);

// Create open house
openhouseRoutes.post(
  "/",
  createValidator(CreateOpenHouseSchema),
  openhouseController.createOpenHouse
);

// Get all open houses for user's org
openhouseRoutes.get("/", openhouseController.getOpenHouses);

// Get open house by id
openhouseRoutes.get(
  "/:id",
  createValidator(OpenHouseIdParamsSchema, "params"),
  openhouseController.getOpenHouse
);

// Get public open house info (no auth)
openhouseRoutes.get(
  "/:id/public",
  createValidator(OpenHouseIdParamsSchema, "params"),
  openhouseController.getPublicOpenHouse
);

// Submit visitor lead (no auth)
openhouseRoutes.post(
  "/:id/sign-in",
  createValidator(OpenHouseIdParamsSchema, "params"),
  createValidator(CreateOpenHouseLeadSchema),
  openhouseController.createOpenHouseLead
);

// Get leads for open house
openhouseRoutes.get(
  "/:id/leads",
  createValidator(OpenHouseIdParamsSchema, "params"),
  openhouseController.getOpenHouseLeads
);

export { openhouseRoutes };
```

### 2.8 Mount Routes in API

Edit `apps/api/src/index.ts`:

```typescript
import { openhouseRoutes } from "@features/openhouse/api/openhouse.routes";

app.route("/api/open-houses", openhouseRoutes);
```

---

## Phase 3: Vite App Setup

### 3.1 Initialize apps/openhouse

Create a new Vite + React + TypeScript project:

```bash
pnpm create vite apps/openhouse --template react-ts
cd apps/openhouse
pnpm install
```

### 3.2 Install Dependencies

```bash
cd apps/openhouse

# Core
pnpm add react react-dom

# Routing
pnpm add @tanstack/react-router

# State management
pnpm add zustand @tanstack/react-query

# Forms & validation
pnpm add @tanstack/react-form zod

# HTTP
pnpm add axios

# Utilities
pnpm add date-fns qrcode @types/qrcode

# Shadcn dependencies (install as needed)
pnpm add class-variance-authority clsx tailwind-merge lucide-react
pnpm add -D tailwindcss postcss autoprefixer
```

### 3.3 Configure Vite

`apps/openhouse/vite.config.ts`:

```typescript
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@packages/*": path.resolve(__dirname, "../../packages/*"),
      "@features/*": path.resolve(__dirname, "./src/features/*"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
```

### 3.4 App Structure

```
apps/openhouse/src/
├── main.tsx
├── App.tsx
├── routes/
│   ├── index.ts                  # Create and export router
│   ├── openHouses.routes.ts      # Open houses routes
│   └── signIn.routes.ts          # Sign-in routes
├── pages/
│   ├── DashboardPage.tsx
│   ├── CreateOpenHousePage.tsx
│   ├── OpenHouseDetailPage.tsx
│   └── VisitorSignInPage.tsx
├── providers/
│   ├── AuthProvider.tsx
│   ├── OrgProvider.tsx
│   └── QueryClientProvider.tsx
├── features/
│   └── openhouse/
│       ├── api/
│       │   └── openhouse.api.ts  # Separated API layer
│       ├── stores/
│       │   └── auth.store.ts
│       └── types/
│           └── openhouse.types.ts
├── components/
│   ├── ui/                       # Shadcn components
│   └── openhouse/
│       ├── OpenHouseCard.tsx
│       ├── OpenHouseTabs.tsx
│       ├── QRCodeDisplay.tsx
│       └── LeadList.tsx
└── lib/
    ├── axios.ts
    └── utils.ts
```

### 3.5 TanStack Router Programmatic Setup

`routes/index.ts`:

```typescript
import { createRouter, createRoute, createRootRoute } from "@tanstack/react-router";
import DashboardPage from "../pages/DashboardPage";
import CreateOpenHousePage from "../pages/CreateOpenHousePage";
import OpenHouseDetailPage from "../pages/OpenHouseDetailPage";
import VisitorSignInPage from "../pages/VisitorSignInPage";

const rootRoute = createRootRoute({
  component: () => {
    const Outlet = rootRoute.useOutlet();
    return <Outlet />;
  },
});

const openHousesIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/open-houses",
  component: DashboardPage,
});

const createOpenHouseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/open-houses/new",
  component: CreateOpenHousePage,
});

const openHouseDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/open-houses/$id",
  component: OpenHouseDetailPage,
});

const visitorSignInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sign-in/$openHouseId",
  component: VisitorSignInPage,
});

const router = createRouter({
  routeTree: rootRoute.addChildren([
    openHousesIndexRoute,
    createOpenHouseRoute,
    openHouseDetailRoute,
    visitorSignInRoute,
  ]),
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export { router };
```

### 3.6 App Entry Point

`App.tsx`:

```typescript
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./routes";
import { AuthProvider } from "./providers/AuthProvider";
import { OrgProvider } from "./providers/OrgProvider";
import { QueryClientProvider } from "./providers/QueryClientProvider";

function App() {
  return (
    <QueryClientProvider>
      <AuthProvider>
        <OrgProvider>
          <RouterProvider router={router} />
        </OrgProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
```

`main.tsx`:

```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 3.7 Axios Configuration

`lib/axios.ts`:

```typescript
import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add session cookie support
apiClient.defaults.withCredentials = true;

export default apiClient;
```

---

## Phase 4: Frontend Pages & Features

### 4.1 Auth Provider

`providers/AuthProvider.tsx`:

```typescript
import { create } from "zustand";
import { useEffect } from "react";
import apiClient from "../lib/axios";

interface Session {
  user: {
    id: string;
    email: string;
    name: string;
  };
  session: {
    token: string;
  };
}

interface AuthState {
  session: Session | null;
  isLoading: boolean;
  fetchSession: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isLoading: true,
  fetchSession: async () => {
    try {
      const response = await apiClient.get("/auth/get-session");
      set({ session: response.data, isLoading: false });
    } catch (error) {
      set({ session: null, isLoading: false });
    }
  },
  logout: async () => {
    try {
      await apiClient.post("/auth/sign-out");
      set({ session: null });
    } catch (error) {
      console.error("Logout failed", error);
    }
  },
}));

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const fetchSession = useAuthStore((state) => state.fetchSession);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  return <>{children}</>;
}
```

### 4.2 Org Provider

`providers/OrgProvider.tsx`:

```typescript
import { create } from "zustand";
import { useEffect } from "react";
import { useAuthStore } from "./AuthProvider";

interface OrgState {
  organizationId: string | null;
  setOrganizationId: (id: string) => void;
}

export const useOrgStore = create<OrgState>((set) => ({
  organizationId: null,
  setOrganizationId: (id) => set({ organizationId: id }),
}));

export function OrgProvider({ children }: { children: React.ReactNode }) {
  const session = useAuthStore((state) => state.session);
  const setOrganizationId = useOrgStore((state) => state.setOrganizationId);

  useEffect(() => {
    if (session?.session?.activeOrganizationId) {
      setOrganizationId(session.session.activeOrganizationId);
    }
  }, [session, setOrganizationId]);

  return <>{children}</>;
}
```

### 4.3 Query Client Provider

`providers/QueryClientProvider.tsx`:

```typescript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function QueryClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TanStackQueryClientProvider client={queryClient}>
      {children}
    </TanStackQueryClientProvider>
  );
}
```

### 4.4 API Layer (Separated for Future Proofing)

`features/openhouse/api/openhouse.api.ts`:

```typescript
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../lib/axios";

// Types
interface OpenHouse {
  id: string;
  organizationId: string;
  createdByUserId: string;
  propertyAddress: string;
  listingPrice: number;
  date: string;
  startTime: string;
  endTime: string;
  listingImageUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface OpenHouseLead {
  id: string;
  openHouseId: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  workingWithAgent: boolean;
  submittedAt: string;
}

interface CreateOpenHouseInput {
  propertyAddress: string;
  listingPrice: number;
  date: string;
  startTime: string;
  endTime: string;
  listingImageUrl?: string;
  notes?: string;
}

interface CreateOpenHouseLeadInput {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  workingWithAgent: boolean;
}

// API functions
const openhouseApi = {
  getOpenHouses: async () => {
    const response = await apiClient.get<{ data: OpenHouse[] }>("/open-houses");
    return response.data.data;
  },

  getOpenHouse: async (id: string) => {
    const response = await apiClient.get<{ data: OpenHouse }>(`/open-houses/${id}`);
    return response.data.data;
  },

  getPublicOpenHouse: async (id: string) => {
    const response = await apiClient.get<{ data: Pick<OpenHouse, "id" | "propertyAddress" | "date" | "startTime" | "endTime"> }>(`/open-houses/${id}/public`);
    return response.data.data;
  },

  createOpenHouse: async (data: CreateOpenHouseInput) => {
    const response = await apiClient.post<{ data: OpenHouse }>("/open-houses", data);
    return response.data.data;
  },

  getOpenHouseLeads: async (id: string) => {
    const response = await apiClient.get<{ data: OpenHouseLead[] }>(`/open-houses/${id}/leads`);
    return response.data.data;
  },

  createOpenHouseLead: async (id: string, data: CreateOpenHouseLeadInput) => {
    const response = await apiClient.post<{ data: OpenHouseLead }>(`/open-houses/${id}/sign-in`, data);
    return response.data.data;
  },
};

// React Query hooks
export function useOpenHouses() {
  return useQuery({
    queryKey: ["open-houses"],
    queryFn: openhouseApi.getOpenHouses,
  });
}

export function useOpenHouse(id: string) {
  return useQuery({
    queryKey: ["open-houses", id],
    queryFn: () => openhouseApi.getOpenHouse(id),
  });
}

export function usePublicOpenHouse(id: string) {
  return useQuery({
    queryKey: ["open-houses", id, "public"],
    queryFn: () => openhouseApi.getPublicOpenHouse(id),
  });
}

export function useCreateOpenHouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: openhouseApi.createOpenHouse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["open-houses"] });
    },
  });
}

export function useOpenHouseLeads(id: string) {
  return useQuery({
    queryKey: ["open-houses", id, "leads"],
    queryFn: () => openhouseApi.getOpenHouseLeads(id),
  });
}

export function useCreateOpenHouseLead(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOpenHouseLeadInput) => openhouseApi.createOpenHouseLead(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["open-houses", id, "leads"] });
    },
  });
}
```

### 4.5 Dashboard Page

`pages/DashboardPage.tsx`:

```typescript
import { useOpenHouses, useCreateOpenHouse } from "../features/openhouse/api/openhouse.api";
import { useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Plus } from "lucide-react";

export default function DashboardPage() {
  const { data: openHouses, isLoading, error } = useOpenHouses();
  const navigate = useNavigate();
  const createOpenHouse = useCreateOpenHouse();

  const handleCreate = async () => {
    navigate({ to: "/open-houses/new" });
  };

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4">Error loading open houses</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Open Houses</h1>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Create Open House
        </Button>
      </div>

      {openHouses && openHouses.length > 0 ? (
        <div className="space-y-3">
          {openHouses.map((oh) => (
            <Card
              key={oh.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate({ to: `/open-houses/${oh.id}` })}
            >
              <CardHeader>
                <CardTitle className="text-lg">{oh.propertyAddress}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{format(new Date(oh.date), "MMM d, yyyy")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span>{oh.startTime} - {oh.endTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span>${Number(oh.listingPrice).toLocaleString()}</span>
                  </div>
                  <div className="pt-2">
                    <Badge variant={new Date(oh.date) > new Date() ? "default" : "secondary"}>
                      {new Date(oh.date) > new Date() ? "Upcoming" : "Past"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>No open houses yet</p>
          <p className="text-sm">Create your first open house to get started</p>
        </div>
      )}
    </div>
  );
}
```

### 4.6 Create Open House Page

`pages/CreateOpenHousePage.tsx`:

```typescript
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { useCreateOpenHouse } from "../features/openhouse/api/openhouse.api";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { z } from "zod";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";

const createOpenHouseSchema = z.object({
  propertyAddress: z.string().min(1, "Address is required"),
  listingPrice: z.number().positive("Price must be positive"),
  date: z.string(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
  listingImageUrl: z.string().url().optional().or(z.literal("")),
  notes: z.string().optional(),
});

export default function CreateOpenHousePage() {
  const navigate = useNavigate();
  const createOpenHouse = useCreateOpenHouse();

  const form = useForm({
    defaultValues: {
      propertyAddress: "",
      listingPrice: 0,
      date: "",
      startTime: "",
      endTime: "",
      listingImageUrl: "",
      notes: "",
    },
    onSubmit: async ({ value }) => {
      try {
        await createOpenHouse.mutateAsync(value);
        navigate({ to: "/open-houses" });
      } catch (error) {
        console.error("Failed to create open house", error);
      }
    },
    validatorAdapter: zodValidator(),
  });

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Open House</h1>
      <form.Provider>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
            name="propertyAddress"
            validators={{
              onChange: createOpenHouseSchema.shape.propertyAddress,
            }}
          >
            {(field) => (
              <div>
                <Label htmlFor={field.name}>Property Address</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive mt-1">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="listingPrice"
            validators={{
              onChange: createOpenHouseSchema.shape.listingPrice,
            }}
          >
            {(field) => (
              <div>
                <Label htmlFor={field.name}>Listing Price</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="number"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive mt-1">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="date"
            validators={{
              onChange: createOpenHouseSchema.shape.date,
            }}
          >
            {(field) => (
              <div>
                <Label htmlFor={field.name}>Date</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="date"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>

          <div className="grid grid-cols-2 gap-4">
            <form.Field
              name="startTime"
              validators={{
                onChange: createOpenHouseSchema.shape.startTime,
              }}
            >
              {(field) => (
                <div>
                  <Label htmlFor={field.name}>Start Time</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="time"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field
              name="endTime"
              validators={{
                onChange: createOpenHouseSchema.shape.endTime,
              }}
            >
              {(field) => (
                <div>
                  <Label htmlFor={field.name}>End Time</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="time"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
          </div>

          <form.Field
            name="listingImageUrl"
            validators={{
              onChange: createOpenHouseSchema.shape.listingImageUrl,
            }}
          >
            {(field) => (
              <div>
                <Label htmlFor={field.name}>Listing Image URL (Optional)</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="url"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="notes">
            {(field) => (
              <div>
                <Label htmlFor={field.name}>Notes (Optional)</Label>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>

          <Button type="submit" className="w-full" disabled={form.state.isSubmitting}>
            {form.state.isSubmitting ? "Creating..." : "Create Open House"}
          </Button>
        </form>
      </form.Provider>
    </div>
  );
}
```

### 4.7 Open House Detail Page

`pages/OpenHouseDetailPage.tsx`:

```typescript
import { useOpenHouse, useOpenHouseLeads } from "../features/openhouse/api/openhouse.api";
import { useParams } from "@tanstack/react-router";
import { format } from "date-fns";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import QRCodeDisplay from "../components/openhouse/QRCodeDisplay";
import LeadList from "../components/openhouse/LeadList";
import { Copy, ArrowLeft } from "lucide-react";

export default function OpenHouseDetailPage() {
  const { id } = useParams({ from: "/open-houses/$id" });
  const { data: openHouse, isLoading, error } = useOpenHouse(id);
  const { data: leads } = useOpenHouseLeads(id);

  const signInUrl = `${window.location.origin}/sign-in/${id}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(signInUrl);
  };

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error || !openHouse) {
    return <div className="p-4">Open house not found</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <Button variant="ghost" onClick={() => window.history.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{openHouse.propertyAddress}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span>Date:</span>
            <span className="font-medium">{format(new Date(openHouse.date), "MMM d, yyyy")}</span>
          </div>
          <div className="flex justify-between">
            <span>Time:</span>
            <span className="font-medium">{openHouse.startTime} - {openHouse.endTime}</span>
          </div>
          <div className="flex justify-between">
            <span>Price:</span>
            <span className="font-medium">${Number(openHouse.listingPrice).toLocaleString()}</span>
          </div>
          {openHouse.listingImageUrl && (
            <img
              src={openHouse.listingImageUrl}
              alt="Listing"
              className="w-full h-48 object-cover rounded-md"
            />
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="qr">QR & Flyer</TabsTrigger>
          <TabsTrigger value="leads">
            Leads
            {leads && leads.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {leads.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sign-In Link</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input value={signInUrl} readOnly className="flex-1" />
                <Button onClick={copyLink}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qr" className="space-y-4 mt-4">
          <QRCodeDisplay url={signInUrl} address={openHouse.propertyAddress} />
        </TabsContent>

        <TabsContent value="leads" className="mt-4">
          <LeadList leads={leads || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### 4.8 QR Code Display Component

`components/openhouse/QRCodeDisplay.tsx`:

```typescript
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Button } from "../ui/button";
import { Download } from "lucide-react";

interface QRCodeDisplayProps {
  url: string;
  address: string;
}

export default function QRCodeDisplay({ url, address }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrGenerated, setQrGenerated] = useState(false);

  useEffect(() => {
    const generateQR = async () => {
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, url, {
          width: 256,
          margin: 2,
        });
        setQrGenerated(true);
      }
    };
    generateQR();
  }, [url]);

  const downloadQR = () => {
    if (canvasRef.current) {
      const link = document.createElement("a");
      link.download = `qr-${address.replace(/\s+/g, "-")}.png`;
      link.href = canvasRef.current.toDataURL("image/png");
      link.click();
    }
  };

  const printFlyer = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Open House Flyer - ${address}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 40px;
                max-width: 600px;
                margin: 0 auto;
              }
              h1 {
                margin-bottom: 10px;
              }
              p {
                margin: 10px 0;
                font-size: 18px;
              }
              .qr-code {
                margin: 30px auto;
                display: block;
              }
              .scan-text {
                font-size: 24px;
                font-weight: bold;
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <h1>Open House</h1>
            <p>${address}</p>
            <canvas id="qr-code" class="qr-code"></canvas>
            <p class="scan-text">Scan to Sign In</p>
            <script>
              const canvas = document.getElementById('qr-code');
              QRCode.toCanvas(canvas, '${url}', { width: 300, margin: 2 });
            </script>
            <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <canvas ref={canvasRef} className="border rounded-lg" />
      </div>
      <div className="flex gap-2 justify-center">
        <Button onClick={downloadQR} disabled={!qrGenerated}>
          <Download className="w-4 h-4 mr-2" />
          Download QR
        </Button>
        <Button onClick={printFlyer} disabled={!qrGenerated} variant="outline">
          Print Flyer
        </Button>
      </div>
    </div>
  );
}
```

### 4.9 Lead List Component

`components/openhouse/LeadList.tsx`:

```typescript
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { formatDistanceToNow } from "date-fns";

interface OpenHouseLead {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  workingWithAgent: boolean;
  submittedAt: string;
}

interface LeadListProps {
  leads: OpenHouseLead[];
}

export default function LeadList({ leads }: LeadListProps) {
  if (leads.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No leads yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {leads.map((lead) => (
        <Card key={lead.id}>
          <CardHeader>
            <CardTitle className="text-base">
              {lead.firstName} {lead.lastName}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {lead.email && (
              <div className="flex justify-between">
                <span>Email:</span>
                <span>{lead.email}</span>
              </div>
            )}
            {lead.phone && (
              <div className="flex justify-between">
                <span>Phone:</span>
                <span>{lead.phone}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2">
              <Badge variant={lead.workingWithAgent ? "default" : "secondary"}>
                {lead.workingWithAgent ? "Has Agent" : "No Agent"}
              </Badge>
              <span className="text-muted-foreground">
                {formatDistanceToNow(new Date(lead.submittedAt), { addSuffix: true })}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

### 4.10 Visitor Sign-In Page

`pages/VisitorSignInPage.tsx`:

```typescript
import { useForm } from "@tanstack/react-form";
import { usePublicOpenHouse, useCreateOpenHouseLead } from "../features/openhouse/api/openhouse.api";
import { useParams } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { z } from "zod";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { format } from "date-fns";

const createLeadSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  workingWithAgent: z.boolean().default(false),
}).refine(
  (data) => data.email || data.phone,
  { message: "Email or phone is required" }
);

export default function VisitorSignInPage() {
  const { openHouseId } = useParams({ from: "/sign-in/$openHouseId" });
  const { data: openHouse, isLoading } = usePublicOpenHouse(openHouseId);
  const createLead = useCreateOpenHouseLead(openHouseId);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      workingWithAgent: false,
    },
    onSubmit: async ({ value }) => {
      try {
        await createLead.mutateAsync(value);
        setSubmitted(true);
      } catch (error) {
        console.error("Failed to submit sign-in", error);
      }
    },
    validatorAdapter: zodValidator(),
  });

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (submitted) {
    return (
      <div className="p-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Thank You!</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You've been signed in successfully.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          {openHouse && (
            <p className="text-muted-foreground text-sm">
              {openHouse.propertyAddress} - {format(new Date(openHouse.date), "MMM d, yyyy")}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <form.Provider>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
              className="space-y-4"
            >
              <form.Field
                name="firstName"
                validators={{
                  onChange: createLeadSchema.shape.firstName,
                }}
              >
                {(field) => (
                  <div>
                    <Label htmlFor={field.name}>First Name</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-destructive mt-1">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field
                name="lastName"
                validators={{
                  onChange: createLeadSchema.shape.lastName,
                }}
              >
                {(field) => (
                  <div>
                    <Label htmlFor={field.name}>Last Name</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              </form.Field>

              <form.Field
                name="email"
                validators={{
                  onChange: createLeadSchema.shape.email,
                }}
              >
                {(field) => (
                  <div>
                    <Label htmlFor={field.name}>Email</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              </form.Field>

              <form.Field
                name="phone"
                validators={{
                  onChange: createLeadSchema.shape.phone,
                }}
              >
                {(field) => (
                  <div>
                    <Label htmlFor={field.name}>Phone</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="tel"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              </form.Field>

              <form.Field
                name="workingWithAgent"
              >
                {(field) => (
                  <div className="flex items-center space-x-2">
                    <input
                      id={field.name}
                      name={field.name}
                      type="checkbox"
                      checked={field.state.value}
                      onChange={(e) => field.handleChange(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor={field.name}>
                      Are you currently working with an agent?
                    </Label>
                  </div>
                )}
              </form.Field>

              {form.state.meta.errors.length > 0 && (
                <p className="text-sm text-destructive">
                  {form.state.meta.errors[0]}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={form.state.isSubmitting}>
                {form.state.isSubmitting ? "Submitting..." : "Sign In"}
              </Button>
            </form>
          </form.Provider>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Phase 5: Integration & Polish

### 5.1 Mobile-First Responsive Design

- Use Tailwind's mobile-first approach
- One-column layouts as default
- Add responsive classes for desktop (e.g., `md:grid-cols-2`)
- Large tap targets (min 44px)
- Bottom sheet for modals (if needed)

### 5.2 Error Handling

**API:** HTTPException with meaningful messages

**React:**
- Add ErrorBoundary at root
```typescript
import { ErrorBoundary } from "react-error-boundary";

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="p-4">
      <h1>Something went wrong</h1>
      <p>{error.message}</p>
    </div>
  );
}

// Wrap App with ErrorBoundary
<ErrorBoundary FallbackComponent={ErrorFallback}>
  <App />
</ErrorBoundary>
```

**TanStack Query:**
- Configure retry logic (already in QueryClientProvider)
- Display error messages in UI

### 5.3 Loading States

- Use skeleton screens for cards/lists
- Add loading spinners for buttons during mutations
- Leverage TanStack Query's `isLoading` and `isFetching` states

### 5.4 Type Safety

- All API responses typed
- Zod schemas → inferred types
- Shared types in `features/openhouse/types/`

### 5.5 Code Quality

Run these commands after completing implementation:

```bash
# Format code
pnpm --filter @apps/openhouse biome check --write

# Type check
pnpm --filter @apps/openhouse exec tsc --noEmit

# Run linter (if configured)
pnpm --filter @apps/openhouse lint
```

---

## Additional Notes

### Environment Variables

Create `apps/openhouse/.env`:

```
VITE_API_URL=http://localhost:3001/api
```

### Auth Middleware Implementation

Create `apps/api/src/middlewares/auth.middleware.ts`:

```typescript
import { auth } from "@packages/auth";
import { NextRequest, NextResponse } from "next/server";

export const authMiddleware = async (c: any, next: any) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  c.set("session", session);
  return next();
};
```

### Shadcn UI Setup

Initialize Shadcn UI components:

```bash
cd apps/openhouse
npx shadcn@latest init
```

Install needed components:

```bash
npx shadcn@latest add button card input label textarea tabs badge
```

---

## Execution Order

1. **Phase 0** - Foundation (database scripts, auth export, migrations, mount BetterAuth)
2. **Phase 1** - Open House Database Schema
3. **Phase 2** - API Endpoints
4. **Phase 3** - Vite App Setup
5. **Phase 4** - Frontend Pages & Features
6. **Phase 5** - Integration & Polish

---

## Checklist for Each Phase

### Phase 0
- [ ] Add `db:generate`, `db:migrate`, `db:studio` scripts to packages/database
- [ ] Create `packages/auth/index.ts` with auth export
- [ ] Generate auth migration
- [ ] Run auth migration
- [ ] Create auth feature structure in apps/api
- [ ] Mount BetterAuth at `/api/auth/*`
- [ ] Add `@packages/auth` to api dependencies

### Phase 1
- [ ] Create `openhouse.schema.ts` with OpenHouse and OpenHouseLead tables
- [ ] Add relations to auth.schema.ts
- [ ] Generate openhouse migration
- [ ] Run openhouse migration

### Phase 2
- [ ] Create validation schemas (openhouse.schemas.ts)
- [ ] Create domain entities (openhouse.entity.ts)
- [ ] Create repository interface (interface.openhouse.repository.ts)
- [ ] Create repository implementation (db.openhouse.repository.ts)
- [ ] Create service layer (openhouse.service.ts)
- [ ] Create controller (openhouse.controller.ts)
- [ ] Create routes (openhouse.routes.ts)
- [ ] Mount routes in apps/api

### Phase 3
- [ ] Initialize Vite app
- [ ] Install dependencies
- [ ] Configure Vite with path aliases
- [ ] Create app structure
- [ ] Setup TanStack Router (programmatic)
- [ ] Setup axios client

### Phase 4
- [ ] Create AuthProvider and useAuthStore
- [ ] Create OrgProvider and useOrgStore
- [ ] Create QueryClientProvider
- [ ] Create API layer with hooks
- [ ] Build DashboardPage
- [ ] Build CreateOpenHousePage
- [ ] Build OpenHouseDetailPage
- [ ] Build QRCodeDisplay component
- [ ] Build LeadList component
- [ ] Build VisitorSignInPage

### Phase 5
- [ ] Add mobile-first responsive styles
- [ ] Add error handling
- [ ] Add loading states
- [ ] Run biome format
- [ ] Run typecheck
- [ ] Test the app
