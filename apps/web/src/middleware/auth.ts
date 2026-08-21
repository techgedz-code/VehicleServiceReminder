import { auth } from '@/lib/auth';
import type { Context, Next } from 'hono';

type User = { id: string; email: string; name: string };

export async function authMiddleware(c: Context, next: Next) {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  c.set('user', session.user as User);
  c.set('session', session.session);
  await next();
}

export async function optionalAuthMiddleware(c: Context, next: Next) {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (session) {
    c.set('user', session.user as User);
    c.set('session', session.session);
  }
  await next();
}