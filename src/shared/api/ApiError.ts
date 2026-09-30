export class ApiError extends Error {
  readonly status: number | null;
  readonly retryAfter: number | null;

  constructor(
    message: string,
    status: number | null = null,
    retryAfter: number | null = null,
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.retryAfter = retryAfter;
  }

  get isUnauthorized() {
    return this.status === 401;
  }
}
