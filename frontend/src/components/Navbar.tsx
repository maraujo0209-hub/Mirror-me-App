'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Apply a dynamic glass-morphism backdrop when the user scrolls down the landing page
  useEffect(() => {
    const handleScrollLifecycle = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScrollLifecycle);
    return () => window.removeEventListener('scroll', handleScrollLifecycle);
  }, []);

  return (
    <header className={`
      fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b
      ${isScrolled 
        ? 'bg-slate-900/80 backdrop-blur-md border-slate-800/80 py-4 shadow-lg shadow-slate-950/20' 
        : 'bg-transparent border-transparent py-6'
      }
    `}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* 1. BRAND LOGO TARGET */}
        <Link href="/" className="flex items-center space-x-3 group outline-none">
          <span className="text-2xl transition-transform duration-300 group-hover:rotate-12">🪞</span>
          <span className="font-black text-xl tracking-wider bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            MIRROR ME
          </span>
        </Link>

        {/* 2. DESKTOP MARKETING NAVIGATION LINKS */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
            Features
          </Link>
          <Link href="#pricing" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
            Pricing
          </Link>
          <Link href="#technology" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
            Technology
          </Link>
        </nav>

        {/* 3. DESKTOP ACTION RAMPS */}
        <div className="hidden md:flex items-center space-x-4">
          <Link 
            href="/login" 
            className="text-sm font-semibold text-slate-300 hover:text-white transition-colors px-4 py-2"
          >
            Sign In
          </Link>
          <Link 
            href="/register" 
            className="text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/10 hover:scale-[1.02] active:scale-[0.98]"
          >
            Get Started
          </Link>
        </div>

        {/* 4. MOBILE HAMBURGER TOGGLE BUTTON */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-slate-400 hover:text-white focus:outline-none text-2xl transition-colors"
          aria-label="Toggle structural marketing navigation menu"
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>

      </div>

      {/* 5. MOBILE DROPDOWN SHELF OVERLAY */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-950/95 backdrop-blur-lg border-b border-slate-800 px-6 py-6 space-y-6 animate-fadeIn">
          <nav className="flex flex-col space-y-4">
            <Link 
              href="#features" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-base font-medium text-slate-300 hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link 
              href="#pricing" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-base font-medium text-slate-300 hover:text-white transition-colors"
            >
              Pricing
            </Link>
            <Link 
              href="#technology" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-base font-medium text-slate-300 hover:text-white transition-colors"
            >
              Technology
            </Link>
          </nav>
          
          <div className="pt-4 border-t border-slate-900 flex flex-col space-y-3">
            <Link 
              href="/login" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full text-center py-3 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/register" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full text-center py-3 text-sm font-bold bg-indigo-600 text-white rounded-xl transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
