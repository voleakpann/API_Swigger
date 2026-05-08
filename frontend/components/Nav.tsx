'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/api';

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<ReturnType<typeof auth.read>>(null);

  useEffect(() => {
    setSession(auth.read());
    const onStorage = () => setSession(auth.read());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [pathname]);

  function logout() {
    auth.clear();
    setSession(null);
    router.replace('/login');
  }

  return (
    <header className="border-b border-white/10 bg-[#0b0d12]/80 backdrop-blur sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="text-white font-semibold">CRUD API</div>
        <div className="text-sm text-slate-400">
          {session ? (
            <div className="flex items-center gap-3">
              <span className="font-mono">{session.phone}</span>
              {session.role ? (
                <span
                  className={
                    'px-1.5 py-0.5 rounded text-xs ' +
                    (session.role === 'ADMIN'
                      ? 'bg-purple-500/15 text-purple-300'
                      : 'bg-emerald-500/15 text-emerald-300')
                  }
                >
                  {session.role}
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 text-xs">
                  pending
                </span>
              )}
              <button
                onClick={logout}
                className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-200 text-xs"
              >
                Logout
              </button>
            </div>
          ) : (
            <span className="text-slate-500">not signed in</span>
          )}
        </div>
      </div>
    </header>
  );
}
