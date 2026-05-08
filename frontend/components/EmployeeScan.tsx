'use client';

import { useEffect, useState } from 'react';
import { api, type Me, type Scan } from '@/lib/api';

export default function EmployeeScan({ me }: { me: Me }) {
  const [scans, setScans] = useState<Scan[]>([]);
  const [busy, setBusy] = useState<'IN' | 'OUT' | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function refresh() {
    setErr(null);
    try {
      setScans(await api.myScans());
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function doScan(type: 'IN' | 'OUT') {
    setBusy(type);
    setErr(null);
    setInfo(null);
    try {
      const scan = await api.scan(type);
      setInfo(
        `Scan ${type} recorded at ${new Date(scan.createdAt).toLocaleTimeString()}`,
      );
      await refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  const lastType = scans[0]?.type ?? null;

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-bold text-white">Welcome, {me.phone}</h1>
        <p className="text-sm text-slate-400 mt-1">
          Role:{' '}
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-xs">
            EMPLOYEE
          </span>
          {lastType && (
            <span className="ml-3 text-slate-500">
              Last action: {lastType}
            </span>
          )}
        </p>
      </section>

      <section className="grid sm:grid-cols-2 gap-4">
        <button
          onClick={() => doScan('IN')}
          disabled={busy !== null}
          className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 disabled:opacity-50 px-6 py-10 text-emerald-200"
        >
          <div className="text-3xl">→</div>
          <div className="mt-2 text-lg font-semibold">
            {busy === 'IN' ? 'Recording…' : 'Scan In'}
          </div>
          <div className="text-xs text-emerald-300/70">Start of shift</div>
        </button>
        <button
          onClick={() => doScan('OUT')}
          disabled={busy !== null}
          className="rounded-2xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 disabled:opacity-50 px-6 py-10 text-rose-200"
        >
          <div className="text-3xl">←</div>
          <div className="mt-2 text-lg font-semibold">
            {busy === 'OUT' ? 'Recording…' : 'Scan Out'}
          </div>
          <div className="text-xs text-rose-300/70">End of shift</div>
        </button>
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

      <section>
        <h2 className="text-white font-semibold mb-3">Recent activity</h2>
        <div className="rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.04] text-slate-400 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-2">When</th>
                <th className="text-left px-4 py-2 w-24">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {scans.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-4 py-6 text-center text-slate-500">
                    No scans yet — press Scan In to start.
                  </td>
                </tr>
              )}
              {scans.map((s) => (
                <tr key={s.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-slate-300">
                    {new Date(s.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        s.type === 'IN'
                          ? 'px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-xs'
                          : 'px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 text-xs'
                      }
                    >
                      {s.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
