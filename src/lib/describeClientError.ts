export function describeClientError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object") {
    if ("message" in error && typeof error.message === "string" && error.message.trim()) {
      return error.message;
    }

    if ("error" in error && typeof error.error === "string" && error.error.trim()) {
      return error.error;
    }

    if ("name" in error && typeof error.name === "string" && error.name.trim()) {
      try {
        return JSON.stringify(error);
      } catch {
        return error.name;
      }
    }

    try {
      return JSON.stringify(error);
    } catch {
      return "[object Object]";
    }
  }

  return String(error);
}
