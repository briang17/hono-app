import { PostSchema } from "@posts/domain/post.entity";
export const CreatePostSchema = PostSchema.pick({ authorId: true, body: true });
