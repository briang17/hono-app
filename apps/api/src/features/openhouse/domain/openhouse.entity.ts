import { z } from "zod";

const OpenHouseEntitySchema = z.object({
	id: z.string().uuid(),
	organizationId: z.string().uuid(),
	createdByUserId: z.string().uuid(),
	propertyAddress: z.string(),
	listingPrice: z.number(),
	date: z.date(),
	startTime: z.string(),
	endTime: z.string(),
	listingImageUrl: z.string().nullable(),
	notes: z.string().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

const OpenHouseLeadEntitySchema = z.object({
	id: z.string().uuid(),
	openHouseId: z.string().uuid(),
	organizationId: z.string().uuid(),
	firstName: z.string(),
	lastName: z.string(),
	email: z.string().nullable(),
	phone: z.string().nullable(),
	workingWithAgent: z.boolean(),
	submittedAt: z.date(),
});

export type OpenHouse = z.infer<typeof OpenHouseEntitySchema>;
export type OpenHouseLead = z.infer<typeof OpenHouseLeadEntitySchema>;

export const OpenHouseFactory = {
	create: (params: z.input<typeof OpenHouseEntitySchema>): OpenHouse => {
		return OpenHouseEntitySchema.parse(params);
	},
};

export const OpenHouseLeadFactory = {
	create: (
		params: z.input<typeof OpenHouseLeadEntitySchema>,
	): OpenHouseLead => {
		return OpenHouseLeadEntitySchema.parse(params);
	},
};
