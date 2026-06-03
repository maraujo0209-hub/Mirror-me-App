import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // Ensure your global Tailwind configurations are imported here

// Optimize font delivery out-of-the-box using standard Next.js font packages
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// Configure base SEO and indexing metadata headers for the client browser
export const metadata: Metadata = {
  title: 'Mirror Me | Enterprise AI Twin Portal',
  description: 'Provisions digital workspaces, virtualized cloning engines, and interaction analytics summaries.',
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: '/favicon.ico', // Ensure an asset is dropped in public/ folder if required
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${inter.variable} h-full scroll-smooth`}>
      <body className="h-full bg-slate-900 text-slate-100 antialiased font-sans select-none selection:bg-indigo-500/30 selection:text-indigo-200">
        
        {/* Main Application Container Mount Point */}
        <div className="relative min-h-screen flex flex-col isolation-isolate">
          {children}
        </div>

      </body>
    </html>
  );
}
