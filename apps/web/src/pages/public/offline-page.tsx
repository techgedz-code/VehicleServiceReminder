'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { WifiOff, RefreshCw, Smartphone, CheckCircle } from 'lucide-react';

export function OfflinePage() {
  const [online, setOnline] = useState(false);
  const [cachedRecords, setCachedRecords] = useState<Array<{ plate: string; owner: string; date: string }>>([]);

  useEffect(() => {
    setOnline(navigator.onLine);
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    try {
      const records = JSON.parse(localStorage.getItem('servicemate_records') || '[]');
      setCachedRecords(records.map((r: any) => ({
        plate: r.vehicle?.plateNumber || 'Unknown',
        owner: r.vehicle?.ownerName || 'Unknown',
        date: r.service?.serviceDate ? new Date(r.service.serviceDate).toLocaleDateString() : 'Unknown',
      })));
    } catch {
      setCachedRecords([]);
    }
  }, []);

  const retry = () => {
    if (navigator.onLine) {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        {!online ? (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <WifiOff className="h-10 w-10 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">You're Offline</h1>
            <p className="text-gray-500 mb-6">
              No internet connection detected. Some features may be limited.
            </p>
            
            <Card className="mb-6">
              <CardContent className="pt-6">
                <Button onClick={retry} className="w-full gap-2" disabled={!navigator.onLine}>
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
              </CardContent>
            </Card>

            {cachedRecords.length > 0 && (
              <Card className="text-left">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Smartphone className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Saved Records (Available Offline)</h3>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {cachedRecords.map((record, i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium">{record.plate}</p>
                        <p className="text-sm text-gray-500">{record.owner} • {record.date}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-3">
                    {cachedRecords.length} record{cachedRecords.length !== 1 ? 's' : ''} cached locally
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-900">Works Offline!</h4>
                  <p className="text-sm text-blue-800 mt-1">
                    ServiceMate is a PWA (Progressive Web App). Once installed, you can:
                  </p>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1 pl-4 list-disc">
                    <li>View saved service records without internet</li>
                    <li>Access workshop contact details offline</li>
                    <li>See next service due dates</li>
                    <li>Get calendar reminders (already in your calendar app)</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Back Online!</h1>
            <p className="text-gray-500 mb-6">
              Internet connection restored. All features are now available.
            </p>
            <Button onClick={() => window.location.href = '/'} className="w-full">
              Go to Home
            </Button>
          </>
        )}
      </div>
    </div>
  );
}