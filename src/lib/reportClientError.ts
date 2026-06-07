import { describeClientError } from "./describeClientError";

export function reportClientError(scope: string, error: unknown, extra?: Record<string, unknown>) {
  const normalized =
    error instanceof Error
      ? {
          message: error.message,
          name: error.name,
          stack: error.stack,
        }
      : { value: describeClientError(error) };

  console.error(`[${scope}]`, {
    ...extra,
    error: normalized,
  });
}
