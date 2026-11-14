import type { User } from "./entity.js";

export interface UserRepository {
    getById(id: number): Promise<User | null>;
    getByEmail(email: string): Promise<User | null>;
    createUser(user: Omit<User, "id">): Promise<User>;
}
