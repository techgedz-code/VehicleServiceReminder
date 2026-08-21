import { db } from './index';
import {
  workshops,
  vehicles,
  serviceRecords,
  creditsLedger,
  payments,
} from './schema';
import { eq, and, desc, asc, sql, count, gte, lte, or, like } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// Workshop queries
export async function createWorkshop(data: {
  email: string;
  passwordHash?: string;
  googleId?: string;
  name: string;
}) {
  const id = nanoid();
  await db.insert(workshops).values({
    id,
    ...data,
    creditsBalance: 5, // trial credits
  });
  return id;
}

export async function getWorkshopByEmail(email: string) {
  return db.query.workshops.findFirst({
    where: eq(workshops.email, email),
  });
}

export async function getWorkshopById(id: string) {
  return db.query.workshops.findFirst({
    where: eq(workshops.id, id),
  });
}

export async function getWorkshopByGoogleId(googleId: string) {
  return db.query.workshops.findFirst({
    where: eq(workshops.googleId, googleId),
  });
}

export async function updateWorkshopCredits(workshopId: string, amount: number) {
  await db
    .update(workshops)
    .set({
      creditsBalance: sql`${workshops.creditsBalance} + ${amount}`,
      updatedAt: sql`(strftime('%s','now'))`,
    })
    .where(eq(workshops.id, workshopId));
}

export async function linkGoogleAccount(workshopId: string, googleId: string) {
  await db
    .update(workshops)
    .set({ googleId, updatedAt: sql`(strftime('%s','now'))` })
    .where(eq(workshops.id, workshopId));
}

// Vehicle queries
export async function createVehicle(data: {
  workshopId: string;
  plateNumber: string;
  ownerName: string;
  ownerPhone?: string;
  ownerEmail?: string;
  pdpaConsent?: boolean;
}) {
  const id = nanoid();
  await db.insert(vehicles).values({ id, ...data });
  return id;
}

