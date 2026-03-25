// Payment App API is proxied through vite to localhost:6000
export const PAYMENT_API = '';          // empty → Vite proxy handles /api → localhost:6000
export const EXPENSE_TRACKER_URL = 'http://localhost:5000';

/** Read JWT token that was set by the Expense Tracker on login */
export function getToken(): string | null {
  return localStorage.getItem('token');
}

/** Decode the user object from the JWT payload (no verify, client-side only) */
export function getUser(): { id: string; firstName?: string; lastName?: string; email?: string } | null {
  const raw = localStorage.getItem('user');
  if (raw) {
    try { return JSON.parse(raw); } catch { /* fall through */ }
  }
  // Fallback: parse token
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { id: payload.id || payload.userId || payload._id, ...payload };
  } catch {
    return null;
  }
}
