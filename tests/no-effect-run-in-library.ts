import { Effect } from "effect";

const program = Effect.succeed(42);

// Should be flagged: this lives in a library file but eagerly runs an Effect.
export const result = Effect.runSync(program);

// Should be flagged.
export const promised = Effect.runPromise(program);

// Should be flagged.
export const fork = Effect.runFork(program);

// OK: returning the Effect, not running it.
export const safe = program;
