import type { RefreshSession } from "./entity.js";

export type NewRefreshSession = Omit<RefreshSession, "id" | "createdAt">;

export interface RotateRefreshSession {
    oldHash: string;
    newHash: string;
    expiresAt: Temporal.Instant;
}

export interface RefreshSessionRepository {
    create(session: NewRefreshSession): Promise<void>;
    getByHash(tokenHash: string): Promise<RefreshSession | null>;
    rotate(data: RotateRefreshSession): Promise<boolean>;
    deleteByHash(tokenHash: string): Promise<void>;
}
