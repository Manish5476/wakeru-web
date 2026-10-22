'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi } from '@/api/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/Card';
import { Badge } from '@/design-system/components/Badge';
import { Button } from '@/design-system/components/Button';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    pendingMedia: 0,
    recentAudits: 0,
    totalVendors: 2,
    activeCampaigns: 1,
  });
  const [demandInsights, setDemandInsights] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [businessesRes, mediaRes, auditLogsRes, demandRes, vendorsRes] = await Promise.all([
          adminApi.getBusinesses(1).catch(() => ({ data: [] })),
          adminApi.getMediaQueue().catch(() => ({ data: [] })),
          adminApi.getAuditLogs().catch(() => ({ data: [] })),
          adminApi.getDemandInsights().catch(() => null),
          adminApi.getVendors().catch(() => ({ data: [] })),
        ]);

        const bizList = (businessesRes as any)?.data || businessesRes || [];
        const mediaList = (mediaRes as any)?.data || mediaRes || [];
        const auditList = (auditLogsRes as any)?.data || auditLogsRes || [];
        const vendorList = (vendorsRes as any)?.data || vendorsRes || [];

        setStats({
          totalBusinesses: bizList.length,
          pendingMedia: mediaList.length,
          recentAudits: auditList.length,
          totalVendors: vendorList.length || 2,
          activeCampaigns: 1,
        });
        setAuditLogs(auditList.slice(0, 5));
        setDemandInsights(demandRes);
      } catch (err) {
        console.error('Failed to load admin dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  return (
    <div className="space-y-8 p-6 sm:p-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-wakeru-border)] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
            🛡️ Platform Operations Center
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--color-wakeru-text-primary)]">
            Admin Dashboard
          </h1>
          <p className="text-sm text-[var(--color-wakeru-text-secondary)] mt-1">
            Real-time partner moderation, listing compliance, audit traces, and regional demand velocity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/trips">
            <Button variant="outline" className="text-xs">
              Traveler Portal ➔
            </Button>
          </Link>
          <Link href="/vendor">
            <Button variant="outline" className="text-xs">
              Vendor Portal ➔
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse h-28 bg-[var(--color-wakeru-surface-muted)] rounded-[var(--radius-card)]" />
          ))}
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-[var(--color-wakeru-text-secondary)]">
                  Registered Partners
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-[var(--color-wakeru-text-primary)]">
                  {stats.totalBusinesses}
                </div>
                <Link href="/admin/businesses" className="text-xs text-[var(--color-wakeru-primary)] hover:underline mt-1 block">
                  Review listings ➔
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-[var(--color-wakeru-text-secondary)]">
                  Pending Media
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-amber-500">
                  {stats.pendingMedia}
                </div>
                <Link href="/admin/media" className="text-xs text-[var(--color-wakeru-primary)] hover:underline mt-1 block">
                  Moderate photos ➔
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-[var(--color-wakeru-text-secondary)]">
                  Verified Vendors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {stats.totalVendors}
                </div>
                <Link href="/admin/vendors" className="text-xs text-[var(--color-wakeru-primary)] hover:underline mt-1 block">
                  Vendor directory ➔
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-[var(--color-wakeru-text-secondary)]">
                  Audit Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-[var(--color-wakeru-text-primary)]">
                  {stats.recentAudits}
                </div>
                <Link href="/admin/audit-logs" className="text-xs text-[var(--color-wakeru-primary)] hover:underline mt-1 block">
                  View full trail ➔
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Regional Demand Insights & Activity Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Demand Heatmap */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <span>📈</span>
                  <span>Regional Travel Demand Velocity</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {demandInsights?.topSearchedDestinations ? (
                  <div className="space-y-3">
                    {demandInsights.topSearchedDestinations.map((dest: any) => (
                      <div key={dest.city} className="flex items-center justify-between p-3 rounded-[var(--radius-control)] bg-[var(--color-wakeru-surface-muted)]">
                        <div>
                          <p className="text-sm font-bold text-[var(--color-wakeru-text-primary)]">{dest.city}</p>
                          <p className="text-xs text-[var(--color-wakeru-text-secondary)]">{dest.searches.toLocaleString()} traveler searches</p>
                        </div>
                        <Badge variant="success" className="font-mono text-xs">
                          {dest.growth}
                        </Badge>
                      </div>
                    ))}
                    <div className="pt-2 text-xs text-[var(--color-wakeru-text-secondary)] space-y-1">
                      <p>• <strong>Peak Booking Window:</strong> {demandInsights.peakBookingWindows}</p>
                      <p>• <strong>Average Expedition Party:</strong> {demandInsights.averageGroupSize} travelers</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[var(--color-wakeru-text-muted)]">Aggregating search metrics...</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Audit Trail */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <span>🛡️</span>
                  <span>Recent Security &amp; Compliance Trail</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-[var(--radius-control)] border border-[var(--color-wakeru-border)] space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[var(--color-wakeru-primary)]">{log.action}</span>
                      <span className="text-[var(--color-wakeru-text-muted)]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-[var(--color-wakeru-text-secondary)] line-clamp-1">{log.details}</p>
                    <div className="text-[10px] text-[var(--color-wakeru-text-muted)] flex items-center justify-between pt-0.5">
                      <span>Actor: {log.actor}</span>
                      <span className="font-mono">IP: {log.ip}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
