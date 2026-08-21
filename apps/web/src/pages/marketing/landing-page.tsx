import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, CalendarClock, QrCode, Smartphone, BarChart3, CreditCard } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Turn Every Service Into a{' '}
              <span className="text-primary">Return Visit</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Replace paper windscreen stickers with digital service records.
              Customers scan a QR code, save to their phone, and get automatic calendar reminders.
              You build a customer list that brings them back.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Free Trial
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              5 free credits • No credit card • RM100 = 500 records
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">How It Works</h2>
            <p className="mt-4 text-lg text-gray-600">Three simple steps to digital service records</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: QrCode,
                title: '1. Log Service',
                desc: 'Enter vehicle details, service type, oil used, mileage, and next due date. Generates a unique QR code instantly.',
              },
              {
                icon: Smartphone,
                title: '2. Customer Scans',
                desc: 'Customer scans QR with their phone camera. Opens instantly in browser — no app download required.',
              },
              {
                icon: CalendarClock,
                title: '3. Auto Reminder',
                desc: 'One tap adds to phone calendar with 1-week reminder. Customer saves to home screen for future reference.',
              },
            ].map((step, i) => (
              <Card key={i} className="text-center p-6">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                <CardHeader>
                  <CardTitle>{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Built for Workshops</h2>
            <p className="mt-4 text-lg text-gray-600">Everything you need to manage customers and drive repeat business</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Car, title: 'Customer Management', desc: 'Search, filter, and view complete service history per vehicle.' },
              { icon: CalendarClock, title: 'Upcoming Due Dashboard', desc: 'See who\'s due this week/month by date or mileage at a glance.' },
              { icon: BarChart3, title: 'Business Analytics', desc: 'Retention rate, service intervals, popular services, monthly volume.' },
              { icon: CreditCard, title: 'Simple Credits System', desc: '5 free credits to start. RM100 = 500 records. Transparent pricing.' },
              { icon: Smartphone, title: 'PWA for Customers', desc: 'Install to home screen, works offline, no app store needed.' },
              { icon: QrCode, title: 'QR Code Generation', desc: 'Unique QR per service record. Print, show on screen, or SMS.' },
            ].map((feature, i) => (
              <Card key={i} className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-gray-600">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Simple, Transparent Pricing</h2>
            <p className="mt-4 text-lg text-gray-600">Pay only for what you use. No monthly fees.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <Card className="p-6 border-2 border-gray-200">
              <div className="text-center">
                <h3 className="text-xl font-semibold">Free Trial</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">RM 0</span>
                  <span className="text-gray-500">/ 5 records</span>
                </div>
                <ul className="mt-6 space-y-3 text-left text-gray-600">
                  <li className="flex items-center gap-2">✓ 5 free service records</li>
                  <li className="flex items-center gap-2">✓ Full dashboard access</li>
                  <li className="flex items-center gap-2">✓ QR codes & calendar reminders</li>
                  <li className="flex items-center gap-2">✓ Analytics & CSV export</li>
                </ul>
                <Link to="/signup" className="mt-6 block">
                  <Button className="w-full">Start Free Trial</Button>
                </Link>
              </div>
            </Card>
            <Card className="p-6 border-2 border-primary relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-medium px-2 py-0.5 rounded">
                Most Popular
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold">Starter Pack</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">RM 100</span>
                  <span className="text-gray-500">/ 500 records</span>
                </div>
                <p className="mt-2 text-sm text-gray-500">RM 0.20 per record</p>
                <ul className="mt-6 space-y-3 text-left text-gray-600">
                  <li className="flex items-center gap-2">✓ 500 service records</li>
                  <li className="flex items-center gap-2">✓ All Free Trial features</li>
                  <li className="flex items-center gap-2">✓ Priority support</li>
                  <li className="flex items-center gap-2">✓ No expiry on credits</li>
                </ul>
                <Link to="/signup" className="mt-6 block">
                  <Button className="w-full bg-primary hover:bg-primary-hover">Get Started</Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to Digitize Your Service Records?</h2>
          <p className="mt-4 text-lg text-blue-100">Join workshops across Malaysia using ServiceMate to bring customers back.</p>
          <Link to="/signup" className="mt-8 inline-block">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900">ServiceMate</h3>
              <p className="mt-2 text-sm text-gray-500">Digital service records for modern workshops.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Product</h4>
              <ul className="mt-3 space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-primary">Features</a></li>
                <li><a href="#" className="hover:text-primary">Pricing</a></li>
                <li><a href="#" className="hover:text-primary">Demo</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Company</h4>
              <ul className="mt-3 space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-primary">About</a></li>
                <li><a href="#" className="hover:text-primary">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Legal</h4>
              <ul className="mt-3 space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
            © 2025 ServiceMate. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}