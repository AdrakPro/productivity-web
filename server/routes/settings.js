import express from "express";

export function createSettingsRoutes(settingsRepo) {
    const router = express.Router();

    router.get("/", async (req, res) => {
        try {
            res.json(await settingsRepo.getAll(req.user.id));
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.get("/:key", async (req, res) => {
        try {
            const value = await settingsRepo.get(req.user.id, req.params.key);
            res.json({ key: req.params.key, value });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.put("/:key", async (req, res) => {
        try {
            await settingsRepo.set(req.user.id, req.params.key, req.body.value);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    return router;
}
