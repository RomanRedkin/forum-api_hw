import express from "express";
import cookieParser from "cookie-parser";
import { createPostRepository } from "./repositories/post.js";
import { createCategoryRepository } from "./repositories/category.js";
import { createUserRepository } from "./repositories/user.js";
import { createRefreshSessionRepository } from "./repositories/refresh-session.js";
import { createPostService } from "./services/post.js";
import { createCategoryService } from "./services/category.js";
import { createAuthService } from "./services/auth.js";
import { createPostHandlers } from "./transport/handlers/post.js";
import { createCategoryHandlers } from "./transport/handlers/category.js";
import { createAuthHandlers } from "./transport/handlers/auth.js";
import { createPostRouter } from "./transport/routers/post.js";
import { createCategoryRouter } from "./transport/routers/category.js";
import { createAuthRouter } from "./transport/routers/auth.js";
import { createRequireAuth } from "./transport/middlewares/require-auth.js";
import * as passwordHasher from "./lib/password.js";
import * as jwt from "./lib/jwt.js";
import { db } from "./prisma/db.js";

const app = express();
app.use(express.json());
app.use(cookieParser());

const HOST = "localhost";
const PORT = 3000;

const requireAuth = createRequireAuth(jwt.verifyAccessToken);

const postRepository = createPostRepository(db);
const postService = createPostService(postRepository);
const postHandlers = createPostHandlers(postService);
const postRouter = createPostRouter(postHandlers, requireAuth);

const categoryRepository = createCategoryRepository(db);
const categoryService = createCategoryService(categoryRepository);
const categoryHandlers = createCategoryHandlers(categoryService);
const categoryRouter = createCategoryRouter(categoryHandlers);

const userRepository = createUserRepository(db);
const refreshSessionRepository = createRefreshSessionRepository(db);
const authService = createAuthService(userRepository, refreshSessionRepository, passwordHasher, jwt, jwt);
const authHandlers = createAuthHandlers(authService);
const authRouter = createAuthRouter(authHandlers, requireAuth);

app.use(postRouter);
app.use(categoryRouter);
app.use("/auth", authRouter);

app.listen(PORT, HOST, () => {
    console.log(`http://${HOST}:${PORT}`);
});
