'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Car, 
  Wrench, 
  Droplets, 
  Gauge, 
  CalendarClock, 
  MapPin, 
  Phone, 
  Download, 
  Smartphone, 
  CheckCircle,
  AlertTriangle,
  Building2,
  QrCode
} from 'lucide-react';
import { formatDate, formatNumber, getDaysUntil, getStatusColor, getServiceStatus } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { generateQRCodeDataURL } from '@/lib/qr';

interface ServiceData {
  workshop: {
    name: string;
    phone?: string;
    address?: string;
  };
  vehicle: {
    plateNumber: string;
    ownerName: string;
  };
  service: {
    serviceDate: number;
    serviceType: string;
    oilUsed?: string;
    mileageAtService: number;
    nextServiceMileage?: number;
    nextServiceDate?: number;
    notes?: string;
  };
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function ServiceViewPage() {
  const { qrToken } = useParams<{ qrToken: string }>();
  const [data, setData] = useState<ServiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [calendarDownloaded, setCalendarDownloaded] = useState(false);

  useEffect(() => {
    if (!qrToken) {
      setError('Invalid QR code');
      setLoading(false);
      return;
    }

    // In production: fetch from API
    // For demo, use mock data
    const mockData: ServiceData = {
      workshop: {
        name: 'AutoCare Workshop',
        phone: '03-1234 5678',
        address: '123 Jalan Bengkel, 50000 Kuala Lumpur',
      },
      vehicle: {
        plateNumber: 'ABC 1234',
        ownerName: 'Ahmad bin Ali',
      },
      service: {
        serviceDate: Date.now() - 30 * 24 * 60 * 60 * 1000,
        serviceType: 'Full Service',
        oilUsed: 'Shell Helix Ultra 5W-40',
        mileageAtService: 45000,
        nextServiceMileage: 50000,
        nextServiceDate: Date.now() + 60 * 24 * 60 * 60 * 1000,
        notes: 'Tire pressure checked. Brake pads at 60%.',
      },
    };
    
    setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 500);
  }, [qrToken]);

  // Generate QR code for re-sharing
  useEffect(() => {
    if (qrToken) {
      generateQRCodeDataURL(`${window.location.origin}/service/${qrToken}`)
        .then(setQrCodeDataUrl)
        .catch(console.error);
    }
  }, [qrToken]);

