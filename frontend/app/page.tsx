'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, auth, type Me } from '@/lib/api';
import PendingApproval from '@/components/PendingApproval';
import EmployeeScan from '@/components/EmployeeScan';
import AdminUsers from '@/components/AdminUsers';

export default function Home() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setErr(null);
    try {
      const fresh = await api.me();
      setMe(fresh);
      const session = auth.read();
      if (session) auth.save(session.token, fresh.role, fresh.phone);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('401')) {
        auth.clear();
        router.replace('/login');
        return;
      }
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!auth.read()) {
      router.replace('/login');
      return;
    }
    refresh();
  }, []);

  if (loading) {
    return (
      <div className="text-slate-400 text-sm">Loading session…</div>
    );
  }

  if (err) {
    return (
      <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
        {err}
      </div>
    );
  }

  if (!me) return null;

  if (me.role === null) return <PendingApproval onRefresh={refresh} />;
  if (me.role === 'EMPLOYEE') return <EmployeeScan me={me} />;
  if (me.role === 'ADMIN') return <AdminUsers me={me} />;

  return (
    <div className="text-slate-400 text-sm">
      Unknown role: <code>{String(me.role)}</code>
    </div>
  );
}
