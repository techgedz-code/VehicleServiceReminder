import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { workshops } from '../db/schema';

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://web-theta-rose-i6mx8yc4e1.vercel.app',
  'https://web-3fv4gw5h9-techgedz-codes-projects.vercel.app',
  'https://web-r5uc8c8a6-techgedz-codes-projects.vercel.app',
  'https://app.servicemate.my',
];

// Lazy auth instance - only creates when first accessed
let authInstance: any = null;

async function createAuth() {
  // Dynamic import to ensure db is only accessed server-side
  const { db } = await import('../db');
  
  return betterAuth({
    database: drizzleAdapter(db, {
      provider: 'sqlite',
      schema: {
        user: workshops,
        session: { modelName: 'sessions' },
        account: { modelName: 'accounts' },
        verification: { modelName: 'verifications' },
      },
    }),
    // Cookie configuration for Vercel
    cookieOptions: {
      domain: process.env.VERCEL_URL ? undefined : 'localhost',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      path: '/',
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      sendResetPassword: async ({ user, url, token }) => {
        await sendEmail({
          to: user.email,
          subject: 'Reset your ServiceMate password',
          html: `
            <p>Hi ${user.name},</p>
            <p>You requested to reset your password. Click the link below:</p>
            <p><a href="${url}">${url}</a></p>
            <p>This link expires in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
          `,
        });
      },
    },
    emailVerification: {
      sendVerificationEmail: async ({ user, url, token }) => {
        await sendEmail({
          to: user.email,
          subject: 'Verify your ServiceMate account',
          html: `
            <p>Hi ${user.name},</p>
            <p>Welcome to ServiceMate! Please verify your email address by clicking the link below:</p>
            <p><a href="${url}">${url}</a></p>
            <p>This link expires in 24 hours.</p>
          `,
        });
      },
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24,
    },
    user: {
      model: 'workshops',
      fields: {
        email: 'email',
        password: 'passwordHash',
        googleId: 'googleId',
        name: 'name',
      },
    },
    trustedOrigins: ALLOWED_ORIGINS,
  });
}

// Email sending function using Resend
async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'ServiceMate <noreply@voucheers.biz>';
  
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set, skipping email send');
    return;
  }
  
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to send email:', error);
    }
  } catch (error) {
    console.error('Email send error:', error);
  }
}

// Lazy auth getter - only creates instance when first accessed
async function getAuth() {
  if (!authInstance) {
    // Prevent client-side access
    if (typeof window !== 'undefined') {
      throw new Error('Auth instance cannot be created client-side. Use in API routes only.');
    }
    authInstance = await createAuth();
  }
  return authInstance;
}

// Lazy auth proxy - only creates instance when first accessed
export const auth = new Proxy({} as any, {
  get(_, prop) {
    if (typeof window !== 'undefined') {
      throw new Error('Auth instance cannot be accessed client-side. Use in API routes only.');
    }
    if (!authInstance) {
      // Trigger async initialization
      getAuth();
    }
    const instance = authInstance;
    if (!instance) {
      return () => { throw new Error('Auth not initialized'); };
    }
    const value = instance[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  },
  
  has(_, prop) {
    if (typeof window !== 'undefined') {
      throw new Error('Auth instance cannot be accessed client-side.');
    }
    return authInstance ? prop in authInstance : true;
  },
  
  set(_, prop, value) {
    if (typeof window !== 'undefined') {
      throw new Error('Auth instance cannot be modified client-side.');
    }
    if (authInstance) {
      (authInstance as any)[prop] = value;
    }
    return true;
  },
  
  deleteProperty(_, prop) {
    if (typeof window !== 'undefined') {
      throw new Error('Auth instance cannot be modified client-side.');
    }
    return authInstance ? delete (authInstance as any)[prop] : true;
  },
  
  ownKeys() {
    if (typeof window !== 'undefined') {
      throw new Error('Auth instance cannot be accessed client-side.');
    }
    return authInstance ? Object.keys(authInstance) : [];
  },
  
  getOwnPropertyDescriptor(_, prop) {
    if (typeof window !== 'undefined') {
      throw new Error('Auth instance cannot be accessed client-side.');
    }
    return authInstance ? Object.getOwnPropertyDescriptor(authInstance, prop) : undefined;
  },
  
  defineProperty(_, prop, descriptor) {
    if (typeof window !== 'undefined') {
      throw new Error('Auth instance cannot be modified client-side.');
    }
    if (authInstance) {
      Object.defineProperty(authInstance, prop, descriptor);
    }
    return true;
  },
});

// Export getter for explicit access
export async function getAuthInstance() {
  if (typeof window !== 'undefined') {
    throw new Error('Auth instance cannot be created client-side. Use in API routes only.');
  }
  return await getAuth();
}

export type Session = any;
export type User = any;