import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KMB Route Mapper',
  description: 'Clear Citymapper-style Hong Kong route planner UI',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-HK">
      <body>{children}</body>
    </html>
  );
}
