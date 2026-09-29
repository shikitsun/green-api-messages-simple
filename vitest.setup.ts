import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";
import { server } from "./src/mocks/node.js";
import { resetStores } from "./src/test/reset.js";

// jsdom does not ship the <dialog> API yet, the modal has to be faked
if (
  typeof HTMLDialogElement !== "undefined" &&
  !HTMLDialogElement.prototype.showModal
) {
  Object.assign(HTMLDialogElement.prototype, {
    showModal(this: HTMLDialogElement) {
      this.open = true;
    },
    show(this: HTMLDialogElement) {
      this.open = true;
    },
    close(this: HTMLDialogElement, returnValue?: string) {
      this.open = false;
      if (returnValue !== undefined) {
        this.returnValue = returnValue;
      }
      this.dispatchEvent(new Event("close"));
    },
  });
}

/**
 * Most defects in this app were silent: they only surfaced as console output
 * (React key warnings, failing polls, unhandled rejections) while the UI kept
 * looking correct. So a test that logs is treated as a failing test.
 *
 * To assert on console output on purpose, spy on it inside the test
 * (`vi.spyOn(console, "error").mockImplementation(() => undefined)`) - a spy
 * replaces this wrapper and silences the check.
 */
const nativeConsole = { error: console.error, warn: console.warn };
let consoleOutput: string[] = [];

beforeEach(() => {
  consoleOutput = [];

  (Object.keys(nativeConsole) as Array<keyof typeof nativeConsole>).forEach(
    (level) => {
      console[level] = (...args: unknown[]) => {
        consoleOutput.push(
          `${level}: ${args.map((arg) => String(arg)).join(" ")}`,
        );
        nativeConsole[level](...args);
      };
    },
  );
});

// A request that is not handled by a mock is a bug in the test, not a silent network call.
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetStores();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.useRealTimers();

  console.error = nativeConsole.error;
  console.warn = nativeConsole.warn;

  const output = consoleOutput;
  consoleOutput = [];

  if (output.length > 0) {
    throw new Error(
      `Tests must stay quiet - console output is a silent failure in the app:\n  ${output.join("\n  ")}`,
    );
  }
});

afterAll(() => server.close());
