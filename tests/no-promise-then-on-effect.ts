import { Effect, pipe } from "effect";

const eff = Effect.succeed(1);

// Should be flagged: `.then` on an Effect-returning expression.
export const bad1 = Effect.succeed(1).then((n) => n + 1);

// Should be flagged.
export const bad2 = Effect.fail("nope").catch(() => 0);

// OK: standard Effect composition.
export const good = pipe(
  eff,
  Effect.map((n) => n + 1),
);

// OK: actually running it produces a Promise we can await.
export const ran = Effect.runPromise(eff);
