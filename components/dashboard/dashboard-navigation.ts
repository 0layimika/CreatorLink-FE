import { BarChart3, Home, Link2, Settings, ShoppingBag, Wallet } from 'lucide-react';

export const dashboardNavItems = [
  { name: 'Home', href: '/dashboard', icon: Home, exact: true },
  { name: 'My page', href: '/dashboard/links', icon: Link2 },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Store', href: '/dashboard/store', icon: ShoppingBag },
  { name: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
] as const;

export const dashboardUtilityItems = [
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
] as const;

export function isDashboardItemActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}
