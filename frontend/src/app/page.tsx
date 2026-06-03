'use client';

import React from 'react';
import Link from 'next/link';

export default function PublicLandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* 1. PUBLIC MARKETING NAVIGATION BAR */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-slate-800/60 zero-opacity-layer">
        <div className="flex items-center space-x-3">
          <span className="text-2xl animate-pulse">🪞</span>
          <span className="font-black text-xl tracking-wider bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            MIRROR ME
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link 
            href="/login" 
            className="text-sm font-semibold text-slate-300 hover:text-white transition-colors px-4 py-2 rounded-xl"
          >
            Sign In
          </Link>
          <Link 
            href="/register" 
            className="text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* 2. HERO SHOWCASE BILLBOARD SECTION */}
      <main className="flex-1 max-w-5xl mx-auto px-6 flex flex-col items-center justify-center text-center py-12 md:py-20 my-auto">
        
        {/* Feature Pill Accent */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
          <span className="text-xs font-semibold text-indigo-300 tracking-wide uppercase">Next-Gen Virtualization</span>
        </div>

        {/* Core Catchy Marketing Title */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-6 leading-[1.15]">
          Clone Your Presence.<br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Scale Your Interactions.
          </span>
        </h1>

        {/* Descriptive Explainer Body */}
        <p className="text-slate-400 text-base sm:text-xl max-w-2xl font-normal leading-relaxed mb-12">
          Provision high-fidelity AI avatars, synthesize secure custom voice models, and dive into automated behavioral analytics frameworks using an all-in-one distributed ecosystem.
        </p>

        {/* Calls to Action Ramps */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link 
            href="/register" 
            className="w-full sm:w-auto text-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-base font-bold rounded-xl transition-all shadow-xl shadow-indigo-600/20 hover:scale-[1.03] active:scale-[0.97]"
          >
            Deploy Your Twin Free
          </Link>
          <Link 
            href="/login" 
            className="w-full sm:w-auto text-center px-8 py-4 bg-slate-950 hover:bg-slate-850 text-slate-300 hover:text-white text-base font-semibold rounded-xl border border-slate-800 transition-all"
          >
            Enterprise Console Log In
          </Link>
        </div>

        {/* Feature Capabilities Grid Teaser */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full mt-20 pt-12 border-t border-slate-800/50">
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left p-2">
            <span className="text-2xl mb-3">🤖</span>
            <h3 className="font-bold text-white text-sm tracking-wide mb-1">AI Video Avatars</h3>
            <p className="text-xs text-slate-400 leading-normal">Generate dynamic, lip-synced video streams using advanced deep rendering models.</p>
          </div>
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left p-2">
            <span className="text-2xl mb-3">🗣️</span>
            <h3 className="font-bold text-white text-sm tracking-wide mb-1">Voice Engineering</h3>
            <p className="text-xs text-slate-400 leading-normal">Clone emotional, natural-sounding synthetic vocal fingerprints with safety keys.</p>
          </div>
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left p-2">
            <span className="text-2xl mb-3">📈</span>
            <h3 className="font-bold text-white text-sm tracking-wide mb-1">Deep Session Analytics</h3>
            <p className="text-xs text-slate-400 leading-normal">Analyze interaction sentiment and unlock conversational token insights natively.</p>
          </div>
        </div>

      </main>

      {/* 3. FOOTER SIGNATURE ATTR */}
      <footer className="w-full text-center py-6 border-t border-slate-800/40">
        <p className="text-xs text-slate-500 tracking-wide">
          &copy; {new Date().getFullYear()} Mirror Me. All permissions secured. Built for scale.
        </p>
      </footer>

    </div>
  );
}
