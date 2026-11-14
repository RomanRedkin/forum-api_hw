import type { Post } from "../domain/post/entity.js";
import type { PostRepository } from "../domain/post/repository.js";
import type { Database } from "../prisma/db.js";

const formatPostResponse = (postItem: any): Post => {
    return {
        id: postItem.id,
        title: postItem.title,
        content: postItem.content,
        authorId: postItem.authorId,
        categoryId: postItem.categoryId,
        ...(postItem.author && {
            author: {
                id: postItem.author.id,
                email: postItem.author.email,
            },
        }),
        ...(postItem.category && {
            category: {
                id: postItem.category.id,
                name: postItem.category.name,
            },
        }),
    };
};

export function createPostRepository(db: Database): PostRepository {
    const postsWithRelations = () => db.orm.public.Post.include("category").include("author");

    return {
        async getAll(categoryName, take, categoryId) {
            if (categoryName !== undefined) {
                const category = await db.orm.public.Category.where({ name: categoryName }).first();
                if (!category) {
                    return [];
                }
                categoryId = category.id;
            }

            const filter = categoryId !== undefined ? { categoryId } : {};
            const query = postsWithRelations().where(filter).orderBy((post) => post.id.asc());

            const allPosts = take !== undefined ? await query.limit(take).all() : await query.all();

            return allPosts.map((postItem) => formatPostResponse(postItem));
        },

        async getById(id) {
            const foundPost = await postsWithRelations().where({ id }).first();

            return foundPost ? formatPostResponse(foundPost) : null;
        },

        async getByAuthorId(authorId) {
            const authorPosts = await postsWithRelations()
                .where({ authorId })
                .orderBy((post) => post.id.asc())
                .all();

            return authorPosts.map((postItem) => formatPostResponse(postItem));
        },

        async addPost(post) {
            try {
                const createdPost = await postsWithRelations().create({
                    title: post.title,
                    content: post.content,
                    category: (category) => category.connect({ id: post.categoryId }),
                    author: (author) => author.connect({ id: post.authorId }),
                });

                return formatPostResponse(createdPost);
            } catch (error: any) {
                if (error?.code === "ORM.RELATION_ROW_MISSING") {
                    if (String(error.message).includes('"author"')) {
                        throw new Error("AUTHOR_NOT_FOUND");
                    }
                    throw new Error("CATEGORY_NOT_FOUND");
                }
                throw error;
            }
        },
    };
}
