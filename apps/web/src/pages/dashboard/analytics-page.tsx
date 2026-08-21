'use client';

import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { formatNumber, formatCurrency } from '@/lib/utils';

const COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export function AnalyticsPage() {
  const user = useOutletContext<{ id: string; email: string; name: string }>();

  // Mock analytics data
  const monthlyVolume = [
    { month: 'Aug 2024', services: 28 },
    { month: 'Sep 2024', services: 35 },
    { month: 'Oct 2024', services: 42 },
    { month: 'Nov 2024', services: 38 },
    { month: 'Dec 2024', services: 51 },
    { month: 'Jan 2025', services: 45 },
  ];

  const serviceTypes = [
    { name: 'Full Service', value: 156 },
    { name: 'Oil Change', value: 134 },
    { name: 'Brake Pads', value: 67 },
    { name: 'Tire Rotation', value: 45 },
    { name: 'Battery', value: 32 },
    { name: 'AC Service', value: 28 },
    { name: 'Other', value: 21 },
  ];

  const retentionData = [
    { month: 'Aug 2024', rate: 72 },
    { month: 'Sep 2024', rate: 68 },
    { month: 'Oct 2024', rate: 75 },
    { month: 'Nov 2024', rate: 71 },
    { month: 'Dec 2024', rate: 78 },
    { month: 'Jan 2025', rate: 74 },
  ];

  const stats = {
    totalCustomers: 127,
    totalServices: 483,
    avgServiceInterval: 89,
    retentionRate: 73.5,
    thisMonthServices: 42,
    creditsBalance: 238,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-gray-500">Business insights and performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(stats.totalCustomers)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(stats.totalServices)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{formatNumber(stats.thisMonthServices)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Avg Interval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.avgServiceInterval} days</div>
            <p className="text-sm text-gray-500">Between services</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Retention Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.retentionRate}%</div>
            <p className="text-sm text-gray-500">90-day returning</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Credits Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(stats.creditsBalance)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Volume */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Service Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyVolume}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                    labelStyle={{ color: '#1f2937', fontWeight: 600 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="services"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Service Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Service Types Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {serviceTypes.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [formatNumber(value), 'services']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Retention Rate */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>90-Day Retention Rate Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={retentionData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis domain={[0, 100]} className="text-xs" tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                    labelStyle={{ color: '#1f2937', fontWeight: 600 }}
                    formatter={(value: number) => [`${value}%`, 'Retention Rate']}
                  />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="#16a34a"
                    strokeWidth={2}
                    dot={{ fill: '#16a34a', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Top Services This Month</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: 'Full Service', count: 18, revenue: 3600 },
              { name: 'Oil Change', count: 15, revenue: 1800 },
              { name: 'Brake Pads', count: 6, revenue: 2400 },
              { name: 'Tire Rotation', count: 3, revenue: 450 },
            ].map((svc, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
                    style={{ backgroundColor: COLORS[i] }}
                  >
                    {i + 1}
                  </div>
                  <span className="font-medium">{svc.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">{svc.count} services</div>
                  <div className="text-sm text-gray-500">{formatCurrency(svc.revenue)}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">New Customers (30d)</span>
                <span className="font-medium">12</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-primary rounded-full" style={{ width: '40%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Repeat Customers</span>
                <span className="font-medium">89%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-green-600 rounded-full" style={{ width: '89%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Avg Services/Customer</span>
                <span className="font-medium">3.8</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Credits Used (30d)</span>
                <span className="font-medium">42</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Estimate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">RM 12,450</div>
              <div className="text-sm text-gray-500">This Month</div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">+12%</div>
                <div className="text-xs text-gray-500">vs Last Month</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary">RM 0.20</div>
                <div className="text-xs text-gray-500">Per Record Cost</div>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              View Detailed Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}