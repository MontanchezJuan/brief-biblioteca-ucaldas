export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    public readonly detail?: string,
    public readonly meta?: Record<string, unknown>
  ) {
    super(code);
  }
}
