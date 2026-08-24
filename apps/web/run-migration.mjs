import 'dotenv/config';
import { drizzleKit } from 'drizzle-kit';

await drizzleKit.push({
  dialect: 'turso',
  schema: './src/lib/db/schema.ts',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
  force: true,
});