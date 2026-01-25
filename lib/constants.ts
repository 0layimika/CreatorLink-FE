export const theme = {
  colors: {
    background: '#faf9f7',
    card: '#ffffff',
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    secondary: '#0891b2',
    textPrimary: '#1a1a1a',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    success: '#16a34a',
    warning: '#d97706',
    error: '#dc2626',
    muted: '#f1f5f9',
  },
} as const;

export const siteConfig = {
  name: 'LinkVerse',
  description: 'Links & Tips for Creators',
  url: 'https://linkverse.com',
  logo: '/logo.png',
} as const;

export const dashboardNavItems = [
  { name: 'Dashboard', href: '/dashboard', icon: 'Home' },
  { name: 'Links', href: '/dashboard/links', icon: 'Link' },
  { name: 'Analytics', href: '/dashboard/analytics', icon: 'BarChart3' },
  { name: 'Wallet', href: '/dashboard/wallet', icon: 'Wallet' },
  { name: 'Media Kit', href: '/dashboard/media-kit', icon: 'FileText' },
] as const;

export const socialPlatforms = [
  { id: 'instagram', name: 'Instagram', color: '#E4405F' },
  { id: 'tiktok', name: 'TikTok', color: '#000000' },
  { id: 'youtube', name: 'YouTube', color: '#FF0000' },
  { id: 'twitter', name: 'Twitter', color: '#1DA1F2' },
  { id: 'spotify', name: 'Spotify', color: '#1DB954' },
  { id: 'website', name: 'Website', color: '#2563eb' },
] as const;
