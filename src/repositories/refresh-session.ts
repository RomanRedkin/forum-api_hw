import type { RefreshSessionRepository } from "../domain/refresh-session/repository.js";
import type { Database } from "../prisma/db.js";

export function createRefreshSessionRepository(db: Database): RefreshSessionRepository {
    return {
        async create(session) {
            await db.orm.public.RefreshSession.create({
                userId: session.userId,
                tokenHash: session.tokenHash,
                expiresAt: session.expiresAt,
            });
        },

        async getByHash(tokenHash) {
            return await db.orm.public.RefreshSession.where({ tokenHash }).first();
        },

        async rotate({ oldHash, newHash, expiresAt }) {
            const updated = await db.orm.public.RefreshSession.where({ tokenHash: oldHash }).update({
                tokenHash: newHash,
                expiresAt,
            });
            return updated !== null;
        },

        async deleteByHash(tokenHash) {
            await db.orm.public.RefreshSession.where({ tokenHash }).delete();
        },
    };
}
