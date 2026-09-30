import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";
import { worker } from "@/mocks/browser";
import { disableDelay } from "@/mocks/utils";
import { resetStores } from "@/test/reset";

disableDelay();

beforeAll(() => worker.start({ onUnhandledRequest: "error" }));

afterEach(() => {
  cleanup();
  worker.resetHandlers();
  resetStores();
});

afterAll(() => worker.stop());
