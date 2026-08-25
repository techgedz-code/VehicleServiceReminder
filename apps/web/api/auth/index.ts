import { Hono } from 'hono';
import { auth } from '@/lib/auth';

const app = new Hono();

// Handle all Better Auth routes: /api/auth/*
app.on(['GET', 'POST'], '/*', async (c) => {
  return auth.handler(c.req.raw);
});

// Vercel Edge Functions require a default export of the handler
export default app.fetch.bind(app);