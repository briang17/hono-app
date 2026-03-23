import { relations } from "drizzle-orm";
import {
    boolean,
    jsonb,
    numeric,
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";
import { organization, user } from "./auth.schema";

export const openHouse = pgTable("open_house", {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
        .notNull()
        .references(() => organization.id, { onDelete: "cascade" }),
    createdByUserId: uuid("created_by_user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    propertyAddress: text("property_address").notNull(),
    listingPrice: numeric("listing_price", {
        precision: 10,
        scale: 2,
        mode: "number",
    }).notNull(),
    date: timestamp("date", { mode: "date" }).notNull(),
    startTime: text("start_time").notNull(),
    endTime: text("end_time").notNull(),
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
    responses: jsonb("responses"),
});

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

export const userOpenHouseRelations = relations(user, ({ many }) => ({
    createdOpenHouses: many(openHouse),
}));

export const organizationOpenHouseRelations = relations(
    organization,
    ({ many }) => ({
        openHouses: many(openHouse),
    }),
);

export type InsertOpenHouse = typeof openHouse.$inferInsert;
export type SelectOpenHouse = typeof openHouse.$inferSelect;
export type InsertOpenHouseLead = typeof openHouseLead.$inferInsert;
export type SelectOpenHouseLead = typeof openHouseLead.$inferSelect;
