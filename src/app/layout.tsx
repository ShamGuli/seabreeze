import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SeaBreeze Interactive Map',
  description: 'Interactive 3D map of SeaBreeze resort city, Baku, Azerbaijan',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={inter.className}
        style={{ margin: 0, padding: 0, overflow: 'hidden' }}
      >
        {children}
      </body>
    </html>
  );
}
