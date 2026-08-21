# Vehicle Service Reminder PWA — Specification v1.0

---

## 1. Product Overview

**Name:** ServiceMate (working title)  
**Tagline:** Turn every service into a return visit.

**Problem:** Workshops use paper stickers on windscreens. Customers lose them, forget service dates, don't return.

**Solution:** Workshop logs service → generates unique QR → customer scans with phone → PWA saves record + adds calendar reminder (1 week prior) → workshop gets returning customers, builds contact list.

**Business Model:** SaaS per workshop. RM100 = 500 service records (RM0.20/record). 5 free credits trial. Self-serve signup.

---

## 2. Target Users

| User | Need |
|------|------|
| **Workshop Owner/Cashier** | Log services fast, track customers, know who's due, export data |
| **Vehicle Owner (Customer)** | Scan QR, save service record, get reminder, no app install friction |

---

## 3. Tech Stack (Bootstrap / Zero-Cost MVP)

| Layer | Choice | Cost |
|-------|--------|------|
| **Frontend** | React 18 + TypeScript + Vite | Free |
| **Hosting** | Vercel (Hobby) | Free |
| **Database** | Turso (libSQL) | Free (9GB, 1B reads/mo) |
| **ORM** | Drizzle ORM | Free |
| **Auth** | Better Auth (email/password + Google OAuth) | Free |
| **Email** | Resend (3,000 emails/mo free) | Free |
| **Payments** | ToyyibPay / Billplz (Malaysia, low/no setup fee) | Per-transaction |
| **QR Codes** | `qrcode` npm package (client-side generation) | Free |
| **Calendar** | `.ics` file generation (server) | Free |
| **PWA** | Vite PWA Plugin (Workbox) | Free |
| **Analytics** | Custom (DB queries) + Vercel Analytics | Free |

---

## 4. Data Model (Turso / libSQL)

```sql
-- Workshops (tenants)
CREATE TABLE workshops (
  id TEXT PRIMARY KEY,           -- UUID
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,            -- Nullable for Google OAuth users
  google_id TEXT UNIQUE,         -- For OAuth linking
  name TEXT NOT NULL,            -- Workshop name
  phone TEXT,                    -- Optional
  address TEXT,                  -- Optional
  credits_balance INTEGER DEFAULT 5,  -- 5 free trial credits
  total_credits_purchased INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (strftime('%s','now')),
  updated_at INTEGER DEFAULT (strftime('%s','now'))
);

-- Vehicles (customers' cars)
CREATE TABLE vehicles (
  id TEXT PRIMARY KEY,           -- UUID
  workshop_id TEXT NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
  plate_number TEXT NOT NULL,    -- Free format, no validation
  owner_name TEXT NOT NULL,
  owner_phone TEXT,              -- Optional
  owner_email TEXT,              -- Optional
  pdpa_consent INTEGER DEFAULT 0, -- 1 = consent given
  created_at INTEGER DEFAULT (strftime('%s','now')),
  updated_at INTEGER DEFAULT (strftime('%s','now')),
  UNIQUE(workshop_id, plate_number)
);

-- Service Records
CREATE TABLE service_records (
  id TEXT PRIMARY KEY,           -- UUID
  vehicle_id TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  workshop_id TEXT NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
  service_date INTEGER NOT NULL, -- Unix timestamp
  service_type TEXT NOT NULL,    -- e.g., "Full Service", "Oil Change", "Brake Pad Replacement"
  oil_used TEXT,                 -- e.g., "Shell Helix Ultra 5W-40"
  mileage_at_service INTEGER NOT NULL,
  next_service_mileage INTEGER,  -- Optional
  next_service_date INTEGER,     -- Optional (whichever comes first)
  qr_token TEXT UNIQUE NOT NULL, -- For public QR access
  notes TEXT,                    -- Optional
  created_at INTEGER DEFAULT (strftime('%s','now')),
  updated_at INTEGER DEFAULT (strftime('%s','now'))
);

-- Credits Ledger (audit trail)
CREATE TABLE credits_ledger (
  id TEXT PRIMARY KEY,
  workshop_id TEXT NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,       -- Positive = topup, Negative = usage
  type TEXT NOT NULL,            -- 'trial', 'purchase', 'usage', 'refund', 'admin_adjust'
  reference_id TEXT,             -- Payment ID or Service Record ID
  description TEXT,
  created_at INTEGER DEFAULT (strftime('%s','now'))
);

-- Payment Records
CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  workshop_id TEXT NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
  gateway TEXT NOT NULL,         -- 'toyyibpay', 'billplz', 'manual'
  gateway_payment_id TEXT,       -- External reference
  amount_rm INTEGER NOT NULL,    -- In cents (RM100 = 10000)
  credits_amount INTEGER NOT NULL, -- Credits granted (500 per RM100)
  status TEXT NOT NULL,          -- 'pending', 'completed', 'failed', 'refunded'
  payload TEXT,                  -- JSON string of gateway response
  created_at INTEGER DEFAULT (strftime('%s','now')),
  completed_at INTEGER
);

-- Indexes
CREATE INDEX idx_vehicles_workshop ON vehicles(workshop_id);
CREATE INDEX idx_services_vehicle ON service_records(vehicle_id);
CREATE INDEX idx_services_workshop ON service_records(workshop_id);
CREATE INDEX idx_services_next_date ON service_records(next_service_date);
CREATE INDEX idx_services_qr_token ON service_records(qr_token);
CREATE INDEX idx_credits_workshop ON credits_ledger(workshop_id);
CREATE INDEX idx_payments_workshop ON payments(workshop_id);
```

