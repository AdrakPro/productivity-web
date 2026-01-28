import pg from "pg";
import { config } from "../config.js";

const { Pool } = pg;

let pool = null;

export async function initializeDatabase() {
    if (pool) return pool;

    pool = new Pool({
        host: config.db.host,
        port: config.db.port,
        database: config.db.database,
        user: config.db.user,
        password: config.db.password,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    });

    try {
        const client = await pool.connect();
        console.log(
            "✓ Database connected:",
            `${config.db.host}:${config.db.port}/${config.db.database}`
        );
        client.release();
    } catch (error) {
        console.error("✗ Database connection failed:", error.message);
        throw error;
    }

    return pool;
}

export function getPool() {
    if (!pool) throw new Error("Database not initialized");
    return pool;
}

export async function closeDatabase() {
    if (pool) {
        await pool.end();
        pool = null;
        console.log("✓ Database connection closed");
    }
}

export async function withTransaction(callback) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const result = await callback(client);
        await client.query("COMMIT");
        return result;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}
