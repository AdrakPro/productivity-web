import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "path";

export default defineConfig({
    plugins: [svelte()],
    resolve: {
        alias: {
            $lib: path.resolve("./src/lib"),
            $components: path.resolve("./src/components"),
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
	host: "0.0.0.0",
        },
    },
    build: {
        outDir: "../dist/client",
        emptyOutDir: true,
    },
});
