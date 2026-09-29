import { describe, expect, it } from "vitest";
import { waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/mocks/node";
import { useChats } from "./useChats";
import { useLocalChatsStore } from "./useLocalChatsStore";
import type { IChat } from "./chat";
import { authedAsTestInstance, greenApiUrl } from "@/test/api";
import { renderHookWithProviders } from "@/test/render";

function localChat(chatId: string): IChat {
  return { chatId, name: chatId, type: "user", phoneNumber: Number(chatId) };
}

const SERVER_CHATS: IChat[] = [
  { chatId: "79001112233", name: "User1", type: "user", phoneNumber: 79001112233 },
  { chatId: "79112223344", name: "Group1", type: "group", phoneNumber: 79112223344 },
];

describe("useChats", () => {
  it("returns the chats reported by the API", async () => {
    authedAsTestInstance();
    server.use(
      http.get(greenApiUrl("getChats"), () => HttpResponse.json(SERVER_CHATS)),
    );

    const { result } = renderHookWithProviders(() => useChats());

    await waitFor(() => expect(result.current.data).toHaveLength(2));
    expect(result.current.data[0]).toMatchObject({ chatId: "79001112233" });
    expect(result.current.isLoading).toBe(false);
  });

  it("puts a locally created chat in front of the API chats", async () => {
    authedAsTestInstance();
    server.use(
      http.get(greenApiUrl("getChats"), () => HttpResponse.json(SERVER_CHATS)),
    );
    useLocalChatsStore.getState().add(localChat("79334445566"));

    const { result } = renderHookWithProviders(() => useChats());

    await waitFor(() => expect(result.current.data).toHaveLength(3));
    expect(result.current.data.map((chat) => chat.chatId)).toEqual([
      "79334445566",
      "79001112233",
      "79112223344",
    ]);
  });

  it("reports loading only while the list is empty", async () => {
    authedAsTestInstance();
    let release: (chats: IChat[]) => void = () => {};
    const pendingResponse = new Promise<IChat[]>((resolve) => {
      release = resolve;
    });
    server.use(
      http.get(greenApiUrl("getChats"), async () =>
        HttpResponse.json(await pendingResponse),
      ),
    );

    const empty = renderHookWithProviders(() => useChats());
    expect(empty.result.current.isLoading).toBe(true);
    expect(empty.result.current.data).toEqual([]);

    useLocalChatsStore.getState().add(localChat("79334445566"));
    const withPendingChat = renderHookWithProviders(() => useChats());
    expect(withPendingChat.result.current.isLoading).toBe(false);
    expect(withPendingChat.result.current.data).toHaveLength(1);

    release(SERVER_CHATS);
    await waitFor(() =>
      expect(withPendingChat.result.current.data).toHaveLength(3),
    );
  });

  it("reports a chat once, even when the API knows it too", async () => {
    authedAsTestInstance();
    server.use(
      http.get(greenApiUrl("getChats"), () => HttpResponse.json(SERVER_CHATS)),
    );
    useLocalChatsStore.getState().add(localChat("79001112233"));

    const { result } = renderHookWithProviders(() => useChats());

    await waitFor(() => expect(result.current.data).toHaveLength(2));
    // the API is authoritative for the chats it reports
    expect(result.current.data[0]).toMatchObject({ name: "User1" });
  });
});
