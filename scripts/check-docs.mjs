// Verifies that the Holocron API reference renders the auth and multipart cURL
// examples we expect. Every expectation is derived from openapi.json, so adding
// or removing an operation needs no edit here.
//
// The `Content-Type: multipart/form-data` expectation of 0 guards the patch in
// patches/@holocron.so__vite@0.28.0.patch: Holocron must not print an explicit
// multipart Content-Type, because that strips the boundary the HTTP client sets.
import { readdir, readFile } from "node:fs/promises";

const spec = JSON.parse(await readFile(new URL("../openapi.json", import.meta.url), "utf8"));
const methods = ["delete", "get", "patch", "post", "put"];
const securitySchemes = spec.components?.securitySchemes ?? {};

function exampleHeaderFor(schemeName) {
  const scheme = securitySchemes[schemeName];
  if (!scheme) {
    throw new Error(`openapi.json references unknown security scheme ${schemeName}.`);
  }
  if (scheme.type === "http" && scheme.scheme === "bearer") {
    return "Authorization: Bearer <token>";
  }
  if (scheme.type === "apiKey" && scheme.in === "header") {
    return `${scheme.name}: <token>`;
  }
  throw new Error(`Security scheme ${schemeName} has no known cURL example shape.`);
}

const expectedExamples = new Map([["Content-Type: multipart/form-data", 0]]);
let operationCount = 0;
let multipartCount = 0;

for (const pathItem of Object.values(spec.paths ?? {})) {
  for (const method of methods) {
    const operation = pathItem[method];
    if (!operation) continue;

    operationCount += 1;

    for (const requirement of operation.security ?? spec.security ?? []) {
      for (const schemeName of Object.keys(requirement)) {
        const example = exampleHeaderFor(schemeName);
        expectedExamples.set(example, (expectedExamples.get(example) ?? 0) + 1);
      }
    }

    if (operation.requestBody?.content?.["multipart/form-data"]) {
      multipartCount += 1;
    }
  }
}

expectedExamples.set("file=@<file>", multipartCount);

const assets = new URL("../docs/dist/rsc/assets/", import.meta.url);
const apiAssets = (await readdir(assets)).filter(
  (file) => file.startsWith("api_") && file.endsWith(".js"),
);
const source = (
  await Promise.all(apiAssets.map((file) => readFile(new URL(file, assets), "utf8")))
).join("\n");

if (apiAssets.length !== operationCount) {
  throw new Error(
    `openapi.json declares ${operationCount} operations but the docs build produced ${apiAssets.length} API pages.`,
  );
}

for (const [example, expected] of expectedExamples) {
  const actual = source.split(example).length - 1;
  if (actual !== expected) {
    throw new Error(
      `Expected ${expected} generated occurrences of "${example}" (derived from openapi.json), found ${actual}.`,
    );
  }
}
