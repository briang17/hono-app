import { randomUUIDv7 } from "bun";
import { string, z } from "zod/v4";
import { type Id, IdSchema, type Timestamp, TimestampSchema } from "./values";

export const PostSchema = z.object({
	id: IdSchema,
	authorId: IdSchema,
	body: string(),
	createdAt: TimestampSchema.optional(),
	updatedAt: TimestampSchema.optional(),
	deletedAt: TimestampSchema.optional(),
});

export type Post = z.infer<typeof PostSchema>;

export const PostFactory = {
	new: (authorId: Id, body: string): Post => {
		const now = new Date();
		const nowTimestamp = now.toISOString();
		const newPost = PostSchema.safeParse({
			id: randomUUIDv7(undefined, now),
			authorId: authorId,
			body: body,
			createdAt: nowTimestamp,
			updatedAt: nowTimestamp,
		});
		if (newPost.error) throw new Error("Invalid Post data");

		return newPost.data;
	},
};
