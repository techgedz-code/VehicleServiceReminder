'use client';

import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, Car, AlertTriangle } from 'lucide-react';
import { formatDate, getServiceStatus, formatNumber } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DueService {
  id: string;
  vehiclePlate: string;
  ownerName: string;
  ownerPhone?: string;
  serviceType: string;
  mileageAtService: number;
  nextServiceDate?: number;
  nextServiceMileage?: number;
  daysUntil?: number;
  status: 'overdue' | 'due-soon' | 'ok';
}

type FilterType = 'all' | 'overdue' | 'due-soon' | 'by-mileage';

export function DuePage() {
  const user = useOutletContext<{ id: string; email: string; name: string }>();
  const [filter, setFilter] = useState<FilterType>('all');

  // Mock data
  const dueServices: DueService[] = [
    {
      id: '1',
      vehiclePlate: 'ABC 1234',
      ownerName: 'Ahmad bin Ali',
      ownerPhone: '012-3456789',
      serviceType: 'Full Service',
      mileageAtService: 45000,
      nextServiceDate: Date.now() - 5 * 24 * 60 * 60 * 1000,
      nextServiceMileage: 50000,
      daysUntil: -5,
      status: 'overdue',
    },
    {
      id: '2',
      vehiclePlate: 'W 4567 XY',
      ownerName: 'Siti Nurhaliza',
      ownerPhone: '019-8765432',
      serviceType: 'Oil Change',
      mileageAtService: 32000,
      nextServiceDate: Date.now() + 3 * 24 * 60 * 60 * 1000,
      nextServiceMileage: 37000,
      daysUntil: 3,
      status: 'due-soon',
    },
    {
      id: '3',
      vehiclePlate: 'PKR 890',
      ownerName: 'Raj Kumar',
      serviceType: 'Brake Pad Replacement',
      mileageAtService: 28000,
      nextServiceMileage: 33000,
      status: 'due-soon',
    },
    {
      id: '4',
      vehiclePlate: 'JHN 2468',
      ownerName: 'Lim Wei',
      ownerPhone: '016-1122334',
      serviceType: 'Tire Rotation',
      mileageAtService: 40000,
      nextServiceDate: Date.now() + 14 * 24 * 60 * 60 * 1000,
      nextServiceMileage: 45000,
      daysUntil: 14,
      status: 'ok',
    },
    {
      id: '5',
      vehiclePlate: 'SGP 1357',
      ownerName: 'Tan Ah Kow',
      ownerPhone: '017-5566778',
      serviceType: 'Coolant Flush',
      mileageAtService: 55000,
      nextServiceDate: Date.now() - 2 * 24 * 60 * 60 * 1000,
      status: 'overdue',
    },
  ];

  const filteredServices = dueServices.filter((s) => {
    if (filter === 'all') return true;
    if (filter === 'by-mileage') return s.nextServiceMileage && !s.nextServiceDate;
    return s.status === filter;
  });

  const overdueCount = dueServices.filter(s => s.status === 'overdue').length;
  const dueSoonCount = dueServices.filter(s => s.status === 'due-soon').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upcoming Due Services</h1>
          <p className="text-gray-500">Vehicles due for service by date or mileage</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(value) => setFilter(value as FilterType)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="overdue">Overdue ({overdueCount})</SelectItem>
              <SelectItem value="due-soon">Due Soon ({dueSoonCount})</SelectItem>
              <SelectItem value="by-mileage">By Mileage</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Overdue</CardTitle>
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{overdueCount}</div>
            <p className="text-sm text-gray-500">Past due date</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Due This Week</CardTitle>
            <CalendarClock className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{dueSoonCount}</div>
            <p className="text-sm text-gray-500">Due within 7 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">By Mileage</CardTitle>
            <Car className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {dueServices.filter(s => s.nextServiceMileage && !s.nextServiceDate).length}
            </div>
            <p className="text-sm text-gray-500">Mileage-based only</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Last Service</TableHead>
                <TableHead>Next Due (Date)</TableHead>
                <TableHead>Next Due (Mileage)</TableHead>
                <TableHead>Days</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.map((service) => {
                const statusIcons = {
                  overdue: <AlertTriangle className="h-4 w-4" />,
                  'due-soon': <CalendarClock className="h-4 w-4" />,
                  ok: <Car className="h-4 w-4" />,
                };
                return (
                  <TableRow key={service.id} className={service.status === 'overdue' ? 'bg-red-50' : ''}>
                    <TableCell>
                      <Badge variant={service.status === 'ok' ? 'success' : service.status === 'due-soon' ? 'warning' : 'destructive'} className="gap-1">
                        {statusIcons[service.status]}
                        {service.status.charAt(0).toUpperCase() + service.status.slice(1).replace('-', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono font-medium">{service.vehiclePlate}</TableCell>
                    <TableCell>
                      <div>{service.ownerName}</div>
                      {service.ownerPhone && <div className="text-sm text-gray-500">{service.ownerPhone}</div>}
                    </TableCell>
                    <TableCell>{service.serviceType} • {formatNumber(service.mileageAtService)} km</TableCell>
                    <TableCell>
                      {service.nextServiceDate ? formatDate(service.nextServiceDate) : <span className="text-gray-400">Not set</span>}
                    </TableCell>
                    <TableCell>
                      {service.nextServiceMileage ? `${formatNumber(service.nextServiceMileage)} km` : <span className="text-gray-400">Not set</span>}
                    </TableCell>
                    <TableCell>
                      {service.daysUntil !== undefined && (
                        <span className={service.daysUntil < 0 ? 'text-red-600 font-medium' : service.daysUntil <= 7 ? 'text-amber-600 font-medium' : 'text-green-600'}>
                          {service.daysUntil < 0 ? `${Math.abs(service.daysUntil)} days ago` : `${service.daysUntil} days`}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Contact</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}