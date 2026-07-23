import { readdir, readFile } from "node:fs/promises";

const assets = new URL("../docs/dist/rsc/assets/", import.meta.url);
const apiAssets = (await readdir(assets)).filter(
  (file) => file.startsWith("api_") && file.endsWith(".js"),
);
const source = (
  await Promise.all(apiAssets.map((file) => readFile(new URL(file, assets), "utf8")))
).join("\n");
const expectedExamples = new Map([
  ["Authorization: Bearer <token>", 19],
  ["x-api-key: <token>", 9],
  ["X-EMESSAGE-Auth: <token>", 1],
  ["X-eGovPay-Token: <token>", 3],
  ["X-EReport-View-Token: <token>", 2],
  ["file=@<file>", 1],
  ["Content-Type: multipart/form-data", 0],
]);

if (apiAssets.length !== 39) {
  throw new Error(`Expected 39 generated API pages, found ${apiAssets.length}.`);
}

for (const [example, expected] of expectedExamples) {
  const actual = source.split(example).length - 1;
  if (actual !== expected) {
    throw new Error(`Expected ${expected} generated occurrences of ${example}, found ${actual}.`);
  }
}
