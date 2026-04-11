export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 400,
    public readonly code = "APP_ERROR",
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function badRequest(message: string, details?: unknown) {
  return new AppError(message, 400, "BAD_REQUEST", details);
}

export function unauthorized(message: string) {
  return new AppError(message, 401, "UNAUTHORIZED");
}

export function notFound(message: string) {
  return new AppError(message, 404, "NOT_FOUND");
}

export function integrationError(message: string, details?: unknown) {
  return new AppError(message, 502, "INTEGRATION_ERROR", details);
}
