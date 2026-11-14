import type { UserRepository } from "../domain/user/repository.js";
import type { Database } from "../prisma/db.js";

export function createUserRepository(db: Database): UserRepository {
    return {
        async getById(id) {
            return await db.orm.public.User.where({ id }).first();
        },

        async getByEmail(email) {
            return await db.orm.public.User.where({ email }).first();
        },

        async createUser(user) {
            try {
                return await db.orm.public.User.create({
                    email: user.email,
                    password: user.password,
                });
            } catch (error: any) {
                if (error?.sqlState === "23505") {
                    throw new Error("EMAIL_ALREADY_EXISTS");
                }
                throw error;
            }
        },
    };
}
