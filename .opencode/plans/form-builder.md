# Form Builder — Schema-Driven Form Builder for Open House Sign-ups

## Status: COMPLETE

## Scope
Open House visitor sign-in only. One form config per organization. Agents build custom questions; visitors fill them out.

## Decisions Made
- **Field types**: text, textarea, number, select, checkbox, radio, date, range
- **Options format**: `{label, value}[]` (not `string[]`)
- **Ordering**: Array index position (removed `order` field)
- **Validation**: Both frontend (TanStack Form + dynamic Zod) AND server-side (`validateResponses()`)
- **Drag-and-drop**: `@dnd-kit/react` (new API, NOT `@dnd-kit/core`/`@dnd-kit/sortable`)
- **State**: Zustand (no persist — syncs to server on save)

---

## Existing Code (What's Already Done)

### Backend (`apps/api`)
- `features/form-config/` — full DDD layers (entity, repo, service, controller, routes, schemas)
- `features/openhouse/domain/openhouse.entity.ts` — `validateResponses()` (160 lines, server-side validation)
- `features/openhouse/service/openhouse.service.ts` — `getPublicOpenHouseWithFormConfig()`, `createOpenHouseLead()`
- DB table: `organization_form_config` with `questions` JSONB column
- DB column: `open_house_lead.responses` JSONB column
- Current types: `short_text`, `long_text`, `number`, `multiple_choice`, `checkboxes`
- Current options: `string[]`

### Frontend (`apps/frontend-base`)
- `@tanstack/react-form` ^1.28.4 — already installed
- `zustand` ^5.0.11 — already installed (see `uiStore.ts` pattern)
- `zod` ^4.3.6 — already installed
- shadcn components: Input, Textarea, Select, Checkbox, Dialog, Button, DatePickerSimple, Field system
- Form pattern: `useForm()` + `validators.onSubmit` (Zod schema) + `form.Field` render-props + `isFieldInvalid()` + `Field`/`FieldLabel`/`FieldError`
- `VisitorSignInPage.tsx` — already renders public sign-in form
- `CreateOpenHouseLeadForm.tsx` — existing lead form (core fields only)

### NOT Yet Installed
- `@dnd-kit/react` — new dnd-kit (replaces old `@dnd-kit/core` + `@dnd-kit/sortable`)
- shadcn `Slider` component (for range type)
- shadcn `RadioGroup` component (for radio type)

---

## Phase 1: Backend — Schema & Entity Rebuild

### 1.1 Update Question Types & Schema

**File**: `apps/api/src/features/form-config/domain/form-config.entity.ts`

```typescript
export const QuestionTypeSchema = z.enum([
    "text", "textarea", "number", "select",
    "checkbox", "radio", "date", "range",
]);

export const OptionSchema = z.object({
    label: z.string().min(1),
    value: z.string().min(1),
});

export const QuestionValidationSchema = z.object({
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
});

export const QuestionSchema = z.object({
    id: IdSchema,
    type: QuestionTypeSchema,
    label: z.string().min(1, "Question label is required"),
    placeholder: z.string().optional(),
    required: z.boolean(),
    options: z.array(OptionSchema).optional(), // only for select, radio, checkbox
    validation: QuestionValidationSchema.optional(),
    step: z.number().positive().optional(), // for range type
});
```

**Changes from current**:
- Types: 5 → 8 (added `radio`, `date`, `range`; renamed `short_text`→`text`, `long_text`→`textarea`, `multiple_choice`→`select`)
- Options: `string[]` → `{label: string, value: string}[]`
- Removed `order` field — array index position is the order
- Added `step` field for range slider

**No DB migration needed** — `questions` is JSONB, DB doesn't enforce shape.

### 1.2 Update `validateResponses()` in `openhouse.entity.ts`

**File**: `apps/api/src/features/openhouse/domain/openhouse.entity.ts`

Update the `validateResponses()` function to handle:
- `radio` — same pattern as old `multiple_choice` (single string, validate against option `.value`)
- `date` — validate as ISO date string
- `range` — validate as number within `validation.min`/`validation.max`
- Update `select` to check `option.value` instead of raw string
- Update `checkbox` to check `option.value` instead of raw string
- Rename type checks: `short_text`/`long_text` → `text`/`textarea`

