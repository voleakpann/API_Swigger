'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/api';

export default function PendingApproval({
  onRefresh,
}: {
  onRefresh: () => Promise<void> | void;
}) {
  const [busy, setBusy] = useState(false);
  const session = auth.read();

  useEffect(() => {
    const id = setInterval(() => {
      onRefresh();
    }, 10_000);
    return () => clearInterval(id);
  }, [onRefresh]);

  async function check() {
    setBusy(true);
    try {
      await onRefresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⏳</span>
          <h1 className="text-xl font-semibold text-amber-200">
            Waiting for manager approval
          </h1>
        </div>
        <p className="text-sm text-amber-100/90">
          Your account{' '}
          <code className="text-amber-200">{session?.phone ?? ''}</code> has
          been registered, but no role has been assigned yet. An administrator
          needs to approve your access before you can use the app.
        </p>
        <p className="text-xs text-amber-200/70">
          This page checks your status automatically every 10 seconds.
        </p>
        <button
          onClick={check}
          disabled={busy}
          className="rounded-md bg-amber-500/20 hover:bg-amber-500/30 disabled:opacity-50 px-4 py-2 text-sm font-medium text-amber-100"
        >
          {busy ? 'Checking…' : 'Check now'}
        </button>
      </div>
    </div>
  );
}
