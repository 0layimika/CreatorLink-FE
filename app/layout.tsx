import type { Metadata } from 'next';
import { AppProviders } from '@/components/providers/AppProviders';
import './globals.css';

export const metadata: Metadata = {
  title: 'LinkVerse - Links & Tips for Creators',
  description:
    'The all-in-one link-in-bio platform for creators. Consolidate your social profiles, accept tips, track analytics, and grow your audience.',
  keywords: ['creator', 'link in bio', 'social media', 'analytics', 'tips', 'linkverse'],
  icons: {
    icon: [
      { url: '/favicon.ico?v=2' },
      { url: '/logo-mark-v2.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico?v=2',
    apple: '/logo-mark-v2-square.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
