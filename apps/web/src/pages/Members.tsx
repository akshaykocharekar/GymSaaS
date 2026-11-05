import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";
import Badge from "../components/ui/Badge.js";
import Card from "../components/ui/Card.js";
import EmptyState from "../components/ui/EmptyState.js";
import Skeleton from "../components/ui/Skeleton.js";
import FAB from "../components/FAB.js";

interface Member {
  id: string;
  fullName: string;
  phone: string;
  expiryDate: string;
  status: "ACTIVE" | "EXPIRED" | "INACTIVE";
}

type Filter = "all" | "active" | "expiring" | "expired" | "inactive";

const filters: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "expiring", label: "Expiring" },
  { key: "expired", label: "Expired" },
  { key: "inactive", label: "Inactive" },
];

export default function Members() {
  const [members, setMembers] = useState<Member[] | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    let cancelled = false;
    setMembers(null);
    const params = new URLSearchParams();
    params.set("filter", filter);
    if (q.trim()) params.set("q", q.trim());
    api
      .get<{ members: Member[] }>(`/api/gym/members?${params}`, true)
      .then((res) => {
        if (!cancelled) setMembers(res.members);
      });
    return () => {
      cancelled = true;
    };
  }, [filter, q]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="sticky top-0 z-20 bg-surface/95 backdrop-blur px-4 sm:px-6 pt-4 pb-3 space-y-3 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Members</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {members ? `${members.length} shown` : "Loading…"}
          </p>
        </div>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search name or phone"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1 scrollbar-hide">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === f.key
                  ? "bg-primary-600 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 sm:px-6 py-4 space-y-2">
        {members === null ? (
          <>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </>
        ) : members.length === 0 ? (
          <EmptyState
         
            title="No members here"
            description={
              q ? "No matches for your search." : "Add your first member to get started."
            }
          />
        ) : (
          members.map((m) => (
            <Link key={m.id} to={`/app/members/${m.id}`} className="block">
              <Card interactive className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center font-semibold text-sm shrink-0">
                  {m.fullName
                    .split(" ")
                    .map((s) => s[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-900 truncate">
                    {m.fullName}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {m.phone} · Expires{" "}
                    {new Date(m.expiryDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </div>
                </div>
                <Badge status={m.status} />
              </Card>
            </Link>
          ))
        )}
      </div>

      <FAB to="/app/members/new" label="Add member" />
    </div>
  );
}