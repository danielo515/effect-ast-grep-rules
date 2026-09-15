import { Arr, Order } from "effect";

interface CalendarEvent {
  readonly start: string;
  readonly title: string;
}

declare const events: ReadonlyArray<CalendarEvent>;

// bad: inline comparator, copy to dodge the in-place mutation
export const bad1 = [...events].sort((a, b) => a.start.localeCompare(b.start));

// bad: mutating sort in place
export const bad2 = (xs: Array<number>) => xs.sort((a, b) => a - b);

// bad: toSorted is still an ad-hoc comparator
export const bad3 = [...events].toSorted((a, b) => a.title.localeCompare(b.title));

// good: the ordering is a named, reusable value
const OrderByStart = Order.mapInput(Order.String, (e: CalendarEvent) => e.start);
export const good1 = Arr.sort(events, OrderByStart);

// good: orderings compose
export const good2 = Arr.sort(events, Order.reverse(OrderByStart));
