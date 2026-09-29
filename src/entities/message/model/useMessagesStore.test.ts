import { describe, expect, it } from "vitest";
import { useChatStore, type IMessage } from "./useMessagesStore";

function message(overrides: Partial<IMessage> = {}): IMessage {
  return {
    id: "msg-1",
    text: "hello",
    timestamp: 100,
    isOutgoing: false,
    ...overrides,
  };
}

const store = () => useChatStore.getState();

describe("useChatStore", () => {
  it("keeps messages per chat", () => {
    store().addMessage("chat-1", message({ id: "a" }));
    store().addMessage("chat-2", message({ id: "b" }));

    expect(Object.keys(store().messagesByChat)).toEqual(["chat-1", "chat-2"]);
    expect(store().messagesByChat["chat-1"]).toHaveLength(1);
  });

  it("inserts a message in chronological order regardless of arrival", () => {
    store().addMessage("chat-1", message({ id: "late", timestamp: 200 }));
    store().addMessage("chat-1", message({ id: "early", timestamp: 100 }));

    expect(store().messagesByChat["chat-1"].map((m) => m.id)).toEqual([
      "early",
      "late",
    ]);
  });

  it("ignores a message that was already stored", () => {
    store().addMessage("chat-1", message({ id: "dup" }));
    store().addMessage("chat-1", message({ id: "dup", text: "changed" }));

    expect(store().messagesByChat["chat-1"]).toHaveLength(1);
    expect(store().messagesByChat["chat-1"][0].text).toBe("hello");
  });

  it("replaces and sorts the history when a chat is loaded", () => {
    store().addMessage("chat-1", message({ id: "old", timestamp: 5 }));
    store().setMessages("chat-1", [
      message({ id: "b", timestamp: 20 }),
      message({ id: "a", timestamp: 10 }),
    ]);

    expect(store().messagesByChat["chat-1"].map((m) => m.id)).toEqual([
      "a",
      "b",
    ]);
  });

  it("clears a single chat without touching the others", () => {
    store().addMessage("chat-1", message({ id: "a" }));
    store().addMessage("chat-2", message({ id: "b" }));

    store().clearChat("chat-1");

    expect(store().messagesByChat["chat-1"]).toBeUndefined();
    expect(store().messagesByChat["chat-2"]).toHaveLength(1);
  });

  it("tracks the loading and error flags", () => {
    store().setLoading(true);
    expect(store().isLoading).toBe(true);

    store().setError("instance is blocked");
    expect(store().error).toBe("instance is blocked");

    store().setError(null);
    expect(store().error).toBeNull();
  });

  it("resets the history and the flags, but keeps the drafts", () => {
    store().addMessage("chat-1", message());
    store().setError("boom");
    store().setLoading(true);
    store().setDraft("chat-1", "half-written");

    store().reset();

    expect(store()).toMatchObject({
      messagesByChat: {},
      isLoading: false,
      error: null,
    });
    expect(store().drafts["chat-1"]).toBe("half-written");
  });

  it("forgets the drafts only when asked to", () => {
    store().setDraft("chat-1", "half-written");

    store().clearDrafts();

    expect(store().drafts).toEqual({});
  });
});
