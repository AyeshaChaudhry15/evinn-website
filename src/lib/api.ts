// Thin fetch wrapper for the Evinn API, shared by Server Components (catalogue reads)
// and the browser (public form submissions).

export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api"
).replace(/\/+$/, "");

/** Error carrying the API's `{ message }` text and the HTTP status (0 when the request never reached the server). */
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type QueryValue = string | number | boolean | null | undefined;

interface RequestOptions {
  method?: "GET" | "POST";
  query?: Record<string, QueryValue>;
  body?: unknown;
  signal?: AbortSignal;
  /** Next.js data cache options for server-side reads. Ignored in the browser. */
  next?: { revalidate?: number | false; tags?: string[] };
}

export function buildApiUrl(path: string, query?: Record<string, QueryValue>) {
  const url = new URL(`${API_URL}${path}`);

  for (const [key, value] of Object.entries(query ?? {})) {
    // Unset and blank values are left out: the API ignores them anyway, and this keeps cache keys stable.
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, String(value));
  }

  return url;
}

export async function apiRequest<T>(
  path: string,
  { method = "GET", query, body, signal, next }: RequestOptions = {},
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(buildApiUrl(path, query), {
      method,
      // Public endpoints work without cookies, but the docs ask every client to send them.
      credentials: "include",
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
      next,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError(
      "We couldn't reach the server. Please check your connection and try again.",
      0,
    );
  }

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "message" in data && typeof data.message === "string"
        ? data.message
        : `Request failed (${response.status})`;

    throw new ApiError(message, response.status);
  }

  return data as T;
}

/** Readable text for any error thrown by `apiRequest`, for forms and inline error states. */
export function errorMessage(
  error: unknown,
  rateLimitMessage = "Too many requests. Please try again later.",
) {
  if (error instanceof ApiError) {
    return error.status === 429 ? rateLimitMessage : error.message;
  }

  return "Something went wrong. Please try again.";
}
