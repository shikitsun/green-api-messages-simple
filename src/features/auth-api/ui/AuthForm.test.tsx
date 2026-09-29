import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { Route, Routes } from "react-router";
import { http, HttpResponse } from "msw";
import { server } from "@/mocks/node";
import { AuthForm } from "./AuthForm";
import { useInstanceStore } from "@/entities/instance";
import { TEST_CREDENTIALS, greenApiUrl } from "@/test/api";
import { renderWithProviders } from "@/test/render";

function mockInstanceState(state: string) {
  server.use(
    http.get(greenApiUrl("getStateInstance"), () =>
      HttpResponse.json({ stateInstance: state }),
    ),
  );
}

function setup() {
  const view = renderWithProviders(
    <Routes>
      <Route path="/login" element={<AuthForm />} />
      <Route path="/chat" element={<p>chat screen</p>} />
    </Routes>,
    { route: "/login" },
  );

  fireEvent.change(screen.getByPlaceholderText("idInstance"), {
    target: { value: TEST_CREDENTIALS.idInstance },
  });
  fireEvent.change(screen.getByPlaceholderText("apiTokenInstance"), {
    target: { value: TEST_CREDENTIALS.apiTokenInstance },
  });

  return view;
}

function submit() {
  fireEvent.click(screen.getByRole("button", { name: /continue/i }));
}

describe("AuthForm", () => {
  it("verifies the instance before it lets the user in", async () => {
    const handler = vi.fn(() =>
      HttpResponse.json({ stateInstance: "authorized" }),
    );
    server.use(http.get(greenApiUrl("getStateInstance"), handler));

    setup();
    submit();

    await waitFor(() =>
      expect(screen.queryByText("chat screen")).not.toBeNull(),
    );
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("stores the credentials of an authorized instance", async () => {
    mockInstanceState("authorized");
    setup();

    submit();

    await waitFor(() =>
      expect(useInstanceStore.getState().idInstance).toBe(
        TEST_CREDENTIALS.idInstance,
      ),
    );
    expect(useInstanceStore.getState().apiTokenInstance).toBe(
      TEST_CREDENTIALS.apiTokenInstance,
    );
  });

  it("reports a state that is not authorized and keeps the user on the form", async () => {
    mockInstanceState("blocked");
    setup();

    submit();

    expect(await screen.findByText("blocked")).toBeInTheDocument();
    expect(useInstanceStore.getState().idInstance).toBeNull();
    expect(screen.queryByText("chat screen")).toBeNull();
  });

  it("keeps the submit button disabled while the instance is verified", async () => {
    let release: () => void = () => {};
    const pendingResponse = new Promise<void>((resolve) => {
      release = resolve;
    });
    server.use(
      http.get(greenApiUrl("getStateInstance"), async () => {
        await pendingResponse;
        return HttpResponse.json({ stateInstance: "authorized" });
      }),
    );

    setup();
    submit();

    const button = screen.getByRole("button", { name: /verifying/i });

    expect(button).toBeDisabled();
    expect(screen.getByPlaceholderText("idInstance")).toBeDisabled();

    release();

    await waitFor(() =>
      expect(screen.queryByText("chat screen")).not.toBeNull(),
    );
  });
});
