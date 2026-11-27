export interface AuthInput {
    email: string;
    password: string;
}

export interface AuthUser {
    id: number;
    email: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface PasswordHasher {
    hash(password: string): Promise<string>;
    verify(passwordHash: string, password: string): Promise<boolean>;
}

export interface TokenSigner {
    signAccessToken(userId: number): string;
    signRefreshToken(userId: number): string;
    hashRefreshToken(token: string): string;
}

export interface TokenVerifier {
    verifyAccessToken(token: string): number;
    verifyRefreshToken(token: string): number;
}

export interface AuthService {
    register(input: AuthInput): Promise<AuthUser>;
    login(input: AuthInput): Promise<{ user: AuthUser } & AuthTokens>;
    refresh(refreshToken: string): Promise<AuthTokens>;
    me(userId: number): Promise<AuthUser>;
    logout(refreshToken: string | undefined): Promise<void>;
}