### 1.3 Update `FormConfigSchema` and `NewFormConfigSchema`

Same file. Remove `order` from the output schema. Keep `FormConfigFactory.create()` and `fromDb()`.

---

## Phase 2: Backend — API Alignment

### 2.1 Add `orgMiddleware` + `rbacMiddleware` to form-config routes

**File**: `apps/api/src/features/form-config/api/form-config.routes.ts`

Current routes lack both middleware. Align with `openhouse` and `agent` features:

```typescript
formConfigRoutes = new Hono()
    .use(authMiddleware)
    .use(orgMiddleware)
    .get("/", rbacMiddleware({ form_config: ["view"] }), ...)
    .post("/", rbacMiddleware({ form_config: ["create"] }), ...)
    .put("/:id", rbacMiddleware({ form_config: ["update"] }), ...)
    .delete("/:id", rbacMiddleware({ form_config: ["delete"] }), ...)
```

### 2.2 Convert controller → `orgFactory.createHandlers()` pattern

**File**: `apps/api/src/features/form-config/api/form-config.controller.ts` → rename to `form-config.handlers.ts`

Switch from controller object pattern to `orgFactory.createHandlers()` to match the established convention in `openhouse` and `agent`.

### 2.3 Add RBAC permission

**File**: `packages/auth/lib/permissions.ts`

Add `form_config` resource with `view`, `create`, `update`, `delete` actions. Add to relevant roles (e.g., `admin`, `agent`).

---

## Phase 3: Frontend — Dependencies & Types

### 3.1 Install @dnd-kit/react

```bash
pnpm --filter @apps/frontend-base add @dnd-kit/react
```

> **IMPORTANT**: The new @dnd-kit API is fundamentally different from the old one.
> - Package: `@dnd-kit/react` (NOT `@dnd-kit/core` + `@dnd-kit/sortable`)
> - `DragDropProvider` replaces `DndContext`
> - `useSortable({id, index})` from `@dnd-kit/react/sortable`
> - No `SortableContext`, no `CSS.Transform`, no `closestCenter`, no `verticalListSortingStrategy`
> - Built-in `OptimisticSortingPlugin` handles visual reorder automatically
> - State updates in `onDragEnd` using `source.initialIndex` → `source.index`
> - Use `isSortable` type guard from `@dnd-kit/react/sortable`
> - Drag handle: `handleRef` from `useSortable()`

### 3.2 Add shadcn components

```bash
# From apps/frontend-base
npx shadcn@latest add slider radio-group
```

### 3.3 Shared Zod schemas (frontend)

**File**: `apps/frontend-base/src/lib/schemas/form-builder.schema.ts`

Mirror the backend `QuestionSchema` and `FormConfigSchema` for frontend use.

```typescript
export const QuestionTypeSchema = z.enum([
    "text", "textarea", "number", "select",
    "checkbox", "radio", "date", "range",
]);
export type FieldType = z.infer<typeof QuestionTypeSchema>;

export const OptionSchema = z.object({
    label: z.string().min(1),
    value: z.string().min(1),
});

export const QuestionValidationSchema = z.object({
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
});

export const QuestionSchema = z.object({
    id: z.string().uuid(),
    type: QuestionTypeSchema,
    label: z.string().min(1),
    placeholder: z.string().optional(),
    required: z.boolean(),
    options: z.array(OptionSchema).optional(),
    validation: QuestionValidationSchema.optional(),
    step: z.number().positive().optional(),
});

export type FormFieldConfig = z.infer<typeof QuestionSchema>;
```

---

## Phase 4: Frontend — Builder UI (Agent Side)

### 4.1 Zustand Store

**File**: `apps/frontend-base/src/lib/stores/form-builder-store.ts`

Follows the `uiStore.ts` pattern (no persist middleware — builder state syncs to server on save):

