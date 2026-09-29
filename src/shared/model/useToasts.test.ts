import { describe, expect, it, vi } from "vitest";
import { useToasts } from "./useToasts";

const store = () => useToasts.getState();

describe("useToasts", () => {
  it("keeps the pushed toast", () => {
    store().push("error", "instance is blocked");

    expect(store().toasts).toEqual([
      { id: 1, kind: "error", text: "instance is blocked" },
    ]);
  });

  it("does not repeat the same text within the dedupe window", () => {
    store().push("error", "Connection lost");
    store().push("error", "Connection lost");

    expect(store().toasts).toHaveLength(1);
  });

  it("shows the same text again once the window is over", () => {
    vi.useFakeTimers();

    store().push("error", "Connection lost");
    vi.advanceTimersByTime(6_000);
    store().push("error", "Connection lost");

    expect(store().toasts).toHaveLength(2);
  });

  it("keeps the kinds apart", () => {
    store().push("error", "same text");
    store().push("info", "same text");

    expect(store().toasts).toHaveLength(2);
  });

  it("keeps only the last three toasts", () => {
    store().push("error", "one");
    store().push("error", "two");
    store().push("error", "three");
    store().push("error", "four");

    expect(store().toasts.map((toast) => toast.text)).toEqual([
      "two",
      "three",
      "four",
    ]);
  });

  it("dismisses a single toast", () => {
    store().push("error", "one");
    store().push("error", "two");

    store().dismiss(store().toasts[0].id);

    expect(store().toasts.map((toast) => toast.text)).toEqual(["two"]);
  });

  it("clears everything", () => {
    store().push("error", "one");

    store().clear();

    expect(store().toasts).toEqual([]);
  });
});
