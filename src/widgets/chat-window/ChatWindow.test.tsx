import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/mocks/node";
import ChatWindow from "./ChatWindow";
import { useChatStore } from "@/entities/message";
import { authedAsTestInstance, greenApiUrl } from "@/test/api";
import { renderWithProviders } from "@/test/render";

const CHAT_ID = "79001112233";

function mockSendMessage(response: () => Response) {
  const handler = vi.fn(response);
  server.use(http.post(greenApiUrl("sendMessage"), handler));
  authedAsTestInstance();

  return handler;
}

function setup() {
  const view = renderWithProviders(<ChatWindow id={CHAT_ID} />);
  const form = view.container.querySelector("form") as HTMLFormElement;

  return { form, ...view };
}

function type(text: string) {
  fireEvent.change(screen.getByPlaceholderText("Message..."), {
    target: { value: text },
  });
}

const stored = () => useChatStore.getState().messagesByChat[CHAT_ID];

describe("ChatWindow", () => {
  it("shows the message while the API is still working and keeps it afterwards", async () => {
    let release: (idMessage: string) => void = () => {};
    const pendingResponse = new Promise<string>((resolve) => {
      release = resolve;
    });
    const sent: unknown[] = [];
    server.use(
      http.post(greenApiUrl("sendMessage"), async ({ request }) => {
        sent.push(await request.json());
        return HttpResponse.json({ idMessage: await pendingResponse });
      }),
    );
    authedAsTestInstance();
    setup();

    type("  hello  ");
    fireEvent.click(screen.getByRole("button"));

    expect(await screen.findByText("hello")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
    expect(stored()).toBeUndefined();

    release("api-1");

    await waitFor(() => expect(stored()).toHaveLength(1));
    expect(stored()[0]).toMatchObject({
      id: "api-1",
      text: "hello",
      isOutgoing: true,
    });
    await waitFor(() =>
      expect(screen.getAllByRole("listitem")).toHaveLength(1),
    );
    expect(screen.getByRole("listitem")).toHaveTextContent("hello");
    expect(sent).toEqual([{ chatId: CHAT_ID, message: "hello" }]);
  });

  it("rolls the message back and explains why when sending fails", async () => {
    mockSendMessage(() =>
      HttpResponse.json({ message: "instance is blocked" }, { status: 403 }),
    );
    setup();

    type("hello");
    fireEvent.click(screen.getByRole("button"));

    expect(await screen.findByText("instance is blocked")).toBeInTheDocument();
    expect(screen.queryByText("hello")).toBeNull();
    expect(stored()).toBeUndefined();
  });

  it("frees the composer once the message is on its way", async () => {
    mockSendMessage(() => HttpResponse.json({ idMessage: "api-1" }));
    setup();

    type("hello");
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => expect(stored()).toHaveLength(1));
    expect(useChatStore.getState().drafts[CHAT_ID]).toBe("");
    expect(screen.getByPlaceholderText("Message...")).toHaveValue("");
  });

  it("keeps the draft when the message could not be sent", async () => {
    mockSendMessage(() =>
      HttpResponse.json({ message: "Send failed" }, { status: 500 }),
    );
    setup();

    type("hello");
    fireEvent.click(screen.getByRole("button"));

    expect(await screen.findByText("Send failed")).toBeInTheDocument();
    expect(useChatStore.getState().drafts[CHAT_ID]).toBe("hello");
    expect(screen.getByPlaceholderText("Message...")).toHaveValue("hello");
    expect(stored()).toBeUndefined();
  });

  it("does not call the API for a message made of blanks", async () => {
    const handler = mockSendMessage(() =>
      HttpResponse.json({ idMessage: "api-1" }),
    );
    setup();

    type("   ");
    fireEvent.click(screen.getByRole("button"));

    expect(await screen.findByText("Message is empty")).toBeInTheDocument();
    expect(handler).not.toHaveBeenCalled();
    expect(stored()).toBeUndefined();
  });

  it("renders the messages that are already in the store", () => {
    authedAsTestInstance();
    useChatStore.getState().addMessage(CHAT_ID, {
      id: "old-1",
      text: "earlier message",
      timestamp: 1712345678,
      isOutgoing: false,
    });

    setup();

    expect(screen.getByText("earlier message")).toBeInTheDocument();
  });

  describe("scrolling to the latest message", () => {
    function stubScrollMetrics(scrollHeight = 1200, clientHeight = 300) {
      vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(
        scrollHeight,
      );
      vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(
        clientHeight,
      );
    }

    const messageList = () =>
      screen.getAllByRole("listitem")[0].parentElement as HTMLDivElement;

    function storeMessage(id: string, text: string, timestamp: number) {
      useChatStore.getState().addMessage(CHAT_ID, {
        id,
        text,
        timestamp,
        isOutgoing: false,
      });
    }

    it("opens the chat at its latest message", () => {
      authedAsTestInstance();
      stubScrollMetrics();
      storeMessage("old-1", "earlier message", 1712345678);
      storeMessage("old-2", "latest message", 1712345679);

      setup();

      expect(messageList().scrollTop).toBe(1200);
    });

    it("follows an incoming message while the user is at the bottom", () => {
      authedAsTestInstance();
      stubScrollMetrics();
      storeMessage("old-1", "earlier message", 1712345678);
      setup();

      stubScrollMetrics(1500);
      act(() => storeMessage("new-1", "just arrived", 1712345680));

      expect(screen.getByText("just arrived")).toBeInTheDocument();
      expect(messageList().scrollTop).toBe(1500);
    });

    it("keeps the position when the user is reading history above", () => {
      authedAsTestInstance();
      stubScrollMetrics();
      storeMessage("old-1", "earlier message", 1712345678);
      setup();

      const list = messageList();
      list.scrollTop = 0;
      fireEvent.scroll(list);

      stubScrollMetrics(1500);
      act(() => storeMessage("new-1", "just arrived", 1712345680));

      expect(screen.getByText("just arrived")).toBeInTheDocument();
      expect(messageList().scrollTop).toBe(0);
    });
  });
});
