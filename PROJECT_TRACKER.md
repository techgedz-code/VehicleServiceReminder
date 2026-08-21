# Vehicle Service Reminder PWA - Project Tracker

**Last Updated:** 2026-08-21 17:46:00 +08:00
**Project Path:** `D:\Goose Projects\Nemotron 3 Ultra\Projects\Vehicle Service Remider`
**App Name:** ServiceMate

---

## 📋 Project Overview

**ServiceMate** - A digital vehicle service reminder PWA for Malaysian workshops.

### Core Concept
- Workshops create service records (plate number, service type, oil used, mileage, next due date/mileage)
- Generates unique QR code per service record
- Customers scan QR → opens PWA in browser (no app store install needed)
- One-tap "Add to Calendar" downloads `.ics` with 1-week reminder
- PWA installs to home screen, works offline
- SaaS model: RM100 = 500 credits (RM0.20/record), 5 free trial credits

### Target Users
- **Workshops** (Malaysia): Single cashier account per workshop
- **Vehicle Owners**: Scan QR, save record, get calendar reminders

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19 + TypeScript + Vite |
| **Styling** | Tailwind CSS v4 + Radix UI primitives |
| **Routing** | React Router v7 |
| **State/Data** | TanStack Query v5 |
| **Database** | Turso (libSQL) + Drizzle ORM |
| **Auth** | Better Auth (email/password + Google OAuth) |
| **Payments** | ToyyibPay (FPX, cards, QRPay - Malaysia) |
| **Email** | Resend (transactional) |
| **Hosting** | Vercel (Edge Functions via Hono) |
| **PWA** | Workbox (vite-plugin-pwa) |
| **Charts** | Recharts |

---

## 📁 Project Structure

```
Vehicle Service Remider/
├── apps/web/                    # Main React application
│   ├── src/
│   │   ├── api/                 # Hono API routes (Vercel Edge)
│   │   │   ├── auth/[...path].ts      # Better Auth endpoints
│   │   │   ├── workshop/index.ts      # Protected workshop APIs
│   │   │   ├── public/service/[qrToken].ts  # Public service view
│   │   │   └── public/calendar/[qrToken].ts # .ics calendar download
│   │   ├── components/
│   │   │   ├── ui/              # Reusable UI components (Button, Input, Card, Table, etc.)
│   │   │   ├── layout/          # Sidebar, Header, DashboardLayout
│   │   │   └── auth/            # ProtectedRoute, PublicRoute
│   │   ├── lib/
│   │   │   ├── auth/            # Better Auth config
│   │   │   ├── db/              # Drizzle schema, queries, client
│   │   │   ├── qr.ts            # QR code generation
│   │   │   └── utils.ts         # Formatters, helpers
│   │   ├── pages/
│   │   │   ├── marketing/       # LandingPage
│   │   │   ├── auth/            # Login, Signup, VerifyEmail
│   │   │   ├── dashboard/       # Dashboard, Customers, Services, Due, Analytics, Credits, Settings
│   │   │   └── public/          # ServiceViewPage, OfflinePage
│   │   ├── hooks/               # useToast
│   │   ├── App.tsx              # Routes + providers
│   │   └── main.tsx             # Entry point + SW registration
│   ├── public/
│   │   ├── manifest.webmanifest # PWA manifest
│   │   └── icons/               # PWA icons (need to generate)
│   ├── drizzle.config.ts        # Drizzle config (Turso)
│   ├── vercel.json              # Vercel config (rewrites, headers, crons)
│   ├── vite.config.ts           # Vite + PWA + Tailwind config
│   ├── tsconfig.json            # TypeScript config
│   └── package.json
├── SPEC.md                      # Full product specification
├── SETUP_CHECKLIST.md           # External services setup guide
└── PROJECT_TRACKER.md           # This file
```

---

## ✅ Implementation Status

### Phase 1: Foundation - **COMPLETE**
- [x] React + Vite + TypeScript + Tailwind initialized
- [x] Drizzle ORM + Turso connection configured
- [x] Database schema: workshops, vehicles, service_records, credits_ledger, payments
- [x] Better Auth (email/password + Google OAuth structure)
- [x] Hono API route structure on Vercel Edge
- [x] All UI components (Button, Input, Card, Table, Modal, Badge, Select, Toast, Dialog, etc.)
- [x] Dashboard layout with collapsible sidebar
- [x] PWA config (manifest, service worker via Workbox)
- [x] Build successful (1.7MB gzipped)

### Phase 2: Workshop Dashboard - **COMPLETE**
- [x] Auth pages: Login, Signup, Verify Email
- [x] Dashboard overview with stats cards
- [x] Customers page: CRUD + search/filter + dialog forms
- [x] Services page: CRUD + QR code generation/download
- [x] Upcoming Due page: filterable by date/mileage
- [x] Analytics page: Recharts (monthly volume, service types, retention)
- [x] Credits page: balance, ledger, top-up flow (ToyyibPay structure)
- [x] Settings page: profile, password, danger zone
- [x] CSV export endpoint

### Phase 3: Customer PWA - **COMPLETE**
- [x] `/service/:qrToken` public page
- [x] `.ics` calendar file generation (with VALARM for 1-week reminder)
- [x] PWA manifest + Service Worker (Workbox)
- [x] Install prompt (beforeinstallprompt)
- [x] Offline caching (service records in localStorage)
- [x] Save to phone for offline access
- [x] Offline page with cached records

