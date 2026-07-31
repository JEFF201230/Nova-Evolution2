export class BffError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: Readonly<Record<string, unknown>>;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: Readonly<Record<string, unknown>>,
  ) {
    super(message);
    this.name = "BffError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function asBffError(error: unknown): BffError {
  if (error instanceof BffError) {
    return error;
  }
  return new BffError(
    500,
    "INTERNAL_ERROR",
    "The BFF could not complete the request.",
  );
}