```typescript
interface FormBuilderState {
    fields: FormFieldConfig[];
    isLoading: boolean;
    isDirty: boolean;

    setFields: (fields: FormFieldConfig[]) => void;
    addField: (type: FieldType) => void;
    updateField: (id: string, updates: Partial<FormFieldConfig>) => void;
    removeField: (id: string) => void;
    reorderFields: (fromIndex: number, toIndex: number) => void;
    reset: () => void;
}
```

`addField` creates a field with sensible defaults per type:
- `select`/`radio`/`checkbox` → initialized with empty options array
- `range` → initialized with `validation: { min: 0, max: 100 }`, `step: 1`
- All others → minimal defaults

`isDirty` tracks whether the form has been modified since last save.

### 4.2 Builder Canvas with @dnd-kit/react (NEW API)

**CRITICAL**: The old API (`DndContext`, `SortableContext`, `CSS.Transform`, `closestCenter`, `verticalListSortingStrategy`) does NOT exist in the new package.

Correct architecture:

```tsx
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable, isSortable } from "@dnd-kit/react/sortable";

// SortableItem component
function SortableFieldCard({ id, index, field }) {
    const { ref, handleRef, isDragSource, isDropping } = useSortable({ id, index });

    return (
        <div ref={ref}>
            <div ref={handleRef}>{/* drag handle icon */}</div>
            {/* field card content */}
        </div>
    );
}

// Builder canvas
function BuilderCanvas() {
    const { fields, reorderFields } = useFormBuilderStore();

    return (
        <DragDropProvider
            onDragEnd={(event) => {
                if (event.canceled) return;
                const { source } = event.operation;
                if (isSortable(source)) {
                    if (source.initialIndex !== source.index) {
                        reorderFields(source.initialIndex, source.index);
                    }
                }
            }}
        >
            <div className="space-y-3">
                {fields.map((field, index) => (
                    <SortableFieldCard key={field.id} id={field.id} index={index} field={field} />
                ))}
            </div>
        </DragDropProvider>
    );
}
```

Key differences from old API:
- No `SortableContext` wrapper
- No `CSS.Transform.toString(transform)` for positioning
- `useSortable` takes `{id, index}` (index is required)
- Returns `{ref, handleRef}` instead of `{attributes, listeners, setNodeRef, transform, transition}`
- Built-in optimistic sorting handles visual reorder
- State only updates in `onDragEnd` using `source.initialIndex`/`source.index`

### 4.3 Component File Structure

```
pages/openhouse/components/form-builder/
  FormBuilder.tsx              # Main container: toolbar + canvas + save button
  BuilderToolbar.tsx           # Field type palette (8 buttons with icons)
  BuilderCanvas.tsx            # DragDropProvider + sortable list
  SortableFieldCard.tsx        # Draggable card with handle, type icon, label, actions
  FieldEditor.tsx              # Edit panel for selected field (label, placeholder, required, etc.)
  FieldOptionsEditor.tsx       # Edit options for select/radio/checkbox (add/remove/reorder)
  FieldValidationEditor.tsx    # Edit validation rules (min, max, minLength, maxLength, step)
```

### 4.4 Field Type Palette (BuilderToolbar)

8 field type buttons, each with an icon. On click → `addField(type)`:

| Type | Icon | Default |
|------|------|---------|
| text | Type | `{ label: "New text question", required: false }` |
| textarea | AlignLeft | `{ label: "New textarea question", required: false }` |
| number | Hash | `{ label: "New number question", required: false }` |
| select | ChevronDown | `{ label: "New select question", options: [], required: false }` |
| checkbox | CheckSquare | `{ label: "New checkbox question", options: [], required: false }` |
| radio | CircleDot | `{ label: "New radio question", options: [], required: false }` |
| date | Calendar | `{ label: "New date question", required: false }` |
| range | SlidersHorizontal | `{ label: "New range question", validation: {min:0, max:100}, step: 1, required: false }` |

---

## Phase 5: Frontend — Dynamic Form Renderer (Visitor Side)

### 5.1 Zod Schema Generator

**File**: `apps/frontend-base/src/lib/schema-generator.ts`

Converts JSON field configs → Zod schema for TanStack Form validation.

