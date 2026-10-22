'use client';

import React, { useEffect, useState } from 'react';
import { adminApi } from '@/api/admin';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/design-system/components/Table';
import { Badge } from '@/design-system/components/Badge';
import { Card } from '@/design-system/components/Card';
import { BookingRequest } from '@/types/api';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ACCEPTED' | 'REQUESTED' | 'DECLINED'>('ALL');

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const res = await adminApi.getBookingQueue();
        setBookings(res?.data ? res.data : res || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter(b => {
    if (filter === 'ALL') return true;
    return b.status === filter;
  });

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
            📅 Platform Ledger
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--color-wakeru-text-primary)]">
            Booking Inquiries &amp; Approvals
          </h1>
          <p className="text-sm text-[var(--color-wakeru-text-secondary)] mt-1">
            Global queue of traveler reservation requests, host approvals, and transparent rejection notes.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5">
          {(['ALL', 'ACCEPTED', 'REQUESTED', 'DECLINED'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter === tab
                  ? 'bg-[var(--color-wakeru-primary)] text-white shadow-xs'
                  : 'bg-[var(--color-wakeru-surface-muted)] text-[var(--color-wakeru-text-secondary)] hover:text-[var(--color-wakeru-text-primary)]'
              }`}
            >
              {tab === 'ALL'
                ? `All (${bookings.length})`
                : tab === 'ACCEPTED'
                ? `Confirmed (${bookings.filter(b => b.status === 'ACCEPTED').length})`
                : tab === 'REQUESTED'
                ? `Pending (${bookings.filter(b => b.status === 'REQUESTED').length})`
                : `Declined (${bookings.filter(b => b.status === 'DECLINED').length})`}
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
                <TableHead>Booking Reference</TableHead>
                <TableHead>Business / Property</TableHead>
                <TableHead>Check-In Date</TableHead>
                <TableHead>Price Snapshot</TableHead>
                <TableHead>Status &amp; Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map(booking => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div className="font-mono font-bold text-xs text-[var(--color-wakeru-text-primary)]">
                      {booking.bookingReference}
                    </div>
                    <div className="text-[10px] text-[var(--color-wakeru-text-muted)] font-mono">
                      {booking.id}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="font-bold text-sm text-[var(--color-wakeru-text-primary)]">
                      {booking.businessName || booking.businessId}
                    </div>
                    {booking.serviceName && (
                      <div className="text-xs text-[var(--color-wakeru-text-secondary)] mt-0.5">
                        {booking.serviceName}
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="text-xs text-[var(--color-wakeru-text-secondary)]">
                    {new Date(booking.bookingDate).toLocaleDateString()}
                  </TableCell>

                  <TableCell className="font-bold text-xs text-[var(--color-wakeru-text-primary)]">
                    {booking.currency || '₹'}{(booking.priceSnapshotMinor / 100).toLocaleString('en-IN')}
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <Badge
                        variant={
                          booking.status === 'ACCEPTED'
                            ? 'success'
                            : booking.status === 'DECLINED'
                            ? 'danger'
                            : 'warning'
                        }
                        className="text-[10px]"
                      >
                        {booking.status}
                      </Badge>

                      {(booking.rejectionReason || booking.reason) && (
                        <div className="text-[10px] text-red-600 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 max-w-xs">
                          Reason: {booking.rejectionReason || booking.reason}
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {filteredBookings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-xs text-[var(--color-wakeru-text-secondary)]">
                    No booking inquiries matching this status.
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
