import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { SendMessage } from "./SendMessage";

function setup(isPending = false) {
  const action = vi.fn();
  const view = render(
    <SendMessage target="79001112233" action={action} isPending={isPending} />,
  );

  return { action, ...view };
}

describe("SendMessage", () => {
  it("renders a message field and a submit button", () => {
    setup();

    expect(screen.getByPlaceholderText("Message...")).toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("carries the target chat in the submitted form data", () => {
    const { container } = setup();
    const form = container.querySelector("form") as HTMLFormElement;

    expect(new FormData(form).get("id")).toBe("79001112233");
  });

  it("limits the message to the length the API accepts", () => {
    setup();

    const input = screen.getByPlaceholderText("Message...");

    expect(input).toBeRequired();
    expect(input).toHaveAttribute("maxlength", "4000");
  });

  it("blocks the field and shows a spinner while a message is on its way", () => {
    const { container } = setup(true);

    expect(screen.getByPlaceholderText("Message...")).toBeDisabled();
    expect(screen.getByRole("button")).toBeDisabled();
    expect(container.querySelector(".spin")).not.toBeNull();
    // the send icon is replaced by the spinner
    expect(container.querySelector('path[d^="M6 12"]')).toBeNull();
  });

  it("keeps the send icon when nothing is pending", () => {
    const { container } = setup(false);

    expect(container.querySelector(".spin")).toBeNull();
    expect(container.querySelector('path[d^="M6 12"]')).not.toBeNull();
    expect(screen.getByPlaceholderText("Message...")).toBeEnabled();
  });

  it("hands the form data over to the action on submit", async () => {
    const action = vi.fn<(formData: FormData) => void>();
    const { container } = render(
      <SendMessage
        target="79001112233"
        action={action}
        isPending={false}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Message..."), {
      target: { value: "hello" },
    });
    fireEvent.submit(container.querySelector("form") as HTMLFormElement);

    await waitFor(() => expect(action).toHaveBeenCalledTimes(1));

    const formData = action.mock.calls[0][0] as FormData;

    expect(formData.get("id")).toBe("79001112233");
    expect(formData.get("text")).toBe("hello");
  });
});
