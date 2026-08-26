# Security Policy

## Supported versions

Security updates are provided for the latest released version on npm. Older
`0.x` releases are not patched; upgrade before reporting an issue against them.

| Version | Supported |
| ------- | --------- |
| 0.2.x   | Yes       |
| < 0.2   | No        |

## Reporting a vulnerability

**Do not open a public issue, pull request, or discussion** for a suspected
vulnerability or for exposed eGov credentials.

Report privately through GitHub's private vulnerability reporting:

- <https://github.com/omsimos/egov.js/security/advisories/new>

If that form is unavailable to you, contact the Omsimos maintainers privately
through the organization profile at <https://github.com/omsimos> rather than
posting details anywhere public.

Include the affected version, reproduction steps, impact, and any suggested
mitigation. Redact tokens, API keys, and citizen data before sending anything —
describe the shape of the exposure instead of pasting the value.

We aim to acknowledge a report within 5 business days and will coordinate a fix
and a disclosure timeline with the reporter.

## Scope

In scope:

- The published `egov.js` package, its build output, and its release pipeline.
- `openapi.json`, the generated SDK, and any credential-handling behavior in the
  bundled Fetch client.

Out of scope:

- Vulnerabilities in the upstream eGov provider services themselves. Report
  those to eGov through <https://platforms.e.gov.ph>.
- Findings that require an already-compromised machine or a maliciously
  modified local checkout.

## Handling credentials

This SDK never persists credentials. Tokens and API keys are read from the
values your application passes to `createClient()` and to each operation, and
are sent only to the `baseUrl` you configure. Keep them in server-side
configuration, never in client bundles or committed fixtures.

If you believe an eGov credential has leaked through this repository or a
release artifact, report it privately using the process above and rotate the
credential with the provider immediately.
