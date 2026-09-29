export const UNEXPECTED_ERROR = "Something went wrong. Please try again.";

export function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error.trim()) return error;

  return UNEXPECTED_ERROR;
}
