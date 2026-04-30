# effect-ast-grep-rules

A reusable collection of [ast-grep](https://ast-grep.github.io) rules for
TypeScript projects that use the [Effect](https://effect.website) library.

These rules catch patterns that compile cleanly but sidestep the guarantees
Effect is meant to give you — typed errors, deferred execution, dependency
tracking, and explicit control flow.

## What's in here

| Rule | Severity | Catches |
| --- | --- | --- |
| `no-effect-run-in-library` | warning | `Effect.runSync` / `runPromise` / `runFork` outside entrypoint files |
| `no-bare-try-catch` | warning | `try/catch` blocks that should be `Effect.try` / `Effect.tryPromise` |
| `no-promise-then-on-effect` | error | `.then()` / `.catch()` / `.finally()` chained onto `Effect.*` |
| `prefer-effect-gen-over-deep-flatmap` | hint | `pipe` chains with 3+ `Effect.flatMap` calls |
| `prefer-schema-decode` | hint | `Schema.decodeUnknown*` outside trust-boundary directories |
| `no-effect-fail-with-string` | warning | `Effect.fail("...")` instead of a tagged error |

Every rule has a matching test file under [`tests/`](./tests). Open the rule
YAML to see the rationale (`note:` field) — these are documentation as much as
linting.

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
