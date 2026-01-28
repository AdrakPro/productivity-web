import express from "express";

export function createStatisticsRoutes(statisticsRepo) {
    const router = express.Router();

    router.get("/", async (req, res) => {
        try {
            let stats = await statisticsRepo.get(req.user.id);
            if (!stats) {
                stats = await statisticsRepo.update(req.user.id, {});
            }
            res.json(stats);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.put("/", async (req, res) => {
        try {
            res.json(await statisticsRepo.update(req.user.id, req.body));
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    return router;
}
