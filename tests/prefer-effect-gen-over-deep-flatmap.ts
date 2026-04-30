import { Effect, pipe } from "effect";

declare const fetchUser: (id: string) => Effect.Effect<{ id: string }, Error>;
declare const fetchOrders: (uid: string) => Effect.Effect<readonly string[], Error>;
declare const fetchItems: (oid: string) => Effect.Effect<readonly string[], Error>;
declare const enrich: (items: readonly string[]) => Effect.Effect<readonly string[], Error>;

// Should be flagged: 3+ chained flatMaps — easier to read as Effect.gen.
export const bad = pipe(
  fetchUser("u1"),
  Effect.flatMap((u) => fetchOrders(u.id)),
  Effect.flatMap((orders) => fetchItems(orders[0]!)),
  Effect.flatMap((items) => enrich(items)),
);

// OK: equivalent program, much easier to read.
export const good = Effect.gen(function* () {
  const user = yield* fetchUser("u1");
  const orders = yield* fetchOrders(user.id);
  const items = yield* fetchItems(orders[0]!);
  return yield* enrich(items);
});

// OK: only one flatMap.
export const fine = pipe(
  fetchUser("u1"),
  Effect.flatMap((u) => fetchOrders(u.id)),
);
