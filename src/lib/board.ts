import type { Board, BoardCard } from "@/types/board";

export function findCardInBoard(
    board: Board,
    cardId: string,
): { card: BoardCard; listName: string } | undefined {
    for (const list of board.lists) {
        const card = list.cards.find((candidate) => candidate.id === cardId);
        if (card) return { card, listName: list.name };
    }
    return undefined;
}
