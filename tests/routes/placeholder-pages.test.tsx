import {
    RouterProvider,
    createMemoryHistory,
    createRouter,
} from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

function renderAtPath(path: string) {
    const router = createRouter({
        routeTree,
        history: createMemoryHistory({ initialEntries: [path] }),
    });

    render(<RouterProvider router={router} />);
}

describe("route tree smoke test", () => {
    it.each([
        ["/terms", "Terms of Service"],
        ["/privacy", "Privacy Policy"],
        ["/roadmap", "Product Roadmap"],
    ])("renders the %s route", async (path, headingName) => {
        renderAtPath(path);

        expect(
            await screen.findByRole("heading", { name: headingName }),
        ).toBeInTheDocument();
    });
});
