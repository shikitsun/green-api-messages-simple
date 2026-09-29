import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MessageItem } from "./MessageItem";

const TIMESTAMP = 1712345678;

const shortTime = new Intl.DateTimeFormat(undefined, {
  timeStyle: "short",
}).format(TIMESTAMP * 1000);

function renderMessage(isOutgoing: boolean) {
  return render(
    <MessageItem
      id="msg-1"
      text="hello there"
      timestamp={TIMESTAMP}
      isOutgoing={isOutgoing}
    />,
  );
}

describe("MessageItem", () => {
  it("renders the text of the message", () => {
    renderMessage(false);

    expect(screen.getByRole("listitem")).toHaveTextContent("hello there");
  });

  it("marks an outgoing message so the bubble can be styled", () => {
    renderMessage(true);

    expect(screen.getByRole("listitem")).toHaveAttribute(
      "data-is-outgoing",
      "true",
    );
  });

  it("leaves an incoming message unmarked", () => {
    renderMessage(false);

    expect(screen.getByRole("listitem")).not.toHaveAttribute(
      "data-is-outgoing",
    );
  });

  it("shows the time the message was sent", () => {
    renderMessage(false);

    expect(screen.getByText(shortTime)).toBeInTheDocument();
  });
});
