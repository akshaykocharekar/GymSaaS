import { ReactNode } from "react";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
  /** If true, hide on mobile card view */
  hideOnMobile?: boolean;
  align?: "left" | "right";
}

interface Props<T> {
  columns: Column<T>[];
  rows: T[];
  keyFn: (row: T) => string;
  empty?: ReactNode;
  loading?: boolean;
  skeletonRows?: number;
  rowHref?: (row: T) => string;
}

export default function AdminTable<T>({
  columns,
  rows,
  keyFn,
  empty,
  loading,
  skeletonRows = 5,
  rowHref,
}: Props<T>) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
        <div className="divide-y divide-white/5">
          {Array.from({ length: skeletonRows }).map((_, i) => (
            <div key={i} className="p-4 flex gap-4">
              {columns.map((c) => (
                <div
                  key={c.key}
                  className="h-4 bg-white/[0.06] rounded-lg animate-pulse flex-1"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
        {empty ?? <div className="text-sm text-stone-500">No rows</div>}
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden sm:block rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/[0.03] border-b border-white/10">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500 ${
                    c.align === "right" ? "text-right" : "text-left"
                  } ${c.className || ""}`}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((row) => (
              <tr
                key={keyFn(row)}
                className="hover:bg-white/[0.04] transition-colors"
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={`px-4 py-3.5 ${
                      c.align === "right" ? "text-right" : "text-left"
                    } ${c.className || ""}`}
                  >
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-2.5">
        {rows.map((row) => (
          <div
            key={keyFn(row)}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-2"
          >
            {columns
              .filter((c) => !c.hideOnMobile)
              .map((c) => (
                <div
                  key={c.key}
                  className="flex justify-between gap-3 items-center"
                >
                  <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-stone-500 shrink-0">
                    {c.header}
                  </div>
                  <div className="text-right text-sm min-w-0">
                    {c.render(row)}
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>
    </>
  );
}