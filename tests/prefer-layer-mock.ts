import { Context, Effect, Layer } from "effect";

class Users extends Context.Tag("Users")<
  Users,
  {
    readonly token: Effect.Effect<string>;
    readonly get: (id: string) => Effect.Effect<string>;
    readonly list: () => Effect.Effect<ReadonlyArray<string>>;
    readonly remove: (id: string) => Effect.Effect<void>;
  }
>() {}

// bad: every unused method stubbed by hand
export const bad1 = Layer.succeed(
  Users,
  Users.of({
    token: Effect.succeed("t"),
    get: (id) => Effect.succeed(id),
    list: () => Effect.die("unused"),
    remove: () => Effect.die("unused"),
  }),
);

// bad: Effect-valued property stubbed, dieMessage variant
export const bad2 = Users.of({
  token: Effect.die("unused"),
  get: (id) => Effect.succeed(id),
  list: () => Effect.succeed([]),
  remove: () => Effect.dieMessage("unused"),
});

// good: only what the test exercises; the rest die with UnimplementedError
export const good1 = Layer.mock(Users, {
  get: (id) => Effect.succeed(id),
});

// good: failing on purpose is a real behaviour, not a stub
export const good2 = Layer.mock(Users, {
  remove: () => Effect.fail("not allowed" as const),
});
