import { Hono } from 'hono';
import { getServiceRecordByQrToken } from '../../../src/lib/db/queries';

const app = new Hono();

function generateICS(record: Awaited<ReturnType<typeof getServiceRecordByQrToken>>) {
  if (!record || !record.nextServiceDate) {
    return null;
  }
  
  const workshop = (record as any).workshop;
  const vehicle = (record as any).vehicle;
  const service = record;
  
  if (!workshop || !vehicle) {
    return null;
  }
  
  const nextDate = new Date(service.nextServiceDate);
  
  const formatDate = (date: Date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const formatDateOnly = (date: Date) => date.toISOString().split('T')[0].replace(/-/g, '');
  
  const uid = `servicemate-${record.id}@servicemate.my`;
  const dtStamp = formatDate(new Date());
  const dtStart = formatDateOnly(nextDate);
  const dtEnd = formatDateOnly(new Date(nextDate.getTime() + 24 * 60 * 60 * 1000));
  const trigger = '-P7D';
  
  const baseUrl = 'https://app.servicemate.my';
  const qrUrl = `${baseUrl}/service/${record.id}`;
  
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ServiceMate//Vehicle Service Reminder//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${dtStamp}
DTSTART;VALUE=DATE:${dtStart}
DTEND;VALUE=DATE:${dtEnd}
SUMMARY:Car Service Due - ${vehicle.plateNumber}
DESCRIPTION:Next service due for ${vehicle.plateNumber}\\nWorkshop: ${workshop.name}${workshop.phone ? `\\nPhone: ${workshop.phone}` : ''}${workshop.address ? `\\nAddress: ${workshop.address}` : ''}\\nMileage: ${service.mileageAtService.toLocaleString()} km\\nService Type: ${service.serviceType}${service.oilUsed ? `\\nOil: ${service.oilUsed}` : ''}\\n\\nBook at: ${qrUrl}
BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:Reminder: Car service due for ${vehicle.plateNumber} in 1 week
TRIGGER:${trigger}
END:VALARM
END:VEVENT
END:VCALENDAR`;
}

app.get('/:qrToken.ics', async (c) => {
  const qrToken = c.req.param('qrToken');
  const record = await getServiceRecordByQrToken(qrToken);
  
  if (!record) {
    return c.json({ error: 'Service record not found' }, 404);
  }
  
  if (!record.nextServiceDate) {
    return c.json({ error: 'No next service date set' }, 400);
  }
  
  const ics = generateICS(record);
  if (!ics) {
    return c.json({ error: 'Could not generate calendar file' }, 500);
  }
  
  const vehicle = (record as any).vehicle;
  const plateNumber = vehicle?.plateNumber || 'unknown';
  
  return new Response(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="service-reminder-${plateNumber}.ics"`,
    },
  });
});

export default app;