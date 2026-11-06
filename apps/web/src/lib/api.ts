const RAW = import.meta.env.VITE_API_URL || "http://localhost:8787";
const API_URL = RAW.replace(/\/+$/, "");

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function getAccessToken(): string | null {
  return localStorage.getItem("gymora_access_token");
}

function getRefreshToken(): string | null {
  const raw = localStorage.getItem("gymora_auth");
  if (!raw) return null;
  try {
    return JSON.parse(raw).refreshToken || null;
  } catch {
    return null;
  }
}

function updateAccessToken(newToken: string) {
  localStorage.setItem("gymora_access_token", newToken);
  const raw = localStorage.getItem("gymora_auth");
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    data.accessToken = newToken;
    localStorage.setItem("gymora_auth", JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

function clearAuthAndRedirect() {
  localStorage.removeItem("gymora_access_token");
  localStorage.removeItem("gymora_auth");
  window.location.href = "/login";
}

let refreshing: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;
    try {
      const res = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      if (!data?.accessToken) return false;
      updateAccessToken(data.accessToken);
      return true;
    } catch {
      return false;
    } finally {
      setTimeout(() => {
        refreshing = null;
      }, 100);
    }
  })();
  return refreshing;
}

async function request<T>(
  path: string,
  options: RequestInit & { auth?: boolean; _retried?: boolean } = {}
): Promise<T> {
  const { auth, headers, _retried, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...((headers as Record<string, string>) || {}),
  };

  if (auth) {
    const token = getAccessToken();
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const res = await fetch(`${API_URL}${normalizedPath}`, {
    ...rest,
    headers: finalHeaders,
  });

  if (res.status === 401 && auth && !_retried) {
    const ok = await refreshAccessToken();
    if (ok) {
      return request<T>(path, { ...options, _retried: true });
    }
    clearAuthAndRedirect();
    throw new ApiError(401, "Session expired. Please log in again.");
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg =
      (data && (data.error || data.message)) || `Request failed (${res.status})`;
    throw new ApiError(res.status, msg, data);
  }

  return data as T;
}

export const api = {
  get: <T>(path: string, auth = false) =>
    request<T>(path, { method: "GET", auth }),
  post: <T>(path: string, body?: unknown, auth = false) =>
    request<T>(path, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
      auth,
    }),
  patch: <T>(path: string, body?: unknown, auth = false) =>
    request<T>(path, {
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
      auth,
    }),
  delete: <T>(path: string, auth = false) =>
    request<T>(path, { method: "DELETE", auth }),
};
