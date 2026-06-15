import { supabase } from "@/integrations/supabase/client";

function hasResponseContext(
  error: unknown,
): error is { context: Response; message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "context" in error &&
    error.context instanceof Response
  );
}

function extractErrorMessage(payload: unknown): string | null {
  if (!payload) {
    return null;
  }

  if (typeof payload === "string") {
    return payload;
  }

  if (payload instanceof Error) {
    return payload.message;
  }

  if (typeof payload === "object") {
    if (
      "error" in payload &&
      typeof payload.error === "string" &&
      payload.error.trim()
    ) {
      return payload.error;
    }

    if (
      "message" in payload &&
      typeof payload.message === "string" &&
      payload.message.trim()
    ) {
      return payload.message;
    }

    try {
      return JSON.stringify(payload);
    } catch {
      return null;
    }
  }

  return String(payload);
}

export async function invokeSupabaseFunction<T>(name: string, body: unknown) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("You must be signed in to continue.");
  }

  const { data, error } = await supabase.functions.invoke(name, {
    body,
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (error) {
    if (hasResponseContext(error)) {
      try {
        const payload = await error.context.json();
        const contextMessage = extractErrorMessage(payload);

        if (contextMessage) {
          throw new Error(contextMessage);
        }
      } catch (contextError) {
        const contextMessage = extractErrorMessage(contextError);

        if (contextMessage) {
          throw new Error(contextMessage);
        }

        try {
          const fallbackPayload = await error.context.text();
          const fallbackMessage = extractErrorMessage(fallbackPayload);

          if (fallbackMessage) {
            throw new Error(fallbackMessage);
          }
        } catch (textError) {
          const textMessage = extractErrorMessage(textError);

          if (textMessage) {
            throw new Error(textMessage);
          }
        }
      }
    }

    const directMessage = extractErrorMessage(error);

    if (directMessage) {
      throw new Error(directMessage);
    }

    throw new Error("Failed to invoke Supabase function.");
  }

  if (typeof data === "object" && data !== null) {
    const dataMessage = extractErrorMessage(data);

    if (
      dataMessage &&
      ("error" in data || "message" in data)
    ) {
      throw new Error(dataMessage);
    }
  }

  return data as T;
}
