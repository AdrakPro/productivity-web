import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { config } from "../config.js";

export function createUserFileRoutes(userFileRepo) {
    const router = express.Router();

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            const userDir = path.join(
                config.upload.uploadDir,
                req.user.id.toString()
            );
            if (!fs.existsSync(userDir)) {
                fs.mkdirSync(userDir, { recursive: true });
            }
            cb(null, userDir);
        },
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            cb(null, `${uuidv4()}${ext}`);
        },
    });

    const upload = multer({
        storage,
        limits: { fileSize: config.upload.maxFileSize },
    });

    router.get("/tree", async (req, res) => {
        try {
            const tree = await userFileRepo.getTree(req.user.id);
            res.json(tree);
        } catch (error) {
            console.error("Get tree error:", error);
            res.status(500).json({ error: error.message });
        }
    });

    router.get("/usage/stats", async (req, res) => {
        try {
            const usage = await userFileRepo.getStorageUsage(req.user.id);
            res.json(usage);
        } catch (error) {
            console.error("Get usage error:", error);
            res.status(500).json({ error: error.message });
        }
    });

    router.get("/search/:query", async (req, res) => {
        try {
            const files = await userFileRepo.search(
                req.user.id,
                req.params.query
            );
            res.json(files);
        } catch (error) {
            console.error("Search error:", error);
            res.status(500).json({ error: error.message });
        }
    });

    router.get("/folder", async (req, res) => {
        try {
            const files = await userFileRepo.getByParent(req.user.id, null);
            res.json(files);
        } catch (error) {
            console.error("Get folder error:", error);
            res.status(500).json({ error: error.message });
        }
    });

    router.get("/folder/:parentId", async (req, res) => {
        try {
            const parentId = parseInt(req.params.parentId);
            if (isNaN(parentId)) {
                return res.status(400).json({ error: "Invalid parent ID" });
            }
            const files = await userFileRepo.getByParent(req.user.id, parentId);
            res.json(files);
        } catch (error) {
            console.error("Get folder error:", error);
            res.status(500).json({ error: error.message });
        }
    });

    router.get("/:id/download", async (req, res) => {
        try {
            const fileId = parseInt(req.params.id);
            if (isNaN(fileId)) {
                return res.status(400).json({ error: "Invalid file ID" });
            }

            const file = await userFileRepo.getById(fileId, req.user.id);
            if (!file) {
                return res.status(404).json({ error: "File not found" });
            }

            if (file.stored_path) {
                const filePath = path.join(
                    config.upload.uploadDir,
                    file.stored_path
                );
                if (!fs.existsSync(filePath)) {
                    return res
                        .status(404)
                        .json({ error: "File not found on disk" });
                }
                res.download(filePath, file.name);
            } else {
                res.setHeader("Content-Type", file.mime_type || "text/plain");
                res.setHeader(
                    "Content-Disposition",
                    `attachment; filename="${file.name}"`
                );
                res.send(file.content || "");
            }
        } catch (error) {
            console.error("Download error:", error);
            res.status(500).json({ error: error.message });
        }
    });

    router.get("/:id", async (req, res) => {
        try {
            const fileId = parseInt(req.params.id);

            if (isNaN(fileId)) {
                return res.status(400).json({ error: "Invalid file ID" });
            }

            const file = await userFileRepo.getById(fileId, req.user.id);

            if (!file) {
                return res.status(404).json({ error: "File not found" });
            }

            let content = file.content || "";

            if (file.stored_path && !file.content) {
                const filePath = path.join(
                    config.upload.uploadDir,
                    file.stored_path
                );

                const textMimeTypes = [
                    "text/plain",
                    "text/markdown",
                    "text/html",
                    "text/css",
                    "text/javascript",
                    "application/json",
                    "text/xml",
                    "application/xml",
                    "text/yaml",
                    "text/x-yaml",
                ];

                const ext = path.extname(file.name).toLowerCase();
                const textExtensions = [
                    ".txt",
                    ".md",
                    ".json",
                    ".js",
                    ".ts",
                    ".jsx",
                    ".tsx",
                    ".html",
                    ".css",
                    ".xml",
                    ".yaml",
                    ".yml",
                    ".svelte",
                    ".vue",
                ];

                const isTextFile =
                    textMimeTypes.some((t) => file.mime_type?.includes(t)) ||
                    textExtensions.includes(ext);

                if (isTextFile && fs.existsSync(filePath)) {
                    try {
                        content = fs.readFileSync(filePath, "utf8");
                    } catch (readErr) {
                        console.error(
                            "Failed to read file from disk:",
                            readErr
                        );
                        content = "";
                    }
                }
            }

            res.json({
                id: file.id,
                user_id: file.user_id,
                parent_id: file.parent_id,
                name: file.name,
                type: file.type,
                content: content,
                mime_type: file.mime_type,
                size: file.size,
                stored_path: file.stored_path,
                created_at: file.created_at,
                updated_at: file.updated_at,
            });
        } catch (error) {
            console.error("Get file error:", error);
            res.status(500).json({ error: error.message });
        }
    });

    router.post("/file", async (req, res) => {
        try {
            const { name, content, parentId } = req.body;

            if (!name) {
                return res.status(400).json({ error: "File name is required" });
            }

            const exists = await userFileRepo.nameExists(
                req.user.id,
                name,
                parentId || null
            );
            if (exists) {
                return res
                    .status(400)
                    .json({ error: "A file with this name already exists" });
            }

            const ext = path.extname(name).toLowerCase();
            const mimeTypes = {
                ".txt": "text/plain",
                ".md": "text/markdown",
                ".json": "application/json",
                ".js": "text/javascript",
                ".ts": "text/typescript",
                ".html": "text/html",
                ".css": "text/css",
                ".xml": "text/xml",
                ".yaml": "text/yaml",
                ".yml": "text/yaml",
                ".svelte": "text/html",
            };
            const mimeType = mimeTypes[ext] || "text/plain";

            const file = await userFileRepo.createFile(req.user.id, {
                name,
                content: content || "",
                parentId: parentId || null,
                mimeType,
            });

            res.status(201).json(file);
        } catch (error) {
            console.error("Create file error:", error);
            res.status(500).json({ error: error.message });
        }
    });

    router.post("/folder", async (req, res) => {
        try {
            const { name, parentId } = req.body;

            if (!name) {
                return res
                    .status(400)
                    .json({ error: "Folder name is required" });
            }

            const exists = await userFileRepo.nameExists(
                req.user.id,
                name,
                parentId || null
            );
            if (exists) {
                return res
                    .status(400)
                    .json({ error: "A folder with this name already exists" });
            }

            const folder = await userFileRepo.createFolder(req.user.id, {
                name,
                parentId: parentId || null,
            });

            res.status(201).json(folder);
        } catch (error) {
            console.error("Create folder error:", error);
            res.status(500).json({ error: error.message });
        }
    });

    router.post("/upload", upload.single("file"), async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: "No file uploaded" });
            }

            const parentId = req.body.parentId
                ? parseInt(req.body.parentId)
                : null;
            let fileName = req.file.originalname;

            const exists = await userFileRepo.nameExists(
                req.user.id,
                fileName,
                parentId
            );
            if (exists) {
                const ext = path.extname(fileName);
                const base = path.basename(fileName, ext);
                let counter = 1;
                while (
                    await userFileRepo.nameExists(
                        req.user.id,
                        `${base} (${counter})${ext}`,
                        parentId
                    )
                ) {
                    counter++;
                }
                fileName = `${base} (${counter})${ext}`;
            }

            const storedPath = `${req.user.id}/${req.file.filename}`;

            const result = await userFileRepo.pool.query(
                `INSERT INTO user_files (user_id, parent_id, name, type, mime_type, size, stored_path)
         VALUES ($1, $2, $3, 'file', $4, $5, $6)
         RETURNING *`,
                [
                    req.user.id,
                    parentId,
                    fileName,
                    req.file.mimetype,
                    req.file.size,
                    storedPath,
                ]
            );

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error("Upload error:", error);
            res.status(500).json({ error: error.message });
        }
    });

    router.put("/:id/content", async (req, res) => {
        try {
            const fileId = parseInt(req.params.id);
            if (isNaN(fileId)) {
                return res.status(400).json({ error: "Invalid file ID" });
            }

            const { content } = req.body;

            const currentFile = await userFileRepo.getById(fileId, req.user.id);
            if (!currentFile) {
                return res.status(404).json({ error: "File not found" });
            }

            if (currentFile.stored_path) {
                const filePath = path.join(
                    config.upload.uploadDir,
                    currentFile.stored_path
                );
                try {
                    fs.writeFileSync(filePath, content || "", "utf8");

                    const size = Buffer.byteLength(content || "", "utf8");
                    const result = await userFileRepo.pool.query(
                        `UPDATE user_files SET size = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING *`,
                        [size, fileId, req.user.id]
                    );

                    res.json(result.rows[0]);
                } catch (writeErr) {
                    console.error("Failed to write file to disk:", writeErr);
                    res.status(500).json({ error: "Failed to save file" });
                }
            } else {
                const file = await userFileRepo.updateContent(
                    fileId,
                    req.user.id,
                    content || ""
                );
                if (!file) {
                    return res.status(404).json({ error: "File not found" });
                }
                res.json(file);
            }
        } catch (error) {
            console.error("Update content error:", error);
            res.status(500).json({ error: error.message });
        }
    });

    router.put("/:id/rename", async (req, res) => {
        try {
            const fileId = parseInt(req.params.id);
            if (isNaN(fileId)) {
                return res.status(400).json({ error: "Invalid file ID" });
            }

            const { name } = req.body;
            if (!name) {
                return res.status(400).json({ error: "Name is required" });
            }

            const current = await userFileRepo.getById(fileId, req.user.id);
            if (!current) {
                return res.status(404).json({ error: "File not found" });
            }

            if (name !== current.name) {
                const exists = await userFileRepo.nameExists(
                    req.user.id,
                    name,
                    current.parent_id
                );
                if (exists) {
                    return res
                        .status(400)
                        .json({
                            error: "A file with this name already exists",
                        });
                }
            }

            const file = await userFileRepo.rename(fileId, req.user.id, name);
            res.json(file);
        } catch (error) {
            console.error("Rename error:", error);
            res.status(500).json({ error: error.message });
        }
    });

    router.put("/:id/move", async (req, res) => {
        try {
            const fileId = parseInt(req.params.id);
            if (isNaN(fileId)) {
                return res.status(400).json({ error: "Invalid file ID" });
            }

            const { parentId } = req.body;
            const file = await userFileRepo.move(
                fileId,
                req.user.id,
                parentId || null
            );

            if (!file) {
                return res.status(404).json({ error: "File not found" });
            }

            res.json(file);
        } catch (error) {
            console.error("Move error:", error);
            res.status(500).json({ error: error.message });
        }
    });

    router.delete("/:id", async (req, res) => {
        try {
            const fileId = parseInt(req.params.id);
            if (isNaN(fileId)) {
                return res.status(400).json({ error: "Invalid file ID" });
            }

            const file = await userFileRepo.delete(fileId, req.user.id);
            if (!file) {
                return res.status(404).json({ error: "File not found" });
            }

            if (file.stored_path) {
                const filePath = path.join(
                    config.upload.uploadDir,
                    file.stored_path
                );
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }

            res.json({ success: true });
        } catch (error) {
            console.error("Delete error:", error);
            res.status(500).json({ error: error.message });
        }
    });

    return router;
}
