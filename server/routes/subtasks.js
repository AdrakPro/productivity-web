import express from "express";

export function createSubtaskRoutes(subtaskRepo, todoRepo) {
    const router = express.Router();

    router.post("/", async (req, res) => {
        try {
            const { todoId, title } = req.body;

            const todo = await todoRepo.getById(todoId, req.user.id);
            if (!todo) {
                return res.status(404).json({ error: "Todo not found" });
            }

            const subtask = await subtaskRepo.create(todoId, title);
            res.status(201).json(subtask);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.put("/:id", async (req, res) => {
        try {
            const subtask = await subtaskRepo.update(
                parseInt(req.params.id),
                req.body
            );
            res.json(subtask);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.delete("/:id", async (req, res) => {
        try {
            const success = await subtaskRepo.delete(parseInt(req.params.id));
            if (!success)
                return res.status(404).json({ error: "Subtask not found" });
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.post("/reorder", async (req, res) => {
        try {
            const { todoId, subtaskIds } = req.body;
            const subtasks = await subtaskRepo.reorder(todoId, subtaskIds);
            res.json(subtasks);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    return router;
}
