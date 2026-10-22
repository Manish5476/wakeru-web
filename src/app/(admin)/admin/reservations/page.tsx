'use client';

import React, { useEffect, useState } from 'react';
import { adminApi } from '@/api/admin';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/design-system/components/Table';
import { Badge } from '@/design-system/components/Badge';
import { Card } from '@/design-system/components/Card';
import { Reservation } from '@/types/api';

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true);
      try {
        const res = await adminApi.getReservations();
        setReservations(res?.data ? res.data : res || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, []);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
          🎫 Active Vouchers
        </div>
        <h1 className="text-3xl font-extrabold text-[var(--color-wakeru-text-primary)]">
          Reservations &amp; Smart Keys
        </h1>
        <p className="text-sm text-[var(--color-wakeru-text-secondary)] mt-1">
          Monitor confirmed guest bookings, issued digital room keys, and check-in validity.
        </p>
      </div>

      {loading ? (
        <Card className="animate-pulse h-64 bg-[var(--color-wakeru-surface-muted)]" />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Voucher ID</TableHead>
                <TableHead>Venue &amp; Service</TableHead>
                <TableHead>Booking Value</TableHead>
                <TableHead>Validity Dates</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map(reservation => (
                <TableRow key={reservation.id}>
                  <TableCell className="font-mono font-bold text-xs text-[var(--color-wakeru-text-primary)]">
                    {reservation.id}
                  </TableCell>

                  <TableCell>
                    <div className="font-bold text-sm text-[var(--color-wakeru-text-primary)]">
                      {reservation.businessName || reservation.businessId || 'Local Venue'}
                    </div>
                    {reservation.serviceName && (
                      <div className="text-xs text-[var(--color-wakeru-text-secondary)] mt-0.5">
                        {reservation.serviceName}
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="font-bold text-xs text-[var(--color-wakeru-text-primary)]">
                    {reservation.currency || '₹'}
                    {reservation.priceMinor
                      ? (reservation.priceMinor / 100).toLocaleString('en-IN')
                      : '24,000'}
                  </TableCell>

                  <TableCell className="text-xs text-[var(--color-wakeru-text-secondary)]">
                    {reservation.bookingDate
                      ? new Date(reservation.bookingDate).toLocaleDateString()
                      : reservation.vendorConfirmedAt
                      ? new Date(reservation.vendorConfirmedAt).toLocaleDateString()
                      : 'Confirmed'}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={reservation.status === 'COMPLETED' ? 'default' : 'success'}
                      className="text-[10px]"
                    >
                      {reservation.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}

              {reservations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-xs text-[var(--color-wakeru-text-secondary)]">
                    No confirmed reservations in the operational queue.
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
