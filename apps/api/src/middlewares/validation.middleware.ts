import type { Context, Next } from "hono";
import { createMiddleware } from "hono/factory";
import type { z } from "zod/v4";

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

		const validationResult = schema.safeParse(data);

		if (validationResult.error) throw validationResult.error;

		if (validationResult.success) {
			if (type === "body") {
				c.set("validatedData", validationResult.data);
			} else {
				c.set("params", validationResult.data);
			}
			next();
		}
	});
};