export async function getVehiclesByWorkshop(workshopId: string, options?: {
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const { search, limit = 50, offset = 0 } = options || {};
  const conditions = [eq(vehicles.workshopId, workshopId)];
  if (search) {
    conditions.push(
      or(
        like(vehicles.plateNumber, `%${search}%`),
        like(vehicles.ownerName, `%${search}%`),
        like(vehicles.ownerPhone, `%${search}%`)
      )!
    );
  }
  return db.query.vehicles.findMany({
    where: and(...conditions),
    orderBy: desc(vehicles.createdAt),
    limit,
    offset,
    with: {
      latestService: {
        orderBy: desc(serviceRecords.serviceDate),
        limit: 1,
      },
    },
  });
}

export async function getVehicleById(id: string) {
  return db.query.vehicles.findFirst({
    where: eq(vehicles.id, id),
    with: {
      services: {
        orderBy: desc(serviceRecords.serviceDate),
      },
    },
  });
}

export async function getVehicleByPlate(workshopId: string, plateNumber: string) {
  return db.query.vehicles.findFirst({
    where: and(
      eq(vehicles.workshopId, workshopId),
      eq(vehicles.plateNumber, plateNumber)
    ),
  });
}

export async function updateVehicle(id: string, data: Partial<{
  plateNumber: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  pdpaConsent: boolean;
}>) {
  await db
    .update(vehicles)
    .set({ ...data, updatedAt: sql`(strftime('%s','now'))` })
    .where(eq(vehicles.id, id));
}

// Service Record queries
export async function createServiceRecord(data: {
  vehicleId: string;
  workshopId: string;
  serviceDate: Date;
  serviceType: string;
  oilUsed?: string;
  mileageAtService: number;
  nextServiceMileage?: number;
  nextServiceDate?: Date;
  notes?: string;
}) {
  const id = nanoid();
  const qrToken = nanoid(24);
  await db.insert(serviceRecords).values({
    id,
    ...data,
    qrToken,
  });
  return { id, qrToken };
}

export async function getServiceRecordByQrToken(qrToken: string) {
  return db.query.serviceRecords.findFirst({
    where: eq(serviceRecords.qrToken, qrToken),
    with: {
      vehicle: true,
      workshop: true,
    },
  });
}

export async function getServiceRecordsByWorkshop(workshopId: string, options?: {
  vehicleId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const { vehicleId, startDate, endDate, limit = 50, offset = 0 } = options || {};
  const conditions = [eq(serviceRecords.workshopId, workshopId)];
  if (vehicleId) conditions.push(eq(serviceRecords.vehicleId, vehicleId));
  if (startDate) conditions.push(gte(serviceRecords.serviceDate, startDate));
  if (endDate) conditions.push(lte(serviceRecords.serviceDate, endDate));
  return db.query.serviceRecords.findMany({
    where: and(...conditions),
    orderBy: desc(serviceRecords.serviceDate),
    limit,
    offset,
    with: {
      vehicle: true,
    },
  });
}

export async function getUpcomingDueServices(workshopId: string, options?: {
  type?: 'date' | 'mileage' | 'both';
  daysAhead?: number;
}) {
  const { type = 'both', daysAhead = 30 } = options || {};
  const now = new Date();
  const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  const conditions = [eq(serviceRecords.workshopId, workshopId)];
  if (type === 'date' || type === 'both') {
    conditions.push(
      and(
        sql`${serviceRecords.nextServiceDate} IS NOT NULL`,
        lte(serviceRecords.nextServiceDate, futureDate),
        gte(serviceRecords.nextServiceDate, now)
      )!
    );
  }
  return db.query.serviceRecords.findMany({
    where: and(...conditions),
    orderBy: asc(serviceRecords.nextServiceDate),
    with: {
      vehicle: true,
    },
  });
}

export async function getServiceStats(workshopId: string) {
  const [totalCustomers, totalServices, thisMonthServices, creditsBalance] = await Promise.all([
    db.select({ count: count() }).from(vehicles).where(eq(vehicles.workshopId, workshopId)),
    db.select({ count: count() }).from(serviceRecords).where(eq(serviceRecords.workshopId, workshopId)),
    db.select({ count: count() }).from(serviceRecords).where(
      and(
        eq(serviceRecords.workshopId, workshopId),
        gte(serviceRecords.serviceDate, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      )
    ),
    db.query.workshops.findFirst({
      where: eq(workshops.id, workshopId),
      columns: { creditsBalance: true },
    }),
  ]);
  return {
    totalCustomers: totalCustomers[0]?.count || 0,
    totalServices: totalServices[0]?.count || 0,
    thisMonthServices: thisMonthServices[0]?.count || 0,
    creditsBalance: creditsBalance?.creditsBalance || 0,
  };
}

// Credits Ledger
export async function addCreditsLedgerEntry(data: {
  workshopId: string;
  amount: number;
  type: 'trial' | 'purchase' | 'usage' | 'refund' | 'admin_adjust';
  referenceId?: string;
  description?: string;
}) {
  const id = nanoid();
  await db.insert(creditsLedger).values({ id, ...data });
  return id;
}

export async function getCreditsLedger(workshopId: string, limit = 50) {
  return db.query.creditsLedger.findMany({
    where: eq(creditsLedger.workshopId, workshopId),
    orderBy: desc(creditsLedger.createdAt),
    limit,
  });
}

// Payments
export async function createPayment(data: {
  workshopId: string;
  gateway: string;
  gatewayPaymentId?: string;
  amountRm: number;
  creditsAmount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payload?: string;
}) {
  const id = nanoid();
  await db.insert(payments).values({ id, ...data });
  return id;
}

export async function updatePaymentStatus(
  paymentId: string,
  status: 'completed' | 'failed' | 'refunded',
  payload?: string
) {
  await db
    .update(payments)
    .set({
      status,
      completedAt: status === 'completed' ? sql`(strftime('%s','now'))` : undefined,
      payload: payload ?? sql`payload`,
    })
    .where(eq(payments.id, paymentId));
}

export async function getPaymentsByWorkshop(workshopId: string) {
  return db.query.payments.findMany({
    where: eq(payments.workshopId, workshopId),
    orderBy: desc(payments.createdAt),
  });
}

// Analytics
export async function getAnalyticsData(workshopId: string) {
  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  const [monthlyVolume, serviceTypes, avgIntervalRaw, retentionData] = await Promise.all([
    // Monthly volume (last 6 months)
    db
      .select({
        month: sql<string>`strftime('%Y-%m', ${serviceRecords.serviceDate} / 1000, 'unixepoch')`,
        count: count(),
      })
      .from(serviceRecords)
      .where(
        and(
          eq(serviceRecords.workshopId, workshopId),
          gte(serviceRecords.serviceDate, new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000))
        )
      )
      .groupBy(sql`strftime('%Y-%m', ${serviceRecords.serviceDate} / 1000, 'unixepoch')`)
      .orderBy(sql`strftime('%Y-%m', ${serviceRecords.serviceDate} / 1000, 'unixepoch')`),

    // Service types distribution
    db
      .select({
        type: serviceRecords.serviceType,
        count: count(),
      })
      .from(serviceRecords)
      .where(eq(serviceRecords.workshopId, workshopId))
      .groupBy(serviceRecords.serviceType)
      .orderBy(desc(count())),

    // Average service interval (days)
    db
      .select({
        vehicleId: serviceRecords.vehicleId,
        serviceDate: serviceRecords.serviceDate,
      })
      .from(serviceRecords)
      .where(eq(serviceRecords.workshopId, workshopId))
      .orderBy(serviceRecords.vehicleId, asc(serviceRecords.serviceDate)),

    // Retention: customers with >1 service in last 90 days
    db
      .select({
        vehicleId: serviceRecords.vehicleId,
        count: count(),
      })
      .from(serviceRecords)
      .where(
        and(
          eq(serviceRecords.workshopId, workshopId),
          gte(serviceRecords.serviceDate, ninetyDaysAgo)
        )
      )
      .groupBy(serviceRecords.vehicleId),
  ]);

  // Process avg interval
  const intervals: number[] = [];
  const byVehicle = new Map<string, number[]>();
  for (const r of avgIntervalRaw) {
    if (!byVehicle.has(r.vehicleId)) byVehicle.set(r.vehicleId, []);
    byVehicle.get(r.vehicleId)!.push(r.serviceDate.getTime());
  }
  for (const dates of byVehicle.values()) {
    for (let i = 1; i < dates.length; i++) {
      intervals.push((dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24));
    }
  }
  const avgServiceInterval = intervals.length
    ? intervals.reduce((a, b) => a + b, 0) / intervals.length
    : 0;

  // Retention rate
  const returningCustomers = retentionData.filter((r) => r.count > 1).length;
  const totalCustomers90d = retentionData.length;
  const retentionRate = totalCustomers90d ? (returningCustomers / totalCustomers90d) * 100 : 0;

  return {
    monthlyVolume,
    serviceTypes,
    avgServiceInterval: Math.round(avgServiceInterval),
    retentionRate: Math.round(retentionRate * 10) / 10,
    totalCustomers90d,
    returningCustomers,
  };
}