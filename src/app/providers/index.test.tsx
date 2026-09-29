import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/mocks/node";
import { useChats } from "@/entities/chat";
import { registerUnhandledRejectionReporter } from "@/shared/lib/reportUnhandledRejection";
import { UNEXPECTED_ERROR } from "@/shared/lib/errorMessage";
import { Toaster } from "@/shared/ui/Toaster";
import { authedAsTestInstance, greenApiUrl } from "@/test/api";
import { renderHookWithProviders } from "@/test/render";

describe("error reporting", () => {
  it("tells the user why a query failed instead of logging it silently", async () => {
    authedAsTestInstance();
    server.use(
      http.get(greenApiUrl("getChats"), () =>
        HttpResponse.json({ message: "instance is blocked" }, { status: 403 }),
      ),
    );

    renderHookWithProviders(() => useChats());

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "instance is blocked",
    );
  });

  it("reports a refused token once", async () => {
    authedAsTestInstance();
    server.use(
      http.get(greenApiUrl("getChats"), () =>
        HttpResponse.json({ message: "Unauthorized" }, { status: 401 }),
      ),
    );

    renderHookWithProviders(() => useChats());

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /Session expired/,
    );
    expect(screen.getAllByRole("alert")).toHaveLength(1);
  });

  it("reports a rejection that nothing awaited", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    render(<Toaster />);
    registerUnhandledRejectionReporter();

    const rejection = new Event("unhandledrejection") as PromiseRejectionEvent;
    Object.assign(rejection, {
      reason: new TypeError("chats.findIndex is not a function"),
      promise: Promise.resolve(),
    });
    act(() => {
      window.dispatchEvent(rejection);
    });

    expect(screen.getByRole("alert")).toHaveTextContent(UNEXPECTED_ERROR);
    expect(consoleError).toHaveBeenCalledWith(
      "Unhandled promise rejection:",
      expect.any(TypeError),
    );
  });
});
