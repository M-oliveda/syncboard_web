import type { CarouselApi } from "@/components/ui/carousel-context";

/** Embla's `watchDrag` option: return `false` to let a gesture pass through
 * untouched to `@dnd-kit` (e.g. reordering a card or a list), `true` to let
 * Embla treat it as carousel-swipe navigation. `@dnd-kit`'s `useSortable`
 * stamps every enabled drag handle with `aria-roledescription="draggable"`
 * (see List.tsx/Card.tsx), so that's the signal we key off of. */
export function shouldCarouselHandleDrag(
    _emblaApi: CarouselApi,
    event: MouseEvent | TouchEvent,
): boolean {
    return !(
        event.target instanceof Element &&
        event.target.closest('[aria-roledescription="draggable"]')
    );
}
