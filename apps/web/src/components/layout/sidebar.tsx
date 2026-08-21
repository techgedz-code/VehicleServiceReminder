'use client';

import * as React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Car,
  ClipboardList,
  CalendarClock,
  BarChart3,
  Settings,
  CreditCard,
  LogOut,
} from 'lucide-react';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Customers', href: '/dashboard/customers', icon: Car },
  { name: 'Services', href: '/dashboard/services', icon: ClipboardList },
  { name: 'Upcoming Due', href: '/dashboard/due', icon: CalendarClock },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Credits', href: '/dashboard/credits', icon: CreditCard },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white transition-transform lg:translate-x-0">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6">
          <NavLink to="/dashboard" className="text-xl font-bold text-primary">
            ServiceMate
          </NavLink>
        </div>
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto" aria-label="Main navigation">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
        <div className="border-t border-gray-200 p-4">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100">
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}