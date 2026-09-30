interface IApiErrorOptions {
  status?: number | null;
  retryAfter?: number | null;
}

export class ApiError extends Error {
  readonly status: number | null;
  readonly retryAfter: number | null;

  constructor(
    message: string,
    { status = null, retryAfter = null }: IApiErrorOptions = {},
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.retryAfter = retryAfter;
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isThrottled() {
    return this.status === 429;
  }

  get isUnavailable() {
    return this.status !== null && this.status >= 500;
  }
}

export class ApiUnreachableError extends ApiError {
  constructor(message = "Cannot reach API. Check your connection.") {
    super(message);

    this.name = "ApiUnreachableError";
  }
}

export class ApiTimeoutError extends ApiError {
  constructor(message = "The API did not answer. Check your connection.") {
    super(message);

    this.name = "ApiTimeoutError";
  }
}
