import {z} from 'zod/v4';

export const OrganizationSchema = z.object({
    id: z.uuid(),
    name: z.string().min(2, "Name is required"),
    logoUrl: z.url()
})

export const CreateOrgSchema = OrganizationSchema.pick({
    name: true,
    logoUrl: true
}).partial({
    logoUrl: true
})

export const UpdateOrgSchema = OrganizationSchema.pick({
    name: true,
    logoUrl: true
}).partial()

export type Organization = z.infer<typeof OrganizationSchema>;

export type CreateOrgInput = z.infer<typeof CreateOrgSchema>;
export type UpdateOrgInput = z.infer<typeof UpdateOrgSchema>;