import { Effect } from "effect";

declare function risky(): string;

// Should be flagged: bare try/catch around throwing code.
export function bad() {
  try {
    return risky();
  } catch (e) {
    return null;
  }
}

// OK: errors flow through the typed Effect channel.
export const good = Effect.try({
  try: () => risky(),
  catch: (cause) => new Error(`risky failed: ${String(cause)}`),
});
