# egov.js

Typed JavaScript and TypeScript SDK for Philippine eGov APIs.

`egov.js` provides dependency-free clients for nine eGov partner
services. It ships ESM and CommonJS builds, TypeScript declarations, explicit
service subpaths, and a shared fetch-based transport.

> The configured hosts are hackathon or staging services unless noted
> otherwise. Do not use them for production traffic without confirmation from
> the relevant eGov service owner.

## Services

| Import                     | Service       | Capability                                                             |
| -------------------------- | ------------- | ---------------------------------------------------------------------- |
| `egov.js/eGovAi`           | eGov AI       | Text generation, translation, document extraction, and credit tracking |
| `egov.js/eGovCompass`      | eGov Compass  | Budget releases, allocations, obligations, and disbursements           |
| `egov.js/eMessage`         | eMessage      | SMS delivery                                                           |
| `egov.js/eGovChain`        | eGovChain     | EVM-compatible JSON-RPC reads and signed transaction submission        |
| `egov.js/eReport`          | eReport       | Complaint submission, OTP verification, reports, and location datasets |
| `egov.js/eGovSso`          | eGov SSO      | Citizen sign-in token exchange and profile retrieval                   |
| `egov.js/eVerify`          | eVerify       | Identity and QR verification                                           |
| `egov.js/eGovPay`          | eGovPay       | Payment creation, lookup, and voiding                                  |
| `egov.js/eGovFaceLiveness` | Face Liveness | Liveness sessions and verification results                             |

## Installation

The package is not yet listed on npm. The command below is the public
installation path and will work after the first npm release.

```bash
pnpm add egov.js
```

Node.js 22.18 or newer is supported. Explicitly configured clients also work in
modern runtimes that provide Fetch, Web Crypto, `Blob`, and `FormData`.

## Quickstart

Import a service subpath so applications only load the API surface they use:

```ts
import { eGovAiApi } from "egov.js/eGovAi";

const ai = eGovAiApi.fromEnv({
  baseUrl: "https://egov-ai-core-ws.oueg.info",
});

const token = await ai.generateAccessToken();
const answer = await ai.generateAssistant(token.access_token, {
  category: "general",
  prompt: "How do I register a business in the Philippines?",
});

console.log(answer.data);
```

`fromEnv(...)` reads credentials only. Pass the service base URL explicitly so
staging and production endpoints cannot be confused silently.

Use `create(...)` when credentials come from another secret provider:

```ts
import { eMessageApi } from "egov.js/eMessage";

const messaging = eMessageApi.create({
  accessToken: secrets.emessageToken,
  baseUrl: "https://ws-message.e.gov.ph",
});

await messaging.sendSms({
  message: "Your application is ready for review.",
  number: "+639171234567",
});
```

Keep credential-bearing clients on the server. SMS, payment, complaint, and
liveness methods can cause real external side effects.

## Error handling

All non-successful HTTP responses throw `EgovApiError` with the normalized
status, headers, parsed body, method, and URL:

```ts
import { EgovApiError } from "egov.js/core";

try {
  await client.getTransaction(transactionUuid);
} catch (error) {
  if (error instanceof EgovApiError) {
    console.error(error.status, error.body);
  }
}
```

Pass an `AbortSignal` in the final call-options argument to enforce application
timeouts. The SDK intentionally does not retry requests because several eGov
operations are not safe to repeat.

## Environment variables

| Service       | Variables read by `fromEnv(...)`                               |
| ------------- | -------------------------------------------------------------- |
| eGov AI       | `EGOVAI_ACCESS_CODE`                                           |
| eGov Compass  | `EGOVCOMPASS_API_KEY`                                          |
| eMessage      | `EMESSAGE_ACCESS_TOKEN`                                        |
| eReport       | `EREPORT_ACCESS_TOKEN`                                         |
| eGov SSO      | `EGOVSSO_PARTNER_CODE`, `EGOVSSO_PARTNER_SECRET`               |
| eVerify       | `EVERIFY_CLIENT_ID`, `EVERIFY_CLIENT_SECRET`, `EVERIFY_PUBKEY` |
| eGovPay       | `EGOVPAY_API_KEY`, `EGOVPAY_SETTLEMENT_TEMPLATE_UUID`          |
| Face Liveness | `EGOVLIVENESS_API_KEY`                                         |

eGovChain uses a public default RPC endpoint and does not read credentials.

## Documentation

The full SDK guide is a [Holocron](https://github.com/remorses/holocron) site in
[`docs/`](./docs/index.mdx). Run it locally with:

```bash
pnpm docs:dev
```

## Development

```bash
pnpm install
pnpm check
```

`pnpm check` verifies formatting, lint, types, unit tests, dual-format builds,
package exports with publint and Are the Types Wrong, and the Holocron site.

Use `pnpm changeset` for user-facing changes. See
[`CONTRIBUTING.md`](./CONTRIBUTING.md), [`SECURITY.md`](./SECURITY.md), and
[`CHANGELOG.md`](./CHANGELOG.md) for project policies and release history.

## License

[MIT](./LICENSE) Copyright (c) 2026 Omsimos.
