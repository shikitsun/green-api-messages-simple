import { describe, expect, it } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/mocks/node";
import ChatPage from "./ChatPage";
import { useActiveChatStore } from "@/entities/chat";
import { authedAsTestInstance, greenApiUrl } from "@/test/api";
import { renderWithProviders } from "@/test/render";

const CHAT = {
  chatId: "79001112233",
  name: "User1",
  type: "user",
  phoneNumber: 79001112233,
};

describe("ChatPage", () => {
  function mockChatScreen(chats: unknown[] = [CHAT]) {
    server.use(
      http.get(greenApiUrl("getChats"), () => HttpResponse.json(chats)),
      http.get(greenApiUrl("receiveNotification"), () =>
        HttpResponse.json(null, { status: 204 }),
      ),
    );
    authedAsTestInstance();
  }

  it("keeps the conversation closed until a chat is picked", async () => {
    mockChatScreen();

    renderWithProviders(<ChatPage />);

    expect(await screen.findByText("User1")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Message...")).toBeNull();
    expect(screen.queryByRole("button", { name: "Back to chats" })).toBeNull();
  });

  it("opens the picked chat as a screen of its own, named in its header", async () => {
    mockChatScreen();

    const { container } = renderWithProviders(<ChatPage />);

    fireEvent.click(await screen.findByText("User1"));

    expect(
      await screen.findByPlaceholderText("Message..."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Back to chats" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "User1" })).toBeInTheDocument();
    expect(
      container.querySelector('aside[data-chat-open="true"]'),
    ).not.toBeNull();
  });

  it("returns to the chat list when the conversation is closed", async () => {
    mockChatScreen();

    renderWithProviders(<ChatPage />);

    fireEvent.click(await screen.findByText("User1"));
    fireEvent.click(
      await screen.findByRole("button", { name: "Back to chats" }),
    );

    await waitFor(() =>
      expect(screen.queryByPlaceholderText("Message...")).toBeNull(),
    );
    expect(screen.getByRole("heading", { name: "Chats" })).toBeInTheDocument();
  });

  it("names a conversation the list does not know by its id", async () => {
    mockChatScreen([]);
    useActiveChatStore.getState().set("79999999999");

    renderWithProviders(<ChatPage />);

    expect(
      await screen.findByRole("heading", { name: "79999999999" }),
    ).toBeInTheDocument();
  });
});
