import type { z } from "zod/v4";
export declare const CreatePostSchema: z.ZodObject<{
    body: z.ZodString;
    authorId: z.ZodUUID;
}, z.core.$strip>;
export type CreatePostType = z.infer<typeof CreatePostSchema>;
