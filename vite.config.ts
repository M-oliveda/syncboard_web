import path from "node:path";

import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [
        tanstackRouter({
            target: "react",
            routesDirectory: "./src/routes",
            generatedRouteTree: "./src/routeTree.gen.ts",
        }),
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            "@": path.resolve(import.meta.dirname, "./src"),
        },
    },
    test: {
        environment: "jsdom",
        setupFiles: ["./tests/setup.ts"],
        include: ["tests/**/*.test.{ts,tsx}"],
        coverage: {
            provider: "v8",
            reporter: ["text", "lcov", "html"],
            thresholds: {
                statements: 100,
                branches: 100,
                functions: 100,
                lines: 100,
            },
            exclude: [
                "src/main.tsx",
                "src/vite-env.d.ts",
                "src/**/*.d.ts",
                "src/routeTree.gen.ts",
                "src/routes/**",
                "src/components/ui/**",
            ],
        },
    },
});
