import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./config.js";
import { initializeDatabase } from "./database/connection.js";
import { createRoutes } from "./routes/index.js";
import { runMigrations } from "./database/migrations.js";

const app = express();

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);

            const allowedOrigins = [
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                config.cors.origin,
            ];

            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                console.log("CORS blocked origin:", origin);
                callback(null, true); // Allow anyway for development
            }
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
        exposedHeaders: ["Set-Cookie"],
    })
);

app.options("*", cors());

app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    console.log("  Origin:", req.headers.origin);
    console.log("  Cookies:", req.cookies);
    next();
});

async function startServer() {
    try {
        const pool = await initializeDatabase();
        const routes = createRoutes(pool);

        runMigrations(pool);
        app.use("/api", routes);

        app.get("/health", (req, res) => {
            res.json({ status: "ok", timestamp: new Date().toISOString() });
        });

        app.use((req, res) => {
            res.status(404).json({ error: "Not found" });
        });

        app.use((err, req, res, next) => {
            console.error("Server error:", err);
            res.status(500).json({ error: "Internal server error" });
        });

        app.listen(config.port, config.host, () => {
            console.log(
                `Server running at http://${config.host}:${config.port}`
            );
            console.log(`CORS origin: ${config.cors.origin}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

startServer();
