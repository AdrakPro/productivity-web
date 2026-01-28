export async function runMigrations(pool) {
    console.log("Running migrations...");

    await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

    const migrations = [
        {
            name: "001_create_users_table",
            sql: `
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          username VARCHAR(100) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      `,
        },
        {
            name: "002_create_todos_table",
            sql: `
        CREATE TABLE IF NOT EXISTS todos (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(500) NOT NULL,
          description TEXT,
          due_date DATE,
          is_global BOOLEAN DEFAULT FALSE,
          is_completed BOOLEAN DEFAULT FALSE,
          is_archived BOOLEAN DEFAULT FALSE,
          completed_at TIMESTAMP,
          priority VARCHAR(20) DEFAULT 'none',
          labels JSONB DEFAULT '[]',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
        CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date);
      `,
        },
        {
            name: "003_create_subtasks_table",
            sql: `
        CREATE TABLE IF NOT EXISTS subtasks (
          id SERIAL PRIMARY KEY,
          todo_id INTEGER NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
          title VARCHAR(500) NOT NULL,
          is_completed BOOLEAN DEFAULT FALSE,
          sort_order INTEGER DEFAULT 0,
          completed_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_subtasks_todo_id ON subtasks(todo_id);
      `,
        },
        {
            name: "004_create_user_files_table",
            sql: `
        CREATE TABLE IF NOT EXISTS user_files (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          parent_id INTEGER REFERENCES user_files(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          type VARCHAR(20) NOT NULL DEFAULT 'file',
          content TEXT,
          mime_type VARCHAR(100),
          size INTEGER DEFAULT 0,
          stored_path VARCHAR(500),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT valid_type CHECK (type IN ('file', 'folder'))
        );

        CREATE INDEX IF NOT EXISTS idx_user_files_user_id ON user_files(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_files_parent_id ON user_files(parent_id);
      `,
        },
        {
            name: "005_create_statistics_table",
            sql: `
        CREATE TABLE IF NOT EXISTS statistics (
          id SERIAL PRIMARY KEY,
          user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          total_completed INTEGER DEFAULT 0,
          current_streak INTEGER DEFAULT 0,
          longest_streak INTEGER DEFAULT 0,
          last_activity_date DATE
        );
      `,
        },
        {
            name: "006_create_streaks_table",
            sql: `
        CREATE TABLE IF NOT EXISTS streaks (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          date DATE NOT NULL,
          completed_count INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, date)
        );

        CREATE INDEX IF NOT EXISTS idx_streaks_user_date ON streaks(user_id, date);
      `,
        },
        {
            name: "007_create_settings_table",
            sql: `
        CREATE TABLE IF NOT EXISTS settings (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          key VARCHAR(255) NOT NULL,
          value JSONB,
          UNIQUE(user_id, key)
        );
      `,
        },
        {
            name: "008_create_updated_at_triggers",
            sql: `
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
        END;
        $$ language 'plpgsql';

        DROP TRIGGER IF EXISTS update_users_updated_at ON users;
        CREATE TRIGGER update_users_updated_at
          BEFORE UPDATE ON users FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();

        DROP TRIGGER IF EXISTS update_todos_updated_at ON todos;
        CREATE TRIGGER update_todos_updated_at
          BEFORE UPDATE ON todos FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();

        DROP TRIGGER IF EXISTS update_user_files_updated_at ON user_files;
        CREATE TRIGGER update_user_files_updated_at
          BEFORE UPDATE ON user_files FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      `,
        },
    ];

    const result = await pool.query("SELECT name FROM migrations");
    const executedMigrations = result.rows.map((row) => row.name);

    for (const migration of migrations) {
        if (!executedMigrations.includes(migration.name)) {
            console.log(`  Running: ${migration.name}`);
            try {
                await pool.query(migration.sql);
                await pool.query("INSERT INTO migrations (name) VALUES ($1)", [
                    migration.name,
                ]);
            } catch (error) {
                if (!error.message.includes("already exists")) {
                    throw error;
                }
                await pool.query(
                    "INSERT INTO migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING",
                    [migration.name]
                );
            }
        }
    }

    console.log("✓ Migrations complete");
}
