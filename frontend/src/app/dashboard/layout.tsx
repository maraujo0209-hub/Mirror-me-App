'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Define navigation layout items matching your system routes
  const navigationItems = [
    { name: 'Overview', href: '/dashboard', icon: '📊' },
    { name: 'AI Avatars', href: '/dashboard/avatars', icon: '🤖' },
    { name: 'Meetings', href: '/dashboard/meetings', icon: '📅' },
    { name: 'Analytics', href: '/dashboard/analytics', icon: '📈' },
    { name: 'Billing', href: '/dashboard/billing', icon: '💳' },
    { name: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
  ];

  const handleLogout = () => {
    // Purge the session storage tracking keys and redirect to public access root
    localStorage.removeItem('mirror_me_token');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
      
      {/* 1. MOBILE HEADER BAR */}
      <header className="flex items-center justify-between px-6 py-4 bg-slate-950 md:hidden border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="text-xl">🪞</span>
          <span className="font-bold text-lg tracking-wide bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Mirror Me
          </span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-slate-400 hover:text-white focus:outline-none text-2xl"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </header>

      {/* 2. SIDEBAR NAVIGATION CONTAINER (DESKTOP & MOBILE TRANSITIONS) */}
      <aside className={`
        ${isMobileMenuOpen ? 'block' : 'hidden'} 
        md:block w-full md:w-64 bg-slate-950 p-6 flex flex-col justify-between border-r border-slate-800 shrink-0
      `}>
        <div className="space-y-8">
          {/* Brand Visual Logo Wrapper */}
          <div className="hidden md:flex items-center space-x-3 px-2">
            <span className="text-2xl">🪞</span>
            <span className="font-black text-xl tracking-wider bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              MIRROR ME
            </span>
          </div>

          {/* Dynamic Link Mapping Group */}
          <nav className="space-y-1.5">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm
                    ${isActive 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                    }
                  `}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Action Controls Section Footer */}
        <div className="pt-6 border-t border-slate-800 mt-6 md:mt-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm text-rose-400 hover:bg-rose-500/10 transition-colors duration-200"
          >
            <span className="text-base">🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 3. MAIN DASHBOARD CONTENT SUB-TREE VIEW WRAPPER */}
      <main className="flex-1 min-w-0 flex flex-col overflow-x-hidden">
        <div className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
      
    </div>
  );
}
