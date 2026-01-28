import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const config = {
    port: parseInt(process.env.PORT) || 3000,
    host: process.env.HOST || "localhost",
    nodeEnv: process.env.NODE_ENV || "development",

    cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:5173",
        credentials: true,
    },

    db: {
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME || "productivity",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "postgres",
    },

    jwt: {
        secret: process.env.JWT_SECRET || "change-this-secret-key",
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    },

    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024,
        uploadDir: path.resolve(
            __dirname,
            "..",
            process.env.UPLOAD_DIR || "uploads"
        ),
    },
};
