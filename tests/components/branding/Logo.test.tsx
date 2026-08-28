import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Logo } from "@/components/branding/Logo";

describe("Logo", () => {
    it("renders the SyncBoard wordmark by default", () => {
        render(<Logo />);

        expect(screen.getByText("SyncBoard")).toBeInTheDocument();
    });

    it("renders only the icon, with an accessible name, when iconOnly is set", () => {
        render(<Logo iconOnly />);

        expect(screen.queryByText("SyncBoard")).not.toBeInTheDocument();
        expect(screen.getByLabelText("SyncBoard")).toBeInTheDocument();
    });

    it("merges a custom className onto the root element", () => {
        render(<Logo className="custom-class" />);

        expect(screen.getByText("SyncBoard").parentElement).toHaveClass("custom-class");
    });
});
