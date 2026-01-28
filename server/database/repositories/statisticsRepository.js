export class StatisticsRepository {
    constructor(pool) {
        this.pool = pool;
    }

    async get() {
        const result = await this.pool.query(
            "SELECT * FROM statistics WHERE id = 1"
        );
        return result.rows[0] || null;
    }

    async update(data) {
        const existing = await this.get();

        const result = await this.pool.query(
            `
      UPDATE statistics SET
        total_completed = $1,
        current_streak = $2,
        longest_streak = $3,
        last_activity_date = $4
      WHERE id = 1
      RETURNING *
    `,
            [
                data.total_completed ?? existing?.total_completed ?? 0,
                data.current_streak ?? existing?.current_streak ?? 0,
                data.longest_streak ?? existing?.longest_streak ?? 0,
                data.last_activity_date ?? existing?.last_activity_date,
            ]
        );

        return result.rows[0];
    }
}
