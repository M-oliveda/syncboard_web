import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { OriginInputPassword } from "@/components/ui/input-password";

describe("OriginInputPassword", () => {
    it("renders the default label and password requirement rules", () => {
        render(<OriginInputPassword />);

        expect(screen.getByText("Password")).toBeInTheDocument();
        expect(screen.getByText("At least 8 characters")).toBeInTheDocument();
    });

    it("omits the label when an empty label is passed and the rule list when rules is empty", () => {
        render(<OriginInputPassword label="" rules={[]} />);

        expect(screen.queryByText("Password")).not.toBeInTheDocument();
        expect(screen.queryByText("At least 8 characters")).not.toBeInTheDocument();
    });

    it("toggles visibility and reflects pass/fail rule state as the user types", async () => {
        const user = userEvent.setup();
        render(<OriginInputPassword id="pw" />);

        const input = screen.getByLabelText("Password");
        expect(input).toHaveAttribute("type", "password");

        await user.type(input, "short");
        expect(screen.getByText("At least 8 characters")).toHaveClass("text-error");
        expect(screen.getByText("One uppercase letter")).toHaveClass("text-error");

        await user.type(input, "Password1!");
        expect(screen.getByText("At least 8 characters")).toHaveClass("text-success");
        expect(screen.getByText("One uppercase letter")).toHaveClass("text-success");

        await user.click(screen.getByRole("button", { name: "Show password" }));
        expect(input).toHaveAttribute("type", "text");
        expect(
            screen.getByRole("button", { name: "Hide password" }),
        ).toBeInTheDocument();
    });

    it("supports a controlled value and forwards onChange", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();

        render(<OriginInputPassword value="preset" onChange={onChange} />);

        const input = screen.getByLabelText("Password");
        expect(input).toHaveValue("preset");

        await user.type(input, "x");
        expect(onChange).toHaveBeenCalled();
    });
});
