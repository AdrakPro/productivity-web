export class SubtaskRepository {
    constructor(pool) {
        this.pool = pool;
    }

    async getByTodoId(todoId) {
        const result = await this.pool.query(
            "SELECT * FROM subtasks WHERE todo_id = $1 ORDER BY sort_order ASC",
            [todoId]
        );
        return result.rows;
    }

    async getById(id) {
        const result = await this.pool.query(
            "SELECT * FROM subtasks WHERE id = $1",
            [id]
        );
        return result.rows[0] || null;
    }

    async create(todoId, title) {
        const maxResult = await this.pool.query(
            "SELECT COALESCE(MAX(sort_order), -1) as max_order FROM subtasks WHERE todo_id = $1",
            [todoId]
        );
        const sortOrder = maxResult.rows[0].max_order + 1;

        const result = await this.pool.query(
            `
      INSERT INTO subtasks (todo_id, title, sort_order)
      VALUES ($1, $2, $3)
      RETURNING *
    `,
            [todoId, title, sortOrder]
        );

        return result.rows[0];
    }

    async update(id, updates) {
        const existing = await this.getById(id);
        if (!existing) throw new Error(`Subtask with id ${id} not found`);

        const result = await this.pool.query(
            `
      UPDATE subtasks SET
        title = $1,
        is_completed = $2,
        completed_at = $3
      WHERE id = $4
      RETURNING *
    `,
            [
                updates.title ?? existing.title,
                updates.is_completed ?? existing.is_completed,
                updates.completed_at ?? existing.completed_at,
                id,
            ]
        );

        return result.rows[0];
    }

    async delete(id) {
        const result = await this.pool.query(
            "DELETE FROM subtasks WHERE id = $1 RETURNING id",
            [id]
        );
        return result.rowCount > 0;
    }

    async reorder(todoId, subtaskIds) {
        for (let i = 0; i < subtaskIds.length; i++) {
            await this.pool.query(
                "UPDATE subtasks SET sort_order = $1 WHERE id = $2",
                [i, subtaskIds[i]]
            );
        }
        return this.getByTodoId(todoId);
    }
}
