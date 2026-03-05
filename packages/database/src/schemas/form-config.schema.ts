import { relations } from "drizzle-orm";
import {
    jsonb,
    pgTable,
    timestamp,
    uniqueIndex,
    uuid,
} from "drizzle-orm/pg-core";
import { organization } from "./auth.schema";

export const organizationFormConfig = pgTable(
    "organization_form_config",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        organizationId: uuid("organization_id")
            .notNull()
            .references(() => organization.id, { onDelete: "cascade" }),
        questions: jsonb("questions").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        uniqueIndex("organization_form_config_organizationId_idx").on(
            table.organizationId,
        ),
    ],
);

export const organizationFormConfigRelations = relations(
    organizationFormConfig,
    ({ one }) => ({
        organization: one(organization, {
            fields: [organizationFormConfig.organizationId],
            references: [organization.id],
        }),
    }),
);

export const organizationFormConfigOrganizationRelations = relations(
    organization,
    ({ one }) => ({
        formConfig: one(organizationFormConfig, {
            fields: [organization.id],
            references: [organizationFormConfig.organizationId],
        }),
    }),
);

export type InsertOrganizationFormConfig =
    typeof organizationFormConfig.$inferInsert;
export type SelectOrganizationFormConfig =
    typeof organizationFormConfig.$inferSelect;
