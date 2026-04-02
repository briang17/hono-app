# Cloudinary Image Upload for Open Houses

> **Project**: Replace listingImageUrl text field with Cloudinary signed upload widget supporting multiple images
> **Date**: Wed Apr 01 2026

---

## Phase Checklist

- [ ] **Phase 1**: Environment Configuration — env vars, cloudinary SDK install, frontend env
- [ ] **Phase 2**: Database Schema Changes — remove `listingImageUrl`, add `open_house_image` table, run migration
- [ ] **Phase 3**: Backend — Cloudinary Signature Endpoint — config, handlers, routes, cleanup utility
- [ ] **Phase 4**: Backend — Open House Entity Updates — image schemas, updated OpenHouseSchema
- [ ] **Phase 5**: Backend — Repository Updates — image CRUD methods in interface + Drizzle impl
- [ ] **Phase 6**: Backend — Service Updates — image handling in create, Cloudinary cleanup on delete
- [ ] **Phase 7**: Backend — Handler & Route Updates — register cloudinary routes in index.ts
- [ ] **Phase 8**: Frontend — Cloudinary URL Utility — `cloudinaryUrl()`, `mainImageUrl()`, presets
- [ ] **Phase 9**: Frontend — Schema Updates — remove `listingImageUrl`, add image schemas
- [ ] **Phase 10**: Frontend — API Client & Mutations — cloudinary API client, updated types
- [ ] **Phase 11**: Frontend — Image Upload Widget Component — script loader, React component
- [ ] **Phase 12**: Frontend — Update CreateOpenHouseForm — replace URL input with upload widget
- [ ] **Phase 13**: Frontend — Update Display Components — OpenHouseCard, DetailPage, VisitorSignIn, QRCode
- [ ] **Phase 14**: Migration & Cleanup — run migration, lint, build verification

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Decisions](#architecture-decisions)
3. [Prerequisites](#prerequisites)
4. [Phase 1: Environment Configuration](#phase-1-environment-configuration)
5. [Phase 2: Database Schema Changes](#phase-2-database-schema-changes)
6. [Phase 3: Backend — Cloudinary Signature Endpoint](#phase-3-backend--cloudinary-signature-endpoint)
7. [Phase 4: Backend — Open House Entity Updates](#phase-4-backend--open-house-entity-updates)
8. [Phase 5: Backend — Repository Updates](#phase-5-backend--repository-updates)
9. [Phase 6: Backend — Service Updates](#phase-6-backend--service-updates)
10. [Phase 7: Backend — Handler & Route Updates](#phase-7-backend--handler--route-updates)
11. [Phase 8: Frontend — Cloudinary URL Utility](#phase-8-frontend--cloudinary-url-utility)
12. [Phase 9: Frontend — Schema Updates](#phase-9-frontend--schema-updates)
13. [Phase 10: Frontend — API Client & Mutations](#phase-10-frontend--api-client--mutations)
14. [Phase 11: Frontend — Image Upload Widget Component](#phase-11-frontend--image-upload-widget-component)
15. [Phase 12: Frontend — Update CreateOpenHouseForm](#phase-12-frontend--update-createopenhouseform)
16. [Phase 13: Frontend — Update Display Components](#phase-13-frontend--update-display-components)
17. [Phase 14: Migration & Cleanup](#phase-14-migration--cleanup)
18. [Files Changed Summary](#files-changed-summary)
19. [Testing Checklist](#testing-checklist)

---

## Overview

### Current State
- `listingImageUrl` is a plain `text` column on `open_house` table accepting a URL string
- User types a URL manually into a text input — no upload capability
- Single image only, no gallery
- Images displayed in `OpenHouseCard`, `OpenHouseDetailPage`, `VisitorSignInPage`, `QRCodeDisplay`
- No upload infrastructure, no storage integration, no cloudinary anywhere

### Goals
- Replace URL text input with Cloudinary Upload Widget (signed uploads)
- Support multiple images per open house
- Allow marking one image as "main" (displayed as hero/default)
- Control display order via `order_index`
- Use Cloudinary URL transformations for responsive/optimized images
- Server-side Cloudinary cleanup when open houses are deleted
- Store `publicId` in DB for transformation URLs and deletion

### Scope
- **In scope**: Create flow only (edit/update deferred), signed uploads, image display with transforms, cleanup on delete
- **Out of scope**: Image editing on existing open houses, drag-and-drop reorder (use up/down buttons), image cropping in widget

---

## Architecture Decisions

### Signed Uploads
- Frontend gets a signature from `POST /api/cloudinary/signature` before opening the widget
- Backend uses `cloudinary.utils.api_sign_request()` with the API secret
- Prevents unauthorized uploads — only authenticated org members can get signatures

### No `cloudinary-react` Package
- Upload Widget is vanilla JS loaded from CDN — no React wrapper needed
- Image transformations are URL-based — a small utility function handles them
- Avoids unnecessary frontend dependencies

### Cloudinary URL Utility
- All image display goes through `cloudinaryUrl(publicId, options)` helper
- Enables per-component size/quality/crop customization
- Automatic `q_auto,f_auto` for optimal format and quality via CDN

### Storage Pattern
- Images are uploaded to Cloudinary **before** the open house is created
- Widget callback gives us `{ url, public_id }` per image
- On form submit, we send the image array alongside open house data
- Backend stores image records in `open_house_image` table
- If the user abandons the form, uploaded images remain orphaned in Cloudinary (acceptable for MVP)

---

## Prerequisites

Before implementation, the developer needs:

1. **Cloudinary Account** (free tier): https://cloudinary.com/users/register/free
2. **Credentials from Cloudinary Console** → Settings → API Keys:
   - `Cloud name` (e.g. `my-cloud`)
   - `API Key` (e.g. `123456789012345`)
   - `API Secret` (e.g. `abcdefg...`)
3. **No upload preset needed** — signed uploads use the API secret directly (the backend signs `timestamp` + `folder` with the secret)
4. **Add to `.env`**:
   ```
   CLOUDINARY_CLOUD_NAME=my-cloud
   CLOUDINARY_CLOUD_API_KEY=123456789012345
   CLOUDINARY_CLOUD_API_SECRET=abcdefg...
   CLOUDINARY_URL=cloudinary://123456789012345:abcdefg...@my-cloud
   ```
5. **Frontend env** (`.env` in `apps/frontend-base/` or root):
   ```
   VITE_CLOUDINARY_CLOUD_NAME=my-cloud
   ```
   Note: `VITE_CLOUDINARY_CLOUD_NAME` is the only frontend env var needed. The cloud name is public (used in image URLs). All secrets stay on the backend.

---

## Phase 1: Environment Configuration

### 1.1 Update `packages/env/index.ts`

Add a new `cloudinaryEnv` scope:

```typescript
const cloudinaryEnvScope = {
    name: "cloudinary",
    schema: z.object({
        CLOUDINARY_CLOUD_NAME: z.string().min(1),
        CLOUDINARY_CLOUD_API_KEY: z.string().min(1),
        CLOUDINARY_CLOUD_API_SECRET: z.string().min(1),
        CLOUDINARY_URL: z.string().min(1), // cloudinary://apikey:apisecret@cloudname
    }),
};

const cloudinaryEnv = validate(
    cloudinaryEnvScope.name,
    cloudinaryEnvScope.schema,
    envSource,
);

export { cloudinaryEnv };
```

> **Note**: `CLOUDINARY_URL` follows the standard Cloudinary URL format (`cloudinary://api_key:api_secret@cloud_name`). The Node SDK also supports this natively, but we validate each var separately for explicitness. The individual vars (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_CLOUD_API_KEY`, `CLOUDINARY_CLOUD_API_SECRET`) are used directly in code for clarity.

### 1.2 Install cloudinary SDK in API

```bash
cd apps/api && pnpm add cloudinary
```

### 1.3 Frontend env vars

Create/update `apps/frontend-base/.env`:
```
VITE_CLOUDINARY_CLOUD_NAME=<from cloudinary console>
```

Add to `apps/frontend-base/src/vite-env.d.ts` if not already:
```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_CLOUDINARY_CLOUD_NAME: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
```

---

## Phase 2: Database Schema Changes

### 2.1 Update `packages/database/src/schemas/openhouse.schema.ts`

**Remove** from `openHouse` table:
```typescript
listingImageUrl: text("listing_image_url"),  // DELETE THIS LINE
```

**Add** new table after `openHouse` table definition:
```typescript
export const openHouseImage = pgTable("open_house_image", {
    id: uuid("id").primaryKey().defaultRandom(),
    openHouseId: uuid("open_house_id")
        .notNull()
        .references(() => openHouse.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    publicId: text("public_id").notNull(),
    isMain: boolean("is_main").notNull().default(false),
    orderIndex: integer("order_index").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

**Update** `openHouseRelations` to include images:
```typescript
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
    images: many(openHouseImage),
}));
```

**Add** image relations:
```typescript
export const openHouseImageRelation = relations(openHouseImage, ({ one }) => ({
    openHouse: one(openHouse, {
        fields: [openHouseImage.openHouseId],
        references: [openHouse.id],
    }),
}));
```

**Add** export types:
```typescript
export type InsertOpenHouseImage = typeof openHouseImage.$inferInsert;
export type SelectOpenHouseImage = typeof openHouseImage.$inferSelect;
```

### 2.2 Generate and run migration

```bash
pnpm --filter @packages/database db:generate
pnpm --filter @packages/database db:migrate
```

---

## Phase 3: Backend — Cloudinary Signature Endpoint

### 3.1 Create `apps/api/src/features/cloudinary/`

New files:

**`apps/api/src/features/cloudinary/cloudinary.config.ts`**
```typescript
import { cloudinaryEnv } from "@packages/env";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: cloudinaryEnv.CLOUDINARY_CLOUD_NAME,
    api_key: cloudinaryEnv.CLOUDINARY_CLOUD_API_KEY,
    api_secret: cloudinaryEnv.CLOUDINARY_CLOUD_API_SECRET,
    secure: true,
});

export { cloudinary };
```

**`apps/api/src/features/cloudinary/api/cloudinary.handlers.ts`**
```typescript
import { orgFactory } from "@lib/factory";
import { cloudinaryEnv } from "@packages/env";
import { cloudinary } from "../cloudinary.config";

export const getSignatureHandlers = orgFactory.createHandlers(
    async (c) => {
        const timestamp = Math.round(new Date().getTime() / 1000);

        const paramsToSign = {
            timestamp,
            folder: "open-houses",
        };

        const signature = cloudinary.utils.api_sign_request(
            paramsToSign,
            cloudinaryEnv.CLOUDINARY_CLOUD_API_SECRET,
        );

        return c.json({
            data: {
                signature,
                timestamp,
                apiKey: cloudinaryEnv.CLOUDINARY_CLOUD_API_KEY,
                cloudName: cloudinaryEnv.CLOUDINARY_CLOUD_NAME,
            },
        });
    },
);
```

> **Note**: For signed uploads, no upload preset is needed. The backend signs `timestamp` + `folder` directly with the API secret. The widget sends these alongside the signature to Cloudinary.

**`apps/api/src/features/cloudinary/api/cloudinary.routes.ts`**
```typescript
import { Hono } from "hono";
import { authMiddleware } from "@middlewares/auth.middleware";
import { orgMiddleware } from "@middlewares/org.middleware";
import { getSignatureHandlers } from "./cloudinary.handlers";

const cloudinaryRoutes = new Hono()
    .use(authMiddleware)
    .use(orgMiddleware)
    .post("/signature", ...getSignatureHandlers);

export { cloudinaryRoutes };
```

### 3.2 Register route in `apps/api/src/index.ts`

```typescript
import { cloudinaryRoutes } from "./features/cloudinary/api/cloudinary.routes";

const featureRoutes = apiV1
    .route("/api/open-houses", openhouseRoutes)
    .route("/api/public/open-houses", publicOpenHouseRoutes)
    .route("/api/form-config", formConfigRoutes)
    .route("/api/agents", agentRoutes)
    .route("/api/cloudinary", cloudinaryRoutes);
```

### 3.3 Cloudinary cleanup utility

**`apps/api/src/features/cloudinary/cloudinary.utils.ts`**
```typescript
import { cloudinary } from "./cloudinary.config";

export async function deleteCloudinaryImages(publicIds: string[]): Promise<void> {
    if (publicIds.length === 0) return;

    await Promise.all(
        publicIds.map((publicId) =>
            cloudinary.uploader.destroy(publicId).catch((err) => {
                console.error(`Failed to delete Cloudinary image ${publicId}:`, err);
            }),
        ),
    );
}
```

---

## Phase 4: Backend — Open House Entity Updates

### 4.1 Update `apps/api/src/features/openhouse/domain/openhouse.entity.ts`

**Add** image schema (after imports, before `OpenHouseSchema`):
```typescript
export const OpenHouseImageSchema = z.object({
    id: IdSchema,
    openHouseId: IdSchema,
    url: z.url(),
    publicId: z.string().min(1),
    isMain: z.boolean(),
    orderIndex: z.number().int().min(0),
    createdAt: DateSchema,
});

export const NewOpenHouseImageSchema = z.object({
    url: z.url(),
    publicId: z.string().min(1),
    isMain: z.boolean().default(false),
    orderIndex: z.number().int().min(0).default(0),
});

export type OpenHouseImage = z.infer<typeof OpenHouseImageSchema>;
export type NewOpenHouseImageInput = z.infer<typeof NewOpenHouseImageSchema>;
```

**Modify** `OpenHouseSchema`:
- Remove `listingImageUrl` field
- Add `images: z.array(OpenHouseImageSchema).default([])`

```typescript
export const OpenHouseSchema = z.object({
    id: IdSchema,
    organizationId: IdSchema,
    createdByUserId: IdSchema,
    propertyAddress: z.string().min(1, "Address is required"),
    listingPrice: z.number().positive("Price must be positive"),
    date: DateSchema,
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
    notes: z.string().nullish(),
    images: z.array(OpenHouseImageSchema).default([]),
    createdAt: DateSchema,
    updatedAt: DateSchema,
});
```

**Modify** `NewOpenHouseSchema`:
- Remove `listingImageUrl` from pick
- Add `images` field

```typescript
export const NewOpenHouseSchema = OpenHouseSchema.pick({
    propertyAddress: true,
    listingPrice: true,
    date: true,
    startTime: true,
    endTime: true,
    notes: true,
}).extend({
    images: z.array(NewOpenHouseImageSchema).min(0).default([]),
}).refine((data) => data.startTime < data.endTime, {
    error: "End time must be after start time",
    path: ["endTime"],
});
```

**Modify** `PublicOpenHouseSchema`:
- Remove `listingImageUrl`
- Add `images`

```typescript
export const PublicOpenHouseSchema = z.object({
    id: IdSchema,
    propertyAddress: z.string().min(1),
    date: DateSchema,
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
    formConfig: FormConfigSchema.nullable(),
    images: z.array(OpenHouseImageSchema).default([]),
});
```

**Modify** `OpenHouseFactory.create`:
- Accept images but don't include them in the parse (they're created separately in DB)
- The factory creates the open house row; images are inserted via repository

```typescript
export const OpenHouseFactory = {
    create: (
        params: z.input<typeof NewOpenHouseSchema>,
        organizationId: Id,
        userId: Id,
    ): { openHouse: Omit<OpenHouse, "images">; images: NewOpenHouseImageInput[] } => {
        const now = new Date();
        const { images, ...openHouseData } = params;
        const result = OpenHouseSchema.omit({ images: true }).parse({
            ...openHouseData,
            id: Bun.randomUUIDv7(),
            organizationId,
            createdByUserId: userId,
            createdAt: now,
            updatedAt: now,
        });
        return { openHouse: result, images: images ?? [] };
    },
    fromDb: (params: z.input<typeof OpenHouseSchema>): OpenHouse => {
        const result = OpenHouseSchema.parse(params);
        return result;
    },
};
```

---

## Phase 5: Backend — Repository Updates

### 5.1 Update `apps/api/src/features/openhouse/domain/interface.openhouse.repository.ts`

Add image-related methods to the interface:

```typescript
import type { OpenHouseImage, NewOpenHouseImageInput } from "./openhouse.entity";

export interface IOpenHouseRepository {
    create(params: Omit<OpenHouse, "images">): Promise<OpenHouse>;
    findById(id: Id): Promise<OpenHouse | null>;
    findByOrgAndUser(organizationId: Id, userId: Id): Promise<OpenHouse[]>;
    findPublicById(id: Id): Promise<OpenHouse | null>;
    findPublicByIdWithFormConfig(id: Id): Promise<PublicOpenHouse | null>;
    createImages(openHouseId: Id, images: NewOpenHouseImageInput[]): Promise<OpenHouseImage[]>;
    findImagesByOpenHouseId(openHouseId: Id): Promise<OpenHouseImage[]>;
    findImagePublicIdsByOpenHouseId(openHouseId: Id): Promise<string[]>;
    delete(openHouseId: Id): Promise<void>;
    createLead(params: OpenHouseLead): Promise<OpenHouseLead>;
    findLeadsByOpenHouseId(openHouseId: Id): Promise<OpenHouseLead[]>;
    findLeadsByOpenHouseIdAndOrg(openHouseId: Id, organizationId: Id): Promise<OpenHouseLead[]>;
}
```

### 5.2 Update `apps/api/src/features/openhouse/infra/db.openhouse.repository.ts`

**Add** import for `openHouseImage` schema:
```typescript
import { openHouseImage } from "@packages/database/src/schemas/openhouse.schema";
```

**Add** helper to attach images to an open house:
```typescript
async attachImages(openHouseResult: Record<string, unknown>): Promise<OpenHouse> {
    const images = await this.findImagesByOpenHouseId(openHouseResult.id as string);
    return OpenHouseFactory.fromDb({ ...openHouseResult, images });
}
```

**Update** `create()`:
```typescript
async create(params: Omit<OpenHouse, "images">) {
    const { ...openHouseData } = params;
    const [result] = await db.insert(openHouse).values(openHouseData).returning();
    if (!result) throw new Error("Failed to create open house");
    return OpenHouseFactory.fromDb({ ...result, images: [] });
}
```

**Update** `findById()`, `findByOrgAndUser()`, `findPublicById()` to fetch and attach images.

**Update** `findPublicByIdWithFormConfig()`:
- Remove `listingImageUrl` from select
- Add image fetching after the main query

```typescript
async findPublicByIdWithFormConfig(id: string): Promise<PublicOpenHouse | null> {
    const [result] = await db
        .select({
            id: openHouse.id,
            propertyAddress: openHouse.propertyAddress,
            date: openHouse.date,
            startTime: openHouse.startTime,
            endTime: openHouse.endTime,
            formConfig: organizationFormConfig,
        })
        .from(openHouse)
        .leftJoin(
            organizationFormConfig,
            eq(organizationFormConfig.organizationId, openHouse.organizationId),
        )
        .where(eq(openHouse.id, id))
        .limit(1);

    if (!result) return null;

    const images = await this.findImagesByOpenHouseId(id);

    return {
        id: result.id,
        propertyAddress: result.propertyAddress,
        date: result.date,
        startTime: result.startTime,
        endTime: result.endTime,
        formConfig: result.formConfig
            ? {
                  id: result.formConfig.id,
                  organizationId: result.formConfig.organizationId,
                  questions: result.formConfig.questions as FormConfig["questions"],
                  createdAt: result.formConfig.createdAt,
                  updatedAt: result.formConfig.updatedAt,
              }
            : null,
        images,
    };
}
```

**Add** new methods:
```typescript
async createImages(openHouseId: string, images: NewOpenHouseImageInput[]): Promise<OpenHouseImage[]> {
    if (images.length === 0) return [];
    const values = images.map((img) => ({
        ...img,
        openHouseId,
    }));
    const results = await db.insert(openHouseImage).values(values).returning();
    return results.map((r) => ({
        id: r.id,
        openHouseId: r.openHouseId,
        url: r.url,
        publicId: r.publicId,
        isMain: r.isMain,
        orderIndex: r.orderIndex,
        createdAt: r.createdAt,
    }));
}

async findImagesByOpenHouseId(openHouseId: string): Promise<OpenHouseImage[]> {
    const results = await db
        .select()
        .from(openHouseImage)
        .where(eq(openHouseImage.openHouseId, openHouseId))
        .orderBy(openHouseImage.orderIndex, openHouseImage.createdAt);
    return results.map((r) => ({
        id: r.id,
        openHouseId: r.openHouseId,
        url: r.url,
        publicId: r.publicId,
        isMain: r.isMain,
        orderIndex: r.orderIndex,
        createdAt: r.createdAt,
    }));
}

async findImagePublicIdsByOpenHouseId(openHouseId: string): Promise<string[]> {
    const results = await db
        .select({ publicId: openHouseImage.publicId })
        .from(openHouseImage)
        .where(eq(openHouseImage.openHouseId, openHouseId));
    return results.map((r) => r.publicId);
}

async delete(openHouseId: string): Promise<void> {
    await db.delete(openHouse).where(eq(openHouse.id, openHouseId));
}
```

---

## Phase 6: Backend — Service Updates

### 6.1 Update `apps/api/src/features/openhouse/service/openhouse.service.ts`

**Modify** `createOpenHouse()` to handle images:
```typescript
async createOpenHouse(
    data: CreateOpenHouseInput,
    organizationId: string,
    userId: string,
): Promise<OpenHouse> {
    const { openHouse, images } = OpenHouseFactory.create(data, organizationId, userId);
    const created = await this.repository.create(openHouse);
    const createdImages = await this.repository.createImages(created.id, images);
    return { ...created, images: createdImages };
}
```

**Add** delete method with Cloudinary cleanup:
```typescript
import { deleteCloudinaryImages } from "@cloudinary/cloudinary.utils";

async deleteOpenHouse(id: string, organizationId: string): Promise<void> {
    const openHouse = await this.repository.findById(id);
    if (!openHouse || openHouse.organizationId !== organizationId) {
        throw new HTTPException(404, { message: "Open house not found" });
    }

    const publicIds = await this.repository.findImagePublicIdsByOpenHouseId(id);

    await this.repository.delete(id);

    await deleteCloudinaryImages(publicIds);
}
```

**Update** all getter methods to ensure images are included (repository handles this).

---

## Phase 7: Backend — Handler & Route Updates

### 7.1 Update `apps/api/src/features/openhouse/api/openhouse.handlers.ts`

No structural changes needed to `createOpenHouseHandlers` — `NewOpenHouseSchema` now includes `images` array, so `zValidator("json", NewOpenHouseSchema)` validates it automatically.

The handler stays the same:
```typescript
const data = c.req.valid("json");
const openHouse = await service.createOpenHouse(data, organizationId, userId);
return c.json({ data: openHouse }, codes.CREATED);
```

All GET handlers continue to work since the service/repository now return images.

### 7.2 Update route registrations in `apps/api/src/index.ts`

```typescript
import { cloudinaryRoutes } from "./features/cloudinary/api/cloudinary.routes";

const featureRoutes = apiV1
    .route("/api/open-houses", openhouseRoutes)
    .route("/api/public/open-houses", publicOpenHouseRoutes)
    .route("/api/form-config", formConfigRoutes)
    .route("/api/agents", agentRoutes)
    .route("/api/cloudinary", cloudinaryRoutes);  // NEW
```

---

## Phase 8: Frontend — Cloudinary URL Utility

### 8.1 Create `apps/frontend-base/src/lib/cloudinary-url.ts`

```typescript
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

interface TransformOptions {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
    radius?: number | string;
    gravity?: string;
}

export function cloudinaryUrl(publicId: string, options: TransformOptions = {}): string {
    const {
        width,
        height,
        crop = "fill",
        quality = "auto",
        format = "auto",
        radius,
        gravity = "auto",
    } = options;

    const transforms: string[] = [];

    if (width) transforms.push(`w_${width}`);
    if (height) transforms.push(`h_${height}`);
    if (crop) transforms.push(`c_${crop}`);
    if (quality) transforms.push(`q_${quality}`);
    if (format) transforms.push(`f_${format}`);
    if (radius) transforms.push(`r_${radius}`);
    if (gravity && (width || height)) transforms.push(`g_${gravity}`);

    const transformStr = transforms.join(",");

    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformStr}/${publicId}`;
}

export function getMainImage(images: OpenHouseImage[]): OpenHouseImage | undefined {
    if (images.length === 0) return undefined;
    const main = images.find((img) => img.isMain);
    return main ?? images[0];
}

export function mainImageUrl(
    images: OpenHouseImage[],
    options: TransformOptions = {},
): string | undefined {
    const main = getMainImage(images);
    if (!main) return undefined;
    return cloudinaryUrl(main.publicId, options);
}
```

### 8.2 Predefined size presets (optional but convenient)

Add to same file:
```typescript
export const imagePresets = {
    card: { width: 400, height: 300, crop: "fill" },
    heroLarge: { width: 1200, height: 600, crop: "fill" },
    heroSmall: { width: 800, height: 400, crop: "fill" },
    thumbnail: { width: 100, height: 100, crop: "fill", radius: "8" },
    flyer: { width: 600, height: 400, crop: "fill" },
} as const;
```

---

## Phase 9: Frontend — Schema Updates

### 9.1 Update `apps/frontend-base/src/lib/schemas/openhouse.schema.ts`

**Remove** `listingImageUrl` from all schemas.

**Add** image schema:
```typescript
export const openHouseImageSchema = z.object({
    id: z.uuid(),
    openHouseId: z.uuid(),
    url: z.url(),
    publicId: z.string().min(1),
    isMain: z.boolean(),
    orderIndex: z.number().int().min(0),
    createdAt: z.date(),
});

export const newOpenHouseImageSchema = z.object({
    url: z.url(),
    publicId: z.string().min(1),
    isMain: z.boolean().default(false),
    orderIndex: z.number().int().min(0).default(0),
});
```

**Update** `openHouseSchema`:
```typescript
export const openHouseSchema = z.object({
    id: z.uuid(),
    organizationId: z.uuid(),
    createdByUserId: z.uuid(),
    propertyAddress: z.string().min(1, "Property address is required"),
    listingPrice: z.number().positive("Price must be positive"),
    date: z.date(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
    images: z.array(openHouseImageSchema).default([]),
    notes: z.string().nullish(),
    createdAt: z.date(),
    updatedAt: z.date(),
});
```

**Update** `createOpenHouseSchema`:
```typescript
export const createOpenHouseSchema = openHouseSchema
    .pick({
        propertyAddress: true,
        listingPrice: true,
        date: true,
        startTime: true,
        endTime: true,
        notes: true,
    })
    .extend({
        images: z.array(newOpenHouseImageSchema).min(0).default([]),
    })
    .refine((data) => data.startTime < data.endTime, {
        message: "End time must be after start time",
        path: ["endTime"],
    });
```

**Update** `publicOpenHouseSchema`:
```typescript
export const publicOpenHouseSchema = z.object({
    id: z.uuid(),
    propertyAddress: z.string().min(1),
    date: z.date(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
    images: z.array(openHouseImageSchema).default([]),
    formConfig: FormConfigSchema.nullable(),
});
```

**Add** export types:
```typescript
export type OpenHouseImage = z.infer<typeof openHouseImageSchema>;
export type NewOpenHouseImageInput = z.infer<typeof newOpenHouseImageSchema>;
```

---

## Phase 10: Frontend — API Client & Mutations

### 10.1 Update `apps/frontend-base/src/lib/api/openhouse.api.ts`

The `createOpenHouse` method already sends JSON — the `CreateOpenHouseInput` type now includes `images[]` so no code change needed here. Types flow automatically from schema changes.

### 10.2 Add Cloudinary API client

**`apps/frontend-base/src/lib/api/cloudinary.api.ts`**
```typescript
import { apiClient } from "./client";

export interface SignatureResponse {
    signature: string;
    timestamp: number;
    apiKey: string;
    cloudName: string;
}

export const cloudinaryApi = {
    getSignature: async (): Promise<SignatureResponse> => {
        const res = await apiClient.api.cloudinary.signature.$post();
        if (!res.ok) {
            throw new Error("Failed to get upload signature");
        }
        const data = await res.json();
        return data.data;
    },
};
```

### 10.3 Update mutations

`apps/frontend-base/src/lib/mutations/openhouse.ts` — no changes needed. The `CreateOpenHouseInput` type flows from the updated schema.

---

## Phase 11: Frontend — Image Upload Widget Component

### 11.1 Create `apps/frontend-base/src/lib/cloudinary-widget.ts`

Utility for loading the widget script and opening it:

```typescript
import { cloudinaryApi, type SignatureResponse } from "@/lib/api/cloudinary.api";

interface CloudinaryUploadResult {
    url: string;
    publicId: string;
}

interface UploadedImageInfo {
    url: string;
    public_id: string;
    [key: string]: unknown;
}

let scriptLoaded = false;
let scriptLoadPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
    if (scriptLoaded) return Promise.resolve();
    if (scriptLoadPromise) return scriptLoadPromise;

    scriptLoadPromise = new Promise((resolve, reject) => {
        const existing = document.querySelector(
            'script[src*="upload-widget.cloudinary.com"]',
        );
        if (existing) {
            scriptLoaded = true;
            resolve();
            return;
        }
        const script = document.createElement("script");
        script.src = "https://upload-widget.cloudinary.com/latest/global/all.js";
        script.type = "text/javascript";
        script.onload = () => {
            scriptLoaded = true;
            resolve();
        };
        script.onerror = () => reject(new Error("Failed to load Cloudinary widget"));
        document.head.appendChild(script);
    });

    return scriptLoadPromise;
}

export async function openCloudinaryUploadWidget(
    onUpload: (results: CloudinaryUploadResult[]) => void,
    onError?: (error: unknown) => void,
): Promise<() => void> {
    await loadScript();

    let signature: SignatureResponse;
    try {
        signature = await cloudinaryApi.getSignature();
    } catch (err) {
        onError?.(err);
        return () => {};
    }

    const widget = (window as any).cloudinary.createUploadWidget(
        {
            cloudName: signature.cloudName,
            apiKey: signature.apiKey,
            uploadSignature: signature.signature,
            uploadSignatureTimestamp: signature.timestamp,
            folder: "open-houses",
            sources: ["local", "url", "camera"],
            multiple: true,
            maxFiles: 10,
            maxFileSize: 10_000_000,
            clientAllowedFormats: ["jpg", "jpeg", "png", "webp", "gif"],
            styles: {
                palette: {
                    window: "#FFFFFF",
                    windowBorder: "#90A0B3",
                    tabIcon: "#0E2F5A",
                    menuIcons: "#5A616A",
                    textDark: "#000000",
                    textLight: "#FFFFFF",
                    link: "#0078FF",
                    action: "#FF620C",
                    inactiveTabIcon: "#0E2F5A",
                    error: "#F44235",
                    inProgress: "#0078FF",
                    complete: "#20B832",
                    sourceBg: "#E4EBF1",
                },
            },
        },
        (error: unknown, result: { event: string; info: { files?: Array<{ uploadInfo: UploadedImageInfo }> } }) => {
            if (error) {
                onError?.(error);
                return;
            }
            if (result.event === "success") {
                // Single file success — handled by batch-complete
            }
            if (
                result.event === "batch-completed" &&
                result.info?.files
            ) {
                const uploaded = result.info.files
                    .filter((f) => f.uploadInfo)
                    .map((f) => ({
                        url: f.uploadInfo.url,
                        publicId: f.uploadInfo.public_id,
                    }));
                onUpload(uploaded);
            }
        },
    );

    widget.open();

    return () => widget.close();
}
```

### 11.2 Create `apps/frontend-base/src/pages/openhouse/components/ImageUploadWidget.tsx`

React component wrapping the upload widget:

```typescript
import { ImageIcon, Star, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { cloudinaryUrl, imagePresets } from "@/lib/cloudinary-url";
import { openCloudinaryUploadWidget } from "@/lib/cloudinary-widget";
import type { NewOpenHouseImageInput } from "@/lib/schemas/openhouse.schema";

interface UploadedImage {
    url: string;
    publicId: string;
}

interface ImageUploadWidgetProps {
    images: NewOpenHouseImageInput[];
    onChange: (images: NewOpenHouseImageInput[]) => void;
}

export function ImageUploadWidget({ images, onChange }: ImageUploadWidgetProps) {
    const handleUpload = useCallback(async () => {
        await openCloudinaryUploadWidget(
            (results: UploadedImage[]) => {
                const startIndex = images.length;
                const newImages: NewOpenHouseImageInput[] = results.map((r, i) => ({
                    url: r.url,
                    publicId: r.publicId,
                    isMain: images.length === 0 && i === 0,
                    orderIndex: startIndex + i,
                }));
                onChange([...images, ...newImages]);
            },
            (error) => {
                console.error("Upload failed:", error);
            },
        );
    }, [images, onChange]);

    const handleRemove = (index: number) => {
        const updated = images
            .filter((_, i) => i !== index)
            .map((img, i) => ({
                ...img,
                orderIndex: i,
                isMain: index === 0 ? i === 0 : img.isMain,
            }));
        onChange(updated);
    };

    const handleSetMain = (index: number) => {
        const updated = images.map((img, i) => ({
            ...img,
            isMain: i === index,
        }));
        onChange(updated);
    };

    const handleMoveUp = (index: number) => {
        if (index === 0) return;
        const updated = [...images];
        [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
        const reordered = updated.map((img, i) => ({ ...img, orderIndex: i }));
        onChange(reordered);
    };

    const handleMoveDown = (index: number) => {
        if (index === images.length - 1) return;
        const updated = [...images];
        [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
        const reordered = updated.map((img, i) => ({ ...img, orderIndex: i }));
        onChange(reordered);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                    Images ({images.length})
                </label>
                <Button type="button" variant="outline" size="sm" onClick={handleUpload}>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Add Images
                </Button>
            </div>

            {images.length === 0 && (
                <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
                    <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No images added yet</p>
                    <p className="text-xs mt-1">Click "Add Images" to upload</p>
                </div>
            )}

            {images.length > 0 && (
                <div className="space-y-2">
                    {images.map((image, index) => (
                        <div
                            key={image.publicId}
                            className={cn(
                                "flex items-center gap-3 p-2 rounded-lg border",
                                image.isMain && "border-re-gold/50 bg-re-gold/5",
                            )}
                        >
                            <img
                                src={cloudinaryUrl(image.publicId, imagePresets.thumbnail)}
                                alt={`Image ${index + 1}`}
                                className="w-16 h-16 object-cover rounded-md"
                            />

                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground truncate">
                                    {image.publicId}
                                </p>
                                {image.isMain && (
                                    <span className="text-xs text-re-gold font-medium">
                                        Main Image
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-1">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => handleSetMain(index)}
                                    title={image.isMain ? "Main image" : "Set as main"}
                                >
                                    <Star
                                        className={cn(
                                            "h-4 w-4",
                                            image.isMain
                                                ? "fill-re-gold text-re-gold"
                                                : "text-muted-foreground",
                                        )}
                                    />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => handleMoveUp(index)}
                                    disabled={index === 0}
                                    title="Move up"
                                >
                                    <ArrowUp className="h-3 w-3" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => handleMoveDown(index)}
                                    disabled={index === images.length - 1}
                                    title="Move down"
                                >
                                    <ArrowDown className="h-3 w-3" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive hover:text-destructive"
                                    onClick={() => handleRemove(index)}
                                    title="Remove"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
```

---

## Phase 12: Frontend — Update CreateOpenHouseForm

### 12.1 Update `apps/frontend-base/src/pages/openhouse/components/CreateOpenHouseForm.tsx`

- Remove the `listingImageUrl` field (lines 140-161)
- Replace with `ImageUploadWidget` component
- Update default values to include `images: []`
- The `form.Field` for images uses array subfield management

Key changes:
```typescript
import { ImageUploadWidget } from "./ImageUploadWidget";
import type { NewOpenHouseImageInput } from "@/lib/schemas/openhouse.schema";

// In defaultValues:
const defaultOpenHouse: CreateOpenHouseInput = {
    propertyAddress: '',
    listingPrice: 100000,
    date: new Date(),
    startTime: '12:00',
    endTime: '16:00',
    images: [],
    notes: '',
};

// Replace the listingImageUrl field with:
<form.Field name="images">
    {(field) => (
        <ImageUploadWidget
            images={field.state.value}
            onChange={field.handleChange}
        />
    )}
</form.Field>
```

---

## Phase 13: Frontend — Update Display Components

### 13.1 Update `OpenHouseCard.tsx`

Replace:
```typescript
{openHouse.listingImageUrl ? (
    <img src={openHouse.listingImageUrl} ... />
) : ...}
```

With:
```typescript
import { mainImageUrl, imagePresets } from "@/lib/cloudinary-url";

const imageUrl = mainImageUrl(openHouse.images, imagePresets.card);

{imageUrl ? (
    <img src={imageUrl} alt={openHouse.propertyAddress} ... />
) : ...}
```

### 13.2 Update `OpenHouseDetailPage.tsx`

Hero section — replace `openHouse.listingImageUrl` with:
```typescript
import { mainImageUrl, cloudinaryUrl, imagePresets } from "@/lib/cloudinary-url";

const heroUrl = mainImageUrl(openHouse.images, imagePresets.heroLarge);
```

Add thumbnail gallery below the hero image:
```typescript
{openHouse.images.length > 1 && (
    <div className="flex gap-2 overflow-x-auto pb-2">
        {openHouse.images.map((img) => (
            <img
                key={img.id}
                src={cloudinaryUrl(img.publicId, imagePresets.thumbnail)}
                alt={openHouse.propertyAddress}
                className={cn(
                    "w-20 h-20 object-cover rounded-lg border-2 cursor-pointer shrink-0",
                    img.isMain ? "border-re-gold" : "border-transparent",
                )}
            />
        ))}
    </div>
)}
```

### 13.3 Update `VisitorSignInPage.tsx`

Replace `openHouse.listingImageUrl` with:
```typescript
import { mainImageUrl, imagePresets } from "@/lib/cloudinary-url";

const heroUrl = mainImageUrl(openHouse.images, imagePresets.heroLarge);
```

### 13.4 Update `QRCodeDisplay.tsx`

Replace `openHouse.listingImageUrl` references with:
```typescript
import { mainImageUrl, imagePresets } from "@/lib/cloudinary-url";

const imageUrl = mainImageUrl(openHouse.images, imagePresets.flyer);
```

---

## Phase 14: Migration & Cleanup

### 14.1 Run database migration

```bash
pnpm --filter @packages/database db:generate
pnpm --filter @packages/database db:migrate
```

### 14.2 Run code quality

```bash
pnpm --filter @apps/api cq
pnpm --filter @apps/frontend-base cq
```

### 14.3 Verify build

```bash
pnpm --filter @apps/api build
pnpm --filter @apps/frontend-base build
```

---

## Files Changed Summary

| File | Action | Description |
|------|--------|-------------|
| `packages/env/index.ts` | Modify | Add `cloudinaryEnv` scope |
| `packages/database/src/schemas/openhouse.schema.ts` | Modify | Remove `listingImageUrl`, add `openHouseImage` table + relations |
| `apps/api/package.json` | Modify | Add `cloudinary` dependency |
| `apps/api/src/features/cloudinary/cloudinary.config.ts` | **New** | Cloudinary SDK config |
| `apps/api/src/features/cloudinary/cloudinary.utils.ts` | **New** | `deleteCloudinaryImages()` helper |
| `apps/api/src/features/cloudinary/api/cloudinary.handlers.ts` | **New** | Signature endpoint handler |
| `apps/api/src/features/cloudinary/api/cloudinary.routes.ts` | **New** | Cloudinary route definition |
| `apps/api/src/features/openhouse/domain/openhouse.entity.ts` | Modify | Remove `listingImageUrl`, add image schemas |
| `apps/api/src/features/openhouse/domain/interface.openhouse.repository.ts` | Modify | Add image methods to interface |
| `apps/api/src/features/openhouse/infra/db.openhouse.repository.ts` | Modify | Image CRUD + cleanup methods |
| `apps/api/src/features/openhouse/service/openhouse.service.ts` | Modify | Image handling + Cloudinary cleanup |
| `apps/api/src/features/openhouse/api/openhouse.handlers.ts` | Modify | (Minor) accept images in create |
| `apps/api/src/index.ts` | Modify | Register cloudinary routes |
| `apps/frontend-base/src/lib/cloudinary-url.ts` | **New** | URL transformation utility + presets |
| `apps/frontend-base/src/lib/cloudinary-widget.ts` | **New** | Widget script loader + opener |
| `apps/frontend-base/src/lib/schemas/openhouse.schema.ts` | Modify | Remove `listingImageUrl`, add image schemas |
| `apps/frontend-base/src/lib/api/cloudinary.api.ts` | **New** | Signature API client |
| `apps/frontend-base/src/lib/api/openhouse.api.ts` | Modify | (Type-only) updated CreateOpenHouseInput |
| `apps/frontend-base/src/lib/mutations/openhouse.ts` | Modify | (Type-only) updated CreateOpenHouseInput |
| `apps/frontend-base/src/pages/openhouse/components/ImageUploadWidget.tsx` | **New** | Upload widget component |
| `apps/frontend-base/src/pages/openhouse/components/CreateOpenHouseForm.tsx` | Modify | Replace URL input with ImageUploadWidget |
| `apps/frontend-base/src/pages/openhouse/components/OpenHouseCard.tsx` | Modify | Use main image + cloudinaryUrl |
| `apps/frontend-base/src/pages/openhouse/OpenHouseDetailPage.tsx` | Modify | Hero + thumbnail gallery |
| `apps/frontend-base/src/pages/openhouse/VisitorSignInPage.tsx` | Modify | Use main image |
| `apps/frontend-base/src/pages/openhouse/components/QRCodeDisplay.tsx` | Modify | Use main image |
| `apps/frontend-base/src/vite-env.d.ts` | Modify | Add VITE_CLOUDINARY_* types |

---

## Testing Checklist

- [ ] Create open house with no images — should succeed
- [ ] Create open house with 1 image — should show as main automatically
- [ ] Create open house with 3 images — should save all, first is main
- [ ] Set different image as main via star toggle
- [ ] Reorder images with up/down buttons
- [ ] Remove an image from the list
- [ ] Open house card shows main image (or first image)
- [ ] Detail page shows hero + thumbnails
- [ ] Visitor sign-in page shows main image hero
- [ ] QR flyer uses main image
- [ ] Cloudinary URL transformations applied correctly (check network tab for image URLs)
- [ ] Upload fails gracefully if signature endpoint errors
- [ ] Non-authenticated user cannot access signature endpoint
- [ ] Open house delete cleans up Cloudinary images (check Cloudinary console)
- [ ] Database migration runs cleanly
- [ ] Existing open houses (with listingImageUrl in DB) work — note: old URL will be gone after migration, acceptable
