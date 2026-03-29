import { API_BASE_URL } from "@/lib/constants";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public payload?: unknown,
  ) {
    super(message);
  }
}

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  token?: string;
  guestToken?: string;
}

function joinApiUrl(base: string, path: string) {
  const normalizedBase = base.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers = new Headers();

  if (options.token) headers.set("Authorization", `Bearer ${options.token}`);
  if (options.guestToken) headers.set("X-Guest-Token", options.guestToken);
  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(joinApiUrl(API_BASE_URL, path), {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(
      (data as { message?: string })?.message ?? "API request failed",
      res.status,
      data,
    );
  }

  return data as T;
}
