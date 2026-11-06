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
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="divide-y divide-slate-100">
          {Array.from({ length: skeletonRows }).map((_, i) => (
            <div key={i} className="p-3 flex gap-4">
              {columns.map((c) => (
                <div
                  key={c.key}
                  className="h-4 bg-slate-100 rounded animate-pulse flex-1"
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
      <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
        {empty ?? <div className="text-sm text-slate-500">No rows</div>}
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden sm:block bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={`px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 ${
                    c.align === "right" ? "text-right" : "text-left"
                  } ${c.className || ""}`}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr
                key={keyFn(row)}
                className="hover:bg-slate-50/60 transition-colors"
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={`px-3 py-3 ${
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
      <div className="sm:hidden space-y-2">
        {rows.map((row) => (
          <div
            key={keyFn(row)}
            className="bg-white border border-slate-200 rounded-lg p-3 space-y-1.5"
          >
            {columns
              .filter((c) => !c.hideOnMobile)
              .map((c) => (
                <div
                  key={c.key}
                  className="flex justify-between gap-3 items-center"
                >
                  <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500 shrink-0">
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