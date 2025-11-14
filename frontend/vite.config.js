import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: "0.0.0.0",
        port: 5173,
        proxy: {
            "/api": {
                // In development, use localhost
                // In production on Raspberry Pi, this will use the same host as the frontend
                target: "http://localhost:8000",
                changeOrigin: true,
                rewrite: function (path) { return path.replace(/^\/api/, ""); },
            },
        },
    },
    define: {
        "process.env.API_URL": JSON.stringify(process.env.API_URL || "/api"),
    },
});
