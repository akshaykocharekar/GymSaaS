import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "../lib/api.js";

export interface GymProfile {
  id: string;
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  trialExpiresAt: string | null;
}

interface Ctx {
  gym: GymProfile | null;
  refresh: () => void;
}

const GymCtx = createContext<Ctx | null>(null);

export function GymProvider({ children }: { children: ReactNode }) {
  const [gym, setGym] = useState<GymProfile | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("gymora_access_token");
    if (!token) return;
    api
      .get<{ ok: boolean; gym: GymProfile }>("/api/gym/profile", true)
      .then((res) => setGym(res.gym))
      .catch(() => setGym(null));
  }, [tick]);

  return (
    <GymCtx.Provider value={{ gym, refresh: () => setTick((t) => t + 1) }}>
      {children}
    </GymCtx.Provider>
  );
}

export function useGym(): Ctx {
  const ctx = useContext(GymCtx);
  if (!ctx) throw new Error("useGym must be inside GymProvider");
  return ctx;
}