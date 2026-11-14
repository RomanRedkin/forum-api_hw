import type { CategoryRepository } from "../domain/category/repository.js";
import type { CategoryService } from "./category.types.js";

export function createCategoryService(categoryRepository: CategoryRepository): CategoryService {
    return {
        async getCategories() {
            return await categoryRepository.getAll();
        },
        async getCategoryById(id) {
            return await categoryRepository.getById(id);
        },
        async createCategory(category) {
            return await categoryRepository.addCategory(category);
        },
    };
}