| Field Type | Zod Validator | Notes |
|-----------|--------------|-------|
| `text` | `z.string()` + minLength/maxLength from validation | `min(1)` if required |
| `textarea` | `z.string()` + minLength/maxLength from validation | `min(1)` if required |
| `number` | `z.coerce.number()` + min/max from validation | Coerce from string input |
| `select` | `z.enum(optionValues)` when options exist, else `z.string()` | `min(1)` if required (no options) |
| `checkbox` | `z.array(z.enum(optionValues))` when options exist, else `z.array(z.string())` | Optional: min selections |
| `radio` | `z.enum(optionValues)` when options exist, else `z.string()` | Same as select |
| `date` | `z.string().min(1)` if required (date string from picker) | Coerce handling depends on input |
| `range` | `z.tuple([z.number().min(min), z.number().max(max)])` + refine `lo <= hi` | Dual-handle range picker, response is `[number, number]` |

### 5.2 DynamicForm Component

**File**: `apps/frontend-base/src/pages/openhouse/components/DynamicForm.tsx`

Follows the existing form pattern from `CreateOpenHouseLeadForm.tsx`:

- `useForm()` with `validators.onSubmit: generatedZodSchema`
- `form.Field` with `field.id` as the name
- `form.Subscribe` for submit button state
- Uses existing `Field`, `FieldLabel`, `FieldError`, `isFieldInvalid` components
- `defaultValues` computed from fields (text→'', checkbox→[], range→min, etc.)

### 5.3 FieldRenderer Component

**File**: `apps/frontend-base/src/pages/openhouse/components/FieldRenderer.tsx`

Maps each field type to shadcn components:

| Type | Component | File |
|------|-----------|------|
| text | `Input` | `components/ui/input.tsx` |
| textarea | `Textarea` | `components/ui/textarea.tsx` |
| number | `Input type="number"` | `components/ui/input.tsx` |
| select | `Select` + `SelectTrigger` + `SelectContent` + `SelectItem` | `components/ui/select.tsx` |
| checkbox | `Checkbox` per option (group) | `components/ui/checkbox.tsx` |
| radio | `RadioGroup` + `RadioGroupItem` | NEW — `components/ui/radio-group.tsx` |
| date | `DatePickerSimple` | `components/ui/datepicker-simple.tsx` |
| range | `Slider` | NEW — `components/ui/slider.tsx` |

All wrapped in `Field`/`FieldLabel`/`FieldError` component system (existing pattern).

---

## Phase 6: Integration

### 6.1 API Client & React Query Hooks

**New files**:
- `apps/frontend-base/src/lib/api/form-config.api.ts` — get, create, update API calls via Hono RPC client
- `apps/frontend-base/src/lib/mutations/useSaveFormConfig.ts` — create or update mutation
- `apps/frontend-base/src/lib/queries/useFormConfig.ts` — query for fetching org's form config

### 6.2 Route: Builder Page

**File**: `apps/frontend-base/src/routes/(protected)/(organization)/openhouse/form-builder.tsx`

Agent-facing page where they construct their visitor form. Loads existing config into Zustand store, renders `FormBuilder` component, saves on button click.

### 6.3 Update VisitorSignInPage

The existing `VisitorSignInPage` already fetches the public open house with form config (`PublicOpenHouse` includes `formConfig: FormConfigSchema.nullable()`).

Update to:
1. Render `CreateOpenHouseLeadForm` for core fields (firstName, lastName, email, phone, workingWithAgent)
2. Below core fields, render `DynamicForm` for custom questions (if `formConfig` is not null)
3. Merge both form submissions into a single API call with `responses` field

---

## Implementation Order

1. **Phase 1** — Backend entity/schema updates (form-config.entity.ts, openhouse.entity.ts)
2. **Phase 3** — Install deps + shadcn components + shared Zod schemas
3. **Phase 4** — Builder UI (biggest chunk: Zustand store + dnd-kit canvas + field editors)
4. **Phase 5** — Dynamic renderer (schema generator + DynamicForm + FieldRenderer)
5. **Phase 2** — Backend API updates (middleware, handlers, RBAC) — can be done in parallel with 4/5
6. **Phase 6** — Integration (API hooks, routes, wire everything together)

