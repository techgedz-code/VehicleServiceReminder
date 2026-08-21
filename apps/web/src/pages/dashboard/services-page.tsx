'use client';

import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Calendar, Download, QrCode, Eye, Edit, Trash2, Copy } from 'lucide-react';
import { formatDate, formatNumber } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateQRCodeDataURL } from '@/lib/qr';
import { toast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const SERVICE_TYPES = [
  'Full Service',
  'Oil Change',
  'Brake Pad Replacement',
  'Brake Fluid Change',
  'Coolant Flush',
  'Transmission Service',
  'Tire Rotation',
  'Wheel Alignment',
  'Air Filter Replacement',
  'Cabin Filter Replacement',
  'Spark Plug Replacement',
  'Timing Belt Replacement',
  'Battery Replacement',
  'AC Service',
  'Other',
];

interface ServiceRecord {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  ownerName: string;
  serviceDate: number;
  serviceType: string;
  oilUsed?: string;
  mileageAtService: number;
  nextServiceMileage?: number;
  nextServiceDate?: number;
  qrToken: string;
  notes?: string;
}

export function ServicesPage() {
  const user = useOutletContext<{ id: string; email: string; name: string }>();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    vehicleId: '',
    serviceDate: new Date().toISOString().split('T')[0],
    serviceType: '',
    oilUsed: '',
    mileageAtService: '',
    nextServiceMileage: '',
    nextServiceDate: '',
    notes: '',
  });
  const [vehicles, setVehicles] = useState<Array<{ id: string; plateNumber: string; ownerName: string }>>([
    { id: '1', plateNumber: 'ABC 1234', ownerName: 'Ahmad' },
    { id: '2', plateNumber: 'W 4567 XY', ownerName: 'Siti' },
    { id: '3', plateNumber: 'PKR 890', ownerName: 'Raj' },
  ]);

  // Mock services
  const services: ServiceRecord[] = [
    {
      id: '1',
      vehicleId: '1',
      vehiclePlate: 'ABC 1234',
      ownerName: 'Ahmad',
      serviceDate: Date.now() - 30 * 24 * 60 * 60 * 1000,
      serviceType: 'Full Service',
      oilUsed: 'Shell Helix Ultra 5W-40',
      mileageAtService: 45000,
      nextServiceMileage: 50000,
      nextServiceDate: Date.now() + 60 * 24 * 60 * 60 * 1000,
      qrToken: 'abc123qrtoken',
      notes: 'Customer requested tire rotation too',
    },
    {
      id: '2',
      vehicleId: '2',
      vehiclePlate: 'W 4567 XY',
      ownerName: 'Siti',
      serviceDate: Date.now() - 60 * 24 * 60 * 60 * 1000,
      serviceType: 'Oil Change',
      oilUsed: 'Castrol Edge 5W-30',
      mileageAtService: 32000,
      nextServiceMileage: 37000,
      qrToken: 'def456qrtoken',
    },
  ];

  const filteredServices = services.filter(
    (s) =>
      s.vehiclePlate.toLowerCase().includes(search.toLowerCase()) ||
      s.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      s.serviceType.toLowerCase().includes(search.toLowerCase())
  );

  const openDialog = () => {
    setFormData({
      vehicleId: '',
      serviceDate: new Date().toISOString().split('T')[0],
      serviceType: '',
      oilUsed: '',
      mileageAtService: '',
      nextServiceMileage: '',
      nextServiceDate: '',
      notes: '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Mock API call
    const newService: ServiceRecord = {
      id: String(Date.now()),
      vehicleId: formData.vehicleId,
      vehiclePlate: vehicles.find(v => v.id === formData.vehicleId)?.plateNumber || '',
      ownerName: vehicles.find(v => v.id === formData.vehicleId)?.ownerName || '',
      serviceDate: new Date(formData.serviceDate).getTime(),
      serviceType: formData.serviceType,
      oilUsed: formData.oilUsed || undefined,
      mileageAtService: parseInt(formData.mileageAtService),
      nextServiceMileage: formData.nextServiceMileage ? parseInt(formData.nextServiceMileage) : undefined,
      nextServiceDate: formData.nextServiceDate ? new Date(formData.nextServiceDate).getTime() : undefined,
      qrToken: 'qr_' + Math.random().toString(36).substr(2, 24),
      notes: formData.notes || undefined,
    };
    services.unshift(newService);
    setDialogOpen(false);
    setQrDialogOpen(newService.qrToken);
    toast({ title: 'Service recorded!', description: 'QR code generated for customer.', variant: 'success' });
  };

  const copyQrUrl = async (qrToken: string) => {
    const url = `${window.location.origin}/service/${qrToken}`;
    await navigator.clipboard.writeText(url);
    toast({ title: 'Copied!', description: 'QR link copied to clipboard', variant: 'success' });
  };

  const downloadQR = async (qrToken: string) => {
    const url = `${window.location.origin}/service/${qrToken}`;
    const dataUrl = await generateQRCodeDataURL(url);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `service-qr-${qrToken}.png`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Records</h1>
          <p className="text-gray-500">View and manage all service records</p>
        </div>
        <Button onClick={openDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Service Record
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Services ({services.length})</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search plate, owner, service type..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Service Type</TableHead>
                <TableHead>Mileage</TableHead>
                <TableHead>Next Due</TableHead>
                <TableHead>QR</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>{formatDate(service.serviceDate)}</TableCell>
                  <TableCell className="font-mono font-medium">{service.vehiclePlate}</TableCell>
                  <TableCell>{service.ownerName}</TableCell>
                  <TableCell>{service.serviceType}</TableCell>
                  <TableCell>{formatNumber(service.mileageAtService)} km</TableCell>
                  <TableCell>
                    {service.nextServiceDate ? (
                      formatDate(service.nextServiceDate)
                    ) : service.nextServiceMileage ? (
                      `${formatNumber(service.nextServiceMileage)} km`
                    ) : (
                      <span className="text-gray-400">Not set</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => setQrDialogOpen(service.qrToken)}>
                      <QrCode className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => copyQrUrl(service.qrToken)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => downloadQR(service.qrToken)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Service Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Service Record</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleId">Vehicle *</Label>
                <Select value={formData.vehicleId} onValueChange={(v) => setFormData({ ...formData, vehicleId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.plateNumber} - {v.ownerName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="serviceDate">Service Date *</Label>
                  <Input
                    id="serviceDate"
                    type="date"
                    value={formData.serviceDate}
                    onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serviceType">Service Type *</Label>
                  <Select value={formData.serviceType} onValueChange={(v) => setFormData({ ...formData, serviceType: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="oilUsed">Oil Used</Label>
                <Input
                  id="oilUsed"
                  value={formData.oilUsed}
                  onChange={(e) => setFormData({ ...formData, oilUsed: e.target.value })}
                  placeholder="Shell Helix Ultra 5W-40"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="mileageAtService">Mileage at Service *</Label>
                  <Input
                    id="mileageAtService"
                    type="number"
                    value={formData.mileageAtService}
                    onChange={(e) => setFormData({ ...formData, mileageAtService: e.target.value })}
                    required
                    placeholder="45000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nextServiceMileage">Next Service Mileage</Label>
                  <Input
                    id="nextServiceMileage"
                    type="number"
                    value={formData.nextServiceMileage}
                    onChange={(e) => setFormData({ ...formData, nextServiceMileage: e.target.value })}
                    placeholder="50000"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nextServiceDate">Next Service Date</Label>
                  <Input
                    id="nextServiceDate"
                    type="date"
                    value={formData.nextServiceDate}
                    onChange={(e) => setFormData({ ...formData, nextServiceDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>
              <Separator />
              <p className="text-sm text-gray-500">
                This will consume 1 credit. Current balance: <span className="font-medium text-primary">238</span> credits.
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Service Record</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={!!qrDialogOpen} onOpenChange={(open) => !open && setQrDialogOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Service Record QR Code</DialogTitle>
          </DialogHeader>
          <DialogContent className="py-4 text-center">
            {qrDialogOpen && (
              <div className="space-y-4">
                <div id="qr-code" className="mx-auto" />
                <p className="text-sm text-gray-500">
                  Show this to customer or share link:
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={() => copyQrUrl(qrDialogOpen!)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Link
                  </Button>
                  <Button variant="outline" onClick={() => downloadQR(qrDialogOpen!)}>
                    <Download className="mr-2 h-4 w-4" />
                    Download PNG
                  </Button>
                </div>
                <p className="text-xs text-gray-400 break-all">
                  {window.location.origin}/service/{qrDialogOpen}
                </p>
              </div>
            )}
          </DialogContent>
          <DialogFooter>
            <Button onClick={() => setQrDialogOpen(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}