---

## 5. User Flows

### 5.1 Workshop Onboarding
1. Lands on marketing page → clicks "Get Started"
2. Signs up: Email/Password **or** "Continue with Google"
3. Email verification (Resend) → redirects to dashboard
4. Dashboard shows: 5 free credits, "Add First Service" CTA, upgrade banner

### 5.2 Workshop: Add Service Record
1. Dashboard → "Add Service Record"
2. Form:
   - Plate number (auto-suggest existing vehicles)
   - If new: Owner name, optional phone/email + PDPA checkbox
   - Service date (defaults today)
   - Service type (select + custom)
   - Oil used (text)
   - Mileage at service (number)
   - Next service: mileage **OR** date (whichever comes first)
   - Notes (optional)
3. Submit → consumes 1 credit → generates QR code (unique `qr_token`)
4. Shows QR modal: "Show this to customer" + "Download PNG"
5. Customer scans → opens PWA at `/service/:qrToken`

### 5.3 Customer: Scan QR → Save Record
1. Scans QR → opens `https://app.servicemate.my/service/:qrToken` (PWA)
2. Page shows: Workshop name, plate, service details, next due date/mileage
3. **"Add to Calendar"** button → downloads `.ics` file
   - Pre-filled: Title "Car Service Due - [Plate]", Date = next_service_date, Reminder = 1 week before
   - User taps file → Calendar app opens → taps "Save"
4. **"Save to Phone"** → caches in localStorage/IndexedDB (offline access)
5. **"Install App"** → browser install prompt → adds to home screen
6. No account, no login, no personal data required beyond what workshop entered

### 5.4 Workshop Dashboard Views
| View | Features |
|------|----------|
| **Overview** | Credits balance, total customers, services this month, due this week |
| **Customers** | List: Plate, Owner, Last Service, Next Due (date/mileage), Status (Due/Upcoming/OK) |
| **Service History** | Filter by plate, date range; shows all records per vehicle |
| **Upcoming Due** | Sort by date/mileage; filter "Due this week", "Due this month" |
| **Analytics** | Retention rate, avg service interval, top service types, monthly volume |
| **Export** | CSV download: all customers + last/next service |
| **Credits** | Balance, history (trial, purchases, usage), "Top Up" button |

### 5.5 Payment Flow (ToyyibPay / Billplz)
1. Workshop clicks "Top Up" → selects RM100 (500 credits) / RM200 (1000) / RM500 (2500)
2. Redirects to payment gateway → completes payment
3. Webhook / callback → verifies → adds credits → logs in `payments` + `credits_ledger`
4. Dashboard updates instantly

---

## 6. Routes & Pages

### Public (Marketing)
| Route | Page |
|-------|------|
| `/` | Landing page: Hero, features, how it works, pricing, CTA |
| `/login` | Workshop login (email/password + Google) |
| `/signup` | Workshop registration |
| `/verify-email` | Email verification page |
| `/forgot-password` | Password reset request |
| `/reset-password` | Password reset form |

### Workshop App (Protected, `/dashboard/*`)
| Route | Page |
|-------|------|
| `/dashboard` | Overview stats + quick actions |
| `/dashboard/services/new` | Add service record (modal or page) |
| `/dashboard/customers` | Customer list with search/filter |
| `/dashboard/customers/:vehicleId` | Vehicle detail + service history |
| `/dashboard/due` | Upcoming due services |
| `/dashboard/analytics` | Charts + metrics |
| `/dashboard/credits` | Balance + top-up |
| `/dashboard/settings` | Workshop profile, change password |

