import type { Request, Response } from "express";
import type { AuthService, AuthTokens } from "../../services/auth.types.js";

export interface AuthHandlers {
    register(req: Request, res: Response): Promise<void>;
    login(req: Request, res: Response): Promise<void>;
    refresh(req: Request, res: Response): Promise<void>;
    me(req: Request, res: Response): Promise<void>;
}

const secure = process.env.NODE_ENV === "production";

function setAuthCookies(res: Response, tokens: AuthTokens): void {
    res.cookie("accessToken", tokens.accessToken, {
        httpOnly: true,
        secure,
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
        path: "/",
    });
    res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/auth",
    });
}

export function createAuthHandlers(service: AuthService): AuthHandlers {
    return {
        async register(req, res) {
            try {
                const { email, password } = req.body ?? {};
                if (
                    typeof email !== "string" || !email.includes("@") ||
                    typeof password !== "string" || password.length < 6
                ) {
                    res.status(422).json({ message: "Invalid email or password" });
                    return;
                }

                const user = await service.register({ email, password });
                res.status(201).json(user);
            } catch (error) {
                if (error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS") {
                    res.status(409).json({ message: "Email already exists" });
                    return;
                }
                console.error(error);
                res.status(500).json({ message: "Internal server error" });
            }
        },

        async login(req, res) {
            try {
                const { email, password } = req.body ?? {};
                if (typeof email !== "string" || typeof password !== "string") {
                    res.status(422).json({ message: "Invalid email or password" });
                    return;
                }

                const { user, accessToken, refreshToken } = await service.login({ email, password });
                setAuthCookies(res, { accessToken, refreshToken });
                res.status(200).json(user);
            } catch (error) {
                if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
                    res.status(401).json({ message: "Invalid email or password" });
                    return;
                }
                console.error(error);
                res.status(500).json({ message: "Internal server error" });
            }
        },

        async refresh(req, res) {
            const token = req.cookies?.refreshToken;
            if (typeof token !== "string") {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }
            try {
                const tokens = await service.refresh(token);
                setAuthCookies(res, tokens);
                res.status(200).json({ message: "Tokens updated" });
            } catch (error) {
                if (
                    error instanceof Error &&
                    error.message === "INVALID_REFRESH_TOKEN"
                ) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                console.error(error);
                res.status(500).json({ message: "Internal server error" });
            }
        },

        async me(req, res) {
            try {
                const user = await service.me(res.locals.userId);
                res.status(200).json(user);
            } catch (error) {
                if (error instanceof Error && error.message === "USER_NOT_FOUND") {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                console.error(error);
                res.status(500).json({ message: "Internal server error" });
            }
        },
    };
}
