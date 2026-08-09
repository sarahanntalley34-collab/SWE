import { useCallback, useEffect, useState } from 'react';
import { getUsers } from '../api/client';
import type { DashboardUser, Plan, UserStatus, UsersResponse } from '../types';

const PLAN_FILTERS: Array<Plan | ''> = ['', 'Starter', 'Pro', 'Enterprise'];
const STATUS_FILTERS: Array<UserStatus | ''> = ['', 'active', 'trialing', 'churned'];

const planBadge: Record<Plan, string> = {
  Starter: 'bg-gray-500/10 text-gray-300 ring-gray-500/20',
  Pro: 'bg-indigo-500/10 text-indigo-300 ring-indigo-500/20',
  Enterprise: 'bg-amber-500/10 text-amber-300 ring-amber-500/20',
};
const statusBadge: Record<UserStatus, string> = {
  active: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/20',
  trialing: 'bg-blue-500/10 text-blue-300 ring-blue-500/20',
  churned: 'bg-red-500/10 text-red-300 ring-red-500/20',
};
const statusLabel: Record<UserStatus, string> = {
  active: 'Active',
  trialing: 'Trialing',
  churned: 'Churned',
};

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function pageNumbers(current: number, total: number): Array<number | '…'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const wanted = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...wanted].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: Array<number | '…'> = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) out.push('…');
    out.push(p);
    prev = p;
  }
  return out;
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="border-t border-gray-800">
          {Array.from({ length: 6 }).map((__, j) => (
            <td key={j} className="px-4 py-3.5">
              <div className="h-4 bg-gray-800 rounded animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function UsersPage() {
  const [searchInput, setSearchInput] = useState('');
  const [plan, setPlan] = useState<Plan | ''>('');
  const [status, setStatus] = useState<UserStatus | ''>('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce the search box, then reset to page 1.
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
    }, 250);
    return () => clearTimeout(t);
  }, [searchInput, plan, status]);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    setError(null);
    getUsers({
      search: searchInput.trim() || undefined,
      plan: plan || undefined,
      status: status || undefined,
      page,
      limit: 20,
    })
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load users');
        setLoading(false);
      });
  }, [searchInput, plan, status, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const from = data && data.total > 0 ? (data.page - 1) * 20 + 1 : 0;
  const to = data ? Math.min(data.page * 20, data.total) : 0;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
          </svg>
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-colors"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={plan}
            onChange={(e) => setPlan(e.target.value as Plan | '')}
            aria-label="Filter by plan"
            className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-colors"
          >
            <option value="">All plans</option>
            {PLAN_FILTERS.filter((p) => p !== '').map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as UserStatus | '')}
            aria-label="Filter by status"
            className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-colors"
          >
            <option value="">All statuses</option>
            {STATUS_FILTERS.filter((s) => s !== '').map((s) => (
              <option key={s} value={s}>{statusLabel[s as UserStatus]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-gray-500 border-b border-gray-800">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">MRR</th>
                <th className="px-4 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {loading && <SkeletonRows />}
              {!loading && error && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center">
                    <p className="text-red-400 mb-3">{error}</p>
                    <button
                      onClick={fetchUsers}
                      className="px-4 py-2 rounded-lg bg-gray-800 text-gray-200 hover:bg-gray-700 transition-colors"
                    >
                      Retry
                    </button>
                  </td>
                </tr>
              )}
              {!loading && !error && data && data.users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                    No users match your filters.
                  </td>
                </tr>
              )}
              {!loading && !error && data?.users.map((u: DashboardUser) => (
                <tr key={u.id} className="border-t border-gray-800 hover:bg-gray-800/40 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-800 text-gray-300 text-xs font-semibold shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </span>
                      <span className="font-medium text-gray-200">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-gray-400">{u.email}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${planBadge[u.plan]}`}>
                      {u.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${statusBadge[u.status]}`}>
                      {statusLabel[u.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-medium text-gray-200">
                    ${u.mrr.toLocaleString('en-US')}
                  </td>
                  <td className="px-4 py-3.5 text-gray-400 whitespace-nowrap">{formatDate(u.joined)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && !error && data && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-800">
            <p className="text-xs text-gray-500">
              {data.total > 0
                ? `Showing ${from}–${to} of ${data.total} users`
                : 'No results'}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={data.page <= 1}
                className="px-3 py-1.5 rounded-lg text-sm bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              {pageNumbers(data.page, data.totalPages).map((p, i) =>
                p === '…' ? (
                  <span key={`e${i}`} className="px-2 text-gray-500 text-sm">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    aria-current={p === data.page ? 'page' : undefined}
                    className={`w-8 h-8 rounded-lg text-sm transition-colors ${
                      p === data.page
                        ? 'bg-emerald-600 text-white font-medium'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={data.page >= data.totalPages}
                className="px-3 py-1.5 rounded-lg text-sm bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