### Customer PWA (Public, no auth)
| Route | Page |
|-------|------|
| `/service/:qrToken` | Service record view + "Add to Calendar" + "Save" + Install prompt |
| `/offline` | Offline fallback page |

---

## 7. Calendar Integration (.ics)

**Generated server-side** at `/api/calendar/:qrToken.ics`

```ics
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ServiceMate//Vehicle Service Reminder//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:servicemate-{qrToken}@servicemate.my
DTSTAMP:20250115T100000Z
DTSTART;VALUE=DATE:20250615
DTEND;VALUE=DATE:20250616
SUMMARY:Car Service Due - ABC 1234
DESCRIPTION:Next service due for ABC 1234\nWorkshop: AutoCare Workshop\nMileage: 45,000 km\nService Type: Full Service\n\nBook at: https://app.servicemate.my/service/{qrToken}
BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:Reminder: Car service due for ABC 1234 in 1 week
TRIGGER:-P7D
END:VALARM
END:VEVENT
END:VCALENDAR
```

- `DTSTART` = `next_service_date` (date only)
- `VALARM` = 7 days before (`-P7D`)
- Works on iOS, Android, Google Calendar, Outlook, Apple Calendar

---

## 8. PWA Features

| Feature | Implementation |
|---------|----------------|
| **Install Prompt** | `beforeinstallprompt` event → custom "Install" button |
| **Offline** | Workbox: cache shell + `/service/:qrToken` responses in IndexedDB |
| **Service Worker** | `vite-plugin-pwa` with Workbox |
| **Manifest** | `manifest.webmanifest` with icons, theme color, shortcuts |
| **Local Notifications** | Request permission on `/service/:qrToken` → schedule 1-week-before notification (if `next_service_date` exists) |

---

## 9. API Endpoints

### Auth (`/api/auth/*`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register workshop (email/password) |
| POST | `/api/auth/login` | Login → returns JWT (HttpOnly cookie) |
| POST | `/api/auth/google` | Google OAuth callback |
| POST | `/api/auth/logout` | Clear cookie |
| GET | `/api/auth/me` | Current workshop session |
| POST | `/api/auth/verify-email` | Verify email token |
| POST | `/api/auth/forgot-password` | Send reset email |
| POST | `/api/auth/reset-password` | Reset with token |

