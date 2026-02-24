type ApiEnvelope<T> = {
  data: T;
  path: string;
  timestamp: string;
};

export const unwrapApiResponse = <T>(response: T | ApiEnvelope<T>): T => {
  if (
    response &&
    typeof response === "object" &&
    "data" in (response as Record<string, unknown>)
  ) {
    return (response as ApiEnvelope<T>).data;
  }

  return response as T;
};
