// Named *.test.ts: the rule only applies to test files.
import { it as itEffect, layer } from "@effect/vitest";
import { Effect, Layer, pipe } from "effect";
import { describe, expect, it as itPlain } from "vitest";

declare const TestLayer: Layer.Layer<never>;
declare const program: Effect.Effect<void>;
declare const flag: boolean;

// bad: plain `it` never runs the returned Effect
it("expression body", () => Effect.gen(function* () {}));

// bad: `test` behaves the same
test("test alias", () => Effect.succeed(1));

// bad: @effect/vitest's `it` is vitest's `it`, aliased or not
itEffect("aliased @effect/vitest it", () => Effect.gen(function* () {}));

// bad: alias of vitest's own `it`
itPlain("aliased vitest it", () => Effect.void);

// bad: vitest modifiers don't run Effects either
it.only("only", () => Effect.gen(function* () {}));
it.skip("skip", () => Effect.gen(function* () {}).pipe(Effect.provide(TestLayer)));
it.concurrent.only("chained modifiers", () => Effect.void);
it.each([1, 2])("each %i", (n) => Effect.succeed(n));
it.skipIf(flag)("skipIf", () => Effect.void);
itEffect.only("aliased modifier", () => Effect.void);

// bad: returned from a block body or a function expression
it("block body", () => {
  const x = 1;
  return Effect.succeed(x);
});
it("function expression", function () {
  return Effect.void;
});

// bad: pipelines that end in an Effect
it("pipe function", () => pipe(Effect.succeed(1), Effect.map((n) => n + 1)));
it("pipe method", () => program.pipe(Effect.provide(TestLayer)));

// bad: options object before the callback
it("with options", { timeout: 1000 }, () => Effect.void);

// bad: plain `it(...)` called on the `it` handed in by layer(...)
layer(TestLayer)("suite", (it) => {
  it("inside layer", () => Effect.void);
});

// good: Effect-aware test registration
it.effect("effect", () => Effect.gen(function* () {}));
it.scoped("scoped", () => Effect.void);
it.live("live", () => Effect.void);
it.scopedLive("scopedLive", () => Effect.void);
itEffect.effect("aliased effect", () => Effect.void);
it.effect.skip("effect.skip", () => Effect.void);
it.effect.each([1])("effect.each", (n) => Effect.succeed(n));

// good: layer(...) blocks and the `it` they hand in
layer(TestLayer)("suite", (it) => {
  it.effect("inside layer", () => Effect.void);
});
it.layer(TestLayer)("nested layer", (it) => {
  it.effect("inside it.layer", () => Effect.void);
});

// good: plain tests that don't return an Effect
it("sync", () => {
  expect(1).toBe(1);
});
it("expression", () => expect(1).toBe(1));
itPlain("aliased sync", () => {
  expect(1).toBe(1);
});

// good: Effect.run* returns a Promise (no-run-effect-in-test covers it)
it("runPromise", () => Effect.runPromise(Effect.void));
it("pipe runPromise", () => Effect.void.pipe(Effect.runPromise));

// good: an Effect returned by a nested function, not by the callback
it("nested return", () => {
  const make = () => {
    return Effect.void;
  };
  expect(make).toBeDefined();
});

// good: not a test function
describe("describe", () => {
  expect(1).toBe(1);
});
