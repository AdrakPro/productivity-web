import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "path";

export default defineConfig({
    plugins: [svelte()],
    root: "client",
    resolve: {
        alias: {
            $lib: path.resolve("./client/src/lib"),
            $components: path.resolve("./client/src/components"),
        },
    },
    server: {
        port: 5173,
        proxy: {
            "/api": {
                target: "http://localhost:3000",
                changeOrigin: true,
                secure: false,
            },
        },
    },
    build: {
        outDir: "../dist/client",
        emptyOutDir: true,
    },
});
