import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    accountId: process.env.TURSO_ACCOUNT_ID!,
    databaseId: process.env.TURSO_DATABASE_NAME!,
    token: process.env.TURSO_AUTH_TOKEN!,
  },
});