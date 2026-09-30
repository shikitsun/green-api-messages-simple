import { useInstanceStore } from "@/entities/instance";
import { useToasts } from "@/shared/model/useToasts";
import { ApiError } from "./ApiError";

const BASE_URL = import.meta.env.VITE_GREEN_API_BASE;
const SESSION_EXPIRED = "Session expired. Sign in again.";
const REQUEST_TIMEOUT = 20_000;

function parseRetryAfter(header: string | null): number | null {
  if (!header) return null;

  const seconds = Number(header);

  if (Number.isFinite(seconds) && seconds >= 0) return seconds;

  const date = Date.parse(header);

  if (Number.isNaN(date)) return null;

  return Math.max(0, Math.ceil((date - Date.now()) / 1000));
}

function expireSession() {
  if (!useInstanceStore.getState().idInstance) return;

  useInstanceStore.getState().clearCredentials();
  useToasts.getState().push("error", SESSION_EXPIRED);
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  replaceState: Partial<
    Pick<
      ReturnType<typeof useInstanceStore.getState>,
      "idInstance" | "apiTokenInstance"
    >
  > = {},
): Promise<T> {
  if (!BASE_URL) {
    throw new Error("Environment variable VITE_GREEN_API_BASE is not defined");
  }
  const { idInstance: sourceId, apiTokenInstance: sourceApi } =
    useInstanceStore.getState();

  let idInstance = sourceId;
  let apiTokenInstance = sourceApi;

  if (replaceState) {
    idInstance = replaceState.idInstance ?? idInstance;
    apiTokenInstance = replaceState.apiTokenInstance ?? apiTokenInstance;
  }

  if (!idInstance || !apiTokenInstance) {
    throw new Error("Not authenticated: missing API credentials");
  }

  // if endpoint have multiple sections, split it by it to extract main part and query
  const [mainEndpoint, ...rest] = endpoint.split("/");

  const url = `${BASE_URL}/waInstance${idInstance}/${mainEndpoint}/${apiTokenInstance}${
    rest.length ? "/" + rest.join("/") : ""
  }`;

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  let response: Response;
  const controller = new AbortController();
  // if user-defined signal are aborted - abort inner controller too
  options?.signal?.addEventListener("abort", () => {
    controller.abort();
  });
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
  } catch (error) {
    throw new ApiError(
      (error as Error)?.name === "AbortError"
        ? "The API did not answer in time. Check your connection."
        : "Cannot reach API. Check your connection.",
    );
  } finally {
    clearTimeout(timeout);
  }

  // receiveNotification answers 204 when there is nothing in the queue
  if (response.status === 204) {
    return undefined as T;
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      errorData.message ||
      `API error: ${response.status} ${response.statusText}`;

    if (response.status === 401) {
      expireSession();
    }

    throw new ApiError(
      message,
      response.status,
      parseRetryAfter(response.headers.get("Retry-After")),
    );
  }

  return response.json() as Promise<T>;
}
