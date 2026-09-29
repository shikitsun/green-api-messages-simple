import { useInstanceStore } from "@/entities/instance";

/** Base URL the app under test was built for (see `test.env` in `vite.config.ts`). */
export const API_BASE = import.meta.env.VITE_GREEN_API_BASE as string;

export const TEST_CREDENTIALS = {
  idInstance: "1101000001",
  apiTokenInstance: "test-token",
} as const;

/** Puts fake credentials into the store so `apiRequest` is allowed to run. */
export function authedAsTestInstance() {
  useInstanceStore.getState().setCredentials({ ...TEST_CREDENTIALS });
}

/** Mirrors the URL layout built by `apiRequest` — used to register MSW handlers. */
export function greenApiUrl(
  endpoint: string,
  credentials: {
    idInstance: string;
    apiTokenInstance: string;
  } = TEST_CREDENTIALS,
) {
  const [mainEndpoint, ...rest] = endpoint.split("/");

  return `${API_BASE}/waInstance${credentials.idInstance}/${mainEndpoint}/${credentials.apiTokenInstance}${
    rest.length ? `/${rest.join("/")}` : ""
  }`;
}
