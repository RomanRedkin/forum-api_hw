import type { UserRepository } from "../domain/user/repository.js";
import type { RefreshSessionRepository } from "../domain/refresh-session/repository.js";
import type {
    AuthService,
    PasswordHasher,
    TokenSigner,
    TokenVerifier,
} from "./auth.types.js";

const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function createAuthService(
    repository: UserRepository,
    sessionRepository: RefreshSessionRepository,
    passwordHasher: PasswordHasher,
    tokenSigner: TokenSigner,
    tokenVerifier: TokenVerifier,
): AuthService {
    const refreshExpiresAt = () =>
        Temporal.Now.instant().add({ milliseconds: REFRESH_TTL_MS });

    return {
        async register(input) {
            const email = input.email.trim().toLowerCase();
            const passwordHash = await passwordHasher.hash(input.password);
            const user = await repository.createUser({ email, password: passwordHash });
            return { id: user.id, email: user.email };
        },
        async login(input) {
            const email = input.email.trim().toLowerCase();
            const user = await repository.getByEmail(email);
            if (
                !user ||
                !(await passwordHasher.verify(user.password, input.password))
            ) {
                throw new Error("INVALID_CREDENTIALS");
            }

            const refreshToken = tokenSigner.signRefreshToken(user.id);
            await sessionRepository.create({
                userId: user.id,
                tokenHash: tokenSigner.hashRefreshToken(refreshToken),
                expiresAt: refreshExpiresAt(),
            });

            return {
                user: { id: user.id, email: user.email },
                accessToken: tokenSigner.signAccessToken(user.id),
                refreshToken,
            };
        },
        async refresh(refreshToken) {
            const userId = tokenVerifier.verifyRefreshToken(refreshToken);
            const refreshHash = tokenSigner.hashRefreshToken(refreshToken);
            const session = await sessionRepository.getByHash(refreshHash);
            if (!session || session.userId !== userId) {
                throw new Error("INVALID_REFRESH_TOKEN");
            }

            const isExpired =
                Temporal.Instant.compare(session.expiresAt, Temporal.Now.instant()) <= 0;
            if (isExpired) throw new Error("INVALID_REFRESH_TOKEN");

            const user = await repository.getById(userId);
            if (!user) throw new Error("INVALID_REFRESH_TOKEN");

            const newRefreshToken = tokenSigner.signRefreshToken(user.id);
            const rotated = await sessionRepository.rotate({
                oldHash: refreshHash,
                newHash: tokenSigner.hashRefreshToken(newRefreshToken),
                expiresAt: refreshExpiresAt(),
            });
            if (!rotated) throw new Error("INVALID_REFRESH_TOKEN");

            return {
                accessToken: tokenSigner.signAccessToken(user.id),
                refreshToken: newRefreshToken,
            };
        },
        async me(userId) {
            const user = await repository.getById(userId);
            if (!user) throw new Error("USER_NOT_FOUND");
            return { id: user.id, email: user.email };
        },
        async logout(refreshToken) {
            if (!refreshToken) return;
            await sessionRepository.deleteByHash(tokenSigner.hashRefreshToken(refreshToken));
        },
    };
}
