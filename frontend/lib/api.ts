const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8081';

export type Item = {
  id: number;
  name: string;
  description: string | null;
  price: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type Role = 'ADMIN' | 'EMPLOYEE' | null;

export type Me = {
  id: number;
  phone: string;
  role: Role;
};

export type UserView = {
  id: number;
  phone: string;
  role: Role;
};

export type Scan = {
  id: number;
  userId: number;
  type: 'IN' | 'OUT';
  createdAt: string;
};

function authHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  // --- Auth (Firebase ID token → server session token) ---
  verifyOtp: (idToken: string) =>
    fetch(`${BASE}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    }).then(async (res) => {
      const body = await res.json();
      return { ok: res.ok, ...body } as {
        ok: boolean;
        phone: string;
        role: Role;
        token: string | null;
        message: string;
      };
    }),
  me: () =>
    fetch(`${BASE}/api/auth/me`, { headers: authHeaders() }).then(handle<Me>),

  // --- Users (admin) ---
  listUsers: () =>
    fetch(`${BASE}/api/users`, { headers: authHeaders() }).then(
      handle<UserView[]>,
    ),
  setRole: (id: number, role: Role) =>
    fetch(`${BASE}/api/users/${id}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ role }),
    }).then(handle<UserView>),

  // --- Scans (employee/admin) ---
  scan: (type: 'IN' | 'OUT') =>
    fetch(`${BASE}/api/scans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ type }),
    }).then(handle<Scan>),
  myScans: () =>
    fetch(`${BASE}/api/scans/me`, { headers: authHeaders() }).then(
      handle<Scan[]>,
    ),

  // --- Items (kept for the debug /items page) ---
  listItems: () => fetch(`${BASE}/api/items`).then(handle<Item[]>),
  createItem: (body: { name: string; description?: string; price?: string }) =>
    fetch(`${BASE}/api/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(handle<Item>),
  deleteItem: (id: number) =>
    fetch(`${BASE}/api/items/${id}`, { method: 'DELETE' }).then(
      handle<{ message: string }>,
    ),
};

export const auth = {
  save: (token: string, role: Role, phone: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('token', token);
    localStorage.setItem('phone', phone);
    if (role) localStorage.setItem('role', role);
    else localStorage.removeItem('role');
  },
  clear: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
    localStorage.removeItem('phone');
    localStorage.removeItem('role');
  },
  read: () => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('token');
    if (!token) return null;
    return {
      token,
      phone: localStorage.getItem('phone') ?? '',
      role: (localStorage.getItem('role') as Role) ?? null,
    };
  },
};
