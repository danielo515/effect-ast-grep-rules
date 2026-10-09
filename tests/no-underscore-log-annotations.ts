import { Effect } from "effect";

declare const error: { _tag: string; message: string };
declare const someEffect: Effect.Effect<void>;

// bad: underscore-prefixed annotation keys
export const bad1 = Effect.annotateLogs({ _tag: error._tag, message: error.message });
export const bad2 = Effect.annotateLogs(someEffect, { _op: "query" });

// good: descriptive key names
export const good1 = Effect.annotateLogs({ errorTag: error._tag });
export const good2 = Effect.annotateLogs(someEffect, { operation: "query" });
