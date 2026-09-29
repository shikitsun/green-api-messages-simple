import { act, fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/mocks/node";
import ChatList from "./ChatList";
import { useChatStore } from "@/entities/message";
import { useLocalChatsStore, type IChat } from "@/entities/chat";
import { authedAsTestInstance, greenApiUrl } from "@/test/api";
import { renderWithProviders } from "@/test/render";

const SERVER_CHATS: IChat[] = [
  {
    chatId: "79001112233",
    name: "User1",
    type: "user",
    phoneNumber: 79001112233,
  },
  {
    chatId: "79112223344",
    name: "User2",
    type: "user",
    phoneNumber: 79112223344,
  },
  {
    chatId: "79223334455",
    name: "Group1",
    type: "group",
    phoneNumber: 79223334455,
  },
];

function sidebarNames(container: HTMLElement) {
  return [...container.querySelectorAll("button[aria-selected]")].map(
    (preview) => preview.querySelector("span[title]")?.textContent,
  );
}

function message(id: string, timestamp: number) {
  return { id, text: "hi", timestamp, isOutgoing: false };
}

function setup() {
  authedAsTestInstance();
  server.use(
    http.get(greenApiUrl("getChats"), () => HttpResponse.json(SERVER_CHATS)),
  );

  return renderWithProviders(<ChatList />);
}

describe("ChatList", () => {
  it("lists the chats of the instance", async () => {
    const { container } = setup();

    await screen.findByText("User1");

    expect(sidebarNames(container)).toEqual(["User1", "User2", "Group1"]);
  });

  it("puts the conversation with the newest message on top", async () => {
    const { container } = setup();
    await screen.findByText("User1");

    act(() => {
      useChatStore.getState().addMessage("79112223344", message("m1", 200));
    });

    expect(sidebarNames(container)).toEqual(["User2", "User1", "Group1"]);
  });

  it("shows a chat whose contact wrote first", async () => {
    useLocalChatsStore.getState().add({
      chatId: "79334445566",
      name: "Alexey",
      type: "user",
      phoneNumber: 79334445566,
    });
    useChatStore.getState().addMessage("79334445566", message("m2", 300));

    const { container } = setup();
    await screen.findByText("User1");

    expect(sidebarNames(container)).toEqual([
      "Alexey",
      "User1",
      "User2",
      "Group1",
    ]);
  });

  it("opens a chat when it is selected", async () => {
    const { container } = setup();
    await screen.findByText("User2");

    fireEvent.click(screen.getByText("User2"));

    expect(
      container.querySelector('button[aria-selected="true"] span[title]')
        ?.textContent,
    ).toBe("User2");
  });
});
