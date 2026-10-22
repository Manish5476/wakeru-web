'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/Card';
import { Badge } from '@/design-system/components/Badge';
import { Button } from '@/design-system/components/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/design-system/components/Table';
import { discoveryApi } from '@/api/discover';
import { BookingRequest } from '@/types/api';

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ACCEPTED' | 'REQUESTED' | 'DECLINED'>('ALL');

  const fetchBookings = () => {
    setLoading(true);
    discoveryApi.getTravelerBookings()
      .then((res: any) => setBookings(res.data || res))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking request?')) return;
    try {
      await discoveryApi.cancelBookingRequest(bookingId);
      fetchBookings();
    } catch (error) {
      console.error('Failed to cancel booking', error);
    }
  };

  const filtered = bookings.filter(b => {
    if (filter === 'ALL') return true;
    if (filter === 'DECLINED') return b.status === 'DECLINED' || b.status === 'CANCELLED';
    return b.status === filter;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-wakeru-text-primary)]">My Bookings &amp; Reservations</h1>
          <p className="text-[var(--color-wakeru-text-secondary)] mt-1">Manage your requested and confirmed local experiences.</p>
        </div>
        <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 font-medium">
          <span>🛡️ Offline Vault: Vouchers cached for zero-connectivity check-in</span>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--color-wakeru-border)] pb-3">
        {(['ALL', 'ACCEPTED', 'REQUESTED', 'DECLINED'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === tab
                ? 'bg-[var(--color-wakeru-primary)] text-white shadow-xs'
                : 'bg-[var(--color-wakeru-surface-muted)] text-[var(--color-wakeru-text-secondary)] hover:text-[var(--color-wakeru-text-primary)]'
            }`}
          >
            {tab === 'ALL'
              ? `All Bookings (${bookings.length})`
              : tab === 'ACCEPTED'
              ? `Confirmed (${bookings.filter(b => b.status === 'ACCEPTED').length})`
              : tab === 'REQUESTED'
              ? `Pending (${bookings.filter(b => b.status === 'REQUESTED').length})`
              : `Declined / Cancelled (${bookings.filter(b => b.status === 'DECLINED' || b.status === 'CANCELLED').length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <Card className="animate-pulse h-64 bg-[var(--color-wakeru-surface-muted)]"></Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="text-center py-24">
            <span className="text-4xl block mb-2">🎒</span>
            <h2 className="text-lg font-medium text-[var(--color-wakeru-text-primary)]">No bookings found</h2>
            <p className="text-[var(--color-wakeru-text-secondary)] mt-2">
              {filter === 'ALL'
                ? 'When you request an accommodation, dining, or activity, it will appear here.'
                : `No bookings found with status "${filter}".`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking Ref &amp; Service</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status &amp; Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(b => (
                <TableRow key={b.id}>
                  <TableCell>
                    <div className="font-mono font-bold text-sm text-[var(--color-wakeru-text-primary)]">
                      {b.bookingReference}
                    </div>
                    {(b.businessName || b.serviceName) && (
                      <div className="text-xs text-[var(--color-wakeru-text-secondary)] mt-0.5">
                        {b.businessName} {b.serviceName ? `• ${b.serviceName}` : ''}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">{new Date(b.bookingDate).toLocaleDateString()}</TableCell>
                  <TableCell className="font-semibold text-xs">
                    {b.currency || '₹'}{(b.priceSnapshotMinor / 100).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant={
                        b.status === 'ACCEPTED' ? 'success' :
                        b.status === 'DECLINED' || b.status === 'CANCELLED' ? 'danger' : 'warning'
                      }>
                        {b.status}
                      </Badge>
                      {(b.rejectionReason || b.reason) && (
                        <div className="text-[11px] text-red-600 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 max-w-xs">
                          <strong>Host note:</strong> {b.rejectionReason || b.reason}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {b.status === 'ACCEPTED' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => router.push(`/reservations/${b.id}`)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                        >
                          View Pass &amp; Key 🔑
                        </Button>
                      )}
                      {b.status === 'REQUESTED' && (
                        <Button variant="danger" size="sm" onClick={() => handleCancel(b.id)} className="text-xs">
                          Cancel
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
