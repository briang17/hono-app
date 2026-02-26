import type { Context, Next, ValidationTargets } from "hono";
import { createMiddleware } from "hono/factory";
import { z, type ZodType } from "zod/v4";
import { zValidator } from '@hono/zod-validator'

export const createValidatoor = (schema: ZodType, type: keyof ValidationTargets) => {
	return zValidator(type, schema);
}


export const createValidator = (
	schema: z.ZodType,
	type: "body" | "params" = "body",
) => {
	return createMiddleware(async (c: Context, next: Next) => {
		let data;
		if (type === "body") {
			data = await c.req.json();
		} else if (type === "params") {
			data = c.req.param();
		}

		console.log(`[VALIDATOR] ${type} validation:`, { input: data });

		const validationResult = schema.safeParse(data);

		if (validationResult.error) {
			console.error(
				`[VALIDATOR] ${type} validation failed:`,
				validationResult.error,
			);
			throw validationResult.error;
		}

		if (validationResult.success) {
			if (type === "body") {
				c.set("validatedData", validationResult.data);
			} else {
				c.set("params", validationResult.data);
			}
			return await next();
		}
	});
};
