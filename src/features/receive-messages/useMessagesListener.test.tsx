import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

vi.mock("@/entities/message", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/entities/message")>();

  return {
    ...actual,
    receiveNotifications: vi.fn(),
    deleteNotification: vi.fn(),
  };
});

import {
  deleteNotification,
  receiveNotifications,
  useChatStore,
} from "@/entities/message";
import { ApiError } from "@/shared/api/errors";
import { useMessagesListener } from "./useMessagesListener";
import { createNotification, withoutMessagePayload } from "@/test/fixtures";
import { useLocalChatsStore } from "@/entities/chat";
import { useToasts } from "@/shared/model/useToasts";

const POLL_INTERVAL = 10_000;
const CHAT_ID = "79001112233";

async function flush() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0);
  });
}

async function wait(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

function setup() {
  vi.useFakeTimers();
  vi.mocked(deleteNotification).mockResolvedValue({ result: true, reason: "" });

  return renderHook(() => useMessagesListener());
}

const messagesOf = (chatId = CHAT_ID) =>
  useChatStore.getState().messagesByChat[chatId];

describe("useMessagesListener", () => {
  it("puts an incoming message into the chat and acknowledges the notification", async () => {
    vi.mocked(receiveNotifications).mockResolvedValueOnce(createNotification());

    setup();
    await flush();

    expect(messagesOf()).toHaveLength(1);
    expect(messagesOf()[0]).toMatchObject({
      id: "msg-1",
      text: "hi from the recipient",
      timestamp: 1712345678,
      isOutgoing: false,
    });
    expect(deleteNotification).toHaveBeenCalledWith(42);
  });

  it("asks again after the interval when the queue is empty", async () => {
    vi.mocked(receiveNotifications).mockResolvedValue(undefined);

    setup();
    await flush();

    expect(receiveNotifications).toHaveBeenCalledTimes(1);
    expect(deleteNotification).not.toHaveBeenCalled();

    await wait(POLL_INTERVAL);

    expect(receiveNotifications).toHaveBeenCalledTimes(2);
  });

  it("picks up the next message on the following poll", async () => {
    vi.mocked(receiveNotifications)
      .mockResolvedValueOnce(createNotification())
      .mockResolvedValueOnce(
        createNotification({
          receiptId: 43,
          idMessage: "msg-2",
          text: "second",
        }),
      );

    setup();
    await flush();
    await wait(POLL_INTERVAL);

    expect(messagesOf().map((message) => message.text)).toEqual([
      "hi from the recipient",
      "second",
    ]);
    expect(deleteNotification).toHaveBeenNthCalledWith(1, 42);
    expect(deleteNotification).toHaveBeenNthCalledWith(2, 43);
  });

  it("acknowledges a service webhook instead of getting stuck on it", async () => {
    vi.mocked(receiveNotifications).mockResolvedValueOnce(
      withoutMessagePayload(
        createNotification({
          typeWebhook: "stateInstanceChanged",
          receiptId: 7,
        }),
      ),
    );

    setup();
    await flush();

    expect(useChatStore.getState().messagesByChat).toEqual({});
    expect(deleteNotification).toHaveBeenCalledWith(7);
  });

  it("penalises a failed request with a longer delay before the next attempt", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    vi.mocked(receiveNotifications)
      .mockRejectedValueOnce(new Error("network down"))
      .mockResolvedValue(undefined);

    setup();
    await flush();

    expect(consoleError).toHaveBeenCalled();
    expect(receiveNotifications).toHaveBeenCalledTimes(1);

    await wait(POLL_INTERVAL);

    expect(receiveNotifications).toHaveBeenCalledTimes(1);

    await wait(POLL_INTERVAL);

    expect(receiveNotifications).toHaveBeenCalledTimes(2);
  });

  it("stops growing the pause at a minute", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.mocked(receiveNotifications).mockRejectedValue(
      new Error("network down"),
    );

    setup();
    await flush();

    for (const pause of [20_000, 40_000, 60_000]) {
      await wait(pause);
    }

    expect(receiveNotifications).toHaveBeenCalledTimes(4);

    await wait(59_000);
    expect(receiveNotifications).toHaveBeenCalledTimes(4);

    await wait(1_000);
    expect(receiveNotifications).toHaveBeenCalledTimes(5);
  });

  it("waits as long as the API asks when it is throttled", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.mocked(receiveNotifications)
      .mockRejectedValueOnce(
        new ApiError("Too Many Requests", { status: 429, retryAfter: 45 }),
      )
      .mockResolvedValue(undefined);

    setup();
    await flush();

    await wait(POLL_INTERVAL * 2);

    expect(receiveNotifications).toHaveBeenCalledTimes(1);

    await wait(45_000 - POLL_INTERVAL * 2);

    expect(receiveNotifications).toHaveBeenCalledTimes(2);
  });

  it("does wait longer than minute if the API asks for more", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.mocked(receiveNotifications)
      .mockRejectedValueOnce(
        new ApiError("Too Many Requests", { status: 429, retryAfter: 600 }),
      )
      .mockResolvedValue(undefined);

    setup();
    await flush();

    await wait(50000);
    expect(receiveNotifications).toHaveBeenCalledTimes(1);

    await wait(550000);
    expect(receiveNotifications).toHaveBeenCalledTimes(2);
  });

  it("stands down for an hour when the instance is no longer authorized", async () => {
    vi.mocked(receiveNotifications).mockResolvedValueOnce(
      createNotification({
        receiptId: 7,
        typeWebhook: "stateInstanceChanged",
        stateInstance: "blocked",
      }),
    );

    setup();
    await flush();

    expect(deleteNotification).toHaveBeenCalledWith(7);
    expect(useToasts.getState().toasts.map((toast) => toast.text)).toEqual([
      expect.stringMatching(/blocked/),
    ]);
    expect(useChatStore.getState().messagesByChat).toEqual({});

    await wait(59 * 60 * 1000);
    expect(receiveNotifications).toHaveBeenCalledTimes(1);

    vi.mocked(receiveNotifications).mockResolvedValue(undefined);
    await wait(60 * 1000);

    expect(receiveNotifications).toHaveBeenCalledTimes(2);
  });

  it("keeps polling when the instance reports itself authorized", async () => {
    vi.mocked(receiveNotifications).mockResolvedValueOnce(
      createNotification({
        receiptId: 8,
        typeWebhook: "stateInstanceChanged",
        stateInstance: "authorized",
      }),
    );

    setup();
    await flush();

    expect(deleteNotification).toHaveBeenCalledWith(8);
    expect(useToasts.getState().toasts).toEqual([]);

    await wait(POLL_INTERVAL);

    expect(receiveNotifications).toHaveBeenCalledTimes(2);
  });

  it("stops asking after unmount", async () => {
    vi.mocked(receiveNotifications).mockResolvedValue(undefined);

    const { unmount } = setup();
    await flush();

    expect(receiveNotifications).toHaveBeenCalledTimes(1);

    unmount();
    await wait(POLL_INTERVAL * 3);

    expect(receiveNotifications).toHaveBeenCalledTimes(1);
  });

  it("registers a chat whose contact wrote first", async () => {
    vi.mocked(receiveNotifications).mockResolvedValueOnce(
      createNotification({ chatId: "79334445566" }),
    );

    setup();
    await flush();

    expect(useLocalChatsStore.getState().chats).toEqual([
      expect.objectContaining({
        chatId: "79334445566",
        name: "User1",
        type: "user",
      }),
    ]);
    expect(messagesOf("79334445566")).toHaveLength(1);
  });

  it("ignores a non-text message but still acknowledges it", async () => {
    vi.mocked(receiveNotifications).mockResolvedValueOnce(
      createNotification({ receiptId: 9, typeMessage: "imageMessage" }),
    );

    setup();
    await flush();

    expect(useChatStore.getState().messagesByChat).toEqual({});
    expect(useLocalChatsStore.getState().chats).toEqual([]);
    expect(deleteNotification).toHaveBeenCalledWith(9);
  });

  it("lets the session expiry speak for a refused token", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    vi.mocked(receiveNotifications).mockRejectedValue(
      new ApiError("Unauthorized", { status: 401 }),
    );

    setup();
    await flush();

    expect(
      useToasts
        .getState()
        .toasts.filter((toast) => /Connection to API lost/.test(toast.text)),
    ).toEqual([]);
    expect(consoleError).toHaveBeenCalled();
  });

  it("tells the user once that the connection is lost, and again after it drops anew", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    vi.mocked(receiveNotifications).mockRejectedValue(
      new Error("network down"),
    );

    setup();
    await flush();

    expect(useToasts.getState().toasts).toHaveLength(1);
    expect(useToasts.getState().toasts[0].text).toMatch(
      /Connection to API lost/,
    );
    expect(consoleError).toHaveBeenCalled();

    await wait(POLL_INTERVAL * 4);
    expect(useToasts.getState().toasts).toHaveLength(1);

    vi.mocked(receiveNotifications).mockResolvedValue(undefined);
    await wait(POLL_INTERVAL * 8);

    vi.mocked(receiveNotifications).mockRejectedValue(
      new Error("network down"),
    );
    await wait(POLL_INTERVAL * 2);

    expect(useToasts.getState().toasts).toHaveLength(2);
  });
});
