import { useInstanceStore } from "@/entities/instance";
import { useToasts } from "@/shared/model/useToasts";
import { ApiError } from "./ApiError";

const BASE_URL = import.meta.env.VITE_GREEN_API_BASE;
const SESSION_EXPIRED = "Session expired. Sign in again.";

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

  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError("Cannot reach API. Check your connection.");
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

    throw new ApiError(message, response.status);
  }

  return response.json() as Promise<T>;
}
