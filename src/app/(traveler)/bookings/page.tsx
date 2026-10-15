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
      // Refresh the list after cancellation
      fetchBookings();
    } catch (error) {
      console.error('Failed to cancel booking', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-wakeru-text-primary)]">My Bookings & Reservations</h1>
          <p className="text-[var(--color-wakeru-text-secondary)] mt-1">Manage your requested and confirmed local experiences.</p>
        </div>
        <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 font-medium">
          <span>🛡️ Offline Vault: Vouchers cached for zero-connectivity check-in</span>
        </div>
      </header>

      {loading ? (
        <Card className="animate-pulse h-64 bg-[var(--color-wakeru-surface-muted)]"></Card>
      ) : bookings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-24">
            <span className="text-4xl block mb-2">🎒</span>
            <h2 className="text-lg font-medium text-[var(--color-wakeru-text-primary)]">No bookings yet</h2>
            <p className="text-[var(--color-wakeru-text-secondary)] mt-2">When you request an accommodation, dining, or activity, it will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking Ref & Service</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map(b => (
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
                  <TableCell>{new Date(b.bookingDate).toLocaleDateString()}</TableCell>
                  <TableCell className="font-semibold">₹{(b.priceSnapshotMinor / 100).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={
                      b.status === 'ACCEPTED' ? 'success' :
                      b.status === 'DECLINED' || b.status === 'CANCELLED' ? 'danger' : 'warning'
                    }>
                      {b.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {b.status === 'ACCEPTED' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => router.push(`/reservations/${b.id}`)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          View Voucher 🎫
                        </Button>
                      )}
                      {b.status === 'REQUESTED' && (
                        <Button variant="danger" size="sm" onClick={() => handleCancel(b.id)}>
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
