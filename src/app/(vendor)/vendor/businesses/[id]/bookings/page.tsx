"use client";

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { vendorApi } from '@/api/vendor';
import { BookingRequest } from '@/types/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/design-system/components/Card';
import { Button } from '@/design-system/components/Button';
import { Badge } from '@/design-system/components/Badge';
import { Modal } from '@/design-system/components/Modal';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '@/design-system/components/Table';

const DECLINE_PRESETS = [
  'Fully booked for this date/time',
  'Scheduled maintenance or private buyout',
  'Service temporarily unavailable on requested dates',
  'Travel party size exceeds capacity',
];

export default function BusinessBookingsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Decline Modal State
  const [declineTargetId, setDeclineTargetId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [submittingAction, setSubmittingAction] = useState<boolean>(false);

  useEffect(() => {
    loadBookings();
  }, [id]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const res = await vendorApi.getBookingRequests(id);
      setBookings(res.data || []);
    } catch (err) {
      console.error('Failed to load vendor bookings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      setSubmittingAction(true);
      await vendorApi.acceptBookingRequest(requestId);
      await loadBookings();
    } catch (err) {
      console.error('Accept action failed', err);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleOpenDeclineModal = (requestId: string) => {
    setDeclineTargetId(requestId);
    setDeclineReason(DECLINE_PRESETS[0]);
    setCustomReason('');
  };

  const handleConfirmDecline = async () => {
    if (!declineTargetId) return;
    try {
      setSubmittingAction(true);
      const finalReason = declineReason === 'Other' ? customReason : declineReason;
      await vendorApi.declineBookingRequest(declineTargetId, finalReason || 'Dates unavailable');
      setDeclineTargetId(null);
      await loadBookings();
    } catch (err) {
      console.error('Decline action failed', err);
    } finally {
      setSubmittingAction(false);
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (statusFilter === 'ALL') return true;
    return b.status === statusFilter;
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>&larr; Back</Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-wakeru-text-primary)]">Booking Requests</h1>
          <p className="text-xs text-[var(--color-wakeru-text-secondary)] mt-0.5">Manage customer inquiries, confirmations, and rejections with reasons.</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-[var(--color-wakeru-border-strong)] pb-4 text-sm font-semibold">
        <Link href={`/vendor/businesses/${id}`} className="text-[var(--color-wakeru-text-secondary)] hover:text-[var(--color-wakeru-text-primary)] px-2">
          Details
        </Link>
        <Link href={`/vendor/businesses/${id}/media`} className="text-[var(--color-wakeru-text-secondary)] hover:text-[var(--color-wakeru-text-primary)] px-2">
          Media
        </Link>
        <Link href={`/vendor/businesses/${id}/bookings`} className="text-[var(--color-wakeru-primary)] border-b-2 border-[var(--color-wakeru-primary)] px-2 pb-4 -mb-4">
          Bookings ({bookings.length})
        </Link>
        <Link href={`/vendor/businesses/${id}/reservations`} className="text-[var(--color-wakeru-text-secondary)] hover:text-[var(--color-wakeru-text-primary)] px-2">
          Reservations
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {['ALL', 'REQUESTED', 'ACCEPTED', 'DECLINED'].map(tab => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              statusFilter === tab
                ? 'bg-[var(--color-wakeru-primary)] text-white'
                : 'bg-[var(--color-wakeru-surface-muted)] text-[var(--color-wakeru-text-secondary)] hover:text-[var(--color-wakeru-text-primary)]'
            }`}
          >
            {tab === 'ALL' ? `All Requests (${bookings.length})` : `${tab} (${bookings.filter(b => b.status === tab).length})`}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inquiries &amp; Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-[var(--color-wakeru-text-secondary)]">Loading requests...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference &amp; Service</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Traveler</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <tbody>
                {filteredBookings.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>
                      <div className="font-mono text-xs font-bold text-[var(--color-wakeru-text-primary)]">
                        {req.bookingReference}
                      </div>
                      {req.serviceName && (
                        <div className="text-[11px] text-[var(--color-wakeru-text-secondary)]">
                          {req.serviceName}
                        </div>
                      )}
                      {req.rejectionReason && (
                        <div className="mt-1 text-[11px] text-red-600 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 max-w-xs">
                          <strong>Declined:</strong> {req.rejectionReason}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      {new Date(req.bookingDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[var(--color-wakeru-text-secondary)]">
                      {req.travelerHash.substring(0, 10)}...
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        req.status === 'REQUESTED' ? 'warning' :
                        req.status === 'ACCEPTED' ? 'success' :
                        req.status === 'DECLINED' ? 'danger' : 'default'
                      }>
                        {req.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono font-bold text-xs">
                      {req.currency} {(req.priceSnapshotMinor / 100).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {req.status === 'REQUESTED' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={submittingAction}
                            onClick={() => handleOpenDeclineModal(req.id)}
                            className="text-xs text-red-600 hover:bg-red-50"
                          >
                            Decline...
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={submittingAction}
                            onClick={() => handleAccept(req.id)}
                            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            Accept &amp; Confirm
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredBookings.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-[var(--color-wakeru-text-secondary)]">
                      No booking requests found for this filter.
                    </TableCell>
                  </TableRow>
                )}
              </tbody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Decline Booking Reason Modal */}
      <Modal
        isOpen={Boolean(declineTargetId)}
        onClose={() => setDeclineTargetId(null)}
        title="Decline Booking Request"
        description="Provide a clear reason for declining so the traveler is notified promptly."
        maxWidth="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeclineTargetId(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={submittingAction}
              onClick={handleConfirmDecline}
            >
              Confirm Decline
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[var(--color-wakeru-text-primary)] mb-2 uppercase tracking-wider text-[11px]">
              Select Reason
            </label>
            <div className="space-y-2">
              {DECLINE_PRESETS.map(preset => (
                <label
                  key={preset}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                    declineReason === preset
                      ? 'border-[var(--color-wakeru-primary)] bg-[var(--color-wakeru-primary)]/5 font-semibold text-[var(--color-wakeru-text-primary)]'
                      : 'border-[var(--color-wakeru-border)] bg-[var(--color-wakeru-surface-muted)] text-[var(--color-wakeru-text-secondary)]'
                  }`}
                >
                  <input
                    type="radio"
                    name="declinePreset"
                    checked={declineReason === preset}
                    onChange={() => setDeclineReason(preset)}
                    className="text-[var(--color-wakeru-primary)]"
                  />
                  <span>{preset}</span>
                </label>
              ))}
              <label
                className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  declineReason === 'Other'
                    ? 'border-[var(--color-wakeru-primary)] bg-[var(--color-wakeru-primary)]/5 font-semibold text-[var(--color-wakeru-text-primary)]'
                    : 'border-[var(--color-wakeru-border)] bg-[var(--color-wakeru-surface-muted)] text-[var(--color-wakeru-text-secondary)]'
                }`}
              >
                <input
                  type="radio"
                  name="declinePreset"
                  checked={declineReason === 'Other'}
                  onChange={() => setDeclineReason('Other')}
                  className="text-[var(--color-wakeru-primary)]"
                />
                <span>Other reason...</span>
              </label>
            </div>
          </div>

          {declineReason === 'Other' && (
            <div>
              <label className="block font-bold text-[var(--color-wakeru-text-primary)] mb-1">
                Custom Explanation
              </label>
              <textarea
                rows={3}
                placeholder="Explain why this booking cannot be accepted..."
                value={customReason}
                onChange={e => setCustomReason(e.target.value)}
                className="w-full p-2.5 bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border-strong)] rounded text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-wakeru-primary)]"
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
