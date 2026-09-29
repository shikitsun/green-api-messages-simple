import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppProviders } from "@/app/providers";
import { queryClient } from "@/app/providers/queryClient";
import { useActiveChatStore, useLocalChatsStore } from "@/entities/chat";
import { useInstanceStore } from "@/entities/instance";
import { useChatStore } from "@/entities/message";
import { TEST_CREDENTIALS, authedAsTestInstance } from "@/test/api";

function setup() {
  return render(
    <AppProviders>
      <p>app</p>
    </AppProviders>,
  );
}

const store = () => useChatStore.getState();

describe("session teardown", () => {
  it("leaves nothing of the previous instance behind", () => {
    authedAsTestInstance();
    store().addMessage("79001112233", {
      id: "m1",
      text: "hi",
      timestamp: 1,
      isOutgoing: false,
    });
    useLocalChatsStore.getState().add({
      chatId: "79001112233",
      name: "User1",
      type: "user",
      phoneNumber: 79001112233,
    });
    useActiveChatStore.getState().set("79001112233");
    queryClient.setQueryData(["api", "chats"], [{ chatId: "79001112233" }]);

    setup();
    act(() => useInstanceStore.getState().clearCredentials());

    expect(useChatStore.getState().messagesByChat).toEqual({});
    expect(screen.queryByText("hi")).toBeNull();
    expect(useLocalChatsStore.getState().chats).toEqual([]);
    expect(useActiveChatStore.getState().active).toBeNull();
    expect(queryClient.getQueryData(["api", "chats"])).toBeUndefined();
  });

  it("keeps the draft the user was typing", () => {
    authedAsTestInstance();
    store().setDraft("79001112233", "half-written");

    setup();
    act(() => useInstanceStore.getState().clearCredentials());

    expect(useChatStore.getState().drafts["79001112233"]).toBe("half-written");
  });

  it("does not touch anything when there was no session to end", () => {
    store().addMessage("79001112233", {
      id: "m1",
      text: "stored while signed out",
      timestamp: 1,
      isOutgoing: false,
    });

    setup();

    expect(useChatStore.getState().messagesByChat["79001112233"]).toHaveLength(1);
    expect(useInstanceStore.getState().idInstance).toBeNull();
  });

  it("survives a login that follows a teardown", () => {
    authedAsTestInstance();
    setup();

    act(() => useInstanceStore.getState().clearCredentials());
    act(() =>
      useInstanceStore.getState().setCredentials({ ...TEST_CREDENTIALS }),
    );

    expect(useInstanceStore.getState().idInstance).toBe(
      TEST_CREDENTIALS.idInstance,
    );
  });
});
