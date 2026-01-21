import type { z } from "zod/v4";
import { PostSchema } from "./post.entity";

export const CreatePostSchema = PostSchema.pick({ authorId: true, body: true });
export type CreatePostType = z.infer<typeof CreatePostSchema>;
