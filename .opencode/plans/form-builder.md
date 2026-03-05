# Configurable Form Builder for Open House Sign-ups

## Overview
Add organization-level configurable form questions to open house sign-ups, with responses stored in JSON and viewable in the leads list.

## Requirements Summary
- **Scope**: Per-organization form configuration
- **Question Types**: Short text, Long text, Number, Multiple choice, Checkboxes
- **Core Fields**: Keep firstName, lastName, email, phone as fixed columns
- **Viewing**: Display responses in leads list (expandable/expandable detail view)

---

## Database Schema Changes

### 1. New Table: `organization_form_config`
Stores form question definitions per organization.

```typescript
{
  id: uuid (PK)
  organizationId: uuid (FK → organization, cascade delete, UNIQUE constraint)
  questions: jsonb (not null)  // Array of question objects
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Note**: UNIQUE constraint on `organizationId` ensures one config per organization.

**Question Object Structure** (in `questions` JSONB):
```typescript
{
  id: Id;                        // UUID from features/common/values.ts
  type: 'short_text' | 'long_text' | 'number' | 'multiple_choice' | 'checkboxes';
  label: string;                 // Display label
  placeholder?: string;          // Optional placeholder
  required: boolean;             // Whether field is required
  options?: string[];            // For multiple_choice/checkboxes
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;                // For number type
    max?: number;                // For number type
  };
  order: number;                 // Display order
}
```

### 2. Modify Table: `open_house_lead`
Add JSONB column for storing dynamic responses.

```typescript
{
  // ... existing fields ...
  responses: jsonb (nullable)  // Key-value pairs of questionId → response
}
```

**Note**: Nullable for backwards compatibility with existing leads. Use `.nullish()` in Zod schema.

**Response Structure** (in `responses` JSONB):
```typescript
{
  [questionId: string]: string | string[] | number;
}
```

### 3. Relations
- `organization` (1) ←→ (N) `organization_form_config`

---

## Architecture Changes

### New Feature Structure
```
apps/api/src/features/form-config/
├── api/
│   ├── form-config.routes.ts          # CRUD routes for form config
│   ├── form-config.controller.ts      # Request handlers
│   └── form-config.schemas.ts         # Zod validation schemas
├── service/
│   └── form-config.service.ts         # Business logic
├── infra/
│   └── db.form-config.repository.ts   # Data access
└── domain/
    ├── form-config.entity.ts          # Domain model + factory
    └── interface.form-config.repository.ts
```

### Modified Features
```
apps/api/src/features/openhouse/
├── api/
│   ├── openhouse.routes.ts            # Add form config to public response
│   └── openhouse.controller.ts        # Update lead creation
├── service/
│   └── openhouse.service.ts           # Add form config validation
└── infra/
    └── db.openhouse.repository.ts     # Update lead creation with responses
