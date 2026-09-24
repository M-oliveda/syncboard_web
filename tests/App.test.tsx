import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import App from "@/App";

describe("App", () => {
    it("renders the router at the current location", async () => {
        render(<App />);

        expect(
            await screen.findByRole("heading", {
                name: "Kanban boards that move as fast as your team.",
            }),
        ).toBeInTheDocument();
    });
});
