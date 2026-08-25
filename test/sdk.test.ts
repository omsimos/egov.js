import { describe, expect, test } from "vitest";

import {
  compass,
  createClient,
  egovAi,
  egovChain,
  egovPay,
  egovSso,
  eMessage,
  eReport,
  eVerify,
  faceLiveness,
} from "../src/index.js";

function assertResponseStyleIsFixed(options: Parameters<typeof egovAi.generateAssistant>[0]) {
  // @ts-expect-error Generated operations always return response data directly.
  options.responseStyle = "fields";
}

void assertResponseStyleIsFixed;

describe("generated SDK", () => {
  test("groups every operation into a service namespace", () => {
    const services = {
      compass,
      egovAi,
      egovChain,
      egovPay,
      egovSso,
      eMessage,
      eReport,
      eVerify,
      faceLiveness,
    };
    const operationCount = Object.values(services).reduce(
      (count, service) =>
        count +
        Object.getOwnPropertyNames(service).filter(
          (property) => !["length", "name", "prototype"].includes(property),
        ).length,
      0,
    );

    expect(Object.keys(services)).toHaveLength(9);
    expect(operationCount).toBe(39);
  });

  test("serializes a bearer-authenticated JSON operation", async () => {
    let request: Request | undefined;
    const client = createClient({
      baseUrl: "https://ai.example.test",
      fetch: async (input, init) => {
        request = new Request(input, init);
        return Response.json({ data: "Answer", session_id: "session-1" });
      },
    });

    const response = await egovAi.generateAssistant({
      auth: "access-token",
      body: { category: "general", prompt: "Hello" },
      client,
      headers: new Headers({ "x-request-id": "request-1" }),
      responseStyle: "fields",
      throwOnError: true,
    } as unknown as Parameters<typeof egovAi.generateAssistant>[0]);

    expect(response).toEqual({ data: "Answer", session_id: "session-1" });
    expect(request?.url).toBe(
      "https://ai.example.test/api/v1/egov/integration/ai_assistant/generate",
    );
    expect(request?.headers.get("authorization")).toBe("Bearer access-token");
    expect(request?.headers.get("x-request-id")).toBe("request-1");
    expect(await request?.json()).toEqual({ category: "general", prompt: "Hello" });
  });

  test("serializes API-key auth and grouped query parameters", async () => {
    let request: Request | undefined;
    const client = createClient({
      baseUrl: "https://compass.example.test",
      headers: [["x-client-kind", "tuple"]],
      fetch: async (input, init) => {
        request = new Request(input, init);
        return Response.json({ items: [], limit: 10, page: 1, total: 0 });
      },
    });

    await compass.getSaaodbRecords({
      auth: "api-key",
      client,
      query: { limit: 10, page: 1, period: "FY", reportYear: 2026 },
      throwOnError: true,
    });

    expect(request?.url).toBe(
      "https://compass.example.test/api/v1/records/saaodb?limit=10&page=1&period=FY&reportYear=2026",
    );
    expect(request?.headers.get("x-api-key")).toBe("api-key");
    expect(request?.headers.get("x-client-kind")).toBe("tuple");
  });

  test("throws parsed provider errors when requested", async () => {
    const client = createClient({
      baseUrl: "https://message.example.test",
      fetch: async () => Response.json({ message: "Invalid number" }, { status: 422 }),
    });

    await expect(
      eMessage.sendSms({
        auth: "message-token",
        body: { message: "Hello", number: "invalid" },
        client,
        throwOnError: true,
      }),
    ).rejects.toEqual({ message: "Invalid number" });
  });

  test("lets Fetch set the multipart boundary", async () => {
    let request: Request | undefined;
    const client = createClient({
      baseUrl: "https://ai.example.test",
      fetch: async (input, init) => {
        request = new Request(input, init);
        return Response.json({ data: "Extracted" });
      },
    });

    await egovAi.extractDocument({
      auth: "access-token",
      body: { file: new Blob(["document"]) },
      client,
      headers: new Headers({ "x-request-id": "upload-1" }),
      throwOnError: true,
    });

    expect(request?.headers.get("content-type")).toMatch(/^multipart\/form-data; boundary=/);
    expect(request?.headers.get("x-request-id")).toBe("upload-1");
  });
});
