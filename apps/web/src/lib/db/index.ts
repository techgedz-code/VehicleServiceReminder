import { createClient } from '@libsql/client';
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql';
import * as schema from './schema.js';

// Server-side only database client
function createDbClient(): LibSQLDatabase<typeof schema> {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  
  if (!url || !authToken) {
    throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set');
  }
  
  const client = createClient({
    url,
    authToken,
  });
  
  return drizzle(client, { schema });
}

// Lazy database instance - only creates real client when first accessed
let dbInstance: any = null;

function getDbInstance() {
  if (!dbInstance) {
    dbInstance = createDbClient();
  }
  return dbInstance;
}

// Lazy database proxy - only creates real instance when first accessed
export const db = new Proxy({} as any, {
  get(_, prop) {
    if (typeof window !== 'undefined') {
      throw new Error('Database client cannot be used client-side. Use in API routes only.');
    }
    const instance = getDbInstance();
    const value = instance[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  },
  
  has(_, prop) {
    if (typeof window !== 'undefined') {
      throw new Error('Database client cannot be used client-side.');
    }
    return prop in getDbInstance();
  },
  
  set(_, prop, value) {
    if (typeof window !== 'undefined') {
      throw new Error('Database client cannot be modified client-side.');
    }
    (getDbInstance() as any)[prop] = value;
    return true;
  },
  
  deleteProperty(_, prop) {
    if (typeof window !== 'undefined') {
      throw new Error('Database client cannot be modified client-side.');
    }
    return delete (getDbInstance() as any)[prop];
  },
  
  ownKeys() {
    if (typeof window !== 'undefined') {
      throw new Error('Database client cannot be used client-side.');
    }
    return Object.keys(getDbInstance());
  },
  
  getOwnPropertyDescriptor(_, prop) {
    if (typeof window !== 'undefined') {
      throw new Error('Database client cannot be used client-side.');
    }
    return Object.getOwnPropertyDescriptor(getDbInstance(), prop);
  },
  
  defineProperty(_, prop, descriptor) {
    if (typeof window !== 'undefined') {
      throw new Error('Database client cannot be modified client-side.');
    }
    Object.defineProperty(getDbInstance(), prop, descriptor);
    return true;
  },
});

// Export getter for explicit access
export function getDb() {
  if (typeof window !== 'undefined') {
    throw new Error('Database client cannot be used client-side. Use in API routes only.');
  }
  return getDbInstance();
}