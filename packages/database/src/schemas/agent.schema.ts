import { relations } from "drizzle-orm";
import {
    boolean,
    pgTable,
    text,
    timestamp,
    uniqueIndex,
    uuid,
} from "drizzle-orm/pg-core";
import { organization, user } from "./auth.schema";

export const agent = pgTable(
    "agent",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        userId: uuid("user_id").references(() => user.id, {
            onDelete: "set null",
        }),
        organizationId: uuid("organization_id")
            .notNull()
            .references(() => organization.id, { onDelete: "cascade" }),
        email: text("email").notNull(),
        firstName: text("first_name").notNull(),
        lastName: text("last_name").notNull(),
        phone: text("phone"),
        fubId: text("fub_id"),
        imageUrl: text("image_url"),
        imagePublicId: text("image_public_id"),
        isActive: boolean("is_active").notNull().default(true),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        uniqueIndex("agent_org_email_uidx").on(
            table.organizationId,
            table.email,
        ),
    ],
);

export const agentRelations = relations(agent, ({ one }) => ({
    user: one(user, {
        fields: [agent.userId],
        references: [user.id],
    }),
    organization: one(organization, {
        fields: [agent.organizationId],
        references: [organization.id],
    }),
}));

export const userAgentRelations = relations(user, ({ many }) => ({
    agents: many(agent),
}));

export const organizationAgentRelations = relations(
    organization,
    ({ many }) => ({
        agents: many(agent),
    }),
);

export type InsertAgent = typeof agent.$inferInsert;
export type SelectAgent = typeof agent.$inferSelect;