  // PWA Install Prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstallBtn(true);
    };

    const handleAppInstalled = () => {
      setShowInstallBtn(false);
      setInstallPrompt(null);
      toast({ title: 'App installed!', description: 'ServiceMate is now on your home screen.', variant: 'success' });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallBtn(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBtn(false);
    }
  };

  const downloadCalendar = async () => {
    if (!data?.service.nextServiceDate) {
      toast({ title: 'No date set', description: 'Next service date not configured', variant: 'destructive' });
      return;
    }

    try {
      const response = await fetch(`${window.location.origin}/api/public/calendar/${qrToken}.ics`);
      if (!response.ok) throw new Error('Failed to generate calendar');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `service-reminder-${data.vehicle.plateNumber}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setCalendarDownloaded(true);
      toast({ title: 'Calendar saved!', description: 'Open the file to add reminder to your calendar.', variant: 'success' });
    } catch {
      toast({ title: 'Error', description: 'Failed to download calendar file', variant: 'destructive' });
    }
  };

  const saveToPhone = () => {
    if (!data) return;
    
    const record = {
      workshop: data.workshop,
      vehicle: data.vehicle,
      service: data.service,
      savedAt: Date.now(),
    };
    
    const existing = JSON.parse(localStorage.getItem('servicemate_records') || '[]');
    const updated = [...existing.filter((r: any) => r.vehicle.plateNumber !== data.vehicle.plateNumber), record];
    localStorage.setItem('servicemate_records', JSON.stringify(updated));
    
    toast({ title: 'Saved to phone!', description: 'Access offline anytime from home screen.', variant: 'success' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading service record...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center p-8">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900">Record Not Found</h2>
          <p className="text-gray-500 mt-2">{error || 'This service record does not exist or has been removed.'}</p>
          <Button className="mt-6" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  const { workshop, vehicle, service } = data;
  const status = getServiceStatus(service.nextServiceDate, service.nextServiceMileage);
  const daysUntil = service.nextServiceDate ? getDaysUntil(service.nextServiceDate) : null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-900">ServiceMate</h1>
                <p className="text-xs text-gray-500">Digital Service Record</p>
              </div>
            </div>
            {showInstallBtn && (
              <Button variant="secondary" size="sm" onClick={handleInstall} className="gap-1">
                <Smartphone className="h-4 w-4" />
                Install
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        {/* Workshop Info */}
        <Card className="mb-4">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900">{workshop.name}</h3>
                {workshop.phone && (
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" /> {workshop.phone}
                  </p>
                )}
                {workshop.address && (
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin className="h-3.5 w-3.5" /> {workshop.address}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Info */}
        <Card className="mb-4">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Car className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Vehicle</p>
                  <p className="font-mono font-bold text-xl text-gray-900">{vehicle.plateNumber}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Owner</p>
                <p className="font-medium text-gray-900">{vehicle.ownerName}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Details */}
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" />
              Service Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Service Date</p>
                <p className="font-medium">{formatDate(service.serviceDate)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Service Type</p>
                <p className="font-medium">{service.serviceType}</p>
              </div>
              {service.oilUsed && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Oil Used</p>
                  <p className="font-medium flex items-center gap-1">
                    <Droplets className="h-4 w-4 text-blue-600" /> {service.oilUsed}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Mileage</p>
                <p className="font-medium flex items-center gap-1">
                  <Gauge className="h-4 w-4 text-gray-600" /> {formatNumber(service.mileageAtService)} km
                </p>
              </div>
            </div>

            {/* Next Service Due */}
            {(service.nextServiceDate || service.nextServiceMileage) && (
              <div className={`p-4 rounded-lg border ${getStatusColor(status)}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Next Service Due</p>
                  <Badge variant={status === 'ok' ? 'success' : status === 'due-soon' ? 'warning' : 'destructive'}>
                    {status === 'ok' ? 'OK' : status === 'due-soon' ? 'Due Soon' : 'Overdue'}
                  </Badge>
                </div>
                {service.nextServiceDate && (
                  <div className="flex items-center gap-2 text-lg font-medium">
                    <CalendarClock className="h-5 w-5" />
                    <span>{formatDate(service.nextServiceDate)}</span>
                    {daysUntil !== null && daysUntil >= 0 && (
                      <span className="text-sm text-gray-500">({daysUntil} days)</span>
                    )}
                    {daysUntil !== null && daysUntil < 0 && (
                      <span className="text-sm text-red-600">({Math.abs(daysUntil)} days overdue)</span>
                    )}
                  </div>
                )}
                {service.nextServiceMileage && (
                  <div className="flex items-center gap-2 text-lg font-medium mt-2">
                    <Gauge className="h-5 w-5" />
                    <span>{formatNumber(service.nextServiceMileage)} km</span>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {status === 'overdue' 
                    ? 'Service is overdue. Please contact workshop to schedule.' 
                    : status === 'due-soon'
                    ? 'Service due within a week. Consider booking soon.'
                    : 'Service is up to date. We\'ll remind you when it\'s due.'}
                </p>
              </div>
            )}

            {service.notes && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Notes</p>
                <p className="text-sm text-gray-900">{service.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button 
            onClick={downloadCalendar} 
            className="w-full justify-center gap-2"
            variant={calendarDownloaded ? 'secondary' : 'default'}
            disabled={!service.nextServiceDate}
          >
            <Calendar className="h-4 w-4" />
            {calendarDownloaded ? 'Calendar Added ✓' : 'Add to Calendar (1-week reminder)'}
          </Button>
          
          <Button 
            onClick={saveToPhone} 
            variant="outline" 
            className="w-full justify-center gap-2"
          >
            <Download className="h-4 w-4" />
            Save to Phone (Offline Access)
          </Button>

          {showInstallBtn && (
            <Button 
              onClick={handleInstall} 
              variant="secondary" 
              className="w-full justify-center gap-2"
            >
              <Smartphone className="h-4 w-4" />
              Install App to Home Screen
            </Button>
          )}
        </div>

        {/* QR Code for sharing */}
        <Card className="mt-6">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              Share This Record
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-center">
            {qrCodeDataUrl && (
              <img src={qrCodeDataUrl} alt="QR Code" className="mx-auto mb-2" width="180" height="180" />
            )}
            <p className="text-xs text-gray-500">Scan to open this record</p>
          </CardContent>
        </Card>

        {/* Offline Notice */}
        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <CheckCircle className="mx-auto h-5 w-5 text-blue-600 mb-1" />
          <p className="text-sm text-blue-800">
            Works offline! Install the app to access this record anytime without internet.
          </p>
        </div>
      </main>
    </div>
  );
}