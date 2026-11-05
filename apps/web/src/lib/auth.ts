export interface AuthUser {
  id: string;
  role: "SUPERADMIN" | "OWNER" | "STAFF";
  gymId: string | null;
  name: string;
  email: string;
}

export interface StoredAuth {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  gymStatus: string | null;
}

const KEY = "gymora_auth";

export function saveAuth(data: StoredAuth): void {
  localStorage.setItem(KEY, JSON.stringify(data));
  localStorage.setItem("gymora_access_token", data.accessToken);
}

export function loadAuth(): StoredAuth | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  localStorage.removeItem(KEY);
  localStorage.removeItem("gymora_access_token");
}
