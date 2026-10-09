# effect-ast-grep-rules

A reusable collection of [ast-grep](https://ast-grep.github.io) rules for
TypeScript projects that use the [Effect](https://effect.website) library.

These rules catch patterns that compile cleanly but sidestep the guarantees
Effect is meant to give you — typed errors, deferred execution, dependency
tracking, and explicit control flow.

> **Compatibility:** these rules have only been tested against **Effect v3**.
> They may or may not apply cleanly to other major versions — review the
> patterns before relying on them elsewhere.

## What is ast-grep, and why not just oxlint?

[ast-grep](https://ast-grep.github.io) is a structural search-and-lint tool:
you write patterns that look like the code you want to match
(`Effect.runSync($$$)`), and it matches against the AST — not text — so
formatting, whitespace, and variable names don't matter. Rules are plain YAML
files with a pattern, a severity, a message, and an explanatory note; no
plugin API, no build step.

[oxlint](https://oxc.rs) is excellent as a general-purpose linter — extremely
fast, with hundreds of curated built-in rules. But writing your *own* rules
for it means writing a JS plugin against a linter API. ast-grep shines exactly
where oxlint doesn't:

- **Project-specific conventions** — "never call `X.y` outside directory Z",
  "use our wrapper instead of this library API". A YAML pattern takes minutes;
  a linter plugin takes an afternoon.
- **Library-idiom enforcement** (this repo) — rules like "no `throw` inside
  `Effect.gen`" exist in no stock rule set.
- **Rules as documentation** — each YAML file carries a `note:` explaining the
  *why* with bad/good examples, printed with every finding.
- **Codemods** — a rule can carry a `fix:`, turning it into an applyable
  rewrite.

The two compose well: keep oxlint (or ESLint) for generic correctness rules,
and add ast-grep for the rules that are yours.

## What's in here

| Rule | Severity | Catches |
| --- | --- | --- |
| `no-effect-run-in-library` | warning | `Effect.runSync` / `runPromise` / `runFork` outside entrypoint files |
| `no-runpromise-in-effect` | error | `Effect.run*` *inside* `Effect.gen` / `Effect.fn` bodies |
| `no-bare-try-catch` | warning | `try/catch` blocks that should be `Effect.try` / `Effect.tryPromise` |
| `no-throw-in-effect` | error | `throw` inside `Effect.gen` — use `Effect.fail` with a tagged error |
| `no-promise-then-on-effect` | error | `.then()` / `.catch()` / `.finally()` chained onto `Effect.*` |
| `no-silent-catch` | warning | `Effect.catchAll` that recovers without logging the error |
| `no-effect-fail-with-string` | warning | `Effect.fail("...")` instead of a tagged error |
| `tagged-error-location` | warning | `new Error(...)` inside Effect code — use `Schema.TaggedError` |
| `no-console-log` | warning | `console.*` — use `Effect.log*`, which integrates with tracing |
| `no-drift-fs` | warning | direct `node:fs` imports — use `@effect/platform` `FileSystem` |
| `no-as-any-service-mock` | error | service mocks cast with `as any` — construct the service class |
| `no-schema-type-helper` | error (fixable) | `Schema.Schema.Type<typeof X>` — use `typeof X.Type` |
| `prefer-schema-decode` | hint | `Schema.decodeUnknown*` outside trust-boundary directories |
| `prefer-effect-gen-over-deep-flatmap` | hint | `pipe` chains with 3+ `Effect.flatMap` calls |
| `prefer-option-from-nullable` | warning | `x ? Option.some(x) : Option.none()` ternaries — use `Option.fromNullable` |
| `no-inline-match-discriminator` | error | inline `Match.discriminator(f)(tag, h)` — hoist the factory and reuse it |
| `no-run-effect-in-test` | error | `Effect.run*` in test files — use `it.effect` from `@effect/vitest` |
| `no-effect-in-plain-test` | error | plain `it`/`test` callbacks returning an Effect (never run) — use `it.effect` |
| `no-either-guard-assertion` | error | boolean `Either.isLeft` guards in tests — deep-assert the whole `Either` |
| `prefer-order-sort` | warning | native `.sort((a, b) => ...)` — use `Arr.sort` with a named `Order` |
| `prefer-destructuring-over-length-guard` | warning | `if (xs.length > 0) { xs[0] }` — destructure, then narrow on `undefined` |
| `prefer-layer-mock` | warning | service mocks padded with `() => Effect.die("unused")` stubs — use `Layer.mock` |

Rules are plain YAML — copy the ones you want, delete the ones you don't.
Open a rule file to see the rationale (`note:` field) — these are
documentation as much as linting. Some rules have matching test files under
[`tests/`](./tests).

## Install

In your Effect project:

```sh
pnpm add -D @ast-grep/cli
```

> The `@ast-grep/napi` package is the programmatic API. For CLI-style scanning
> in scripts and CI, `@ast-grep/cli` is what you want.

If you use Nix, the binary is also available as `pkgs.ast-grep` — see this
repo's [`flake.nix`](./flake.nix) for an example devShell.

## Drop the rules into your project

You have two reasonable options.

### Option A — vendor the rules

Copy the [`rules/`](./rules) directory and [`sgconfig.yml`](./sgconfig.yml)
into your project root, adjusting `ruleDirs` if you want a different layout.
Rules are plain YAML, so you can prune or tweak them per project.

### Option B — git submodule

```sh
git submodule add https://github.com/<you>/effect-ast-grep-rules .ast-grep/effect
```

Then in your project's `sgconfig.yml`:

```yaml
ruleDirs:
  - .ast-grep/effect/rules
```

## Wire it into your pipeline

### npm scripts

```json
{
  "scripts": {
    "lint:ast": "ast-grep scan",
    "lint:ast:ci": "ast-grep scan --error",
    "lint": "pnpm lint:ast && pnpm tsc --noEmit"
  }
}
```

`--error` makes the process exit non-zero on any rule with severity `error`,
which is what you want in CI.

### Pre-commit (lefthook example)

```yaml
pre-commit:
  commands:
    ast-grep:
      glob: "*.{ts,tsx}"
      run: pnpm ast-grep scan --error {staged_files}
```

The same shape works for [`husky`](https://typicode.github.io/husky/) +
`lint-staged` — just point `lint-staged` at `ast-grep scan --error`.

### GitHub Actions

```yaml
- run: pnpm install --frozen-lockfile
- run: pnpm ast-grep scan --error
```

## Run scans manually

```sh
# scan the whole project against everything in sgconfig.yml
pnpm ast-grep scan

# only fail on `error`-severity rules
pnpm ast-grep scan --error

# scan with a single rule file (handy when iterating on a rule)
pnpm ast-grep scan --rule rules/no-effect-run-in-library.yml src/

# machine-readable output
pnpm ast-grep scan --json=pretty
```

## Example output

```
warning[no-effect-run-in-library]: Avoid `Effect.runSync` / `Effect.runPromise` / `Effect.runFork` outside of entrypoint files.
  ┌─ src/services/users.ts:6:23
  │
6 │ export const result = Effect.runSync(program);
  │                       ^^^^^^^^^^^^^^^^^^^^^^^
  │
  = Running an Effect inside a library module forces eager execution and discards the dependency requirements (R) of the Effect...

error[no-promise-then-on-effect]: Don't call `.then()` / `.catch()` / `.finally()` on an Effect-returning value.
  ┌─ src/api/handler.ts:14:21
  │
14│ const out = Effect.succeed(1).then((n) => n + 1);
  │             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
```

## Adding a new rule

1. Create `rules/<rule-id>.yml`. The minimum shape is:

   ```yaml
   id: my-rule
   language: TypeScript
   severity: warning   # hint | info | warning | error
   message: One-line summary shown at the top of each finding.
   note: >-
     Longer explanation of the why. Include the recommended fix.
   rule:
     pattern: SomeAPI.badThing($$$)
   files:
     - "**/*.ts"
     - "**/*.tsx"
   ```

2. Add a `tests/<rule-id>.ts` file with both bad cases (should be flagged) and
   good cases (should stay quiet). Comments above each case make the intent
   obvious when a future change breaks the rule.

3. Run `pnpm ast-grep scan --rule rules/<rule-id>.yml tests/<rule-id>.ts` and
   confirm the output matches expectations.

4. Add the rule to the table at the top of this README.

### Useful rule-config docs

- [Rule config reference](https://ast-grep.github.io/reference/rule.html)
- [Pattern syntax (`$VAR`, `$$$REST`, etc.)](https://ast-grep.github.io/guide/pattern-syntax.html)
- [Constraints on meta-variables](https://ast-grep.github.io/guide/rule-config/atomic-rule.html#constraints)
- [Playground](https://ast-grep.github.io/playground.html) — paste TS, iterate
  on a pattern, copy it into a rule file.

## Configuration: `sgconfig.yml`

The minimal config this repo ships with:

```yaml
ruleDirs:
  - rules
```

`ast-grep scan` (no args) walks the cwd and applies every rule under
`ruleDirs`. Add more entries to combine vendor-shipped rules with your own
project-local ones.

## License

MIT
