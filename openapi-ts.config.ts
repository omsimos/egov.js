import { defineConfig } from "@hey-api/openapi-ts";

const operationPrefixes = [
  "egovAi",
  "egovChain",
  "egovCompass",
  "egovFaceLiveness",
  "egovPay",
  "egovSso",
  "eMessage",
  "eReport",
  "eVerify",
];

const serviceNames: Record<string, string> = {
  Compass: "compass",
  "Face Liveness": "faceLiveness",
  "eGov AI": "egovAi",
  "eGov SSO": "egovSso",
  eGovChain: "egovChain",
  eGovPay: "egovPay",
  eMessage: "eMessage",
  eReport: "eReport",
  eVerify: "eVerify",
};

export default defineConfig({
  input: "./openapi.json",
  output: {
    clean: true,
    entryFile: false,
    module: {
      extension: ".js",
    },
    path: "./src/generated",
    postProcess: ["oxfmt"],
    tsConfigPath: "./tsconfig.json",
  },
  parser: {
    validate_EXPERIMENTAL: "strict",
  },
  plugins: [
    {
      enums: false,
      name: "@hey-api/typescript",
    },
    {
      baseUrl: false,
      bundle: true,
      name: "@hey-api/client-fetch",
    },
    {
      auth: true,
      client: false,
      name: "@hey-api/sdk",
      operations: {
        containerName: {
          casing: "preserve",
          name: (name) => serviceNames[name] ?? name,
        },
        methodName: {
          casing: "camelCase",
          name: (name) => {
            for (const prefix of operationPrefixes) {
              if (name.startsWith(prefix)) return name.slice(prefix.length);
            }

            return name;
          },
        },
        methods: "static",
        nesting: "operationId",
        strategy: "byTags",
      },
      paramsStructure: "grouped",
      responseStyle: "data",
      transformer: false,
      validator: false,
    },
  ],
});
