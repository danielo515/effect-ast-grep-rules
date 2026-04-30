import { Data, Effect } from "effect";

// Should be flagged.
export const bad1 = Effect.fail("user not found");

// Should be flagged.
const id = "u1";
export const bad2 = Effect.fail(`user ${id} not found`);

// OK: tagged error.
class UserNotFound extends Data.TaggedError("UserNotFound")<{ id: string }> {}
export const good = Effect.fail(new UserNotFound({ id: "u1" }));
