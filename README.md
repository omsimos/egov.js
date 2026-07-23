# egov.js

OpenAPI specification and generated TypeScript SDK for nine Philippine eGov
partner services. The SDK is generated with
[`@hey-api/openapi-ts`](https://heyapi.dev/openapi-ts/get-started) and bundles a
Fetch client without runtime dependencies.

> Provider hosts are staging or hackathon services unless confirmed otherwise.
> Keep credentials and citizen data on trusted server infrastructure.

## Services

| Service       | Capability                                                             |
| ------------- | ---------------------------------------------------------------------- |
| eGov AI       | Text generation, translation, document extraction, and credit tracking |
| eGov Compass  | Budget releases, allocations, obligations, and disbursements           |
| eMessage      | SMS delivery                                                           |
| eGovChain     | EVM-compatible JSON-RPC reads and signed transaction submission        |
| eReport       | Complaint submission, OTP verification, reports, and location datasets |
| eGov SSO      | Citizen sign-in token exchange and profile retrieval                   |
| eVerify       | Identity and QR verification                                           |
| eGovPay       | Payment creation, lookup, and voiding                                  |
| Face Liveness | Liveness sessions and verification results                             |

## Installation

```bash
pnpm add egov.js
```

Node.js 22.18 or newer is supported. Other modern runtimes can use the SDK when
they provide Fetch, `Blob`, and `FormData`.

## Quickstart

Create a client for a provider host, exchange the access code, and pass the raw
bearer token to authenticated operations:

```ts
import { createClient, egovAi } from "egov.js";

const client = createClient({
  baseUrl: "https://egov-ai-core-ws.oueg.info",
});

const token = await egovAi.generateAccessToken({
  client,
  body: {
    access_code: process.env.EGOVAI_ACCESS_CODE!,
  },
  throwOnError: true,
});

const answer = await egovAi.generateAssistant({
  client,
  auth: token.access_token,
  body: {
    category: "general",
    prompt: "How do I register a business in the Philippines?",
  },
  throwOnError: true,
});

console.log(answer.data);
```

Generated service methods accept one grouped options object. Depending on the
operation, request values belong under `body`, `query`, or `path`. Shared options
such as `client`, `auth`, `headers`, `signal`, and `throwOnError` remain at the
top level.

## Authentication

Read secrets in application code and configure one client per provider or
credential scope. Bearer operations accept a raw token through `auth`. API-key
services can configure their required header once:

```ts
import { createClient, compass } from "egov.js";

const client = createClient({
  baseUrl: "https://dbm-ws.oueg.info",
  headers: {
    "X-API-Key": process.env.EGOVCOMPASS_API_KEY!,
  },
});

const records = await compass.getSaaodbRecords({
  client,
  query: {
    period: "FY",
    reportYear: 2026,
  },
  throwOnError: true,
});
```

## Errors

Pass `throwOnError: true` to reject unsuccessful HTTP responses and retain a
non-optional success type. The generated Fetch client throws the parsed error
body for HTTP failures. Network and abort failures propagate as native errors.
The SDK does not retry automatically.

## OpenAPI

The published OpenAPI 3.1 document is the source of truth for every generated
operation and type:

```ts
import openapi from "egov.js/openapi.json" with { type: "json" };

console.log(openapi.openapi);
```

Use `import.meta.resolve("egov.js/openapi.json")` to locate the document for an
external generator. Update `openapi.json`, run `pnpm generate`, and commit the
generated changes when contributing.

## Migration

| Handwritten SDK                                | Generated SDK                                      |
| ---------------------------------------------- | -------------------------------------------------- |
| Service subpaths such as `egov.js/eGovAi`      | Named exports from `egov.js`                       |
| Service factories and `fromEnv()`              | `createClient()` and tagged static service classes |
| Positional method arguments                    | Grouped `body`, `query`, and `path` options        |
| Runtime endpoint catalogs                      | `egov.js/openapi.json`                             |
| Custom `EgovApiError`                          | Generated Fetch client errors                      |
| Payment digest and named JSON-RPC conveniences | Application logic over documented wire operations  |

## Development

```bash
pnpm install
pnpm check
```

`pnpm check` validates and regenerates the OpenAPI SDK, checks formatting and
types, runs tests, verifies package exports, and builds the Holocron docs.

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the contribution workflow.

## License

[MIT](./LICENSE) Copyright (c) 2026 Omsimos.
