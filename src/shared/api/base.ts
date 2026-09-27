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
  const {
    idInstance = replaceState?.idInstance,
    apiTokenInstance = replaceState?.apiTokenInstance,
  } = useInstanceStore.getState();

  if (!idInstance || !apiTokenInstance) {
    throw new Error("Not authenticated: missing Green-API credentials");
  }

  const url = `${BASE_URL}/${endpoint}`;

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  const finalUrl = url
    .replace("{{idInstance}}", idInstance)
    .replace("{{apiTokenInstance}}", apiTokenInstance);

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
