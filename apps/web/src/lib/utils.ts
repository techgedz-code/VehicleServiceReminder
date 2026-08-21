import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: number | Date, options?: Intl.DateTimeFormatOptions) {
  const d = typeof date === 'number' ? new Date(date) : date;
  return d.toLocaleDateString('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
}

export function formatDateTime(date: number | Date) {
  const d = typeof date === 'number' ? new Date(date) : date;
  return d.toLocaleString('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatNumber(num: number) {
  return num.toLocaleString('en-MY');
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getDaysUntil(date: number | Date) {
  const target = typeof date === 'number' ? new Date(date) : date;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getStatusColor(status: 'overdue' | 'due-soon' | 'ok') {
  switch (status) {
    case 'overdue': return 'text-red-600 bg-red-50';
    case 'due-soon': return 'text-amber-600 bg-amber-50';
    default: return 'text-green-600 bg-green-50';
  }
}

export function getServiceStatus(nextServiceDate?: number, nextServiceMileage?: number, currentMileage?: number) {
  if (nextServiceDate) {
    const days = getDaysUntil(nextServiceDate);
    if (days < 0) return 'overdue';
    if (days <= 7) return 'due-soon';
  }
  if (nextServiceMileage && currentMileage && currentMileage >= nextServiceMileage) {
    return 'overdue';
  }
  return 'ok';
}

export function generateId() {
  return crypto.randomUUID();
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
}