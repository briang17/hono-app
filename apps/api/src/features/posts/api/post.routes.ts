import { createValidator } from "@middlewares/validation.middleware";
import { CreatePostSchema } from "@posts/api/post.schemas";
import { Hono } from "hono";

const validateCreatePost = createValidator(CreatePostSchema);

export const postRoutes = new Hono();

postRoutes.post("/", validateCreatePost);
