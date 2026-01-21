import type { Context, Next } from "hono";
import { createMiddleware } from "hono/factory";
import type { z } from "zod/v4";
export const createValidator = (schema: z.ZodType) => {
	return createMiddleware(async (c: Context, next: Next) => {
		const body = c.req.json();

		const validationResult = schema.safeParse(body);

		if (validationResult.error) throw validationResult.error;

		if (validationResult.success) {
			c.set("parsedBody", validationResult.data);

			console.log(`Validated: ${c.get("parsedBody")}`);
			next();
		}
	});
};
