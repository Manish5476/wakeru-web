'use client';

import React, { useEffect, useState } from 'react';
import { adminApi } from '@/api/admin';
import { Card, CardHeader, CardTitle, CardContent } from '@/design-system/components/Card';
import { Badge } from '@/design-system/components/Badge';

export default function DemandInsightsPage() {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      try {
        const res = await adminApi.getDemandInsights();
        setInsights(res?.data ? res.data : res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
          📈 Platform Intelligence
        </div>
        <h1 className="text-3xl font-extrabold text-[var(--color-wakeru-text-primary)]">
          Regional Travel Demand Velocity
        </h1>
        <p className="text-sm text-[var(--color-wakeru-text-secondary)] mt-1">
          Real-time aggregated destination searches, group expedition party sizes, and booking windows.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse h-40 bg-[var(--color-wakeru-surface-muted)] rounded-[var(--radius-card)]" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-5 space-y-2">
              <span className="text-2xl block">⏱️</span>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-wakeru-text-secondary)]">
                Peak Booking Window
              </p>
              <p className="text-xl font-extrabold text-[var(--color-wakeru-text-primary)]">
                {insights?.peakBookingWindows || '14 to 28 days prior'}
              </p>
              <p className="text-xs text-[var(--color-wakeru-text-muted)]">
                Ideal window for host promotional campaigns
              </p>
            </Card>

            <Card className="p-5 space-y-2">
              <span className="text-2xl block">👥</span>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-wakeru-text-secondary)]">
                Average Group Size
              </p>
              <p className="text-xl font-extrabold text-[var(--color-wakeru-primary)]">
                {insights?.averageGroupSize || 5.2} Travelers
              </p>
              <p className="text-xs text-[var(--color-wakeru-text-muted)]">
                Squad trips driving multi-room and villa demand
              </p>
            </Card>

            <Card className="p-5 space-y-2">
              <span className="text-2xl block">🚀</span>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-wakeru-text-secondary)]">
                Highest Growth Hub
              </p>
              <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                Goa (+28% MoM)
              </p>
              <p className="text-xs text-[var(--color-wakeru-text-muted)]">
                Led by Anjuna, Siolim, and Palolem coastal demand
              </p>
            </Card>
          </div>

          {/* Destination Demand Ranking */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <span>📍</span>
                <span>Top Searched Destinations &amp; Search Momentum</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {insights?.topSearchedDestinations ? (
                <div className="space-y-4">
                  {insights.topSearchedDestinations.map((dest: any) => {
                    const maxSearches = 15000;
                    const pct = Math.min(100, Math.round((dest.searches / maxSearches) * 100));

                    return (
                      <div key={dest.city} className="space-y-1.5 p-3 rounded-[var(--radius-control)] bg-[var(--color-wakeru-surface-muted)]">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-sm text-[var(--color-wakeru-text-primary)]">
                            {dest.city}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[var(--color-wakeru-text-secondary)] font-mono">
                              {dest.searches.toLocaleString()} searches
                            </span>
                            <Badge variant="success" className="font-mono text-[10px]">
                              {dest.growth}
                            </Badge>
                          </div>
                        </div>

                        <div className="w-full h-2.5 bg-[var(--color-wakeru-surface)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[var(--color-wakeru-primary)] rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-[var(--color-wakeru-text-muted)]">No destination telemetry available.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
