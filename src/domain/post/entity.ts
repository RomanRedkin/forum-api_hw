import type { Category } from "../category/entity.js";

export interface Author {
    id: number;
    email: string;
}

export interface Post {
    id: number;
    title: string;
    content: string;
    authorId: number;
    author?: Author;
    categoryId: number;
    category?: Category;
}
