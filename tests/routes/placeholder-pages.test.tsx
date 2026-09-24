import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderAtPath } from "../test-utils/renderAtPath";

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
