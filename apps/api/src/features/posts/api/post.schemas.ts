import { PostSchema } from "@posts/domain/post.entity";
import type { z } from "zod/v4";

export const CreatePostSchema = PostSchema.pick({ authorId: true, body: true });
export type CreatePostType = z.infer<typeof CreatePostSchema>;
