import type { PostRepository } from "@posts/domain/interface.post.repository";
import type { Post } from "@posts/domain/post.entity";
export declare class MemoryPostRepository implements PostRepository {
    private postStore;
    insertPost(post: Post): {
        id: string;
        authorId: string;
        body: string;
        createdAt?: string | undefined;
        updatedAt?: string | undefined;
        deletedAt?: string | undefined;
    };
}
