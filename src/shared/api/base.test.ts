import { describe, expect, it, vi } from "vitest";
import { apiRequest } from "./base";
import {
  API_BASE,
  TEST_CREDENTIALS,
  authedAsTestInstance,
  greenApiUrl,
} from "@/test/api";

function stubFetch(response: Response) {
  const fetchMock = vi.fn(async () => response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function jsonResponse(body: unknown, init?: ResponseInit) {
  return Response.json(body, init);
}

describe("apiRequest", () => {
  it("uses the Green-API base url configured for the environment", () => {
    expect(API_BASE).toBe("https://api.green-api.test");
  });

  it("builds the waInstance url and sends JSON headers", async () => {
    authedAsTestInstance();
    const fetchMock = stubFetch(jsonResponse([{ chatId: "1" }]));

    await apiRequest("getChats");

    const [url, options] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];

    expect(url).toBe(greenApiUrl("getChats"));
    expect(url).toBe(
      `https://api.green-api.test/waInstance${TEST_CREDENTIALS.idInstance}/getChats/${TEST_CREDENTIALS.apiTokenInstance}`,
    );
    expect(new Headers(options.headers).get("Content-Type")).toBe(
      "application/json",
    );
  });

  it("keeps the sub-path of an endpoint after the api token", async () => {
    authedAsTestInstance();
    const fetchMock = stubFetch(jsonResponse({ result: true }));

    await apiRequest("deleteNotification/1234", { method: "DELETE" });

    const [url, options] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];

    expect(url).toBe(greenApiUrl("deleteNotification/1234"));
    expect(url.endsWith(`/${TEST_CREDENTIALS.apiTokenInstance}/1234`)).toBe(
      true,
    );
    expect(options.method).toBe("DELETE");
  });

  it("returns the parsed json body", async () => {
    authedAsTestInstance();
    stubFetch(jsonResponse({ idMessage: "abc" }));

    await expect(apiRequest<{ idMessage: string }>("sendMessage")).resolves.toEqual(
      { idMessage: "abc" },
    );
  });

  it("refuses to call the API without credentials", async () => {
    const fetchMock = stubFetch(jsonResponse({}));

    await expect(apiRequest("getChats")).rejects.toThrow(/Not authenticated/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("throws the message reported by the API", async () => {
    authedAsTestInstance();
    stubFetch(jsonResponse({ message: "instance is blocked" }, { status: 401 }));

    await expect(apiRequest("getChats")).rejects.toThrow("instance is blocked");
  });

  it("falls back to the http status when the error body is not json", async () => {
    authedAsTestInstance();
    stubFetch(new Response("", { status: 500, statusText: "Server Error" }));

    await expect(apiRequest("getChats")).rejects.toThrow(/API error: 500/);
  });

  it("throws when the base url is not configured", async () => {
    vi.resetModules();
    vi.stubEnv("VITE_GREEN_API_BASE", "");

    const { apiRequest: apiRequestWithoutBase } = await import("./base");

    await expect(apiRequestWithoutBase("getChats")).rejects.toThrow(
      /VITE_GREEN_API_BASE/,
    );
  });
});
