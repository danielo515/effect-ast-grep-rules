import { Schema } from "effect";

const User = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
});

declare const internalUser: { id: string; name: string };

// Should be flagged: input type is already known.
export const bad = Schema.decodeUnknownSync(User)(internalUser);

// OK: tighter signature for already-typed input.
export const good = Schema.decodeSync(User)(internalUser);
