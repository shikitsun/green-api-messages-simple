import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Toaster } from "./Toaster";
import { useToasts, type TToastKind } from "../model/useToasts";

function push(kind: TToastKind, text: string) {
  act(() => useToasts.getState().push(kind, text));
}

describe("Toaster", () => {
  it("renders nothing until something is reported", () => {
    render(<Toaster />);

    expect(screen.queryAllByRole("alert")).toEqual([]);
    expect(screen.queryAllByRole("status")).toEqual([]);
  });

  it("announces an error", () => {
    render(<Toaster />);

    push("error", "instance is blocked");

    expect(screen.getByRole("alert")).toHaveTextContent("instance is blocked");
  });

  it("uses the polite role for information", () => {
    render(<Toaster />);

    push("info", "Message copied");

    expect(screen.getByRole("status")).toHaveTextContent("Message copied");
  });

  it("can be dismissed by hand", () => {
    render(<Toaster />);
    push("error", "instance is blocked");

    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));

    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("disappears on its own", () => {
    vi.useFakeTimers();
    render(<Toaster />);
    push("error", "instance is blocked");

    act(() => {
      vi.advanceTimersByTime(5_000);
    });

    expect(screen.queryByRole("alert")).toBeNull();
  });
});
