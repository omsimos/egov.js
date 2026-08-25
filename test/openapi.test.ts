import { readFile } from "node:fs/promises";

import { describe, expect, test } from "vitest";

const methods = ["delete", "get", "patch", "post", "put"] as const;

interface OpenApiOperation {
  operationId?: string;
  servers?: OpenApiServer[];
  tags?: string[];
}

interface OpenApiPathItem extends Partial<Record<(typeof methods)[number], OpenApiOperation>> {
  servers?: OpenApiServer[];
}

interface OpenApiServer {
  url: string;
}

interface OpenApiDocument {
  components?: {
    schemas?: Record<string, unknown>;
    securitySchemes?: Record<string, unknown>;
  };
  openapi: string;
  paths: Record<string, OpenApiPathItem>;
  tags?: Array<{ name: string }>;
}

const providerServers: Record<string, string> = {
  Compass: "https://platforms-api.e.gov.ph/compass",
  "Face Liveness": "https://platforms-api.e.gov.ph/face-liveness",
  "eGov AI": "https://platforms-api.e.gov.ph/egov-ai",
  "eGov SSO": "https://hackathon-sso.e.gov.ph",
  eGovChain: "https://platforms-api.e.gov.ph/egovchain",
  eGovPay: "https://platforms-api.e.gov.ph/egovpay",
  eMessage: "https://platforms-api.e.gov.ph/emessage",
  eReport: "https://platforms-api.e.gov.ph/ereport",
  eVerify: "https://platforms-api.e.gov.ph/everify",
};

async function readOpenApi(): Promise<OpenApiDocument> {
  return JSON.parse(await readFile(new URL("../openapi.json", import.meta.url), "utf8"));
}

describe("openapi.json", () => {
  test("contains the complete unique operation catalog", async () => {
    const document = await readOpenApi();
    const operations = Object.values(document.paths).flatMap((path) =>
      methods.flatMap((method) => (path[method] ? [path[method]] : [])),
    );
    const operationIds = operations.map((operation) => operation.operationId);

    expect(document.openapi).toBe("3.1.1");
    expect(operations).toHaveLength(39);
    expect(operationIds.every(Boolean)).toBe(true);
    expect(new Set(operationIds).size).toBe(39);
  });

  test("publishes reusable schemas, tags, and security schemes", async () => {
    const document = await readOpenApi();

    expect(Object.keys(document.components?.schemas ?? {})).toHaveLength(73);
    expect(Object.keys(document.components?.securitySchemes ?? {})).toHaveLength(5);
    expect(document.tags).toHaveLength(9);
  });

  test("declares the documented provider server for every operation", async () => {
    const document = await readOpenApi();

    for (const path of Object.values(document.paths)) {
      for (const method of methods) {
        const operation = path[method];
        if (!operation) continue;

        expect(operation.tags).toHaveLength(1);
        const tag = operation.tags?.[0];
        expect(tag).toBeDefined();
        expect((operation.servers ?? path.servers)?.map((server) => server.url)).toEqual([
          providerServers[tag!],
        ]);
      }
    }
  });
});
