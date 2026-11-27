export interface RefreshSession {
    id: number;
    userId: number;
    tokenHash: string;
    expiresAt: Temporal.Instant;
    createdAt: Temporal.Instant;
}
