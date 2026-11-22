const configuredOrigin = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

export class ApiError extends Error {
  readonly status: number;
  readonly requestId?: string;

  constructor(message: string, status: number, requestId?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.requestId = requestId;
  }
}

export function isApiConfigured(): boolean {
  return Boolean(configuredOrigin);
}

function getApiOrigin(): string {
  if (!configuredOrigin) {
    throw new Error("OTHRI backend is not configured. Set EXPO_PUBLIC_API_BASE_URL to your API origin.");
  }
  return configuredOrigin.replace(/\/+$/, "");
}

/**
 * Small transport boundary for the future OTHRI backend.
 * Provider credentials must remain server-side; this client only talks to OTHRI.
 */
export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!path.startsWith("/")) {
    throw new Error("API paths must start with '/'.");
  }

  const response = await fetch(`${getApiOrigin()}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });

  const requestId = response.headers.get("x-request-id") ?? undefined;
  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : await response.text().catch(() => "");

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string"
        ? payload.message
        : `OTHRI API request failed with status ${response.status}.`;
    throw new ApiError(message, response.status, requestId);
  }

  return payload as T;
}
