const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as {
      message?: string | string[];
    } | null;
    const message = Array.isArray(errorBody?.message)
      ? errorBody.message.join(" ")
      : errorBody?.message;

    throw new Error(
      message ?? `A API respondeu com o status ${response.status}.`,
    );
  }

  return response.json() as Promise<T>;
}
