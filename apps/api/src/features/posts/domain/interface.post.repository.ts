import type { Post } from "./post.entity";

export interface PostRepository {
	insertPost: (post: Post) => Post;
}
