'use client';

import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { formatDate, getServiceStatus, formatNumber } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Vehicle {
  id: string;
  plateNumber: string;
  ownerName: string;
  ownerPhone?: string;
  ownerEmail?: string;
  pdpaConsent: boolean;
  latestService?: {
    serviceDate: number;
    serviceType: string;
    mileageAtService: number;
    nextServiceDate?: number;
    nextServiceMileage?: number;
  };
}

type BadgeVariant = 'default' | 'destructive' | 'success' | 'outline' | 'secondary' | 'warning';

export function CustomersPage() {
  const user = useOutletContext<{ id: string; email: string; name: string }>();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    plateNumber: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    pdpaConsent: false,
  });

  // Mock data
  const vehicles: Vehicle[] = [
    {
      id: '1',
      plateNumber: 'ABC 1234',
      ownerName: 'Ahmad bin Ali',
      ownerPhone: '012-3456789',
      ownerEmail: 'ahmad@email.com',
      pdpaConsent: true,
      latestService: {
        serviceDate: Date.now() - 30 * 24 * 60 * 60 * 1000,
        serviceType: 'Full Service',
        mileageAtService: 45000,
        nextServiceDate: Date.now() + 60 * 24 * 60 * 60 * 1000,
        nextServiceMileage: 50000,
      },
    },
    {
      id: '2',
      plateNumber: 'W 4567 XY',
      ownerName: 'Siti Nurhaliza',
      ownerPhone: '019-8765432',
      pdpaConsent: true,
      latestService: {
        serviceDate: Date.now() - 60 * 24 * 60 * 60 * 1000,
        serviceType: 'Oil Change',
        mileageAtService: 32000,
        nextServiceMileage: 37000,
      },
    },
    {
      id: '3',
      plateNumber: 'PKR 890',
      ownerName: 'Raj Kumar',
      pdpaConsent: false,
    },
  ];

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.plateNumber.toLowerCase().includes(search.toLowerCase()) ||
      v.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      v.ownerPhone?.toLowerCase().includes(search.toLowerCase())
  );

  const openDialog = (vehicle?: Vehicle) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData({
        plateNumber: vehicle.plateNumber,
        ownerName: vehicle.ownerName,
        ownerPhone: vehicle.ownerPhone || '',
        ownerEmail: vehicle.ownerEmail || '',
        pdpaConsent: vehicle.pdpaConsent,
      });
    } else {
      setEditingVehicle(null);
      setFormData({ plateNumber: '', ownerName: '', ownerPhone: '', ownerEmail: '', pdpaConsent: false });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // API call would go here
    setDialogOpen(false);
  };

  const getStatus = (vehicle: Vehicle): { label: string; variant: BadgeVariant } => {
    if (!vehicle.latestService) return { label: 'No Service', variant: 'outline' };
    const status = getServiceStatus(
      vehicle.latestService.nextServiceDate,
      vehicle.latestService.nextServiceMileage
    );
    const labels = { overdue: 'Overdue', 'due-soon': 'Due Soon', ok: 'OK' };
    const variants: Record<string, BadgeVariant> = { 
      overdue: 'destructive', 
      'due-soon': 'warning', 
      ok: 'success' 
    };
    return { label: labels[status], variant: variants[status] };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-gray-500">Manage your customer vehicles and service history</p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Vehicle
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Vehicles ({vehicles.length})</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search plate, name, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plate Number</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Last Service</TableHead>
                <TableHead>Next Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles.map((vehicle) => {
                const status = getStatus(vehicle);
                const lastService = vehicle.latestService;
                return (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-mono font-medium">{vehicle.plateNumber}</TableCell>
                    <TableCell>{vehicle.ownerName}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {vehicle.ownerPhone && <div>{vehicle.ownerPhone}</div>}
                        {vehicle.ownerEmail && <div className="text-gray-500">{vehicle.ownerEmail}</div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {lastService ? (
                        <>
                          <div>{formatDate(lastService.serviceDate)}</div>
                          <div className="text-sm text-gray-500">{lastService.serviceType}</div>
                        </>
                      ) : (
                        <span className="text-gray-400">No service yet</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {lastService?.nextServiceDate ? (
                        formatDate(lastService.nextServiceDate)
                      ) : lastService?.nextServiceMileage ? (
                        `${formatNumber(lastService.nextServiceMileage)} km`
                      ) : (
                        <span className="text-gray-400">Not set</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openDialog(vehicle)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Vehicle Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="plateNumber">Plate Number *</Label>
                <Input
                  id="plateNumber"
                  value={formData.plateNumber}
                  onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                  required
                  placeholder="ABC 1234"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerName">Owner Name *</Label>
                <Input
                  id="ownerName"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  required
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerPhone">Phone Number</Label>
                <Input
                  id="ownerPhone"
                  type="tel"
                  value={formData.ownerPhone}
                  onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                  placeholder="012-3456789"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerEmail">Email</Label>
                <Input
                  id="ownerEmail"
                  type="email"
                  value={formData.ownerEmail}
                  onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                  placeholder="john@email.com"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pdpaConsent"
                  checked={formData.pdpaConsent}
                  onChange={(e) => setFormData({ ...formData, pdpaConsent: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="pdpaConsent" className="text-sm">
                  Customer consents to storing contact details (PDPA)
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingVehicle ? 'Update' : 'Add Vehicle'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}