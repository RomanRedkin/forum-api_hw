import express, { type RequestHandler } from "express";
import type { PostHandlers } from "../handlers/post.js";

export function createPostRouter(handlers: PostHandlers, requireAuth: RequestHandler) {
    const router = express.Router();

    router.get("/posts", handlers.getPostsHandler);
    router.get("/posts/my", requireAuth, handlers.getMyPostsHandler);
    router.get("/posts/:id", handlers.getPostByIdHandler);
    router.post("/posts", handlers.createPostHandler);

    return router;
}
