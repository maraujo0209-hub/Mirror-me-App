'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface DashboardMetrics {
  totalMeetings: number;
  completedMeetings: number;
  aiProcessedSessions: number;
  totalTokensBurned: number;
  averageSessionSentiment: number;
}

interface RecentActivity {
  id: string;
  title: string;
  status: string;
  time: string;
}

export default function DashboardOverviewPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Mock list of recent activity tracking arrays
  const recentActivities: RecentActivity[] = [
    { id: '1', title: 'Q3 Strategy Sync Sync', status: 'Completed', time: '2 hours ago' },
    { id: '2', title: 'AI Avatar Rendering Pipeline #4', status: 'Processing', time: '4 hours ago' },
    { id: '3', title: 'Product Engineering Standup', status: 'Scheduled', time: 'Tomorrow at 10:00 AM' },
  ];

  useEffect(() => {
    const fetchDashboardTelemetry = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('mirror_me_token');
        
        // Connect directly to your combined Node/Express aggregated route
        const response = await fetch('http://localhost:5000/api/analytics/overview', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to synchronize dashboard analytical telemetry modules.');
        }

        const jsonResult = await response.json();
        if (jsonResult.success) {
          setMetrics(jsonResult.data);
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred linking to the backend infrastructure services.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardTelemetry();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 bg-slate-800 rounded-md w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-800 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-64 bg-slate-800 rounded-2xl"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl max-w-2xl">
        <h3 className="font-bold text-lg mb-1">Telemetry Synchronization Fault</h3>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      
      {/* HEADER BILLBOARD */}
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
          Dashboard Hub
        </h1>
        <p className="text-slate-400 text-sm md:text-base">
          Real-time execution performance metrics across your digital twin infrastructure.
        </p>
      </div>

      {/* METRIC CARDS GRID SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-2xl">📅</span>
            <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-3">Total Meetings</h3>
          </div>
          <p className="text-3xl font-black text-white mt-4">{metrics?.totalMeetings || 0}</p>
        </div>

        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-2xl">🤖</span>
            <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-3">AI Processed</h3>
          </div>
          <p className="text-3xl font-black text-indigo-400 mt-4">{metrics?.aiProcessedSessions || 0}</p>
        </div>

        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-2xl">⚡</span>
            <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-3">AI Tokens Spent</h3>
          </div>
          <p className="text-3xl font-black text-purple-400 mt-4">
            {(metrics?.totalTokensBurned || 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-2xl">🎭</span>
            <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-3">Avg Sentiment</h3>
          </div>
          <p className="text-3xl font-black text-emerald-400 mt-4">
            {metrics?.averageSessionSentiment ? `${metrics.averageSessionSentiment * 100}%` : '0%'}
          </p>
        </div>

      </div>

      {/* DETAILED WORKING TRACKS CONFIGURATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* RECENT INTERACTIONS SUMMARY PANEL */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white tracking-tight">Recent Activity</h2>
            <Link href="/dashboard/meetings" className="text-indigo-400 hover:text-indigo-300 font-medium text-xs transition-colors">
              View All Sessions →
            </Link>
          </div>
          
          <div className="divide-y divide-slate-800">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="py-4 first:pt-0 last:pb-0 flex justify-between items-center">
                <div className="min-w-0 pr-4">
                  <p className="text-sm font-semibold text-slate-200 truncate">{activity.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{activity.time}</p>
                </div>
                <span className={`
                  px-3 py-1 rounded-full text-xs font-medium tracking-wide border shrink-0
                  ${activity.status === 'Completed' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : activity.status === 'Processing'
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                  }
                `}>
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* QUICK SHORTCUT ACTIONS RAMP PANEL */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight mb-2">Quick Actions</h2>
            <p className="text-slate-400 text-xs mb-6">Instantly trigger pipelines or initialize virtual rooms.</p>
            
            <div className="space-y-3">
              <Link href="/dashboard/meetings" className="w-full block text-center px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium text-sm transition-all shadow-md shadow-indigo-600/10">
                🚀 Initialize New Meeting Room
              </Link>
              <Link href="/dashboard/avatars" className="w-full block text-center px-4 py-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 rounded-xl font-medium text-sm transition-all">
                🤖 Render Digital Twin Avatar
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-900 text-center">
            <span className="text-xs text-slate-500 font-medium">System Core Version 1.0.0</span>
          </div>
        </div>

      </div>

    </div>
  );
}
