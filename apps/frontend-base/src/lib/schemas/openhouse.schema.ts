import { z } from 'zod/v4'
import { FormConfigSchema } from './form-builder.schema'

export const openHouseSchema = z.object({
    id: z.uuid(),
    organizationId: z.uuid(),
    createdByUserId: z.uuid(),
    propertyAddress: z.string().min(1, 'Property address is required'),
    listingPrice: z.number().positive('Price must be positive'),
    date: z.date(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
    listingImageUrl: z.url().nullish(),
    notes: z.string().nullish(),
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
        listingImageUrl: true,
        notes: true,
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
    date: z.date(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
    listingImageUrl: z.url().nullish(),
    formConfig: FormConfigSchema.nullable(),
})

export type OpenHouse = z.infer<typeof openHouseSchema>
export type CreateOpenHouseInput = z.infer<typeof createOpenHouseSchema>
export type OpenHouseLead = z.infer<typeof openHouseLeadSchema>
export type CreateOpenHouseLeadInput = z.infer<typeof createOpenHouseLeadSchema>
export type PublicOpenHouse = z.infer<typeof publicOpenHouseSchema>
export type LeadsWithFormConfig = z.infer<typeof leadsWithFormConfigSchema>
