'use client';

import React, { useEffect, useState } from 'react';
import { adminApi } from '@/api/admin';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/design-system/components/Table';
import { Badge } from '@/design-system/components/Badge';
import { Card } from '@/design-system/components/Card';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await adminApi.getAuditLogs();
        const list = (res as any)?.data || (Array.isArray(res) ? res : []);
        setLogs(list);
      } catch (err) {
        console.error('Failed to load audit logs', err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  const filteredLogs = logs.filter(l => {
    if (filter === 'ALL') return true;
    return l.action === filter;
  });

  return (
    <div className="space-y-6 p-6 sm:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
            🛡️ Compliance &amp; Security
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--color-wakeru-text-primary)]">
            System Audit Logs
          </h1>
          <p className="text-sm text-[var(--color-wakeru-text-secondary)] mt-1">
            Immutable trace of admin actions, verification reviews, and booking transactions.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {['ALL', 'BOOKING_ACCEPT', 'BUSINESS_VERIFY', 'MEDIA_APPROVE'].map(act => (
            <button
              key={act}
              onClick={() => setFilter(act)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter === act
                  ? 'bg-[var(--color-wakeru-primary)] text-white shadow-xs'
                  : 'bg-[var(--color-wakeru-surface-muted)] text-[var(--color-wakeru-text-secondary)] hover:text-[var(--color-wakeru-text-primary)]'
              }`}
            >
              {act === 'ALL' ? 'All Events' : act}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Card className="animate-pulse h-64 bg-[var(--color-wakeru-surface-muted)]" />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target Resource</TableHead>
                <TableHead>Actor / Role</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Operational Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log, i) => (
                <TableRow key={log.id || i}>
                  <TableCell className="whitespace-nowrap text-xs text-[var(--color-wakeru-text-secondary)]">
                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : '-'}
                  </TableCell>

                  <TableCell>
                    <Badge variant="default" className="font-mono text-[10px]">
                      {log.action || 'EVENT'}
                    </Badge>
                  </TableCell>

                  <TableCell className="font-mono text-xs font-bold text-[var(--color-wakeru-text-primary)]">
                    {log.target || log.resource || '-'}
                  </TableCell>

                  <TableCell className="text-xs font-medium text-[var(--color-wakeru-text-primary)]">
                    {log.actor || 'System'}
                  </TableCell>

                  <TableCell className="font-mono text-xs text-[var(--color-wakeru-text-muted)]">
                    {log.ip || '127.0.0.1'}
                  </TableCell>

                  <TableCell className="text-xs text-[var(--color-wakeru-text-secondary)] max-w-sm">
                    {log.details ? String(log.details) : '-'}
                  </TableCell>
                </TableRow>
              ))}

              {filteredLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-xs text-[var(--color-wakeru-text-secondary)]">
                    No audit records matching this filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
