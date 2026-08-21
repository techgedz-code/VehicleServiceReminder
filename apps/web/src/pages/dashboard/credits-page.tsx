'use client';

import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, CreditCard, History, ArrowDown, ArrowUp, RefreshCw } from 'lucide-react';
import { formatNumber, formatCurrency, formatDateTime } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const PACKAGES = [
  { id: 'starter', name: 'Starter', credits: 500, price: 100, popular: true },
  { id: 'growth', name: 'Growth', credits: 1100, price: 200, bonus: 100 },
  { id: 'pro', name: 'Professional', credits: 2800, price: 500, bonus: 300 },
];

export function CreditsPage() {
  const user = useOutletContext<{ id: string; email: string; name: string }>();
  const [purchaseDialog, setPurchaseDialog] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);

  // Mock data
  const balance = 238;
  const totalPurchased = 500;
  const ledger = [
    { id: '1', type: 'trial', amount: 5, description: 'Free trial credits', date: Date.now() - 30 * 24 * 60 * 60 * 1000 },
    { id: '2', type: 'purchase', amount: 500, description: 'Starter Pack - RM100', date: Date.now() - 25 * 24 * 60 * 60 * 1000, referenceId: 'pay_123' },
    { id: '3', type: 'usage', amount: -1, description: 'Service: ABC 1234 - Full Service', date: Date.now() - 20 * 24 * 60 * 60 * 1000, referenceId: 'svc_1' },
    { id: '4', type: 'usage', amount: -1, description: 'Service: W 4567 XY - Oil Change', date: Date.now() - 15 * 24 * 60 * 60 * 1000, referenceId: 'svc_2' },
    { id: '5', type: 'usage', amount: -1, description: 'Service: PKR 890 - Brake Pads', date: Date.now() - 10 * 24 * 60 * 60 * 1000, referenceId: 'svc_3' },
    { id: '6', type: 'usage', amount: -1, description: 'Service: JHN 2468 - Tire Rotation', date: Date.now() - 5 * 24 * 60 * 60 * 1000, referenceId: 'svc_4' },
  ];

  const handlePurchase = async (packageId: string) => {
    const pkg = PACKAGES.find(p => p.id === packageId);
    if (!pkg) return;
    
    setPaymentLoading(packageId);
    setPurchaseDialog(null);
    
    // Mock payment flow - in production, redirect to ToyyibPay
    try {
      // Simulate API call to create payment
      await new Promise(r => setTimeout(r, 1500));
      
      // For demo, auto-complete
      toast({ 
        title: 'Payment initiated!', 
        description: `Redirecting to payment gateway for ${pkg.name} pack...`,
        variant: 'success' 
      });
      
      // In real app: window.location.href = paymentUrl
    } catch {
      toast({ title: 'Error', description: 'Failed to initiate payment', variant: 'destructive' });
    } finally {
      setPaymentLoading(null);
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'purchase': return { label: 'Purchase', variant: 'success' as const, icon: <ArrowDown className="h-3 w-3" /> };
      case 'usage': return { label: 'Usage', variant: 'default' as const, icon: <ArrowUp className="h-3 w-3" /> };
      case 'trial': return { label: 'Trial', variant: 'secondary' as const, icon: <History className="h-3 w-3" /> };
      case 'refund': return { label: 'Refund', variant: 'warning' as const, icon: <RefreshCw className="h-3 w-3" /> };
      default: return { label: type, variant: 'outline' as const };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Credits Balance</h1>
          <p className="text-gray-500">Manage your service record credits</p>
        </div>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-r from-primary to-blue-600 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 font-medium">Available Credits</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-5xl font-bold">{formatNumber(balance)}</span>
                <Badge variant="secondary" className="text-base px-3 py-1">
                  {balance < 50 ? 'Low - Top Up Soon' : 'Good'}
                </Badge>
              </div>
              <p className="mt-2 text-blue-200 text-sm">
                {balance < 50 
                  ? 'You have less than 50 credits remaining. Consider topping up to avoid interruption.'
                  : 'You have plenty of credits for your service records.'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-200">Total Purchased</div>
              <div className="text-2xl font-bold">{formatNumber(totalPurchased)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Packages */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Top Up Credits</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {PACKAGES.map((pkg) => (
            <Card key={pkg.id} className={pkg.popular ? 'border-2 border-primary relative' : ''}>
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-medium px-2 py-0.5 rounded">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle>{pkg.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">{formatNumber(pkg.credits)}</div>
                  <div className="text-gray-500">credits</div>
                  {pkg.bonus && (
                    <div className="text-sm text-green-600 font-medium">+{pkg.bonus} bonus credits!</div>
                  )}
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{formatCurrency(pkg.price)}</div>
                  <div className="text-sm text-gray-500">RM {pkg.price / pkg.credits * 100} per 100 credits</div>
                </div>
                <Button
                  className="w-full"
                  variant={pkg.popular ? 'default' : 'outline'}
                  onClick={() => handlePurchase(pkg.id)}
                  loading={paymentLoading === pkg.id}
                >
                  {paymentLoading === pkg.id ? (
                    <> <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Processing... </> 
                  ) : (
                    <> Get {pkg.credits} Credits </> 
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment Methods Note */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <h3 className="font-medium text-amber-900">Payment via ToyyibPay (FPX)</h3>
              <p className="text-sm text-amber-800 mt-1">
                Secure online banking payment. Supports all major Malaysian banks.
                Credits are added instantly upon successful payment.
              </p>
              <p className="text-sm text-amber-700 mt-2">
                Minimum top-up: RM100 (500 credits). No expiry on purchased credits.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ledger.map((entry) => {
                const badge = getTypeBadge(entry.type);
                const isCredit = entry.amount > 0;
                return (
                  <TableRow key={entry.id}>
                    <TableCell>{formatDateTime(entry.date)}</TableCell>
                    <TableCell>
                      <Badge variant={badge.variant} className="gap-1">
                        {badge.icon} {badge.label}
                      </Badge>
                    </TableCell>
                    <TableCell className={isCredit ? 'text-green-600' : 'text-red-600'} font-mono>
                      {isCredit ? '+' : ''}{formatNumber(entry.amount)}
                    </TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell className="font-mono text-sm text-gray-500">
                      {entry.referenceId || '-'}
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

import { useState } from 'react';