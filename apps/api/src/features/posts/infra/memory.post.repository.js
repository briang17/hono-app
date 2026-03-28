export class MemoryPostRepository {
    postStore = new Map();
    insertPost(post) {
        try {
            this.postStore.set(post.id, post);
            const savedPost = this.postStore.get(post.id);
            if (!savedPost) {
                throw new Error("Error inserting post");
            }
            return savedPost;
        }
        catch (e) {
            console.log(e);
            throw e;
        }
    }
}
