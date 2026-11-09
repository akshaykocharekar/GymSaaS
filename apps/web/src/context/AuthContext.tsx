import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { api } from "../lib/api.js";
import { saveAuth, loadAuth, clearAuth, type AuthUser } from "../lib/auth.js";
import { roleHasPermission } from "../lib/permissions.js";
import type { Permission } from "@gymora/shared";

interface LoginResponse {
  ok: boolean;
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
  gymStatus: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  gymStatus: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (p: Permission) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [gymStatus, setGymStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = loadAuth();
    if (stored) {
      setUser(stored.user);
      setGymStatus(stored.gymStatus);
    }
    setLoading(false);
  }, []);

  async function login(email: string, password: string) {
    const res = await api.post<LoginResponse>("/api/auth/login", {
      email,
      password,
    });
    saveAuth({
      user: res.user,
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
      gymStatus: res.gymStatus,
    });
    setUser(res.user);
    setGymStatus(res.gymStatus);
  }

  function logout() {
    clearAuth();
    setUser(null);
    setGymStatus(null);
  }

  const hasPermission = useCallback(
    (p: Permission) =>
      roleHasPermission(user?.role, user?.permissions, p),
    [user]
  );

  return (
    <AuthContext.Provider
      value={{ user, gymStatus, loading, login, logout, hasPermission }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}