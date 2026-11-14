import type { Post } from "./entity.js";

export interface PostRepository {
    getAll(categoryName?: string, take?: number, categoryId?: number): Promise<Post[]>;
    getById(id: number): Promise<Post | null>;
    getByAuthorId(authorId: number): Promise<Post[]>;
    addPost(post: Omit<Post, "id" | "category" | "author">): Promise<Post>;
}
