// Client-side auth utilities - only for use in browser
// These call the API endpoints directly instead of using the server-side auth proxy

const API_BASE = '/api';

export async function getSession(): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/auth/session`, {
      credentials: 'include',
    });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export async function signUpEmail(data: { email: string; password: string; name: string }) {
  const response = await fetch(`${API_BASE}/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Registration failed');
  }
  return response.json();
}

export async function signInEmail(data: { email: string; password: string }) {
  const response = await fetch(`${API_BASE}/auth/sign-in/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Sign in failed');
  }
  return response.json();
}

export async function signInSocial(provider: string, callbackURL: string) {
  const response = await fetch(`${API_BASE}/auth/sign-in/social`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ provider, callbackURL }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Social sign in failed');
  }
  return response.json();
}

export async function signOut() {
  const response = await fetch(`${API_BASE}/auth/sign-out`, {
    method: 'POST',
    credentials: 'include',
  });
  return response.json();
}