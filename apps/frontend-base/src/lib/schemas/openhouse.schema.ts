import { z } from 'zod/v4'
import { FormConfigSchema } from './form-builder.schema'

export const openHouseImageSchema = z.object({
    id: z.uuid(),
    openHouseId: z.uuid(),
    url: z.url(),
    publicId: z.string().min(1),
    isMain: z.boolean(),
    orderIndex: z.number().int().min(0),
    createdAt: z.date(),
})

export const newOpenHouseImageSchema = z.object({
    url: z.url(),
    publicId: z.string().min(1),
    isMain: z.boolean(),
    orderIndex: z.number().int().min(0),
})

export const existingOpenHouseImageSchema = z.object({
    id: z.uuid(),
    publicId: z.string().min(1),
    url: z.url(),
    isMain: z.boolean(),
    orderIndex: z.number().int().min(0),
})

export const updateOpenHouseImageSchema = z.union([
    existingOpenHouseImageSchema,
    newOpenHouseImageSchema,
])

export const agentInfoSchema = z.object({
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    phone: z.string().nullable(),
    email: z.string().nullable(),
    imageUrl: z.string().nullable().optional(),
    imagePublicId: z.string().nullable().optional(),
})

export const openHouseSchema = z.object({
    id: z.uuid(),
    organizationId: z.uuid(),
    createdByUserId: z.uuid(),
    propertyAddress: z.string().min(1, 'Property address is required'),
    listingPrice: z.number().positive('Price must be positive'),
    bedrooms: z.number().int().positive().nullable().optional(),
    bathrooms: z.number().positive().nullable().optional(),
    features: z.array(z.string()).nullable().optional(),
    date: z.coerce.date(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
    images: z.array(openHouseImageSchema),
    notes: z.string().nullish(),
    agent: agentInfoSchema.nullable().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export const createOpenHouseSchema = openHouseSchema
    .pick({
        propertyAddress: true,
        listingPrice: true,
        date: true,
        startTime: true,
        endTime: true,
        notes: true,
        bedrooms: true,
        bathrooms: true,
        features: true,
    })
    .extend({
        images: z.array(newOpenHouseImageSchema),
    })
    .refine((data) => data.startTime < data.endTime, {
        message: 'End time must be after start time',
        path: ['endTime'],
    })

export const updateOpenHouseSchema = openHouseSchema
    .pick({
        propertyAddress: true,
        listingPrice: true,
        date: true,
        startTime: true,
        endTime: true,
        notes: true,
        bedrooms: true,
        bathrooms: true,
        features: true,
    })
    .extend({
        images: z.array(updateOpenHouseImageSchema),
    })
    .refine((data) => data.startTime < data.endTime, {
        message: 'End time must be after start time',
        path: ['endTime'],
    })

export const openHouseLeadSchema = z.object({
    id: z.uuid(),
    openHouseId: z.uuid(),
    organizationId: z.uuid(),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.email().nullable(),
    phone: z.string().nullable(),
    workingWithAgent: z.boolean(),
    submittedAt: z.date(),
    responses: z
        .record(
            z.string(),
            z.union([z.string(), z.number(), z.array(z.string()), z.array(z.number())]),
        )
        .nullable()
        .nullish(),
})

export const createOpenHouseLeadSchema = openHouseLeadSchema
    .pick({
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        workingWithAgent: true,
    })
    .refine((data) => data.email || data.phone, {
        message: 'Either email or phone is required',
        path: ['email'],
    })

export const leadsWithFormConfigSchema = z.object({
    leads: z.array(openHouseLeadSchema),
    formConfig: FormConfigSchema.nullable(),
})

export const publicOpenHouseSchema = z.object({
    id: z.uuid(),
    propertyAddress: z.string().min(1),
    bedrooms: z.number().int().positive().nullable().optional(),
    bathrooms: z.number().positive().nullable().optional(),
    features: z.array(z.string()).nullable().optional(),
    date: z.date(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
    images: z.array(openHouseImageSchema).default([]),
    formConfig: FormConfigSchema.nullable(),
})

export type OpenHouseImage = z.infer<typeof openHouseImageSchema>
export type NewOpenHouseImageInput = z.infer<typeof newOpenHouseImageSchema>
export type ExistingOpenHouseImage = z.infer<typeof existingOpenHouseImageSchema>
export type UpdateOpenHouseImage = z.infer<typeof updateOpenHouseImageSchema>
export type OpenHouse = z.infer<typeof openHouseSchema>
export type AgentInfo = z.infer<typeof agentInfoSchema>
export type CreateOpenHouseInput = z.infer<typeof createOpenHouseSchema>
export type UpdateOpenHouseInput = z.infer<typeof updateOpenHouseSchema>
export type OpenHouseLead = z.infer<typeof openHouseLeadSchema>
export type CreateOpenHouseLeadInput = z.infer<typeof createOpenHouseLeadSchema>
export type PublicOpenHouse = z.infer<typeof publicOpenHouseSchema>
export type LeadsWithFormConfig = z.infer<typeof leadsWithFormConfigSchema>

export const teamOpenHouseSchema = openHouseSchema.extend({
    creatorFirstName: z.string().nullable(),
    creatorLastName: z.string().nullable(),
})

export type TeamOpenHouse = z.infer<typeof teamOpenHouseSchema>
