import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type Auth,
  type ConfirmationResult,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ??
    'AIzaSyCgKvIEfpo2XGMC6OPcQHR4wheM0eIkF2A',
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ??
    'crud-api-otp.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'crud-api-otp',
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ??
    'crud-api-otp.firebasestorage.app',
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '1064538601960',
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ??
    '1:1064538601960:web:1842807c4701d6530f0c5d',
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? 'G-4CGM9SLD4Z',
};

export const firebaseApp: FirebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

export function firebaseAuth(): Auth {
  return getAuth(firebaseApp);
}

export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === 'undefined') return null;
  if (!(await isSupported())) return null;
  return getAnalytics(firebaseApp);
}

let recaptcha: RecaptchaVerifier | null = null;

export function getRecaptcha(containerId: string): RecaptchaVerifier {
  if (recaptcha) return recaptcha;
  recaptcha = new RecaptchaVerifier(firebaseAuth(), containerId, {
    size: 'invisible',
  });
  return recaptcha;
}

export function resetRecaptcha(): void {
  if (recaptcha) {
    recaptcha.clear();
    recaptcha = null;
  }
}

export async function sendPhoneOtp(
  phoneE164: string,
  recaptchaContainerId: string,
): Promise<ConfirmationResult> {
  const verifier = getRecaptcha(recaptchaContainerId);
  return signInWithPhoneNumber(firebaseAuth(), phoneE164, verifier);
}

export function normalizeCambodiaPhone(raw: string): string {
  const digits = raw.replace(/[\s\-()]/g, '').trim();
  if (digits.startsWith('+')) return digits;
  if (digits.startsWith('855')) return '+' + digits;
  if (digits.startsWith('0')) return '+855' + digits.substring(1);
  return '+855' + digits;
}
