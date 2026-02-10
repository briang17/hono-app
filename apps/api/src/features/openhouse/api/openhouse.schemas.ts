import { z } from "zod";

export const CreateOpenHouseSchema = z
	.object({
		propertyAddress: z.string().min(1, "Address is required"),
		listingPrice: z.number().positive("Price must be positive"),
		date: z.coerce.date(),
		startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
		endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
		listingImageUrl: z.string().url().optional().or(z.literal("")),
		notes: z.string().optional(),
	})
	.refine((data) => data.startTime < data.endTime, {
		message: "End time must be after start time",
		path: ["endTime"],
	});

export const CreateOpenHouseLeadSchema = z
	.object({
		firstName: z.string().min(1, "First name is required"),
		lastName: z.string().min(1, "Last name is required"),
		email: z.string().email().optional().or(z.literal("")),
		phone: z.string().optional().or(z.literal("")),
		workingWithAgent: z.boolean().default(false),
	})
	.refine((data) => data.email || data.phone, {
		message: "Email or phone is required",
	});

export const OpenHouseIdParamsSchema = z.object({
	id: z.string().uuid(),
});

export type CreateOpenHouseInput = z.infer<typeof CreateOpenHouseSchema>;
export type CreateOpenHouseLeadInput = z.infer<
	typeof CreateOpenHouseLeadSchema
>;
