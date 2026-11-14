import type { Request, Response } from "express";
import type { CategoryService } from "../../services/category.types.js";
import type { CategoryRequest, EmptyParams, EmptyResponse } from "../dto/requests.js";
import type { CategoryResponse } from "../dto/responses.js";
import type { ErrorResponse } from "../dto/errors.js";

export interface CategoryHandlers {
    getCategoriesHandler(req: Request, res: Response<CategoryResponse[] | ErrorResponse>): Promise<void>;
    getCategoryByIdHandler(req: Request, res: Response<CategoryResponse | ErrorResponse>): Promise<void>;
    createCategoryHandler(req: Request<EmptyParams, EmptyResponse, CategoryRequest>, res: Response<CategoryResponse | ErrorResponse>): Promise<void>;
}

export function createCategoryHandlers(categoryService: CategoryService): CategoryHandlers {
    return {
        async getCategoriesHandler(req, res) {
            try {
                const categories = await categoryService.getCategories();
                res.status(200).json(categories);
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Internal server error" });
            }
        },

        async getCategoryByIdHandler(req, res) {
            const id = Number(req.params.id);
            if (!Number.isInteger(id) || id <= 0) {
                res.status(400).json({ message: "Invalid id" });
                return;
            }

            try {
                const category = await categoryService.getCategoryById(id);
                if (!category) {
                    res.status(404).json({ message: "Category not found" });
                    return;
                }

                res.status(200).json(category);
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Internal server error" });
            }
        },

        async createCategoryHandler(req, res) {
            const { name } = req.body ?? {};

            if (typeof name !== "string" || !name.trim()) {
                res.status(422).json({ message: "Invalid category data" });
                return;
            }

            try {
                const category = await categoryService.createCategory({ name: name.trim() });
                res.status(201).json(category);
            } catch (error) {
                if (error instanceof Error && error.message === "CATEGORY_ALREADY_EXISTS") {
                    res.status(409).json({ message: "Category already exists" });
                    return;
                }
                console.error(error);
                res.status(500).json({ message: "Internal server error" });
            }
        },
    };
}
