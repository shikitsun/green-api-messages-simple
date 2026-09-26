import { useInstanceStore } from "../../entities/instance/model/useInstanceStore.js";

const BASE_URL = import.meta.env.VITE_GREEN_API_BASE;

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  if (!BASE_URL) {
    throw new Error("Environment variable VITE_GREEN_API_BASE is not defined");
  }
  const { idInstance, apiTokenInstance } = useInstanceStore.getState();

  if (!idInstance || !apiTokenInstance) {
    throw new Error("Not authenticated: missing Green-API credentials");
  }

  const url = `${BASE_URL}/${endpoint}`;

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  // Note: For GREEN-API, many methods use idInstance and apiToken in URL or query params,
  // but we'll follow the standard pattern for now.
  // Adjust based on actual GREEN-API documentation requirements if needed.
  const finalUrl = url
    .replace("{idInstance}", idInstance)
    .replace("{apiTokenInstance}", apiTokenInstance);

  const response = await fetch(finalUrl, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.errorText ||
        `API error: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<T>;
}