### Workshop (`/api/workshop/*`) — Requires JWT
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/workshop/stats` | Dashboard stats |
| GET | `/api/workshop/vehicles` | List vehicles (search, filter, paginate) |
| POST | `/api/workshop/vehicles` | Create vehicle |
| GET | `/api/workshop/vehicles/:id` | Vehicle detail + services |
| GET | `/api/workshop/services` | List services (filter: due, date range) |
| POST | `/api/workshop/services` | Create service record → returns QR token |
| GET | `/api/workshop/services/:id` | Service detail |
| GET | `/api/workshop/due` | Upcoming due (filter: week, month, mileage) |
| GET | `/api/workshop/analytics` | Aggregated metrics |
| GET | `/api/workshop/export/csv` | CSV download |
| GET | `/api/workshop/credits` | Balance + ledger |
| POST | `/api/workshop/credits/topup` | Create payment session |

### Public (`/api/public/*`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/service/:qrToken` | Service record for PWA (no auth) |
| GET | `/api/public/calendar/:qrToken.ics` | Download .ics file |

### Webhooks
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/webhooks/payment` | ToyyibPay/Billplz callback |

---

## 10. Payment Gateway: Malaysia Options (Cheaper than Stripe)

| Gateway | Setup Fee | Transaction Fee | Payout | Notes |
|---------|-----------|-----------------|--------|-------|
| **ToyyibPay** | RM0 | 1.5% + RM0.50 (FPX) | T+1 | Free tier, Malaysia, simple API |
| **Billplz** | RM0 | 1.5% + RM0.50 (FPX) | T+1 | Popular, webhook support |
| **SenangPay** | RM0 | ~2% | T+2 | Simple, Malaysia |
| **Xendit** | RM0 | ~2.9% | T+2 | SEA-wide, good docs |
| **Manual** | RM0 | RM0 | Instant | Bank transfer, admin verifies |

**Recommendation:** **ToyyibPay** — zero setup, Malaysia-native, FPX support, simple callback. Billplz as backup.

---

## 11. Environment Variables

```env
# App
VITE_APP_URL=https://app.servicemate.my
VITE_APP_NAME=ServiceMate

# Turso
TURSO_DATABASE_URL=libsql://xxx.turso.io
TURSO_AUTH_TOKEN=xxx

# Auth (Better Auth)
BETTER_AUTH_SECRET=xxx
BETTER_AUTH_URL=https://app.servicemate.my

# Google OAuth
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

# Resend
RESEND_API_KEY=re_xxx
EMAIL_FROM=ServiceMate <noreply@servicemate.my>

# Payment (ToyyibPay)
TOYYIBPAY_API_KEY=xxx
TOYYIBPAY_CATEGORY_ID=xxx
TOYYIBPAY_CALLBACK_URL=https://app.servicemate.my/api/webhooks/payment

# Vercel (auto-injected)
# VERCEL_URL, VERCEL_ENV, etc.
```

---

## 12. Security & Compliance

- **JWT in HttpOnly Secure Cookie** (SameSite=Lax)
- **Rate limiting** on auth endpoints (Vercel Edge Middleware)
- **PDPA:** Consent checkbox for phone/email; data export/delete via dashboard
- **QR tokens:** UUID v4, unguessable, no PII in URL
- **CSP Headers:** Strict via Vercel `headers()` in `vercel.json`
- **Input validation:** Zod schemas on all API inputs

---

## 13. MVP Scope

### In Scope (v1.0)
- [ ] Landing page + workshop auth (email/password + Google)
- [ ] Workshop dashboard: stats, customers, services, due, analytics, export CSV
- [ ] Add service record → QR generation
- [ ] Customer PWA: `/service/:qrToken` + .ics download + install prompt + offline cache
- [ ] Credits system: 5 free trial, RM100/500 top-up via ToyyibPay
- [ ] Email verification, password reset
- [ ] Basic analytics (retention, volume, intervals)

### Out of Scope (v2+)
- Push notifications (iOS PWA unsupported)
- Multi-user per workshop (staff roles)
- SMS/WhatsApp reminders
- Customer-facing history (multi-vehicle)
- Advanced analytics (cohorts, LTV)
- White-label / custom domain
- Mobile app (React Native)

---

## 14. File Structure (Monorepo: `apps/web`)

```
apps/web/
├── public/
│   ├── manifest.webmanifest
│   ├── sw.js (generated)
│   └── icons/
├── src/
│   ├── components/
│   │   ├── ui/           # Button, Input, Card, Table, Modal, etc.
│   │   ├── layout/       # Header, Sidebar, DashboardLayout
│   │   ├── forms/        # ServiceForm, VehicleForm
│   │   └── charts/       # Analytics charts (Recharts)
│   ├── pages/
│   │   ├── marketing/    # Landing, Pricing, Features
│   │   ├── auth/         # Login, Signup, Verify, Reset
│   │   ├── dashboard/    # All protected pages
│   │   └── public/       # ServiceView (PWA), Offline
│   ├── hooks/            # useAuth, useCredits, usePWAInstall
│   ├── lib/
│   │   ├── db/           # Drizzle client, schema, queries
│   │   ├── auth/         # Better Auth config
│   │   ├── payments/     # ToyyibPay client
│   │   ├── calendar/     # .ics generator
│   │   ├── qr/           # QR code generator
│   │   └── utils/        # Date, format, validation
│   ├── middleware/       # Auth guard, rate limit
│   ├── styles/           # Tailwind + globals
│   ├── types/            # TypeScript types
│   └── main.tsx
├── drizzle.config.ts
├── vercel.json
├── vite.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 15. Implementation Phases

| Phase | Deliverable | Est. Time |
|-------|-------------|-----------|
| **1. Foundation** | Repo init, Turso + Drizzle, Auth (Better Auth), Vercel deploy | 2-3 days |
| **2. Workshop Dashboard** | Layout, Stats, Vehicles CRUD, Services CRUD, QR generation | 3-4 days |
| **3. Customer PWA** | `/service/:qrToken`, .ics download, Install prompt, Offline | 2-3 days |
| **4. Payments** | ToyyibPay integration, Credits ledger, Top-up flow | 2 days |
| **5. Analytics & Export** | Dashboard charts, CSV export, Due services view | 2 days |
| **6. Landing & Polish** | Marketing page, SEO, PWA icons, testing, deploy | 1-2 days |
| **Total** | **MVP Ready** | **~12-16 days** |

---

## 16. Success Metrics (Post-Launch)

- Workshops signed up (target: 10 in month 1)
- Services recorded per workshop/week
- Credit purchase conversion (trial → paid)
- Customer PWA install rate
- Calendar .ics download rate
- Workshop retention (month 2+ active)

---

## 17. Approval

**Review this SPEC.md.** Reply with:
- ✅ **Approved** — I'll start implementation
- 🔄 **Changes needed** — Specify what to adjust

---

*Generated: 2025-01-21 | Version 1.0*