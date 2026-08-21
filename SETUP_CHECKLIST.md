# Service Setup Checklist — What You Need to Provide

---

## 🟢 You Create (I'll guide you) — **Required for MVP**

### 1. **Turso Database** (Free, 2 min)
- Go to [turso.tech](https://turso.tech) → Sign up (GitHub/Email)
- Create database: `servicemate` (or your preferred name)
- **Give me:**
  - `TURSO_DATABASE_URL` (e.g., `libsql://servicemate-xxx.turso.io`)
  - `TURSO_AUTH_TOKEN` (Generate in database settings → "Auth Token")

### 2. **Resend** (Free 3k emails/mo, 3 min)
- Go to [resend.com](https://resend.com) → Sign up
- **Domain:** Add your domain (e.g., `servicemate.my`) → verify DNS
  - *Or use `onboarding@resend.dev` for testing (no domain needed)*
- Create API Key: `re_xxx`
- **Give me:** `RESEND_API_KEY`
- **Optional:** Verify a sender email (e.g., `noreply@servicemate.my`)

### 3. **Google OAuth** (Free, 5 min)
- Go to [Google Cloud Console](https://console.cloud.google.com)
- Create project → "APIs & Services" → "Credentials"
- **OAuth Consent Screen:** External, add scopes: `email`, `profile`
- **Create Credentials** → OAuth Client ID → Web Application
- **Authorized Redirect URIs:**
  - `http://localhost:5173/api/auth/callback/google` (dev)
  - `https://app.servicemate.my/api/auth/callback/google` (prod)
- **Give me:** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

### 4. **ToyyibPay** (Free setup, Malaysia, 10 min)
- Go to [toyyibpay.com](https://toyyibpay.com) → Register as Merchant
- Complete KYC (MyKad, bank account) — required for live
- **Create Category:** "ServiceMate Credits" → note `category_id`
- **Get API Key:** Profile → API Key
- **Callback URL:** `https://app.servicemate.my/api/webhooks/payment`
- **Give me:** `TOYYIBPAY_API_KEY`, `TOYYIBPAY_CATEGORY_ID`
- *Sandbox available for testing*

### 5. **Vercel** (Free, 2 min)
- Go to [vercel.com](https://vercel.com) → Sign up (GitHub)
- Import this repo when ready
- **Give me:** Nothing needed now — I'll push to GitHub, you import

---

## 🟡 You Create Later — **Can Use Placeholders for Now**

### 6. **Custom Domain** (Optional, ~RM50/yr)
- Buy `servicemate.my` (or your choice) on Namecheap/Cloudflare/Exabytes
- Add to Vercel → auto HTTPS
- Update Resend + Google OAuth + ToyyibPay callbacks

### 7. **Analytics** (Optional)
- Vercel Analytics (auto-enabled on deploy)
- Google Analytics / Plausible / Umami — add later

---

## 🔵 I Handle Completely — **Zero Action Needed**

| Service | What I Do |
|---------|-----------|
| **GitHub Repo** | Create, push code, CI/CD |
| **Vercel Deploy** | Connect repo, env vars, deploy |
| **Database Schema** | Drizzle migrations → run on Turso |
| **PWA Config** | Manifest, Service Worker, Icons |
| **All Code** | Frontend + API + Auth + Payments |

---

## 📋 Your Action Items (Do in Parallel)

| # | Service | Time | Status |
|---|---------|------|--------|
| 1 | Turso DB + token | 2 min | ⬜ |
| 2 | Resend API key | 3 min | ⬜ |
| 3 | Google OAuth credentials | 5 min | ⬜ |
| 4 | ToyyibPay merchant + API | 10 min | ⬜ |
| 5 | Vercel account | 2 min | ⬜ |

**Total: ~22 minutes**

---

## 🚀 While You Set Those Up, I'll:

1. **Initialize repo** with React + Vite + TypeScript + Tailwind
2. **Configure Drizzle** + Turso connection + run migrations
3. **Set up Better Auth** (email/password + Google)
4. **Build API routes** (auth, workshop, public)
5. **Create Dashboard layout** + components
6. **Deploy to Vercel** (you just import + add env vars)

---

## 📦 Format to Give Me (Copy-Paste Ready)

```env
# Turso
TURSO_DATABASE_URL=libsql://your-db-xxx.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJ...

# Resend
RESEND_API_KEY=re_xxx
EMAIL_FROM=ServiceMate <noreply@yourdomain.my>

# Google OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx

# ToyyibPay
TOYYIBPAY_API_KEY=xxx
TOYYIBPAY_CATEGORY_ID=xxx
TOYYIBPAY_CALLBACK_URL=https://app.servicemate.my/api/webhooks/payment

# App (I'll generate)
BETTER_AUTH_SECRET=xxx
BETTER_AUTH_URL=https://app.servicemate.my
VITE_APP_URL=https://app.servicemate.my
VITE_APP_NAME=ServiceMate
```

---

## ⚡ Quick Start Option

**If you want to start coding NOW** without waiting for external services:

1. **Turso** — Create now (2 min), give me credentials
2. **Others** — I'll use **mock/placeholder** values for:
   - Resend → log emails to console
   - Google OAuth → skip / use email-only for now
   - ToyyibPay → mock payment flow, add real later
3. **Vercel** — Deploy when ready

**Your call:** Wait for all 4, or start with just Turso?

---

## 🎯 My Recommendation

**Start with Turso only** — I can build 80% of the app (schema, auth UI, dashboard, PWA, QR, calendar, analytics) with a local/dev database. Add Resend/Google/ToyyibPay when you're ready.

**Reply with:**
- "Start with Turso only" → Give me Turso creds, I begin
- "I'll set up all 4" → I'll wait for your .env file
- "Here's my .env" → Paste the filled template above