'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface SidebarProps {
  onCloseMobileMenu?: () => void;
}

export default function Sidebar({ onCloseMobileMenu }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Unified configuration map for system dashboard navigation nodes
  const navigationLinks = [
    { name: 'Overview', href: '/dashboard', icon: '📊' },
    { name: 'AI Avatars', href: '/dashboard/avatars', icon: '🤖' },
    { name: 'Meetings', href: '/dashboard/meetings', icon: '📅' },
    { name: 'Analytics', href: '/dashboard/analytics', icon: '📈' },
    { name: 'Billing', href: '/dashboard/billing', icon: '💳' },
    { name: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
  ];

  const handleSessionTermination = () => {
    // Evict credentials from the user's browser memory store
    localStorage.removeItem('mirror_me_token');
    
    if (onCloseMobileMenu) {
      onCloseMobileMenu();
    }
    
    // Hard push execution to root authentication portal entry point
    router.push('/login');
  };

  return (
    <div className="w-full h-full bg-slate-950 p-6 flex flex-col justify-between border-r border-slate-800/60 select-none">
      
      {/* TOP SECTION: BRAND IDENTITY & INTERACTIVE ROUTE MAPS */}
      <div className="space-y-9">
        
        {/* Brand Core Billboard Layout */}
        <div className="flex items-center space-x-3 px-2">
          <span className="text-2xl animate-pulse">🪞</span>
          <span className="font-black text-xl tracking-wider bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            MIRROR ME
          </span>
        </div>

        {/* Dynamic Nav Link Stack */}
        <nav className="space-y-1.5" aria-label="Dashboard Sidebar Navigation">
          {navigationLinks.map((link) => {
            // Evaluates complete matching or deeper nested child execution layers
            const isRouteActive = pathname === link.href || pathname?.startsWith(`${link.href}/`);
            
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={onCloseMobileMenu}
                className={`
                  flex items-center space-x-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group
                  ${isRouteActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10'
                    : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-100'
                  }
                `}
              >
                <span className={`
                  text-base transition-transform duration-200 
                  ${isRouteActive ? 'scale-110' : 'group-hover:scale-110'}
                `}>
                  {link.icon}
                </span>
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

      </div>

      {/* BOTTOM SECTION: SESSION TERMINATION SYSTEM HUB */}
      <div className="pt-6 border-t border-slate-900/80">
        <button
          onClick={handleSessionTermination}
          className="w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl font-semibold text-sm text-rose-400 hover:bg-rose-500/10 transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-rose-500/20"
        >
          <span className="text-base">🚪</span>
          <span>Sign Out</span>
        </button>
      </div>

    </div>
  );
}
