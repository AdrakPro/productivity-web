export class StreaksRepository {
    constructor(pool) {
        this.pool = pool;
    }

    async getAll() {
        const result = await this.pool.query(
            "SELECT * FROM streaks ORDER BY date DESC LIMIT 365"
        );
        return result.rows;
    }

    async getByDate(date) {
        const result = await this.pool.query(
            "SELECT * FROM streaks WHERE date = $1",
            [date]
        );
        return result.rows[0] || null;
    }

    async recordCompletion(date) {
        const result = await this.pool.query(
            `
      INSERT INTO streaks (date, completed_count)
      VALUES ($1, 1)
      ON CONFLICT (date) DO UPDATE SET
        completed_count = streaks.completed_count + 1
      RETURNING *
    `,
            [date]
        );

        return result.rows[0];
    }
}
