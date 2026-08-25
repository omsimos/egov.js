import { readFile, writeFile } from "node:fs/promises";

const sdk = new URL("../src/generated/sdk.gen.ts", import.meta.url);
const source = await readFile(sdk, "utf8");
const clientImport = "  formDataBodySerializer,\n";
const jsonHeaders =
  /^(\s+)headers: \{\n\s+"Content-Type": "application\/json",\n\s+\.\.\.options\.headers,\n\s+\},$/gm;
const multipartHeaders =
  /^(\s+)headers: \{\n\s+"Content-Type": null,\n\s+\.\.\.options\.headers,\n\s+\},$/gm;
const optionType = "> = Options2<TData, ThrowOnError, TResponse> & {";
const optionTypeFixed = '> = Omit<Options2<TData, ThrowOnError, TResponse>, "responseStyle"> & {';
const responseStyle = /^\s+responseStyle: "data",$/gm;
const spread = /^(\s+)\.\.\.options,$/gm;

if (!source.includes(optionType)) {
  throw new Error("Generated SDK option type changed; response-style guard was not applied.");
}

const responseStyles = source.match(responseStyle) ?? [];
const spreads = source.match(spread) ?? [];
const jsonHeaderBlocks = source.match(jsonHeaders) ?? [];
const multipartHeaderBlocks = source.match(multipartHeaders) ?? [];

if (
  !source.includes(clientImport) ||
  jsonHeaderBlocks.length === 0 ||
  multipartHeaderBlocks.length === 0 ||
  spreads.length === 0 ||
  responseStyles.length !== spreads.length
) {
  throw new Error("Generated SDK operation shape changed; response-style guard was not applied.");
}

const fixed = source
  .replace(clientImport, `${clientImport}  mergeHeaders,\n`)
  .replace(
    jsonHeaders,
    (_, indentation) =>
      `${indentation}headers: mergeHeaders(\n${indentation}  { "Content-Type": "application/json" },\n${indentation}  options.headers,\n${indentation}),`,
  )
  .replace(
    multipartHeaders,
    (_, indentation) =>
      `${indentation}headers: {\n${indentation}  "Content-Type": null,\n${indentation}  ...Object.fromEntries(mergeHeaders(options.headers)),\n${indentation}},`,
  )
  .replace(optionType, optionTypeFixed)
  .replace(responseStyle, "")
  .replace(
    spread,
    (_, indentation) => `${indentation}...options,\n${indentation}responseStyle: "data",`,
  );

if (/^\s+\.\.\.options,\n(?!\s+responseStyle: "data",)/m.test(fixed)) {
  throw new Error("Generated SDK contains an operation without a response-style guard.");
}

await writeFile(sdk, fixed);

const utils = new URL("../src/generated/client/utils.gen.ts", import.meta.url);
const utilsSource = await readFile(utils, "utf8");
const headerIterator =
  "const iterator = header instanceof Headers ? headersEntries(header) : Object.entries(header);";

if (!utilsSource.includes(headerIterator)) {
  throw new Error("Generated header merge changed; tuple-array guard was not applied.");
}

await writeFile(
  utils,
  utilsSource.replace(
    headerIterator,
    "const iterator = header instanceof Headers ? headersEntries(header) : Array.isArray(header) ? header : Object.entries(header);",
  ),
);

const types = new URL("../src/generated/types.gen.ts", import.meta.url);
const typesSource = await readFile(types, "utf8");
const clientOptions = /^(export type ClientOptions = \{\n  baseUrl:\n)([\s\S]*?)(;\n\};)$/m;
const match = typesSource.match(clientOptions);

if (!match) {
  throw new Error("Generated ClientOptions shape changed; base URL deduplication was not applied.");
}

const seenBaseUrls = new Set();
const baseUrls = match[2]
  .split("\n")
  .filter((line) => {
    const member = line.trim();
    if (!member.startsWith('| "https://')) return true;
    if (seenBaseUrls.has(member)) return false;
    seenBaseUrls.add(member);
    return true;
  })
  .join("\n");

await writeFile(types, typesSource.replace(clientOptions, `$1${baseUrls}$3`));
