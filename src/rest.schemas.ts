import { z } from "zod/v4";
import { DateSchema, IdSchema } from "./values";

export const BaseQuerySchema = z.object({
	createdFrom: DateSchema,
	createdAfter: DateSchema,
	userId: IdSchema,
});
