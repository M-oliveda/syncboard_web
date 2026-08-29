import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { FIXTURE_BOARDS, FIXTURE_CARDS, FIXTURE_LISTS } from "../../mocks/fixtures";
import { server } from "../../mocks/server";
import { renderAtPath } from "../../test-utils/renderAtPath";

const board = FIXTURE_BOARDS[0];
const firstList = FIXTURE_LISTS[0];
const firstCard = FIXTURE_CARDS[0];
if (!board || !firstList || !firstCard) {
    throw new Error("expected fixture board/list/card");
}

describe("ActiveBoardPage", () => {
    it("renders the board name and every list", async () => {
        renderAtPath(`/app/boards/${board._id}`);

        expect(
            await screen.findByRole("heading", { name: board.title }),
        ).toBeInTheDocument();

        for (const list of FIXTURE_LISTS) {
            expect(
                screen.getByRole("heading", { name: list.title }),
            ).toBeInTheDocument();
        }
    });

    it("opens the card detail modal from the ?card= search param", async () => {
        renderAtPath(`/app/boards/${board._id}?card=${firstCard._id}`);

        expect(await screen.findByDisplayValue(firstCard.title)).toBeInTheDocument();
    });

    it("opens a card on click and closes it back to no search param", async () => {
        const user = userEvent.setup();
        const router = renderAtPath(`/app/boards/${board._id}`);
        await screen.findByRole("heading", { name: board.title });

        await user.click(
            screen.getByRole("button", { name: new RegExp(firstCard.title) }),
        );

        expect(await screen.findByDisplayValue(firstCard.title)).toBeInTheDocument();
        expect(router.state.location.search).toEqual({ card: firstCard._id });

        await user.click(screen.getByTitle("Close modal"));

        expect(screen.queryByDisplayValue(firstCard.title)).not.toBeInTheDocument();
        expect(router.state.location.search).toEqual({});
    });

    it("renders no modal when the card id in the URL does not match any card", async () => {
        renderAtPath(`/app/boards/${board._id}?card=does-not-exist`);

        await screen.findByRole("heading", { name: board.title });
        expect(screen.queryByText("Description")).not.toBeInTheDocument();
    });

    it("shows an error state when the board fails to load", async () => {
        server.use(http.get("*/boards/:boardId", () => HttpResponse.error()));

        renderAtPath(`/app/boards/${board._id}`);

        expect(await screen.findByText("Couldn't load this board")).toBeInTheDocument();
    });
});
