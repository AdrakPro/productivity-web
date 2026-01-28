export class TodoRepository {
    constructor(pool) {
        this.pool = pool;
    }

    async getAll(userId) {
        const result = await this.pool.query(
            `SELECT * FROM todos WHERE user_id = $1 ORDER BY created_at DESC`,
            [userId]
        );
        return result.rows;
    }

    async getByDate(userId, date) {
        const result = await this.pool.query(
            `SELECT * FROM todos 
       WHERE user_id = $1 
         AND due_date = $2::date
         AND is_global = false 
         AND is_archived = false
       ORDER BY created_at DESC`,
            [userId, date]
        );
        return result.rows;
    }

    async getGlobal(userId) {
        const result = await this.pool.query(
            `SELECT * FROM todos 
       WHERE user_id = $1 AND is_global = true AND is_archived = false
       ORDER BY due_date ASC NULLS LAST, created_at DESC`,
            [userId]
        );
        return result.rows;
    }

    async getArchived(userId) {
        const result = await this.pool.query(
            `SELECT * FROM todos 
       WHERE user_id = $1 AND is_archived = true
       ORDER BY completed_at DESC NULLS LAST, updated_at DESC`,
            [userId]
        );
        return result.rows;
    }

    async getById(id, userId) {
        const result = await this.pool.query(
            `SELECT * FROM todos WHERE id = $1 AND user_id = $2`,
            [id, userId]
        );
        return result.rows[0] || null;
    }

    async create(userId, data) {
        const { title, description, due_date, is_global, priority, labels } =
            data;

        console.log("TodoRepo.create:", { userId, title, due_date, is_global });

        const result = await this.pool.query(
            `INSERT INTO todos (user_id, title, description, due_date, is_global, priority, labels)
       VALUES ($1, $2, $3, $4::date, $5, $6, $7)
       RETURNING *`,
            [
                userId,
                title,
                description || null,
                due_date || null,
                is_global === true,
                priority || "none",
                JSON.stringify(labels || []),
            ]
        );

        console.log("TodoRepo.create result:", result.rows[0]);

        return result.rows[0];
    }

    async update(id, userId, data) {
        const fields = [];
        const values = [];
        let paramCount = 1;

        const allowedFields = [
            "title",
            "description",
            "due_date",
            "is_global",
            "is_completed",
            "is_archived",
            "completed_at",
            "priority",
            "labels",
        ];

        for (const [key, value] of Object.entries(data)) {
            if (allowedFields.includes(key) && value !== undefined) {
                if (key === "labels") {
                    fields.push(`${key} = $${paramCount}`);
                    values.push(JSON.stringify(value));
                } else if (key === "due_date") {
                    fields.push(`${key} = $${paramCount}::date`);
                    values.push(value);
                } else {
                    fields.push(`${key} = $${paramCount}`);
                    values.push(value);
                }
                paramCount++;
            }
        }

        if (fields.length === 0) {
            return this.getById(id, userId);
        }

        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id, userId);

        const result = await this.pool.query(
            `UPDATE todos SET ${fields.join(", ")} 
       WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
       RETURNING *`,
            values
        );

        return result.rows[0] || null;
    }

    async delete(id, userId) {
        await this.pool.query(`DELETE FROM subtasks WHERE todo_id = $1`, [id]);

        const result = await this.pool.query(
            `DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING id`,
            [id, userId]
        );

        return result.rowCount > 0;
    }

    async archive(id, userId) {
        const result = await this.pool.query(
            `UPDATE todos SET is_archived = true, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
            [id, userId]
        );
        return result.rows[0] || null;
    }

    async archiveByDate(userId, date) {
        const result = await this.pool.query(
            `UPDATE todos SET is_archived = true, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND due_date = $2::date AND is_completed = true AND is_archived = false`,
            [userId, date]
        );
        return result.rowCount;
    }
}
