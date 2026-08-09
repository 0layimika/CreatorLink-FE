import type { Metadata } from 'next';
import { AppProviders } from '@/components/providers/AppProviders';
import './globals.css';

export const metadata: Metadata = {
  title: 'LinkVerse — Your whole creator world, one link',
  description:
    'Bring your content, shop, bookings and supporter gifts together in one link that feels like you.',
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var t = localStorage.getItem('app-theme') || 'light';
                  document.documentElement.setAttribute('data-theme', t);
                } catch (e) {
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
