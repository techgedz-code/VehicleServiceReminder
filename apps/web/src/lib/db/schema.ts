import { sqliteTable, text, integer, uniqueIndex, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const workshops = sqliteTable(
  'workshops',
  {
    id: text('id').primaryKey(),
    // BetterAuth required fields
    email: text('email').unique().notNull(),
    emailVerified: integer('email_verified', { mode: 'boolean' }).default(false).notNull(),
    image: text('image'),
    passwordHash: text('password_hash'),
    googleId: text('google_id').unique(),
    name: text('name').notNull(),
    role: text('role').default('user').notNull(),
    banned: integer('banned', { mode: 'boolean' }).default(false).notNull(),
    banReason: text('ban_reason'),
    banExpires: integer('ban_expires', { mode: 'timestamp' }),
    // Custom fields
    phone: text('phone'),
    address: text('address'),
    creditsBalance: integer('credits_balance').default(5).notNull(),
    totalCreditsPurchased: integer('total_credits_purchased').default(0).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .default(sql`(strftime('%s','now'))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .default(sql`(strftime('%s','now'))`)
      .notNull(),
  },
  (t) => [
    uniqueIndex('workshops_email_idx').on(t.email),
    uniqueIndex('workshops_google_id_idx').on(t.googleId),
  ]
);

// BetterAuth standard tables
export const sessions = sqliteTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    token: text('token').unique().notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .default(sql`(strftime('%s','now'))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .default(sql`(strftime('%s','now'))`)
      .notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => workshops.id, { onDelete: 'cascade' }),
    impersonatedBy: text('impersonated_by'),
  },
  (t) => [
    index('sessions_user_id_idx').on(t.userId),
    uniqueIndex('sessions_token_idx').on(t.token),
  ]
);

export const accounts = sqliteTable(
  'accounts',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => workshops.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
    refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
    scope: text('scope'),
    password: text('password'),
    issuer: text('issuer'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .default(sql`(strftime('%s','now'))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .default(sql`(strftime('%s','now'))`)
      .notNull(),
  },
  (t) => [
    index('accounts_user_id_idx').on(t.userId),
    uniqueIndex('accounts_provider_account_idx').on(t.providerId, t.accountId),
  ]
);

export const verifications = sqliteTable(
  'verifications',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .default(sql`(strftime('%s','now'))`),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .default(sql`(strftime('%s','now'))`),
  }
);

export const vehicles = sqliteTable(
  'vehicles',
  {
    id: text('id').primaryKey(),
    workshopId: text('workshop_id')
      .notNull()
      .references(() => workshops.id, { onDelete: 'cascade' }),
    plateNumber: text('plate_number').notNull(),
    ownerName: text('owner_name').notNull(),
    ownerPhone: text('owner_phone'),
    ownerEmail: text('owner_email'),
    pdpaConsent: integer('pdpa_consent', { mode: 'boolean' }).default(false).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .default(sql`(strftime('%s','now'))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .default(sql`(strftime('%s','now'))`)
      .notNull(),
  },
  (t) => [
    index('vehicles_workshop_idx').on(t.workshopId),
    uniqueIndex('vehicles_workshop_plate_idx').on(t.workshopId, t.plateNumber),
  ]
);

export const serviceRecords = sqliteTable(
  'service_records',
  {
    id: text('id').primaryKey(),
    vehicleId: text('vehicle_id')
      .notNull()
      .references(() => vehicles.id, { onDelete: 'cascade' }),
    workshopId: text('workshop_id')
      .notNull()
      .references(() => workshops.id, { onDelete: 'cascade' }),
    serviceDate: integer('service_date', { mode: 'timestamp' }).notNull(),
    serviceType: text('service_type').notNull(),
    oilUsed: text('oil_used'),
    mileageAtService: integer('mileage_at_service').notNull(),
    nextServiceMileage: integer('next_service_mileage'),
    nextServiceDate: integer('next_service_date', { mode: 'timestamp' }),
    qrToken: text('qr_token').unique().notNull(),
    notes: text('notes'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .default(sql`(strftime('%s','now'))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .default(sql`(strftime('%s','now'))`)
      .notNull(),
  },
  (t) => [
    index('services_vehicle_idx').on(t.vehicleId),
    index('services_workshop_idx').on(t.workshopId),
    index('services_next_date_idx').on(t.nextServiceDate),
    uniqueIndex('services_qr_token_idx').on(t.qrToken),
  ]
);

export const creditsLedger = sqliteTable(
  'credits_ledger',
  {
    id: text('id').primaryKey(),
    workshopId: text('workshop_id')
      .notNull()
      .references(() => workshops.id, { onDelete: 'cascade' }),
    amount: integer('amount').notNull(),
    type: text('type', {
      enum: ['trial', 'purchase', 'usage', 'refund', 'admin_adjust'],
    }).notNull(),
    referenceId: text('reference_id'),
    description: text('description'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .default(sql`(strftime('%s','now'))`)
      .notNull(),
  },
  (t) => [index('credits_workshop_idx').on(t.workshopId)]
);

export const payments = sqliteTable(
  'payments',
  {
    id: text('id').primaryKey(),
    workshopId: text('workshop_id')
      .notNull()
      .references(() => workshops.id, { onDelete: 'cascade' }),
    gateway: text('gateway').notNull(),
    gatewayPaymentId: text('gateway_payment_id'),
    amountRm: integer('amount_rm').notNull(),
    creditsAmount: integer('credits_amount').notNull(),
    status: text('status', {
      enum: ['pending', 'completed', 'failed', 'refunded'],
    }).notNull(),
    payload: text('payload'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .default(sql`(strftime('%s','now'))`)
      .notNull(),
    completedAt: integer('completed_at', { mode: 'timestamp' }),
  },
  (t) => [index('payments_workshop_idx').on(t.workshopId)]
);

export type Workshop = typeof workshops.$inferSelect;
export type NewWorkshop = typeof workshops.$inferInsert;
export type Vehicle = typeof vehicles.$inferSelect;
export type NewVehicle = typeof vehicles.$inferInsert;
export type ServiceRecord = typeof serviceRecords.$inferSelect;
export type NewServiceRecord = typeof serviceRecords.$inferInsert;
export type CreditsLedger = typeof creditsLedger.$inferSelect;
export type NewCreditsLedger = typeof creditsLedger.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;