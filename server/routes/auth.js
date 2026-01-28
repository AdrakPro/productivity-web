import express from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { authMiddleware } from "../middleware/auth.js";

export function createAuthRoutes(userRepo) {
    const router = express.Router();

    router.post("/register", async (req, res) => {
        try {
            const { email, username, password } = req.body;

            if (!email || !username || !password) {
                return res
                    .status(400)
                    .json({ error: "All fields are required" });
            }

            if (password.length < 6) {
                return res
                    .status(400)
                    .json({ error: "Password must be at least 6 characters" });
            }

            if (username.length < 3) {
                return res
                    .status(400)
                    .json({ error: "Username must be at least 3 characters" });
            }

            const existingEmail = await userRepo.findByEmail(email);
            if (existingEmail) {
                return res
                    .status(400)
                    .json({ error: "Email already registered" });
            }

            const existingUsername = await userRepo.findByUsername(username);
            if (existingUsername) {
                return res
                    .status(400)
                    .json({ error: "Username already taken" });
            }

            const user = await userRepo.create({ email, username, password });

            const token = jwt.sign(
                { id: user.id, email: user.email, username: user.username },
                config.jwt.secret,
                { expiresIn: config.jwt.expiresIn }
            );

            res.cookie("token", token, {
                httpOnly: true,
                secure: config.nodeEnv === "production",
                sameSite: "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            res.status(201).json({ user, token });
        } catch (error) {
            console.error("Register error:", error);
            res.status(500).json({ error: error.message });
        }
    });

    router.post("/login", async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res
                    .status(400)
                    .json({ error: "Email and password are required" });
            }

            const user = await userRepo.findByEmail(email);
            if (!user) {
                return res.status(401).json({ error: "Invalid credentials" });
            }

            const validPassword = await userRepo.verifyPassword(user, password);
            if (!validPassword) {
                return res.status(401).json({ error: "Invalid credentials" });
            }

            const token = jwt.sign(
                { id: user.id, email: user.email, username: user.username },
                config.jwt.secret,
                { expiresIn: config.jwt.expiresIn }
            );

            res.cookie("token", token, {
                httpOnly: true,
                secure: config.nodeEnv === "production",
                sameSite: "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            res.json({
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                },
                token,
            });
        } catch (error) {
            console.error("Login error:", error);
            res.status(500).json({ error: error.message });
        }
    });

    router.post("/logout", (req, res) => {
        res.clearCookie("token");
        res.json({ success: true });
    });

    router.get("/me", authMiddleware, async (req, res) => {
        try {
            const user = await userRepo.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            res.json(user);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.put("/password", authMiddleware, async (req, res) => {
        try {
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return res
                    .status(400)
                    .json({ error: "Both passwords are required" });
            }

            if (newPassword.length < 6) {
                return res
                    .status(400)
                    .json({
                        error: "New password must be at least 6 characters",
                    });
            }

            const user = await userRepo.findByEmail(req.user.email);
            const validPassword = await userRepo.verifyPassword(
                user,
                currentPassword
            );

            if (!validPassword) {
                return res
                    .status(401)
                    .json({ error: "Current password is incorrect" });
            }

            await userRepo.updatePassword(req.user.id, newPassword);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.delete("/account", authMiddleware, async (req, res) => {
        try {
            await userRepo.delete(req.user.id);
            res.clearCookie("token");
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    return router;
}
