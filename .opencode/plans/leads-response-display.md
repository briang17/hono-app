# Leads Response Display + Open House Detail Visual Review

## Status: COMPLETE

## What Changed

### Backend
- `openhouse.service.ts` — Added `getOpenHouseLeadsWithFormConfig()` returning `{ leads, formConfig }`
- `openhouse.handlers.ts` — `getOpenHouseLeadsHandlers` now returns enriched response with form config

### Frontend Schemas
- `openhouse.schema.ts` — Added `responses` field to `openHouseLeadSchema`, replaced `z.any()` with `FormConfigSchema` in `publicOpenHouseSchema`, added `leadsWithFormConfigSchema`
- Exported `LeadsWithFormConfig` type

### Frontend Components
- **NEW** `ResponseViewer.tsx` — Renders lead custom responses with human-readable labels (maps question IDs → labels, formats values per type)
- `LeadList.tsx` — Accepts `formConfig` prop, integrates `ResponseViewer` per lead card, fixed depth strategy (`hover:shadow-md` → `hover:border-primary/40`)
- `OpenHouseDetailPage.tsx` — Destructures enriched leads response, passes `formConfig` to `LeadList`

### Design System
- `.interface-design/system.md` — Updated lead card pattern with responses section and ResponseViewer docs, fixed hover depth strategy

## Files Changed
- `apps/api/src/features/openhouse/service/openhouse.service.ts`
- `apps/api/src/features/openhouse/api/openhouse.handlers.ts`
- `apps/frontend-base/src/lib/schemas/openhouse.schema.ts`
- `apps/frontend-base/src/pages/openhouse/components/ResponseViewer.tsx` (NEW)
- `apps/frontend-base/src/pages/openhouse/components/LeadList.tsx`
- `apps/frontend-base/src/pages/openhouse/OpenHouseDetailPage.tsx`
- `apps/frontend-base/.interface-design/system.md`

## Visual Decisions
- Lead card depth: borders-only strategy (replaced `hover:shadow-md` with `hover:border-primary/40`)
- Responses rendered as label:value rows between contact info and timestamp, separated by `border-t`
- Option-based fields (select, radio, checkbox) show human-readable labels, not raw values
- Date responses formatted via `date-fns`
- Range responses displayed as "min — max"
- Empty responses (null/empty object) render nothing — no visual noise
