import { Hono } from "hono";
import { CreatePostSchema } from "./post.schemas";
import { createValidator } from "./validation.middleware";

const validateCreatePost = createValidator(CreatePostSchema);

export const postRoutes = new Hono();

postRoutes.post("/", validateCreatePost);
