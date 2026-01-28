import express from "express";

export function createTodoRoutes(todoRepo, subtaskRepo) {
    const router = express.Router();

    router.get("/", async (req, res) => {
        try {
            const todos = await todoRepo.getAll(req.user.id);
            const todosWithSubtasks = await Promise.all(
                todos.map(async (todo) => ({
                    ...todo,
                    subtasks: await subtaskRepo.getByTodoId(todo.id),
                }))
            );
            res.json(todosWithSubtasks);
        } catch (error) {
            console.error("Get all todos error:", error);
            res.status(500).json({ error: error.message });
        }
    });

    router.get("/date/:date", async (req, res) => {
        try {
            const dateParam = req.params.date;

            if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
                return res
                    .status(400)
                    .json({ error: "Invalid date format. Use YYYY-MM-DD" });
            }

            console.log(
                "Getting todos for date:",
                dateParam,
                "user:",
                req.user.id
            );

            const todos = await todoRepo.getByDate(req.user.id, dateParam);

            console.log("Found todos:", todos.length);

            const todosWithSubtasks = await Promise.all(
                todos.map(async (todo) => ({
                    ...todo,
                    subtasks: await subtaskRepo.getByTodoId(todo.id),
                }))
            );

            res.json(todosWithSubtasks);
        } catch (error) {
            console.error("Get todos by date error:", error);
            res.status(500).json({ error: error.message });
        }
    });

    router.get("/global", async (req, res) => {
        try {
            const todos = await todoRepo.getGlobal(req.user.id);

            const todosWithSubtasks = await Promise.all(
                todos.map(async (todo) => ({
                    ...todo,
                    subtasks: await subtaskRepo.getByTodoId(todo.id),
                }))
            );

            res.json(todosWithSubtasks);
        } catch (error) {
            console.error("Get global todos error:", error);
            res.status(500).json({ error: error.message });
        }
    });

    router.get("/archived", async (req, res) => {
        try {
            const todos = await todoRepo.getArchived(req.user.id);

            const todosWithSubtasks = await Promise.all(
                todos.map(async (todo) => ({
                    ...todo,
                    subtasks: await subtaskRepo.getByTodoId(todo.id),
                }))
            );

            res.json(todosWithSubtasks);
        } catch (error) {
            console.error("Get archived todos error:", error);
            res.status(500).json({ error: error.message });
        }
    });

    router.get("/:id", async (req, res) => {
        try {
            const todoId = parseInt(req.params.id);
            if (isNaN(todoId)) {
                return res.status(400).json({ error: "Invalid todo ID" });
            }

            const todo = await todoRepo.getById(todoId, req.user.id);
            if (!todo) {
                return res.status(404).json({ error: "Todo not found" });
            }

            todo.subtasks = await subtaskRepo.getByTodoId(todo.id);
            res.json(todo);
        } catch (error) {
            console.error("Get todo by ID error:", error);
            res.status(500).json({ error: error.message });
        }
    });

    router.post("/", async (req, res) => {
        try {
            const {
                title,
                description,
                due_date,
                is_global,
                priority,
                labels,
            } = req.body;

            console.log("Creating todo:", {
                title,
                due_date,
                is_global,
                user: req.user.id,
            });

            if (!title || !title.trim()) {
                return res.status(400).json({ error: "Title is required" });
            }

            const todo = await todoRepo.create(req.user.id, {
                title: title.trim(),
                description: description?.trim() || null,
                due_date: due_date || null,
                is_global: is_global === true,
                priority: priority || "none",
                labels: labels || [],
            });

            console.log("Created todo:", todo);

            res.status(201).json({
                ...todo,
                subtasks: [],
            });
        } catch (error) {
            console.error("Create todo error:", error);
            res.status(500).json({ error: error.message });
        }
    });

    router.put("/:id", async (req, res) => {
        try {
            const todoId = parseInt(req.params.id);
            if (isNaN(todoId)) {
                return res.status(400).json({ error: "Invalid todo ID" });
            }

            const todo = await todoRepo.update(todoId, req.user.id, req.body);
            if (!todo) {
                return res.status(404).json({ error: "Todo not found" });
            }

            todo.subtasks = await subtaskRepo.getByTodoId(todo.id);
            res.json(todo);
        } catch (error) {
            console.error("Update todo error:", error);
            res.status(500).json({ error: error.message });
        }
    });

    router.delete("/:id", async (req, res) => {
        try {
            const todoId = parseInt(req.params.id);
            if (isNaN(todoId)) {
                return res.status(400).json({ error: "Invalid todo ID" });
            }

            const success = await todoRepo.delete(todoId, req.user.id);
            if (!success) {
                return res.status(404).json({ error: "Todo not found" });
            }

            res.json({ success: true });
        } catch (error) {
            console.error("Delete todo error:", error);
            res.status(500).json({ error: error.message });
        }
    });

    router.post("/:id/archive", async (req, res) => {
        try {
            const todoId = parseInt(req.params.id);
            if (isNaN(todoId)) {
                return res.status(400).json({ error: "Invalid todo ID" });
            }

            const todo = await todoRepo.archive(todoId, req.user.id);
            if (!todo) {
                return res.status(404).json({ error: "Todo not found" });
            }

            todo.subtasks = await subtaskRepo.getByTodoId(todo.id);
            res.json(todo);
        } catch (error) {
            console.error("Archive todo error:", error);
            res.status(500).json({ error: error.message });
        }
    });

    router.post("/archive-by-date/:date", async (req, res) => {
        try {
            const dateParam = req.params.date;

            if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
                return res
                    .status(400)
                    .json({ error: "Invalid date format. Use YYYY-MM-DD" });
            }

            const count = await todoRepo.archiveByDate(req.user.id, dateParam);
            res.json({ archived: count });
        } catch (error) {
            console.error("Archive by date error:", error);
            res.status(500).json({ error: error.message });
        }
    });

    return router;
}
