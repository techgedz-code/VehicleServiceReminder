import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { auth } from '../auth';

export const createApi = () => {
  const app = new Hono();

  app.use('*', cors({
    origin: ['http://localhost:5173', 'https://app.servicemate.my'],
    credentials: true,
  }));

  // Auth routes handled by Better Auth
  app.on(['GET', 'POST'], '/api/auth/*', async (c) => {
    return auth.handler(c.req.raw);
  });

  return app;
};