### Phase 4: Payments & Credits - **STRUCTURE READY**
- [x] ToyyibPay API integration structure
- [x] Credits ledger (trial, purchase, usage, refund)
- [x] Top-up flow UI
- [x] Payment webhook handler structure
- ⚠️ **Needs:** Actual ToyyibPay credentials + webhook testing

### Phase 5: Analytics & Export - **COMPLETE**
- [x] Dashboard analytics charts
- [x] CSV export (customers + service history)
- [x] Upcoming due services view

### Phase 6: Landing Page & Polish - **COMPLETE**
- [x] Marketing landing page with pricing
- [x] SEO meta tags + Open Graph + Twitter cards
- [x] PWA icons structure (need actual PNG generation)
- [x] Build tested and successful

---

## 🔑 Environment Variables Needed

Create `.env.local` in `apps/web/` or add to Vercel:

```bash
# App
VITE_APP_URL=https://app.servicemate.my
VITE_APP_NAME=ServiceMate

# Turso Database (create at https://app.turso.tech)
TURSO_DATABASE_URL=libsql://vehicleservicereminder-xxx.turso.io
TURSO_AUTH_TOKEN=your-auth-token

# Better Auth
BETTER_AUTH_SECRET=generate-with: openssl rand -base64 32
BETTER_AUTH_URL=https://app.servicemate.my

# Google OAuth (https://console.cloud.google.com/apis/credentials)
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx

# Resend Email (https://resend.com)
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=ServiceMate <noreply@yourdomain.my>

# ToyyibPay (https://toyyibpay.com/access/login)
TOYYIBPAY_API_KEY=your-api-key
TOYYIBPAY_CATEGORY_ID=123
TOYYIBPAY_CALLBACK_URL=https://app.servicemate.my/api/webhooks/payment
```

---

## 🚀 Next Steps for Deployment

### 1. Collect External Service Credentials
| Service | URL | What to Get |
|---------|-----|-------------|
| **Turso** | https://app.turso.tech/databases/vehicleservicereminder | Database URL + Auth Token |
| **Google Cloud** | https://console.cloud.google.com/apis/credentials | OAuth Client ID + Secret |
| **ToyyibPay** | https://toyyibpay.com/access/login | API Key + Category ID |
| **Resend** | https://resend.com | API Key + verify domain |
| **Vercel** | https://vercel.com/new | Account ready |

### 2. Push to GitHub
```bash
cd "D:\Goose Projects\Nemotron 3 Ultra\Projects\Vehicle Service Remider\apps\web"
git init
git add .
git commit -m "Initial commit: ServiceMate PWA"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/vehicle-service-reminder.git
git push -u origin main
```

### 3. Deploy to Vercel
1. Go to https://vercel.com/new
2. Import the GitHub repo
3. Framework: Vite (auto-detected)
4. Add all environment variables from above
5. Deploy

### 4. Run Migrations
```bash
cd apps/web
npm run db:push
```

### 5. Configure Google OAuth Redirects
Add to authorized redirect URIs:
- `http://localhost:5173/api/auth/callback/google` (dev)
- `https://app.servicemate.my/api/auth/callback/google` (prod)

### 6. Configure ToyyibPay
- Set callback URL: `https://app.servicemate.my/api/webhooks/payment`
- Test payment flow

---

## 📝 Key Files for Reference

| File | Purpose |
|------|---------|
| `SPEC.md` | Complete product specification |
| `SETUP_CHECKLIST.md` | Step-by-step external services setup |
| `apps/web/drizzle.config.ts` | Database migration config |
| `apps/web/vercel.json` | Vercel deployment config |
| `apps/web/src/lib/db/schema.ts` | Database schema |
| `apps/web/src/lib/auth/index.ts` | Auth configuration |
| `apps/web/src/api/workshop/index.ts` | Workshop API endpoints |

---

## ⚠️ Known Issues / TODOs

1. **PWA Icons** - Need to generate actual PNG icons from the SVG in `public/icons/icon.svg`
2. **ToyyibPay Webhook** - Needs live testing with real credentials
3. **Email Templates** - Resend templates for verification/reset emails
4. **Production Domain** - Update `VITE_APP_URL` and OAuth redirects for custom domain
5. **Rate Limiting** - Consider adding to API routes
6. **Error Tracking** - Add Sentry or similar

---

## 🎯 Session Handoff Notes

**Current State:** All code written and building successfully. Ready for external service configuration and deployment.

**What the next session should do:**
1. Help user collect the 5 sets of API credentials
2. Push code to GitHub
3. Deploy to Vercel with environment variables
4. Run Drizzle migrations on Turso
5. Test full flow: Workshop signup → create service → QR scan → calendar download

**Commands to run after deployment:**
```bash
# In apps/web directory
npm run db:push        # Run migrations
npm run db:studio      # Optional: Open Drizzle Studio
```

---

## 🔗 Quick Links

- **Turso Dashboard:** https://app.turso.tech/databases/vehicleservicereminder
- **Google Cloud Credentials:** https://console.cloud.google.com/apis/credentials
- **ToyyibPay Merchant:** https://toyyibpay.com/access/login
- **Vercel New Project:** https://vercel.com/new
- **GitHub New Repo:** https://github.com/new
- **Resend Dashboard:** https://resend.com

---

*Generated by Goose AI Assistant - Session ended 2026-08-21 17:46*