```

---

## Implementation Plan

### Phase 1: Database Schema
1. Create `organization_form_config` table schema
2. Add `responses` jsonb column to `open_house_lead` table
3. Run migration: `pnpm --filter @packages/database db:migrate`

### Phase 2: Form Config Domain
1. Create `FormConfigEntity` with Zod validation
   - Import `IdSchema` from `@features/common/values`
   - Validate question structure
   - Ensure unique question IDs within the questions array
   - Validate options for select/checkbox types
   - Question IDs use `Bun.randomUUIDv7()` (same pattern as other entities)
2. Create `FormConfigFactory` with `create()` and `fromDb()` methods
3. Define `IFormConfigRepository` interface
   - `getByOrg(organizationId)`
   - `create(organizationId, config)`
   - `update(id, config)`
   - `delete(id)`

### Phase 3: Form Config Repository
1. Implement `DbFormConfigRepository`
2. CRUD operations using Drizzle
3. Handle JSONB serialization/deserialization

### Phase 4: Form Config Service & API
1. Create `FormConfigService` with:
   - `getFormConfig(organizationId)`
   - `createFormConfig(organizationId, questions)`
   - `updateFormConfig(id, questions)`
   - `deleteFormConfig(id)`
2. Create controller with organization-scoped CRUD
3. Create routes: `/api/form-config` (GET, POST, PUT, DELETE)

### Phase 5: Update Open House Public Endpoint
1. Modify `getPublicOpenHouse` to include form config
   - Join with `organization_form_config` table
   - Return questions array in response
2. Update public open house schema to include `questions` field

### Phase 6: Update Lead Creation
1. Add `responses` field to `CreateOpenHouseLeadSchema` with `.nullish()`
2. Add response validation to `NewOpenHouseLeadSchema` refinement:
   - Fetch form config from open house's organization
   - Validate responses against config (if provided)
   - Check required fields, types, constraints
3. Update `createOpenHouseLead` service method:
   - Store validated responses in JSONB column
   - Keep core fields separate
4. Update repository to handle `responses` field

### Phase 7: Update Lead Viewing
1. Modify `getOpenHouseLeads` response:
   - Include `responses` field for each lead
   - Optionally join with form config to get question labels
2. Update lead schema to include `responses` field with `.nullish()`

---

## API Contracts

### GET /api/form-config
Get current organization's form config.

**Response**:
```json
{
  "data": {
    "id": "uuid",
    "questions": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "type": "short_text",
        "label": "What's your budget?",
        "placeholder": "e.g. $500k",
        "required": true,
        "order": 1
      },
      {
        "id": "223e4567-e89b-12d3-a456-426614174001",
        "type": "multiple_choice",
        "label": "When are you looking to move?",
        "options": ["ASAP", "1-3 months", "3-6 months", "6+ months"],
        "required": true,
        "order": 2
      }
    ]
  }
}
```

### POST /api/form-config
Create form config for organization.

**Request**:
```json
{
  "questions": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "type": "short_text",
      "label": "What's your budget?",
      "required": true,
      "order": 1
    }
  ]
}
```

### PUT /api/form-config/:id
Update form config.

### DELETE /api/form-config/:id
Delete form config (reverts to default behavior).

### GET /api/public/open-houses/:id
(Updated) Get open house with form questions.

**Response**:
```json
{
  "data": {
    "id": "uuid",
    "propertyAddress": "123 Main St",
    "date": "2025-03-04",
    "questions": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "type": "short_text",
        "label": "What's your budget?",
        "placeholder": "e.g. $500k",
        "required": true,
        "order": 1
      }
    ]
  }
}
```

### POST /api/public/open-houses/:id/sign-in
(Updated) Sign up with responses.

**Request**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "555-1234",
  "workingWithAgent": false,
  "responses": {
    "123e4567-e89b-12d3-a456-426614174000": "$500k",
    "223e4567-e89b-12d3-a456-426614174001": "1-3 months"
  }
}
```

### GET /api/open-houses/:id/leads
(Updated) Get leads with responses.

**Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "555-1234",
      "workingWithAgent": false,
      "submittedAt": "2025-03-04T10:00:00Z",
      "responses": {
        "123e4567-e89b-12d3-a456-426614174000": "$500k",
        "223e4567-e89b-12d3-a456-426614174001": "1-3 months"
      }
    }
  ]
}
```

---

## Edge Cases & Considerations

1. **No form config**: If org has no config, public endpoint returns empty `questions` array. Only core fields are collected.

2. **Deleted config**: When config is deleted, existing leads still have their responses in JSONB. New sign-ups only collect core fields.

3. **Invalid question types**: Validation prevents creating invalid configs (e.g., multiple choice without options).

4. **Response validation**:
   - Validation occurs in `NewOpenHouseLeadSchema` refinement
   - Required fields must be present
   - Type checking (string, number, array)
   - Min/max constraints
   - Option validation (for select/checkbox)
   - Returns detailed error messages for each field

5. **Question ID collisions**: Prevent duplicate question IDs in config.

6. **Frontend rendering**: Question `order` field enables sorted display.

7. **Backwards compatibility**: Existing leads without `responses` field handled gracefully.

---

## Testing Strategy

1. **Unit Tests** (when test framework is configured):
   - FormConfigEntity validation
   - Response validation logic
   - Repository methods

2. **Integration Tests**:
   - Full flow: create config → create open house → sign up with responses → view leads
   - Validation error cases
   - Organization scoping

3. **Manual Testing**:
   - Create form config via API
   - Test public sign-up with valid/invalid responses
   - Verify responses stored correctly
   - Check leads list displays responses

---

## Future Enhancements (Out of Scope)

- Conditional questions (show/hide based on previous answers)
- Question reordering UI
- Question templates
- Form config versioning
- Export responses to CSV/Excel
- Response analytics
- Multi-language support
