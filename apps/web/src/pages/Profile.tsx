import { FormEvent, useEffect, useState } from "react";
import { api, ApiError } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.js";
import { useGym } from "../context/GymContext.js";
import Card from "../components/ui/Card.js";
import Button from "../components/ui/Button.js";
import FormField from "../components/FormField.js";
import Skeleton from "../components/ui/Skeleton.js";
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
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
          Gym profile
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {isOwner
            ? "Update your gym's details"
            : "Contact the owner to edit these details"}
        </p>
      </div>

      <Card className="p-5">
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
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              value={gym.email}
              disabled
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 mt-1">
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

          {error && <p className="text-sm text-rose-600">{error}</p>}

          {isOwner && (
            <Button type="submit" fullWidth loading={busy} size="lg">
              Save changes
            </Button>
          )}
        </form>
      </Card>
    </div>
  );
}