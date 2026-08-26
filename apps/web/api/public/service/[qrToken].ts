import { Hono } from 'hono';
import { getServiceRecordByQrToken } from '../../../src/lib/db/queries';

const app = new Hono();

app.get('/:qrToken', async (c) => {
  const qrToken = c.req.param('qrToken');
  const record = await getServiceRecordByQrToken(qrToken);
  
  if (!record) {
    return c.json({ error: 'Service record not found' }, 404);
  }
  
  const workshop = (record as any).workshop;
  const vehicle = (record as any).vehicle;
  
  if (!workshop || !vehicle) {
    return c.json({ error: 'Incomplete record data' }, 500);
  }
  
  return c.json({
    workshop: {
      name: workshop.name,
      phone: workshop.phone,
      address: workshop.address,
    },
    vehicle: {
      plateNumber: vehicle.plateNumber,
      ownerName: vehicle.ownerName,
    },
    service: {
      serviceDate: record.serviceDate,
      serviceType: record.serviceType,
      oilUsed: record.oilUsed,
      mileageAtService: record.mileageAtService,
      nextServiceMileage: record.nextServiceMileage,
      nextServiceDate: record.nextServiceDate,
      notes: record.notes,
    },
  });
});

export default app;