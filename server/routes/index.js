import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { createAuthRoutes } from "./auth.js";
import { createTodoRoutes } from "./todos.js";
import { createSubtaskRoutes } from "./subtasks.js";
import { createUserFileRoutes } from "./userFiles.js";
import { createStatisticsRoutes } from "./statistics.js";
import { createStreaksRoutes } from "./streaks.js";
import { createSettingsRoutes } from "./settings.js";

import { UserRepository } from "../database/repositories/userRepository.js";
import { TodoRepository } from "../database/repositories/todoRepository.js";
import { SubtaskRepository } from "../database/repositories/subtaskRepository.js";
import { UserFileRepository } from "../database/repositories/userFileRepository.js";
import { StatisticsRepository } from "../database/repositories/statisticsRepository.js";
import { StreaksRepository } from "../database/repositories/streaksRepository.js";
import { SettingsRepository } from "../database/repositories/settingsRepository.js";

export function createRoutes(pool) {
    const router = express.Router();

    const userRepo = new UserRepository(pool);
    const todoRepo = new TodoRepository(pool);
    const subtaskRepo = new SubtaskRepository(pool);
    const userFileRepo = new UserFileRepository(pool);
    userFileRepo.pool = pool; // For upload route
    const statisticsRepo = new StatisticsRepository(pool);
    const streaksRepo = new StreaksRepository(pool);
    const settingsRepo = new SettingsRepository(pool);

    router.use("/auth", createAuthRoutes(userRepo));

    router.get("/health", (req, res) => {
        res.json({ status: "ok", timestamp: new Date().toISOString() });
    });

    router.use(
        "/todos",
        authMiddleware,
        createTodoRoutes(todoRepo, subtaskRepo)
    );
    router.use(
        "/subtasks",
        authMiddleware,
        createSubtaskRoutes(subtaskRepo, todoRepo)
    );
    router.use("/files", authMiddleware, createUserFileRoutes(userFileRepo));
    router.use(
        "/statistics",
        authMiddleware,
        createStatisticsRoutes(statisticsRepo)
    );
    router.use("/streaks", authMiddleware, createStreaksRoutes(streaksRepo));
    router.use("/settings", authMiddleware, createSettingsRoutes(settingsRepo));

    return router;
}
