import { http, HttpResponse } from "msw";
import { type IBaseCredentials } from ".";

export const getStateInstance = http.get<IBaseCredentials>(
  `${import.meta.env.VITE_GREEN_API_BASE}/waInstancetest/getStateInstance/:apiTokenInstance`,
  async () => {
    // add loading
    // await new Promise((res) => setTimeout(res, 10000));
    return HttpResponse.json({
      stateInstance: "authorized",
    });
  },
);
