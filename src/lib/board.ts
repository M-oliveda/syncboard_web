import type { Board, BoardCard } from "@/types/board";

export function findCardInBoard(
    board: Board,
    cardId: string,
): { card: BoardCard; listName: string; listId: string } | undefined {
    for (const list of board.lists) {
        const card = list.cards.find((candidate) => candidate.id === cardId);
        if (card) return { card, listName: list.name, listId: list.id };
    }
    return undefined;
}

/** Moves a card to `targetListId` at the given `order`, removing it from wherever it
 * currently lives first — covers both cross-list moves and same-list reorders. Used to
 * apply both the optimistic guess (`onMutate`) and the server's reconciled result
 * (`onSuccess`) in `useMoveCardMutation`. */
export function moveCardInBoard(
    board: Board,
    cardId: string,
    targetListId: string,
    order: number,
): Board {
    let movedCard: BoardCard | undefined;
    const listsWithoutCard = board.lists.map((list) => {
        const found = list.cards.find((card) => card.id === cardId);
        if (!found) return list;
        movedCard = { ...found, order };
        return { ...list, cards: list.cards.filter((card) => card.id !== cardId) };
    });

    if (!movedCard) return board;
    const cardToInsert = movedCard;

    return {
        ...board,
        lists: listsWithoutCard.map((list) =>
            list.id === targetListId
                ? {
                      ...list,
                      cards: [...list.cards, cardToInsert].sort((a, b) => a.order - b.order),
                  }
                : list,
        ),
    };
}

/** Moves a list to the given `order`, keeping `board.lists` sorted. Used to apply both
 * the optimistic guess and the server's reconciled result in `useMoveListMutation`. */
export function moveListInBoard(board: Board, listId: string, order: number): Board {
    return {
        ...board,
        lists: board.lists
            .map((list) => (list.id === listId ? { ...list, order } : list))
            .sort((a, b) => a.order - b.order),
    };
}
