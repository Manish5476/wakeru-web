'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { vendorApi } from '@/api/vendor';
import { Reservation } from '@/types/api';
import { Card, CardContent } from '@/design-system/components/Card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/design-system/components/Table';
import { Button } from '@/design-system/components/Button';
import { Badge } from '@/design-system/components/Badge';
import { BusinessNavTabs } from '@/features/vendor/BusinessNavTabs';

export default function VendorReservationsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedPin, setCopiedPin] = useState<string | null>(null);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const res = await vendorApi.getReservations(id);
      setReservations(res.data || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchReservations();
  }, [id]);

  const handleComplete = async (resId: string) => {
    try {
      await vendorApi.completeReservation(resId);
      setReservations(prev =>
        prev.map(r => (r.id === resId ? { ...r, status: 'COMPLETED' } : r))
      );
    } catch (error) {
      console.error('Error completing reservation:', error);
    }
  };

  const handleCopyPin = (pin: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedPin(pin);
    setTimeout(() => setCopiedPin(null), 2000);
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.push('/vendor')}>
            &larr; Back
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-wakeru-text-primary)]">
              Confirmed Reservations &amp; Keys
            </h1>
            <p className="text-xs text-[var(--color-wakeru-text-secondary)] mt-0.5">
              Active guest vouchers, digital smart keycards, and check-in status.
            </p>
          </div>
        </div>
      </div>

      <BusinessNavTabs businessId={id} activeTab="reservations" />

      {loading ? (
        <Card className="animate-pulse h-48 bg-[var(--color-wakeru-surface-muted)]" />
      ) : reservations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-20 space-y-3">
            <span className="text-4xl block">🎫</span>
            <h3 className="text-lg font-bold text-[var(--color-wakeru-text-primary)]">
              No active reservations
            </h3>
            <p className="text-xs text-[var(--color-wakeru-text-secondary)] max-w-sm mx-auto">
              When booking requests are accepted, guest vouchers and smart keycards will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Voucher &amp; Service</TableHead>
                <TableHead>Dates &amp; Amount</TableHead>
                <TableHead>Digital Key Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map(res => (
                <TableRow key={res.id}>
                  <TableCell>
                    <div className="font-mono font-bold text-xs text-[var(--color-wakeru-text-primary)]">
                      {res.id}
                    </div>
                    <div className="text-xs text-[var(--color-wakeru-text-secondary)] mt-0.5">
                      {res.serviceName || 'Direct Reservation'}
                    </div>
                  </TableCell>

                  <TableCell className="text-xs">
                    <div>
                      {res.bookingDate
                        ? new Date(res.bookingDate).toLocaleDateString()
                        : res.vendorConfirmedAt
                        ? new Date(res.vendorConfirmedAt).toLocaleDateString()
                        : '-'}
                    </div>
                    {res.priceMinor && (
                      <div className="font-bold text-[var(--color-wakeru-text-primary)] mt-0.5">
                        {res.currency || '₹'}{(res.priceMinor / 100).toLocaleString('en-IN')}
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="text-xs">
                    {res.digitalKey ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold bg-[var(--color-wakeru-surface-muted)] px-2 py-0.5 rounded border border-[var(--color-wakeru-border)]">
                            PIN: {res.digitalKey.pin || '849204'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyPin(res.digitalKey?.pin || '849204')}
                            className="text-[10px] text-[var(--color-wakeru-primary)] hover:underline"
                          >
                            {copiedPin === res.digitalKey.pin ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                        {res.digitalKey.doorName && (
                          <div className="text-[11px] text-[var(--color-wakeru-text-secondary)]">
                            🚪 {res.digitalKey.doorName}
                          </div>
                        )}
                        {res.digitalKey.wifiSsid && (
                          <div className="text-[10px] text-[var(--color-wakeru-text-muted)]">
                            📶 {res.digitalKey.wifiSsid}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-[var(--color-wakeru-text-muted)]">Standard Keycode</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={res.status === 'COMPLETED' ? 'default' : 'success'}
                      className="text-[11px]"
                    >
                      {res.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    {res.status !== 'COMPLETED' && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleComplete(res.id)}
                        className="text-xs"
                      >
                        Check-In Complete ✓
                      </Button>
                    )}
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
