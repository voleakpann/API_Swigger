'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ConfirmationResult } from 'firebase/auth';
import { api, auth } from '@/lib/api';
import {
  normalizeCambodiaPhone,
  resetRecaptcha,
  sendPhoneOtp,
} from '@/lib/firebase';

const RECAPTCHA_CONTAINER_ID = 'firebase-recaptcha-container';

export default function LoginPage() {
  const router = useRouter();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(
    null,
  );
  const [info, setInfo] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [session, setSession] = useState<ReturnType<typeof auth.read>>(null);

  useEffect(() => {
    setSession(auth.read());
    return () => resetRecaptcha();
  }, []);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setInfo(null);
    try {
      const phoneE164 = normalizeCambodiaPhone(phone.trim());
      const result = await sendPhoneOtp(phoneE164, RECAPTCHA_CONTAINER_ID);
      setConfirmation(result);
      setInfo(`OTP sent to ${phoneE164}`);
      setStep('otp');
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
      resetRecaptcha();
    } finally {
      setBusy(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setInfo(null);
    try {
      if (!confirmation) {
        setErr('Send OTP first');
        return;
      }
      const cred = await confirmation.confirm(otp.trim());
      const idToken = await cred.user.getIdToken();

      const r = await api.verifyOtp(idToken);
      if (!r.ok || !r.token) {
        setErr(r.message || 'Verification failed');
        return;
      }
      auth.save(r.token, r.role, r.phone);
      setSession(auth.read());
      setInfo('Login successful — redirecting…');
      setTimeout(() => router.push('/'), 400);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    auth.clear();
    setSession(null);
    setStep('phone');
    setPhone('');
    setOtp('');
    setConfirmation(null);
    setInfo(null);
    resetRecaptcha();
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <section>
        <h1 className="text-2xl font-bold text-white">OTP Login</h1>
        <p className="text-sm text-slate-400 mt-1">
          Cambodia (+855) numbers are auto-normalized. SMS is sent by Firebase.
        </p>
      </section>

      {session ? (
        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
          <div className="text-white">
            Signed in as <span className="font-mono">{session.phone}</span>
            {session.role && (
              <span className="ml-2 px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-xs">
                {session.role}
              </span>
            )}
          </div>
          <details className="text-xs text-slate-400">
            <summary className="cursor-pointer">Token</summary>
            <pre className="mt-2 break-all whitespace-pre-wrap bg-black/30 p-2 rounded text-slate-300">
              {session.token}
            </pre>
          </details>
          <button
            onClick={logout}
            className="rounded-md bg-white/5 hover:bg-white/10 px-4 py-2 text-sm text-slate-200"
          >
            Logout
          </button>
        </section>
      ) : step === 'phone' ? (
        <form
          onSubmit={send}
          className="rounded-xl border border-white/10 bg-white/[0.03] p-5 space-y-4"
        >
          <label className="block">
            <span className="text-sm text-slate-300">Phone number</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="012345678 or +85512345678"
              className="mt-1 w-full rounded-md bg-black/30 border border-white/10 px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
              required
              minLength={6}
              maxLength={20}
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/40 px-4 py-2 font-medium text-black"
          >
            {busy ? 'Sending…' : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form
          onSubmit={verify}
          className="rounded-xl border border-white/10 bg-white/[0.03] p-5 space-y-4"
        >
          <div className="text-sm text-slate-400">
            OTP sent to <span className="text-white">{phone}</span>
          </div>
          <label className="block">
            <span className="text-sm text-slate-300">6-digit code</span>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              placeholder="000000"
              className="mt-1 w-full rounded-md bg-black/30 border border-white/10 px-3 py-2 text-white tracking-[0.4em] text-center font-mono focus:outline-none focus:border-emerald-500/50"
              required
            />
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setStep('phone');
                setConfirmation(null);
                resetRecaptcha();
              }}
              className="rounded-md bg-white/5 hover:bg-white/10 px-4 py-2 text-sm text-slate-200"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex-1 rounded-md bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/40 px-4 py-2 font-medium text-black"
            >
              {busy ? 'Verifying…' : 'Verify'}
            </button>
          </div>
        </form>
      )}

      <div id={RECAPTCHA_CONTAINER_ID} />

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
    </div>
  );
}
