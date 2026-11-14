import type { PostRepository } from "../domain/post/repository.js";
import type { PostService } from "./post.types.js";

export function createPostService(postRepository: PostRepository): PostService {
    return {
        async getPosts(categoryName, take, categoryId) {
            return await postRepository.getAll(categoryName, take, categoryId);
        },
        async getPostById(id) {
            return await postRepository.getById(id);
        },
        async getPostsByAuthor(authorId) {
            return await postRepository.getByAuthorId(authorId);
        },
        async createPost(post) {
            return await postRepository.addPost(post);
        },
    };
}
