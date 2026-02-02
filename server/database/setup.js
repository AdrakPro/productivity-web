import pg from "pg";
import { config } from "../config.js";

const { Client } = pg;

async function setupDatabase() {
    const client = new Client({
        host: config.db.host,
        port: config.db.port,
        database: "productivity",
        user: config.db.user,
        password: config.db.password,
    });

    try {
        await client.connect();
        console.log("Connected to PostgreSQL");

        const result = await client.query(
            "SELECT 1 FROM pg_database WHERE datname = $1",
            [config.db.database]
        );

        if (result.rows.length === 0) {
            await client.query(`CREATE DATABASE ${config.db.database}`);
            console.log(`✓ Database "${config.db.database}" created`);
        } else {
            console.log(`✓ Database "${config.db.database}" already exists`);
        }
    } catch (error) {
        console.error("Error setting up database:", error.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

setupDatabase();
