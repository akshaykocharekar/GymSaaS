import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.js";
import Badge from "../components/ui/Badge.js";
import Card from "../components/ui/Card.js";
import EmptyState from "../components/ui/EmptyState.js";
import Skeleton from "../components/ui/Skeleton.js";
import WhatsAppSheet from "../components/WhatsAppSheet.js";

interface Member {
  id: string;
  fullName: string;
  phone: string;
  expiryDate: string;
  status: "ACTIVE" | "EXPIRED" | "INACTIVE";
}

interface Bucket {
  key: string;
  label: string;
  filter: string;
  days?: number;
  tone: "warning" | "danger" | "info";
  members: Member[];
}

const bucketDefs: Omit<Bucket, "members">[] = [
  {
    key: "7d",
    label: "Expiring in 7 days",
    filter: "expiring",
    days: 7,
    tone: "warning",
  },
  {
    key: "15d",
    label: "Expiring in 15 days",
    filter: "expiring",
    days: 15,
    tone: "warning",
  },
  {
    key: "30d",
    label: "Expiring in 30 days",
    filter: "expiring",
    days: 30,
    tone: "info",
  },
  {
    key: "expired",
    label: "Already expired",
    filter: "expired",
    tone: "danger",
  },
];

export default function Expiries() {
  const { user } = useAuth();
  const [buckets, setBuckets] = useState<Bucket[] | null>(null);
  const [waMember, setWaMember] = useState<Member | null>(null);

  useEffect(() => {
    Promise.all(
      bucketDefs.map(async (b) => {
        const params = new URLSearchParams();
        params.set("filter", b.filter);
        if (b.days) params.set("expiringInDays", String(b.days));
        params.set("limit", "100");
        const res = await api.get<{ members: Member[] }>(
          `/api/gym/members?${params}`,
          true
        );
        return { ...b, members: res.members };
      })
    ).then((all) => setBuckets(all));
  }, []);

  const total = buckets?.reduce((s, b) => s + b.members.length, 0) || 0;

  return (
    <div className="max-w-4xl mx-auto pb-8">
      <div className="px-4 sm:px-6 pt-4 pb-3">
        <h1 className="text-2xl font-bold text-slate-900">Expiries</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {buckets ? `${total} to follow up` : "Loading…"}
        </p>
      </div>

      {!buckets ? (
        <div className="px-4 sm:px-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : total === 0 ? (
        <div className="px-4 sm:px-6">
          <EmptyState
            
            title="All caught up"
            description="No members expiring in the next 30 days, and no expired memberships."
          />
        </div>
      ) : (
        <div className="px-4 sm:px-6 space-y-5">
          {buckets.map((b) => (
            <section key={b.key}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      b.tone === "danger"
                        ? "bg-danger"
                        : b.tone === "warning"
                        ? "bg-amber-500"
                        : "bg-primary-500"
                    }`}
                  />
                  <h2 className="text-sm font-semibold text-slate-800">
                    {b.label}
                  </h2>
                </div>
                <span className="text-xs text-slate-500">
                  {b.members.length}
                </span>
              </div>

              {b.members.length === 0 ? (
                <Card className="p-4 text-sm text-slate-500 text-center">
                  Nobody here
                </Card>
              ) : (
                <div className="space-y-2">
                  {b.members.map((m) => (
                    <Card key={m.id} className="p-3 flex items-center gap-3">
                      <Link
                        to={`/app/members/${m.id}`}
                        className="flex-1 min-w-0"
                      >
                        <div className="font-medium text-slate-900 truncate">
                          {m.fullName}
                        </div>
                        <div className="text-xs text-slate-500">
                          Expires{" "}
                          {new Date(m.expiryDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </Link>
                      <Badge status={m.status} />
                      <button
                        onClick={() => setWaMember(m)}
                        className="shrink-0 w-9 h-9 rounded-full bg-green-50 text-green-700 flex items-center justify-center hover:bg-green-100"
                        aria-label="Send WhatsApp"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M17.6 6.32A7.85 7.85 0 0 0 12 4a7.94 7.94 0 0 0-6.9 11.9L4 20l4.2-1.1a7.93 7.93 0 0 0 3.8.96h.01a7.94 7.94 0 0 0 5.6-13.55zM12 18.5a6.6 6.6 0 0 1-3.4-.93l-.24-.14-2.5.66.67-2.43-.16-.25a6.6 6.6 0 1 1 12.24-3.4 6.6 6.6 0 0 1-6.6 6.6zm3.62-4.94c-.2-.1-1.18-.58-1.36-.65-.18-.07-.31-.1-.44.1-.13.2-.51.65-.62.78-.11.13-.23.15-.42.05-.2-.1-.83-.3-1.58-.97-.58-.52-.98-1.16-1.09-1.36-.11-.2-.01-.3.09-.4.09-.09.2-.23.3-.35.1-.12.13-.2.2-.34.07-.13.03-.25-.02-.35-.05-.1-.44-1.06-.6-1.45-.16-.38-.32-.33-.44-.34l-.38-.01c-.13 0-.34.05-.52.25-.18.2-.68.67-.68 1.63 0 .96.7 1.89.8 2.02.1.13 1.38 2.11 3.34 2.96.47.2.83.32 1.12.41.47.15.9.13 1.24.08.38-.06 1.18-.48 1.35-.95.17-.47.17-.87.12-.95-.05-.08-.18-.13-.38-.23z" />
                        </svg>
                      </button>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}

      {waMember && (
        <WhatsAppSheet
          open={!!waMember}
          onClose={() => setWaMember(null)}
          member={{
            fullName: waMember.fullName,
            phone: waMember.phone,
            expiryDate: waMember.expiryDate,
          }}
          gymName={gym?.name || "the gym"}
          defaultKind={waMember.status === "EXPIRED" ? "RENEWAL_REMINDER" : "EXPIRY_REMINDER"}
        />
      )}
    </div>
  );
}