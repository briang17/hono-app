import { z } from "zod";

export const FubPersonSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().optional(),
    phone: z.string().optional(),
    contacted: z.boolean().default(false),
    stage: z.string().default("Attempted Contact"),
    source: z.string().default("Sphere"),
    price: z.number().optional(),
    assignedUserId: z.number(),
    emails: z.array(z.object({ value: z.string() })).optional(),
    phones: z.array(z.object({ value: z.string() })).optional(),
    tags: z.array(z.string()).default([]),
});

export const FubPropertySchema = z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    code: z.string().optional(),
    price: z.number().optional(),
    type: z.string().optional(),
    bedrooms: z.string().optional(),
    bathrooms: z.string().optional(),
    area: z.string().optional(),
    lot: z.string().optional(),
});

export const FubEventJobDataSchema = z.object({
    person: FubPersonSchema,
    property: FubPropertySchema.optional(),
    type: z.string().default("Visited Open House"),
    system: z.string().default("ANEWCo"),
    source: z.string().default("Sphere"),
    message: z.string().optional(),
    description: z.string().optional(),
    note: z
        .object({
            subject: z.string(),
            body: z.string(),
        })
        .nullable()
        .optional(),
});

export type FubEventJobData = z.infer<typeof FubEventJobDataSchema>;
