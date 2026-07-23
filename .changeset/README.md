# Changesets

Run `pnpm changeset` for every user-facing change. Select the semantic version
bump, describe the impact on SDK consumers, and commit the generated Markdown
file with the implementation.

Maintainers run `pnpm version` to consume pending changesets, update the package
version, and add the release notes to `CHANGELOG.md`.
