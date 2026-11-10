import { FormEvent, useEffect, useState } from "react";
import { api, ApiError } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.js";
import { useGym } from "../context/GymContext.js";
import Button from "../components/ui/Button.js";
import FormField from "../components/FormField.js";
import { useToast } from "../components/Toast.js";

interface GymProfile {
  id: string;
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
}

export default function Profile() {
  const { user } = useAuth();
  const { refresh } = useGym();
  const toast = useToast();
  const [gym, setGym] = useState<GymProfile | null>(null);
  const [form, setForm] = useState({ name: "", ownerName: "", phone: "", address: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwner = user?.role === "OWNER";

  useEffect(() => {
    api
      .get<{ gym: GymProfile }>("/api/gym/profile", true)
      .then((res) => {
        setGym(res.gym);
        setForm({
          name: res.gym.name,
          ownerName: res.gym.ownerName,
          phone: res.gym.phone,
          address: res.gym.address,
        });
      });
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api.patch("/api/gym/profile", form, true);
      toast.show("Profile updated");
      refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update");
    } finally {
      setBusy(false);
    }
  }

  if (!gym) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-3">
        <div className="h-8 w-32 animate-pulse rounded-lg bg-white/[0.08]" />
        <div className="h-64 w-full animate-pulse rounded-2xl bg-white/[0.06]" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
          Gym profile
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          {isOwner
            ? "Update your gym's details"
            : "Contact the owner to edit these details"}
        </p>
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
        {/* identity strip */}
        <div className="mb-6 flex items-center gap-3.5 border-b border-white/5 pb-5">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-orange-300 to-orange-500 text-lg font-bold text-orange-950 shadow-lg shadow-orange-500/20">
            {gym.name.trim().charAt(0).toUpperCase() || "G"}
          </div>
          <div className="min-w-0">
            <div className="truncate font-semibold text-white">{gym.name}</div>
            <div className="truncate text-xs text-stone-500">{gym.email}</div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <FormField
            label="Gym name"
            name="name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            disabled={!isOwner}
            required
          />
          <FormField
            label="Owner name"
            name="ownerName"
            value={form.ownerName}
            onChange={(e) =>
              setForm((f) => ({ ...f, ownerName: e.target.value }))
            }
            disabled={!isOwner}
            required
          />
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-stone-300">
              Email
            </label>
            <input
              id="email"
              value={gym.email}
              disabled
              className="w-full cursor-not-allowed rounded-xl border border-white/5 bg-white/[0.02] px-3.5 py-3 text-base text-stone-500 sm:text-sm"
            />
            <p className="mt-1.5 text-xs text-stone-500">
              Email cannot be changed (used for login)
            </p>
          </div>
          <FormField
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            disabled={!isOwner}
            required
          />
          <FormField
            label="Address"
            name="address"
            value={form.address}
            onChange={(e) =>
              setForm((f) => ({ ...f, address: e.target.value }))
            }
            disabled={!isOwner}
            required
          />

          {error && (
            <p role="alert" className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3.5 py-2.5 text-sm text-rose-300">
              {error}
            </p>
          )}

          {isOwner && (
            <Button type="submit" fullWidth loading={busy} size="lg">
              Save changes
            </Button>
          )}
        </form>
      </section>
    </div>
  );
}