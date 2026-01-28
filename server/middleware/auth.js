import jwt from "jsonwebtoken";
import { config } from "../config.js";

export function authMiddleware(req, res, next) {
    try {
        let token = req.cookies?.token;

        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
            }
        }

        if (!token) {
            return res.status(401).json({ error: "Authentication required" });
        }

        const decoded = jwt.verify(token, config.jwt.secret);

        req.user = {
            id: decoded.id,
            email: decoded.email,
            username: decoded.username,
        };

        console.log("Auth middleware - user:", req.user);

        next();
    } catch (error) {
        console.error("Auth middleware error:", error.message);
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}
