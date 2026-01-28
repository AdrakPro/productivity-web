export class UserFileRepository {
    constructor(pool) {
        this.pool = pool;
    }

    async getByParent(userId, parentId = null) {
        let query;
        let params;

        if (parentId === null) {
            query = `
        SELECT id, user_id, parent_id, name, type, mime_type, size, created_at, updated_at
        FROM user_files 
        WHERE user_id = $1 AND parent_id IS NULL
        ORDER BY type DESC, name ASC
      `;
            params = [userId];
        } else {
            query = `
        SELECT id, user_id, parent_id, name, type, mime_type, size, created_at, updated_at
        FROM user_files 
        WHERE user_id = $1 AND parent_id = $2
        ORDER BY type DESC, name ASC
      `;
            params = [userId, parentId];
        }

        const result = await this.pool.query(query, params);
        return result.rows;
    }

    async getTree(userId) {
        const result = await this.pool.query(
            `
      SELECT id, name, type, parent_id, mime_type, size, created_at, updated_at
      FROM user_files 
      WHERE user_id = $1
      ORDER BY type DESC, name ASC
    `,
            [userId]
        );

        const items = result.rows;
        const itemMap = new Map();
        const rootItems = [];

        items.forEach((item) => {
            itemMap.set(item.id, { ...item, children: [] });
        });

        items.forEach((item) => {
            const node = itemMap.get(item.id);
            if (item.parent_id === null) {
                rootItems.push(node);
            } else {
                const parent = itemMap.get(item.parent_id);
                if (parent) {
                    parent.children.push(node);
                }
            }
        });

        return rootItems;
    }

    async getById(id, userId) {
        const result = await this.pool.query(
            `SELECT id, user_id, parent_id, name, type, content, mime_type, size, stored_path, created_at, updated_at
       FROM user_files 
       WHERE id = $1 AND user_id = $2`,
            [id, userId]
        );
        return result.rows[0] || null;
    }

    async createFile(userId, data) {
        const { name, content, parentId, mimeType } = data;
        const size = content ? Buffer.byteLength(content, "utf8") : 0;

        const result = await this.pool.query(
            `
      INSERT INTO user_files (user_id, parent_id, name, type, content, mime_type, size)
      VALUES ($1, $2, $3, 'file', $4, $5, $6)
      RETURNING *
    `,
            [
                userId,
                parentId || null,
                name,
                content || "",
                mimeType || "text/plain",
                size,
            ]
        );

        return result.rows[0];
    }

    async createFolder(userId, data) {
        const { name, parentId } = data;

        const result = await this.pool.query(
            `
      INSERT INTO user_files (user_id, parent_id, name, type)
      VALUES ($1, $2, $3, 'folder')
      RETURNING *
    `,
            [userId, parentId || null, name]
        );

        return result.rows[0];
    }

    async updateContent(id, userId, content) {
        const size = content ? Buffer.byteLength(content, "utf8") : 0;

        const result = await this.pool.query(
            `
      UPDATE user_files 
      SET content = $1, size = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND user_id = $4 AND type = 'file'
      RETURNING *
    `,
            [content, size, id, userId]
        );

        return result.rows[0] || null;
    }

    async rename(id, userId, newName) {
        const result = await this.pool.query(
            `
      UPDATE user_files SET name = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND user_id = $3
      RETURNING *
    `,
            [newName, id, userId]
        );

        return result.rows[0] || null;
    }

    async move(id, userId, newParentId) {
        const result = await this.pool.query(
            `
      UPDATE user_files SET parent_id = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND user_id = $3
      RETURNING *
    `,
            [newParentId || null, id, userId]
        );

        return result.rows[0] || null;
    }

    async delete(id, userId) {
        const result = await this.pool.query(
            "DELETE FROM user_files WHERE id = $1 AND user_id = $2 RETURNING *",
            [id, userId]
        );
        return result.rows[0] || null;
    }

    async search(userId, query) {
        const result = await this.pool.query(
            `
      SELECT id, user_id, parent_id, name, type, mime_type, size, created_at, updated_at
      FROM user_files 
      WHERE user_id = $1 AND type = 'file' AND name ILIKE $2
      ORDER BY updated_at DESC
      LIMIT 50
    `,
            [userId, `%${query}%`]
        );
        return result.rows;
    }

    async nameExists(userId, name, parentId) {
        let query;
        let params;

        if (parentId === null) {
            query = `
        SELECT 1 FROM user_files 
        WHERE user_id = $1 AND name = $2 AND parent_id IS NULL
        LIMIT 1
      `;
            params = [userId, name];
        } else {
            query = `
        SELECT 1 FROM user_files 
        WHERE user_id = $1 AND name = $2 AND parent_id = $3
        LIMIT 1
      `;
            params = [userId, name, parentId];
        }

        const result = await this.pool.query(query, params);
        return result.rows.length > 0;
    }

    async getStorageUsage(userId) {
        const result = await this.pool.query(
            "SELECT COALESCE(SUM(size), 0) as total_size, COUNT(*) as file_count FROM user_files WHERE user_id = $1 AND type = 'file'",
            [userId]
        );
        return result.rows[0];
    }
}
