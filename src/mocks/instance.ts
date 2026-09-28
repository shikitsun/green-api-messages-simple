import { http, HttpResponse } from "msw";
import { type IBaseCredentials } from ".";

export const getStateInstance = http.get<IBaseCredentials>(
  `${import.meta.env.VITE_GREEN_API_BASE}/waInstancetest/getStateInstance/:apiTokenInstance`,
  () => {
    return HttpResponse.json({
      stateInstance: "authorized",
    });
  },
);
