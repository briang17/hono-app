import { z } from "zod";

export const CreateOrganizationSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be at most 50 characters"),
	slug: z.string().min(2, "Slug must be at least 2 characters").max(50, "Slug must be at most 50 characters").regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens allowed"),
});

export type CreateOrganizationInput = z.infer<typeof CreateOrganizationSchema>;
