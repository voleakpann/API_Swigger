'use client';

import { useEffect, useState } from 'react';
import { api, type Me, type Role, type UserView } from '@/lib/api';

const ROLE_OPTIONS: Role[] = [null, 'EMPLOYEE', 'ADMIN'];

export default function AdminUsers({ me }: { me: Me }) {
  const [users, setUsers] = useState<UserView[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);

  async function refresh() {
    setErr(null);
    try {
      setUsers(await api.listUsers());
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function changeRole(u: UserView, role: Role) {
    if (u.id === me.id) {
      if (!confirm('Change your own role? You may lose access.')) return;
    }
    setPendingId(u.id);
    setErr(null);
    setInfo(null);
    try {
      const updated = await api.setRole(u.id, role);
      setUsers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      setInfo(
        `Updated ${updated.phone} → ${updated.role ?? 'pending'}`,
      );
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        <p className="text-sm text-slate-400 mt-1">
          Signed in as{' '}
          <code className="text-slate-300">{me.phone}</code>
          <span className="ml-2 px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300 text-xs">
            ADMIN
          </span>
        </p>
      </section>

      {info && (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {info}
        </div>
      )}
      {err && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {err}
        </div>
      )}

      <section className="rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.04] text-slate-400 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-2 w-16">ID</th>
              <th className="text-left px-4 py-2">Phone</th>
              <th className="text-left px-4 py-2 w-32">Current role</th>
              <th className="text-left px-4 py-2">Set role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                  No users.
                </td>
              </tr>
            )}
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-slate-400">{u.id}</td>
                <td className="px-4 py-3 text-white font-mono">{u.phone}</td>
                <td className="px-4 py-3">
                  <RoleBadge role={u.role} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {ROLE_OPTIONS.map((r) => {
                      const isCurrent = u.role === r;
                      const disabled = pendingId === u.id || isCurrent;
                      return (
                        <button
                          key={String(r)}
                          onClick={() => changeRole(u, r)}
                          disabled={disabled}
                          className={
                            'px-2 py-1 rounded text-xs transition ' +
                            (isCurrent
                              ? 'bg-white/10 text-slate-400 cursor-default'
                              : 'bg-white/5 hover:bg-white/15 text-slate-200')
                          }
                        >
                          {pendingId === u.id ? '…' : r ?? 'pending'}
                        </button>
                      );
                    })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function RoleBadge({ role }: { role: Role }) {
  if (role === 'ADMIN')
    return (
      <span className="px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300 text-xs">
        ADMIN
      </span>
    );
  if (role === 'EMPLOYEE')
    return (
      <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-xs">
        EMPLOYEE
      </span>
    );
  return (
    <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 text-xs">
      pending
    </span>
  );
}
