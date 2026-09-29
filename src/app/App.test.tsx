import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/mocks/node";
import App from "./App";
import { authedAsTestInstance, greenApiUrl } from "@/test/api";
import { renderWithProviders } from "@/test/render";

const CHATS = [
  {
    chatId: "79001112233",
    name: "User1",
    type: "user",
    phoneNumber: 79001112233,
  },
];

function renderApp(route: string) {
  return renderWithProviders(<App />, { route });
}

/** The chat screen polls for messages, so the empty queue has to answer. */
function mockChatScreen() {
  server.use(
    http.get(greenApiUrl("getChats"), () => HttpResponse.json(CHATS)),
    http.get(greenApiUrl("receiveNotification"), () =>
      HttpResponse.json(null, { status: 204 }),
    ),
  );
}

describe("App", () => {
  it("asks for Green-API credentials on the index route", async () => {
    renderApp("/");

    expect(
      await screen.findByPlaceholderText("idInstance"),
    ).toBeInTheDocument();
  });

  it("does not let an unauthenticated visitor open the chat route", async () => {
    renderApp("/chat");

    expect(
      await screen.findByPlaceholderText("apiTokenInstance"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Chats" })).toBeNull();
  });

  it("opens the chat screen once an instance is authenticated", async () => {
    authedAsTestInstance();
    mockChatScreen();

    renderApp("/");

    expect(
      await screen.findByRole("heading", { name: "Chats" }),
    ).toBeInTheDocument();
    expect(await screen.findByText("User1")).toBeInTheDocument();
  });
});
