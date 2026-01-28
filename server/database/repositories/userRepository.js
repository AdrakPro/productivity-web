import bcrypt from "bcrypt";

export class UserRepository {
    constructor(pool) {
        this.pool = pool;
    }

    async findById(id) {
        const result = await this.pool.query(
            "SELECT id, email, username, created_at FROM users WHERE id = $1",
            [id]
        );
        return result.rows[0] || null;
    }

    async findByEmail(email) {
        const result = await this.pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email.toLowerCase()]
        );
        return result.rows[0] || null;
    }

    async findByUsername(username) {
        const result = await this.pool.query(
            "SELECT * FROM users WHERE username = $1",
            [username.toLowerCase()]
        );
        return result.rows[0] || null;
    }

    async create(userData) {
        const { email, username, password } = userData;

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const result = await this.pool.query(
            `
      INSERT INTO users (email, username, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, email, username, created_at
    `,
            [email.toLowerCase(), username.toLowerCase(), passwordHash]
        );

        const user = result.rows[0];

        await this.pool.query("INSERT INTO statistics (user_id) VALUES ($1)", [
            user.id,
        ]);

        return user;
    }

    async verifyPassword(user, password) {
        return bcrypt.compare(password, user.password_hash);
    }

    async updatePassword(userId, newPassword) {
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(newPassword, saltRounds);

        await this.pool.query(
            "UPDATE users SET password_hash = $1 WHERE id = $2",
            [passwordHash, userId]
        );
    }

    async delete(userId) {
        const result = await this.pool.query(
            "DELETE FROM users WHERE id = $1 RETURNING id",
            [userId]
        );
        return result.rowCount > 0;
    }
}
