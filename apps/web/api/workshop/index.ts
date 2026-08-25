import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '@/middleware/auth';
import {
  getVehiclesByWorkshop,
  createVehicle,
  getVehicleById,
  getVehicleByPlate,
  updateVehicle,
  createServiceRecord,
  getServiceRecordsByWorkshop,
  getUpcomingDueServices,
  getServiceStats,
  getAnalyticsData,
  getCreditsLedger,
  addCreditsLedgerEntry,
} from '@/lib/db/queries';

const app = new Hono<{ Variables: { user: { id: string; email: string; name: string } } }>();

app.use('*', authMiddleware);

// Stats
app.get('/stats', async (c) => {
  const user = c.get('user');
  const stats = await getServiceStats(user.id);
  return c.json(stats);
});

// Vehicles
app.get('/vehicles', async (c) => {
  const user = c.get('user');
  const search = c.req.query('search');
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '50');
  const vehicles = await getVehiclesByWorkshop(user.id, {
    search,
    limit,
    offset: (page - 1) * limit,
  });
  return c.json(vehicles);
});

const vehicleSchema = z.object({
  plateNumber: z.string().min(1),
  ownerName: z.string().min(1),
  ownerPhone: z.string().optional(),
  ownerEmail: z.string().email().optional().or(z.literal('')),
  pdpaConsent: z.boolean().default(false),
});

app.post('/vehicles', zValidator('json', vehicleSchema), async (c) => {
  const user = c.get('user');
  const data = c.req.valid('json');
  
  const existing = await getVehicleByPlate(user.id, data.plateNumber);
  if (existing) {
    return c.json({ error: 'Vehicle with this plate number already exists' }, 400);
  }
  
  const id = await createVehicle({ workshopId: user.id, ...data });
  return c.json({ id });
});

app.get('/vehicles/:id', async (c) => {
  const user = c.get('user');
  const vehicle = await getVehicleById(c.req.param('id'));
  if (!vehicle || vehicle.workshopId !== user.id) {
    return c.json({ error: 'Not found' }, 404);
  }
  return c.json(vehicle);
});

app.patch('/vehicles/:id', zValidator('json', vehicleSchema.partial()), async (c) => {
  const user = c.get('user');
  const vehicle = await getVehicleById(c.req.param('id'));
  if (!vehicle || vehicle.workshopId !== user.id) {
    return c.json({ error: 'Not found' }, 404);
  }
  await updateVehicle(c.req.param('id'), c.req.valid('json'));
  return c.json({ success: true });
});

// Service Records
const serviceSchema = z.object({
  vehicleId: z.string().min(1),
  serviceDate: z.string().transform((v) => new Date(v)),
  serviceType: z.string().min(1),
  oilUsed: z.string().optional(),
  mileageAtService: z.number().int().positive(),
  nextServiceMileage: z.number().int().positive().optional(),
  nextServiceDate: z.string().transform((v) => new Date(v)).optional(),
  notes: z.string().optional(),
});

app.post('/services', zValidator('json', serviceSchema), async (c) => {
  const user = c.get('user');
  const data = c.req.valid('json');
  
  const stats = await getServiceStats(user.id);
  if (stats.creditsBalance <= 0) {
    return c.json({ error: 'Insufficient credits. Please top up.' }, 402);
  }
  
  const { id, qrToken } = await createServiceRecord({
    workshopId: user.id,
    vehicleId: data.vehicleId,
    serviceDate: data.serviceDate,
    serviceType: data.serviceType,
    oilUsed: data.oilUsed,
    mileageAtService: data.mileageAtService,
    nextServiceMileage: data.nextServiceMileage,
    nextServiceDate: data.nextServiceDate,
    notes: data.notes,
  });
  
  await addCreditsLedgerEntry({
    workshopId: user.id,
    amount: -1,
    type: 'usage',
    referenceId: id,
    description: `Service record for ${data.vehicleId}`,
  });
  
  const baseUrl = 'https://app.servicemate.my';
  return c.json({ id, qrToken, qrUrl: `${baseUrl}/service/${qrToken}` });
});

app.get('/services', async (c) => {
  const user = c.get('user');
  const vehicleId = c.req.query('vehicleId');
  const startDate = c.req.query('startDate') ? new Date(c.req.query('startDate')!) : undefined;
  const endDate = c.req.query('endDate') ? new Date(c.req.query('endDate')!) : undefined;
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '50');
  const services = await getServiceRecordsByWorkshop(user.id, {
    vehicleId,
    startDate,
    endDate,
    limit,
    offset: (page - 1) * limit,
  });
  return c.json(services);
});

// Upcoming Due
app.get('/due', async (c) => {
  const user = c.get('user');
  const type = c.req.query('type') as 'date' | 'mileage' | 'both' | undefined;
  const daysAhead = c.req.query('daysAhead') ? parseInt(c.req.query('daysAhead')!) : 30;
  const due = await getUpcomingDueServices(user.id, { type, daysAhead });
  return c.json(due);
});

// Analytics
app.get('/analytics', async (c) => {
  const user = c.get('user');
  const analytics = await getAnalyticsData(user.id);
  return c.json(analytics);
});

// Credits
app.get('/credits', async (c) => {
  const user = c.get('user');
  const ledger = await getCreditsLedger(user.id);
  return c.json(ledger);
});

// CSV Export
app.get('/export/csv', async (c) => {
  const user = c.get('user');
  const vehicles = await getVehiclesByWorkshop(user.id, { limit: 10000 });
  
  const headers = ['Plate Number', 'Owner Name', 'Owner Phone', 'Owner Email', 'Last Service Date', 'Last Service Type', 'Last Mileage', 'Next Service Date', 'Next Service Mileage', 'Status'];
  const rows = vehicles.map((v) => {
    const lastService = (v as any).latestService?.[0];
    const nextDate = lastService?.nextServiceDate;
    const nextMileage = lastService?.nextServiceMileage;
    let status = 'OK';
    if (nextDate && new Date(nextDate) < new Date()) status = 'Overdue';
    else if (nextDate && new Date(nextDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) status = 'Due Soon';
    
    return [
      v.plateNumber,
      v.ownerName,
      v.ownerPhone || '',
      v.ownerEmail || '',
      lastService ? new Date(lastService.serviceDate).toLocaleDateString() : '',
      lastService?.serviceType || '',
      lastService?.mileageAtService?.toString() || '',
      nextDate ? new Date(nextDate).toLocaleDateString() : '',
      nextMileage?.toString() || '',
      status,
    ];
  });
  
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
  
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="customers.csv"',
    },
  });
});

export default app;