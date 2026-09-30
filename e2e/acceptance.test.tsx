import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { StrictMode } from "react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import App from "@/app/App";
import { AppProviders } from "@/app/providers";

const EXISTING_NUMBER = "79334445566";
const MESSAGE = "hello from";

function mountApp() {
  return render(
    <StrictMode>
      <AppProviders>
        <App />
      </AppProviders>
    </StrictMode>,
  );
}

function chatRows() {
  const sidebar = screen.getByRole("complementary");

  return within(sidebar)
    .getAllByRole("button")
    .filter((button) => !button.closest("header"));
}

function openChatList() {
  const back = screen.queryByRole("button", { name: "Back to chats" });
  if (back) fireEvent.click(back);
  return chatRows();
}

async function signIn() {
  fireEvent.change(await screen.findByPlaceholderText("idInstance"), {
    target: { value: "test" },
  });
  fireEvent.change(screen.getByPlaceholderText("apiTokenInstance"), {
    target: { value: "mock-token" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
}

function injectIncomingMessages(count: number) {
  return fetch(`${import.meta.env.VITE_GREEN_API_BASE}/injectRandomMessages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ count }),
  });
}

const bubbles = () =>
  [...document.querySelectorAll('[role="listitem"]')].map((node) => ({
    text: node.querySelector("p")?.textContent ?? "",
    outgoing: node.hasAttribute("data-is-outgoing"),
  }));

describe("acceptance run", () => {
  beforeEach(() => window.history.replaceState({}, "", "/"));
  beforeAll(() => import("@/widgets/chat-window/ChatWindow"));

  it("signs in with the instance credentials and lands on the chat list", async () => {
    mountApp();

    await signIn();

    await waitFor(() => expect(screen.getByText("Chats")).toBeInTheDocument());
    await waitFor(() => expect(chatRows()).toHaveLength(3));
  });

  it("opens a chat by phone number and sends a text message into it", async () => {
    mountApp();
    await signIn();

    await waitFor(() => expect(chatRows()).toHaveLength(3));
    fireEvent.click(screen.getByRole("button", { name: "Find chat" }));

    const phoneField = await screen.findByPlaceholderText("1234567890");
    fireEvent.change(phoneField, { target: { value: EXISTING_NUMBER } });
    fireEvent.click(screen.getByRole("button", { name: "Find" }));

    await waitFor(() => expect(chatRows()).toHaveLength(4));

    const composer = await screen.findByPlaceholderText("Message...");
    fireEvent.change(composer, { target: { value: MESSAGE } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() =>
      expect(bubbles()).toEqual([
        expect.objectContaining({ text: MESSAGE, outgoing: true }),
      ]),
    );
  });

  it("shows the reply of the recipient in the open chat", async () => {
    mountApp();
    await signIn();
    await waitFor(() => expect(chatRows()).toHaveLength(3));
    await injectIncomingMessages(3);

    // the chat that received the delivery has the newest message, so it leads the list -
    // the open chat is picked once, and waiting happens without touching the DOM: firing
    // events inside waitFor deadlocks the browser run
    fireEvent.click(openChatList()[0]);

    await waitFor(
      () =>
        expect(
          bubbles().some(
            (bubble) =>
              !bubble.outgoing && /Random message from/.test(bubble.text),
          ),
        ).toBe(true),
      { timeout: 60_000, interval: 1_000 },
    );
  });
});
