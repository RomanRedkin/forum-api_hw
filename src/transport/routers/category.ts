import express from "express";
import type { CategoryHandlers } from "../handlers/category.js";

export function createCategoryRouter(handlers: CategoryHandlers) {
    const router = express.Router();

    router.get("/categories", handlers.getCategoriesHandler);
    router.get("/categories/:id", handlers.getCategoryByIdHandler);
    router.post("/categories", handlers.createCategoryHandler);

    return router;
}
