import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Checklist } from "@/components/card-modal/Checklist";
import type { ChecklistItem } from "@/types/card-detail";

describe("Checklist", () => {
    it("shows 0% progress when there are no items", () => {
        render(<Checklist items={[]} />);
        expect(screen.getByText("0%")).toBeInTheDocument();
    });

    it("computes progress from completed items and toggles items on click", async () => {
        const user = userEvent.setup();
        const items: ChecklistItem[] = [
            { id: "i1", label: "Done already", completed: true },
            { id: "i2", label: "Not done yet", completed: false },
        ];
        render(<Checklist items={items} />);

        expect(screen.getByText("50%")).toBeInTheDocument();
        expect(screen.getByText("Not done yet")).not.toHaveClass("line-through");

        await user.click(screen.getByRole("checkbox", { name: "Not done yet" }));

        expect(screen.getByText("100%")).toBeInTheDocument();
        expect(screen.getByText("Not done yet")).toHaveClass("line-through");
    });

    it("adds a new item and ignores an empty submission", async () => {
        const user = userEvent.setup();
        render(<Checklist items={[]} />);

        await user.click(screen.getByRole("button", { name: "Add item" }));
        expect(screen.queryByText("New item")).not.toBeInTheDocument();

        await user.type(screen.getByLabelText("New checklist item"), "New item");
        await user.click(screen.getByRole("button", { name: "Add item" }));

        expect(screen.getByText("New item")).toBeInTheDocument();
        expect(screen.getByLabelText("New checklist item")).toHaveValue("");
    });
});
