import { Option } from "effect";

declare const event: { id: string } | undefined;
declare const maybe: string | null;

// bad: truthiness ternary into Option
export const bad1 = event ? Option.some(event) : Option.none();

// bad: explicit nullish checks, both orientations
export const bad2 = maybe == null ? Option.none() : Option.some(maybe);
export const bad3 = maybe === null ? Option.none() : Option.some(maybe);
export const bad4 = maybe !== undefined ? Option.some(maybe) : Option.none();
export const bad5 = maybe != null ? Option.some(maybe) : Option.none();

// good: the idiomatic form
export const good1 = Option.fromNullable(event);

// good: explicit falsy-to-none intent
export const good2 = Option.liftPredicate(Boolean)(maybe);

// good: branches produce different values, not a plain wrap
export const good3 = event ? Option.some(event.id) : Option.none();
