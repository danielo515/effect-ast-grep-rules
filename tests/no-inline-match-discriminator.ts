import { Match } from "effect";

type Chunk = { type: "start"; id: string } | { type: "finish"; id: string };

// bad: the discriminator factory is rebuilt on every branch
export const bad = Match.type<Chunk>().pipe(
  Match.discriminator("type")("start", (chunk) => chunk.id),
  Match.discriminator("type")("finish", (chunk) => chunk.id),
  Match.orElse(() => "none"),
);

// bad: same problem with the prefix variant
export const bad2 = Match.type<Chunk>().pipe(
  Match.discriminatorStartsWith("type")("fin", (chunk) => chunk.id),
  Match.orElse(() => "none"),
);

// good: built once, reused across branches
const byType = Match.discriminator("type");

export const good = Match.type<Chunk>().pipe(
  byType("start", (chunk) => chunk.id),
  byType("finish", (chunk) => chunk.id),
  Match.orElse(() => "none"),
);

// good: `discriminators` takes every branch in one object — nothing is rebuilt
export const good2 = Match.type<Chunk>().pipe(
  Match.discriminators("type")({
    start: (chunk) => chunk.id,
    finish: (chunk) => chunk.id,
  }),
);

// good: `Match.tag` is not a curried factory
export const good3 = Match.type<Chunk>().pipe(
  Match.tag("start", (chunk) => chunk.id),
  Match.orElse(() => "none"),
);
