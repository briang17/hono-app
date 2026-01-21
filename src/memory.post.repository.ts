import type { PostRepository } from "./interface.post.repository";
import type { Post } from "./post.entity";

export class MemoryPostRepository implements PostRepository {
	private postStore = new Map<string, Post>();

	public async insertPost(post: Post) {
		try {
			this.postStore.set(post.id, post);
			const savedPost = this.postStore.get(post.id);
			if (!savedPost) {
				throw new Error("Error inserting post");
			}
			return savedPost;
		} catch (e) {
			console.log(e);
			throw e;
		}
	}
}
