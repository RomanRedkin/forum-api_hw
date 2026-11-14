import type { Post } from "../domain/post/entity.js";

export interface PostService {
    getPosts(categoryName?: string, take?: number, categoryId?: number): Promise<Post[]>;
    getPostById(id: number): Promise<Post | null>;
    getPostsByAuthor(authorId: number): Promise<Post[]>;
    createPost(post: Omit<Post, "id" | "category" | "author">): Promise<Post>;
}
