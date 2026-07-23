# Contributing

Thank you for helping improve `egov.js`.

## Development

Requirements:

- Node.js 22.18 or newer
- pnpm 10.33 or newer

Install dependencies and run the complete local validation suite:

```bash
pnpm install
pnpm check
```

Use `pnpm test:watch` while changing behavior and `pnpm docs:dev` while editing
the Holocron site.

`openapi.json` is the SDK's source of truth. After changing the contract, run:

```bash
pnpm openapi:lint
pnpm generate
```

Commit the resulting `src/generated` changes and do not edit generated files by
hand. `pnpm check` verifies that generated output is current.

## Changes

- Keep credentials and personal data out of source, fixtures, logs, and issues.
- Add or update tests for behavior changes.
- Update documentation when public APIs or configuration change.
- Run `pnpm changeset` for every user-facing change.
- Use clear, focused commits and open a pull request against `main`.

By contributing, you agree that your contributions are licensed under the MIT
License.
