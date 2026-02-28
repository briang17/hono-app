import {
    DateSchema,
    EmailSchema,
    type Id,
    IdSchema,
    PhoneSchema,
} from "@features/common/values";
import { z } from "zod";

export const OpenHouseSchema = z.object({
    id: IdSchema,
    organizationId: IdSchema,
    createdByUserId: IdSchema,
    propertyAddress: z.string().min(1, "Address is required"),
    listingPrice: z.number().positive("Price must be positive"),
    date: DateSchema,
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
    listingImageUrl: z.union([z.url().nullish(), z.literal("")]),
    notes: z.string().nullable(),
    createdAt: DateSchema,
    updatedAt: DateSchema,
});

export const NewOpenHouseSchema = OpenHouseSchema.pick({
    propertyAddress: true,
    listingPrice: true,
    date: true,
    startTime: true,
    endTime: true,
    listingImageUrl: true,
    notes: true,
}).refine((data) => data.startTime < data.endTime, {
    error: "End time must be after start time",
    path: ["endTime"],
});

export const OpenHouseLeadSchema = z.object({
    id: IdSchema,
    openHouseId: IdSchema,
    organizationId: IdSchema,
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.union([EmailSchema.nullish(), z.literal("")]),
    phone: z.union([PhoneSchema.nullish(), z.literal("")]),
    workingWithAgent: z.boolean().default(false),
    submittedAt: DateSchema,
});

export const NewOpenHouseLeadSchema = OpenHouseLeadSchema.pick({
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
    workingWithAgent: true,
}).refine((data) => data.email || data.phone, {
    message: "Email or phone is required",
});

export type OpenHouse = z.infer<typeof OpenHouseSchema>;
export type OpenHouseLead = z.infer<typeof OpenHouseLeadSchema>;

export const OpenHouseFactory = {
    create: (
        params: z.input<typeof NewOpenHouseSchema>,
        organizationId: Id,
        userId: Id,
    ): OpenHouse => {
        const now = new Date();
        const result = OpenHouseSchema.parse({
            ...params,
            id: Bun.randomUUIDv7(),
            organizationId,
            createdByUserId: userId,
            createdAt: now,
            updatedAt: now,
        });
        return result;
    },
    fromDb: (params: z.input<typeof OpenHouseSchema>): OpenHouse => {
        const result = OpenHouseSchema.parse(params);
        return result;
    },
};

export const OpenHouseLeadFactory = {
    create: (
        params: z.input<typeof NewOpenHouseLeadSchema>,
        openHouseId: Id,
        organizationId: Id,
    ): OpenHouseLead => {
        const now = new Date();
        return OpenHouseLeadSchema.parse({
            ...params,
            id: Bun.randomUUIDv7(),
            openHouseId,
            organizationId,
            submittedAt: now,
        });
    },
    fromDb: (params: z.input<typeof OpenHouseLeadSchema>): OpenHouseLead => {
        const result = OpenHouseLeadSchema.parse(params);
        return result;
    },
};