---

## API Contracts (Updated)

### GET /api/form-config
```json
{
    "data": {
        "id": "uuid",
        "questions": [
            {
                "id": "uuid",
                "type": "select",
                "label": "When are you looking to move?",
                "required": true,
                "options": [
                    { "label": "ASAP", "value": "asap" },
                    { "label": "1-3 months", "value": "1-3_months" },
                    { "label": "3-6 months", "value": "3-6_months" },
                    { "label": "6+ months", "value": "6_plus" }
                ]
            }
        ]
    }
}
```

### POST /api/form-config
```json
{
    "questions": [
        {
            "id": "uuid",
            "type": "text",
            "label": "What's your budget?",
            "placeholder": "e.g. $500k",
            "required": true
        }
    ]
}
```

### POST /api/public/open-houses/:id/sign-in (updated)
```json
{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "555-1234",
    "workingWithAgent": false,
    "responses": {
        "question-uuid-1": "$500k",
        "question-uuid-2": "1-3_months",
        "question-uuid-3": ["option_a", "option_b"]
    }
}
```

---

## Edge Cases

1. **No form config**: Public endpoint returns `formConfig: null`. Only core fields collected.
2. **Deleted config**: Existing leads keep their responses in JSONB. New sign-ups only collect core fields.
3. **Type changes**: If agent changes a field from `text` to `number`, old string responses still exist. Server-side validation applies to new submissions only.
4. **Question ID stability**: IDs are UUIDs generated at field creation. Editing label/type doesn't change the ID. Deleting removes it permanently.
5. **Empty options**: `select`/`radio`/`checkbox` with empty options array — should the builder prevent save? (Yes — validate that option-bearing types have at least 1 option.)

---

## Checklist

- [ ] Phase 1.1: Update `QuestionTypeSchema`, `OptionSchema`, `QuestionSchema` in form-config.entity.ts
- [ ] Phase 1.2: Update `validateResponses()` in openhouse.entity.ts for new types
- [ ] Phase 1.3: Update `FormConfigSchema`, `NewFormConfigSchema`, `FormConfigFactory`
- [ ] Phase 2.1: Add `orgMiddleware` + `rbacMiddleware` to form-config routes
- [ ] Phase 2.2: Convert controller → `orgFactory.createHandlers()` pattern
- [ ] Phase 2.3: Add `form_config` permission to RBAC
- [ ] Phase 3.1: Install `@dnd-kit/react`
- [ ] Phase 3.2: Install shadcn `slider` + `radio-group`
- [ ] Phase 3.3: Create `form-builder.schema.ts` frontend Zod schemas
- [ ] Phase 4.1: Create `form-builder-store.ts` Zustand store
- [ ] Phase 4.2: Create `BuilderCanvas.tsx` with DragDropProvider + useSortable
- [ ] Phase 4.3: Create `BuilderToolbar.tsx` field type palette
- [ ] Phase 4.4: Create `SortableFieldCard.tsx` draggable card
- [ ] Phase 4.5: Create `FieldEditor.tsx` edit panel
- [ ] Phase 4.6: Create `FieldOptionsEditor.tsx` options editor
- [ ] Phase 4.7: Create `FieldValidationEditor.tsx` validation editor
- [ ] Phase 4.8: Create `FormBuilder.tsx` main container
- [ ] Phase 5.1: Create `schema-generator.ts` Zod schema generator
- [ ] Phase 5.2: Create `DynamicForm.tsx` dynamic form renderer
- [ ] Phase 5.3: Create `FieldRenderer.tsx` field type renderer
- [ ] Phase 6.1: Create API client + mutations + queries
- [ ] Phase 6.2: Create form-builder route page
- [ ] Phase 6.3: Update VisitorSignInPage to use DynamicForm
- [ ] Phase 6.4: Add link to form builder from openhouse section (sidebar or detail page)
- [ ] Run `pnpm --filter @apps/api cq` and `pnpm --filter @apps/frontend-base cq`
- [ ] Update AGENTS.md with form-builder conventions
