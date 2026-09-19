import type { Metadata } from 'next';
import { AppProviders } from './providers';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'CodeQuest',
  description: 'Pixel-themed coding education platform',
};

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
