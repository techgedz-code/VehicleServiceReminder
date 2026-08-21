'use client';

import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, ClipboardList, CalendarClock, TrendingUp, CreditCard, ArrowRight } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  href?: string;
}

function StatCard({ title, value, icon, trend, trendUp, href }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className={trendUp ? 'text-green-600' : 'text-red-600'}>{trend}</p>
        )}
        {href && (
          <a href={href} className="mt-2 inline-flex items-center text-sm text-primary hover:underline">
            View details <ArrowRight className="ml-1 h-4 w-4" />
          </a>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const user = useOutletContext<{ id: string; email: string; name: string }>();
  
  // Mock data - replace with real API calls
  const stats = {
    totalCustomers: 127,
    totalServices: 483,
    thisMonthServices: 42,
    creditsBalance: 238,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-gray-500">Welcome back, {user?.name}</p>
        </div>
        <Button asChild>
          <a href="/dashboard/services/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </a>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Customers"
          value={formatNumber(stats.totalCustomers)}
          icon={<Users className="h-5 w-5 text-primary" />}
          href="/dashboard/customers"
        />
        <StatCard
          title="Total Services"
          value={formatNumber(stats.totalServices)}
          icon={<ClipboardList className="h-5 w-5 text-primary" />}
          href="/dashboard/services"
        />
        <StatCard
          title="This Month"
          value={formatNumber(stats.thisMonthServices)}
          icon={<CalendarClock className="h-5 w-5 text-primary" />}
          trend="+12% vs last month"
          trendUp={true}
          href="/dashboard/services"
        />
        <StatCard
          title="Credits Balance"
          value={formatNumber(stats.creditsBalance)}
          icon={<CreditCard className="h-5 w-5 text-primary" />}
          trend={stats.creditsBalance < 50 ? 'Low - Top up needed' : 'Good'}
          trendUp={stats.creditsBalance >= 50}
          href="/dashboard/credits"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full justify-start">
              <a href="/dashboard/services/new">
                <Plus className="mr-2 h-4 w-4" />
                Log New Service
              </a>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <a href="/dashboard/customers">
                <Users className="mr-2 h-4 w-4" />
                View Customers
              </a>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <a href="/dashboard/due">
                <CalendarClock className="mr-2 h-4 w-4" />
                Check Due Services
              </a>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <a href="/dashboard/analytics">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Analytics
              </a>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <a href="/dashboard/credits">
                <CreditCard className="mr-2 h-4 w-4" />
                Manage Credits
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Services */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Services</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <a href="/dashboard/services">View All</a>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { plate: 'ABC 1234', owner: 'Ahmad', date: 'Jan 15, 2025', type: 'Full Service', status: 'completed' },
                { plate: 'W 4567 XY', owner: 'Siti', date: 'Jan 14, 2025', type: 'Oil Change', status: 'completed' },
                { plate: 'PKR 890', owner: 'Raj', date: 'Jan 13, 2025', type: 'Brake Pads', status: 'completed' },
                { plate: 'JHN 2468', owner: 'Lim', date: 'Jan 12, 2025', type: 'Tire Rotation', status: 'completed' },
              ].map((service, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium">{service.plate}</p>
                    <p className="text-sm text-gray-500">{service.owner} • {service.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{service.date}</p>
                    <Badge variant="success">{service.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}