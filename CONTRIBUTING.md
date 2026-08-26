# Contributing

Thank you for helping improve `egov.js`. Issues, pull requests, and
[discussions](https://github.com/omsimos/egov.js/discussions) are all welcome.

By contributing, you agree that your contributions are licensed under the MIT
License, and to follow the [Code of Conduct](./CODE_OF_CONDUCT.md).

## Development

Requirements:

- Node.js 22.18 or newer (see `.node-version`)
- pnpm 10.33 or newer

Install dependencies and run the complete local validation suite:

```bash
pnpm install
pnpm check
```

`pnpm check` runs, in order: format check, lint, OpenAPI lint, generated-output
check, typecheck, tests, build, package-export validation, and the docs build.
CI runs the same command on Node 22.18 and 24, so a green `pnpm check` locally
means a green CI.

Use `pnpm test:watch` while changing behavior and `pnpm docs:dev` while editing
the Holocron site.

## Project layout

| Path                           | Purpose                                                          |
| ------------------------------ | ---------------------------------------------------------------- |
| `openapi.json`                 | The wire contract. Source of truth for everything generated.     |
| `openapi-ts.config.ts`         | Generator config: service naming, method naming, plugin options. |
| `src/generated/`               | Generated output. Never edit by hand.                            |
| `src/index.ts`                 | The public entry point and the only hand-written source file.    |
| `scripts/`                     | Generation post-processing and the generated/docs drift checks.  |
| `test/`                        | Contract snapshot tests and SDK transport behavior tests.        |
| `docs/`                        | Holocron documentation site (a private workspace package).       |
| `patches/`                     | pnpm patch for Holocron's cURL example rendering.                |
| `.agents/`, `skills-lock.json` | Pinned AI-agent skill used when working on the docs site.        |

## Changing the wire contract

`openapi.json` drives the SDK, the types, and the API reference. To add or
change an operation:

1. Edit `openapi.json`. Every operation needs a unique `operationId`, exactly
   one `tag`, and a `servers` entry naming its documented provider host.
2. Run `pnpm openapi:lint` to validate the document.
3. Run `pnpm generate` to regenerate `src/generated/`.
4. Update the contract snapshot counts in `test/openapi.test.ts` — the operation
   total, schema total, security-scheme total, and tag total are deliberate
   literals there so that an accidental deletion fails loudly. This is the only
   file where those totals are maintained by hand.
5. Update the matching page under `docs/services/` and, for a new service, the
   navigation in `docs/docs.jsonc`.
6. Run `pnpm changeset` and then `pnpm check`.

Commit the resulting `src/generated/` changes. `pnpm check:generated` verifies
that the committed output matches what the generator produces, so a stale
regeneration fails CI.

`scripts/check-docs.mjs` and `test/sdk.test.ts` derive their expectations from
`openapi.json` and need no edit when the operation catalog changes.

## Changes

- Keep credentials and personal data out of source, fixtures, logs, and issues.
- Add or update tests for behavior changes.
- Update documentation when public APIs or configuration change.
- Run `pnpm changeset` for every user-facing change.
- Use clear, focused commits. This repository follows
  [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`,
  `docs:`, `chore:`, `ci:`).
- Open a pull request against `main` and fill in the checklist in the template.

## Releasing

Releases are cut by the maintainers:

1. `pnpm changeset version` consumes the pending changesets and updates
   `package.json` and `CHANGELOG.md`. `CHANGELOG.md` is machine-owned — do not
   hand-edit released sections.
2. Review and merge the version bump to `main`.
3. `pnpm release` runs `pnpm check`, publishes to npm, and creates the `vX.Y.Z`
   git tag locally. npm publishing is intentionally manual.
4. Push the tag. The Release workflow re-runs `pnpm audit` and `pnpm check`,
   verifies the tag matches the package version, and publishes a GitHub Release
   with the packed tarball.

## Security

Never open a public issue for a suspected vulnerability or for an exposed eGov
credential. Follow the [Security Policy](./SECURITY.md) instead.
