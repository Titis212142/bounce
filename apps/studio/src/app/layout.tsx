import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dopamine Orbs Studio',
  description: 'Generate and publish TikTok videos automatically',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
