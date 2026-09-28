// Absolute necessary
import { useInstanceStore } from "@/entities/instance";

const BASE_URL = import.meta.env.VITE_GREEN_API_BASE;

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
    throw new Error("Not authenticated: missing Green-API credentials");
  }

  // if endpoint have multiple sections, split it by it to extract main part and query
  const [mainEndpoint, ...rest] = endpoint.split("/");

  const url = `${BASE_URL}/waInstance${idInstance}/${mainEndpoint}/${apiTokenInstance}${rest ? "/" + rest.join("/") : ""}`;

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message ||
        `API error: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<T>;
}
