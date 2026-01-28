import express from "express";

export function createStreaksRoutes(streaksRepo) {
    const router = express.Router();

    router.get("/", async (req, res) => {
        try {
            res.json(await streaksRepo.getAll(req.user.id));
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.get("/:date", async (req, res) => {
        try {
            const streak = await streaksRepo.getByDate(
                req.user.id,
                req.params.date
            );
            res.json(streak || { date: req.params.date, completed_count: 0 });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.post("/record/:date", async (req, res) => {
        try {
            res.json(
                await streaksRepo.recordCompletion(req.user.id, req.params.date)
            );
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    return router;
}
