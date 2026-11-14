import type { CategoryRepository } from "../domain/category/repository.js";
import type { Database } from "../prisma/db.js";

export function createCategoryRepository(db: Database): CategoryRepository {
    return {
        async getAll() {
            return await db.orm.public.Category.orderBy((category) => category.id.asc()).all();
        },

        async getById(id) {
            return await db.orm.public.Category.where({ id }).first();
        },

        async addCategory(category) {
            try {
                return await db.orm.public.Category.create({ name: category.name });
            } catch (error: any) {
                if (error?.sqlState === "23505") {
                    throw new Error("CATEGORY_ALREADY_EXISTS");
                }
                throw error;
            }
        },
    };
}
