import { type Id } from "@features/common/values";
import { z } from "zod/v4";
export declare const PostSchema: z.ZodObject<{
    id: z.ZodUUID;
    authorId: z.ZodUUID;
    body: z.ZodString;
    createdAt: z.ZodOptional<z.ZodISODateTime>;
    updatedAt: z.ZodOptional<z.ZodISODateTime>;
    deletedAt: z.ZodOptional<z.ZodISODateTime>;
}, z.core.$strip>;
export type Post = z.infer<typeof PostSchema>;
export declare const PostFactory: {
    new: (authorId: Id, body: string) => Post;
};
