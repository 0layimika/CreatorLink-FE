import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'NGN'): string {
  const formatter = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  if (currency === 'NGN') {
    return `₦${amount.toLocaleString()}`;
  }

  return formatter.format(amount);
}

export function formatNumber(num: number | null | undefined): string {
  // Handle null, undefined, or invalid numbers
  if (num == null || isNaN(num)) {
    return '0';
  }
  
  // Ensure we have a valid number
  const validNum = typeof num === 'number' ? num : Number(num);
  
  if (isNaN(validNum)) {
    return '0';
  }
  
  if (validNum >= 1000000) {
    return (validNum / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (validNum >= 1000) {
    return (validNum / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return validNum.toString();
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
