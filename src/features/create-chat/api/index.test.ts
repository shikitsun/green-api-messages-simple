import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/mocks/node";
import { createChat } from "./index";
import { authedAsTestInstance, greenApiUrl } from "@/test/api";

describe("createChat", () => {
  it("returns the chatId of a phone number that has an account", async () => {
    authedAsTestInstance();
    server.use(
      http.post(greenApiUrl("checkAccount"), () =>
        HttpResponse.json({ exist: true, chatId: "79001112233" }),
      ),
    );

    await expect(createChat(79001112233)).resolves.toEqual({
      payload: "79001112233",
    });
  });

  it("explains that the phone number has no account", async () => {
    authedAsTestInstance();
    server.use(
      http.post(greenApiUrl("checkAccount"), () =>
        HttpResponse.json({ exist: false, chatId: null }),
      ),
    );

    await expect(createChat(79001112233)).resolves.toEqual({
      error: "No account for given user",
    });
  });

  it("reports the reason of a failed request", async () => {
    authedAsTestInstance();
    server.use(
      http.post(greenApiUrl("checkAccount"), () =>
        HttpResponse.json({ message: "instance is blocked" }, { status: 401 }),
      ),
    );

    await expect(createChat(79001112233)).resolves.toEqual({
      error: "instance is blocked",
    });
  });

  it("reports an unauthenticated instance", async () => {
    await expect(createChat(79001112233)).resolves.toEqual({
      error: "Not authenticated: missing API credentials",
    });
  });
});
