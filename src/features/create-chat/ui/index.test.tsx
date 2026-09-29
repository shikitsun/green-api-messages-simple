import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/mocks/node";
import { CreateChatModal } from "./index";
import { useLocalChatsStore } from "@/entities/chat";
import { authedAsTestInstance, greenApiUrl } from "@/test/api";
import { renderWithProviders } from "@/test/render";

const PHONE = "79001112233";

function mockCheckAccount(exist: boolean) {
  server.use(
    http.post(greenApiUrl("checkAccount"), () =>
      HttpResponse.json({ exist, chatId: exist ? PHONE : null }),
    ),
  );
}

function setup() {
  authedAsTestInstance();
  server.use(http.get(greenApiUrl("getChats"), () => HttpResponse.json([])));

  const onSuccess = vi.fn();
  const onClose = vi.fn();
  const view = renderWithProviders(
    <CreateChatModal onSuccess={onSuccess} onClose={onClose} />,
  );

  return { onSuccess, onClose, ...view };
}

describe("CreateChatModal", () => {
  it("opens as a modal dialog", () => {
    const { container } = setup();

    const dialog = container.querySelector("dialog");

    expect(dialog).not.toBeNull();
    expect(dialog?.open).toBe(true);
    expect(screen.getByRole("heading", { name: "Find by phone" })).toBeVisible();
  });

  it("opens the chat of the phone number that was typed in", async () => {
    mockCheckAccount(true);
    const { onSuccess, container } = setup();

    fireEvent.change(screen.getByPlaceholderText("1234567890"), {
      target: { value: PHONE },
    });
    fireEvent.click(screen.getByRole("button", { name: "Find" }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(PHONE));
    expect(useLocalChatsStore.getState().chats).toEqual([
      expect.objectContaining({ chatId: PHONE }),
    ]);
    expect(container.querySelector(".error-message")).toBeNull();
  });

  it("does not create a chat twice for the same number", async () => {
    mockCheckAccount(true);
    const { onSuccess } = setup();
    useLocalChatsStore.getState().add({
      chatId: PHONE,
      name: PHONE,
      type: "user",
      phoneNumber: Number(PHONE),
    });

    fireEvent.change(screen.getByPlaceholderText("1234567890"), {
      target: { value: PHONE },
    });
    fireEvent.click(screen.getByRole("button", { name: "Find" }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(PHONE));
    expect(useLocalChatsStore.getState().chats).toHaveLength(1);
  });

  it("shows the reason when the number has no account", async () => {
    mockCheckAccount(false);
    const { onSuccess, container } = setup();

    fireEvent.change(screen.getByPlaceholderText("1234567890"), {
      target: { value: PHONE },
    });
    fireEvent.click(screen.getByRole("button", { name: "Find" }));

    await waitFor(() =>
      expect(container.querySelector(".error-message")).toHaveTextContent(
        "No account for given user",
      ),
    );
    expect(onSuccess).not.toHaveBeenCalled();
    expect(useLocalChatsStore.getState().chats).toEqual([]);
  });

  it("refuses a form without a usable phone number", async () => {
    const { onSuccess, container } = setup();

    fireEvent.submit(container.querySelector("form") as HTMLFormElement);

    await waitFor(() =>
      expect(container.querySelector(".error-message")).toHaveTextContent(
        "Invalid number",
      ),
    );
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("closes itself when the backdrop is clicked", () => {
    const { onClose, container } = setup();

    fireEvent.click(container.querySelector("dialog") as HTMLDialogElement);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not close when a click lands inside the dialog", () => {
    const { onClose } = setup();

    fireEvent.click(screen.getByPlaceholderText("1234567890"));

    expect(onClose).not.toHaveBeenCalled();
  });
});
