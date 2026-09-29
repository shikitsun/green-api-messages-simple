import { http, HttpResponse } from "msw";
import { type IBaseCredentials } from ".";
import { randomWaiting } from "./utils";

export const getStateInstance = http.get<IBaseCredentials>(
  `${import.meta.env.VITE_GREEN_API_BASE}/waInstancetest/getStateInstance/:apiTokenInstance`,
  async () => {
    // add randomly loading
    await randomWaiting(10000);
    return HttpResponse.json({
      stateInstance: "authorized",
    });
  },
);
