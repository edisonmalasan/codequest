import type { Metadata, Viewport } from 'next';
import { AppProviders } from './providers';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'CodeQuest',
  description: 'Pixel-themed coding education platform',
  applicationName: 'CodeQuest',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'CodeQuest', statusBarStyle: 'default' },
  icons: { apple: '/icons/apple-touch-icon.png' },
};

export const viewport: Viewport = { themeColor: '#070a12' };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
