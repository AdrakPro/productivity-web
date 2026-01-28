export class SettingsRepository {
    constructor(pool) {
        this.pool = pool;
    }

    async get(key, defaultValue = null) {
        const result = await this.pool.query(
            "SELECT value FROM settings WHERE key = $1",
            [key]
        );
        if (result.rows.length === 0) return defaultValue;
        return result.rows[0].value;
    }

    async set(key, value) {
        await this.pool.query(
            `
      INSERT INTO settings (key, value)
      VALUES ($1, $2)
      ON CONFLICT (key) DO UPDATE SET value = $2
    `,
            [key, JSON.stringify(value)]
        );
    }

    async delete(key) {
        await this.pool.query("DELETE FROM settings WHERE key = $1", [key]);
    }

    async getAll() {
        const result = await this.pool.query("SELECT * FROM settings");
        const settings = {};
        for (const row of result.rows) {
            settings[row.key] = row.value;
        }
        return settings;
    }
}
