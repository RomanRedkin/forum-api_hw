import type { Request, Response } from "express";
import type { PostService } from "../../services/post.types.js";
import type { Post } from "../../domain/post/entity.js";
import type { PostRequest, EmptyParams, EmptyResponse } from "../dto/requests.js";
import type { PostResponse } from "../dto/responses.js";
import type { ErrorResponse } from "../dto/errors.js";

export interface PostHandlers {
    getPostsHandler(req: Request, res: Response<PostResponse[] | ErrorResponse>): Promise<void>;
    getMyPostsHandler(req: Request, res: Response<PostResponse[] | ErrorResponse>): Promise<void>;
    getPostByIdHandler(req: Request, res: Response<PostResponse | ErrorResponse>): Promise<void>;
    createPostHandler(req: Request<EmptyParams, EmptyResponse, PostRequest>, res: Response<PostResponse | ErrorResponse>): Promise<void>;
}

function toPostResponse(post: Post): PostResponse {
    return {
        id: post.id,
        title: post.title,
        content: post.content,
        author: post.author ?? null,
        category: post.category ?? null,
    };
}

export function createPostHandlers(postService: PostService): PostHandlers {
    return {
        async getPostsHandler(req, res) {
            const { category, categoryId, take } = req.query;

            let numberTake: number | undefined = undefined;
            if (take !== undefined) {
                numberTake = Number(take);
                if (Number.isNaN(numberTake) || !Number.isInteger(numberTake) || numberTake <= 0) {
                    res.status(400).json({ message: "Invalid take" });
                    return;
                }
            }

            let numberCategoryId: number | undefined = undefined;
            if (categoryId !== undefined) {
                numberCategoryId = Number(categoryId);
                if (!Number.isInteger(numberCategoryId) || numberCategoryId <= 0) {
                    res.status(400).json({ message: "Invalid categoryId" });
                    return;
                }
            }

            try {
                const posts = await postService.getPosts(
                    typeof category === "string" ? category : undefined,
                    numberTake,
                    numberCategoryId,
                );
                res.status(200).json(posts.map(toPostResponse));
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Internal server error" });
            }
        },

        async getMyPostsHandler(req, res) {
            try {
                const posts = await postService.getPostsByAuthor(res.locals.userId);
                res.status(200).json(posts.map(toPostResponse));
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Internal server error" });
            }
        },

        async getPostByIdHandler(req, res) {
            const id = Number(req.params.id);
            if (!Number.isInteger(id) || id <= 0) {
                res.status(400).json({ message: "Invalid id" });
                return;
            }

            try {
                const post = await postService.getPostById(id);
                if (!post) {
                    res.status(404).json({ message: "Post not found" });
                    return;
                }

                res.status(200).json(toPostResponse(post));
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Internal server error" });
            }
        },

        async createPostHandler(req, res) {
            const { title, content, authorId, categoryId } = req.body ?? {};

            if (
                typeof title !== "string" || !title.trim() ||
                typeof content !== "string" || !content.trim()
            ) {
                res.status(422).json({ message: "Invalid post data" });
                return;
            }

            if (!Number.isInteger(categoryId) || categoryId <= 0) {
                res.status(400).json({ message: "Invalid categoryId" });
                return;
            }

            if (!Number.isInteger(authorId) || authorId <= 0) {
                res.status(400).json({ message: "Invalid authorId" });
                return;
            }

            try {
                const post = await postService.createPost({
                    title: title.trim(),
                    content: content.trim(),
                    authorId,
                    categoryId,
                });

                res.status(201).json(toPostResponse(post));
            } catch (error) {
                if (error instanceof Error && error.message === "CATEGORY_NOT_FOUND") {
                    res.status(404).json({ message: "Category not found" });
                    return;
                }
                if (error instanceof Error && error.message === "AUTHOR_NOT_FOUND") {
                    res.status(404).json({ message: "Author not found" });
                    return;
                }
                console.error(error);
                res.status(500).json({ message: "Internal server error" });
            }
        },
    };
}
