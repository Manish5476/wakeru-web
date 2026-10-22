'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { vendorApi } from '@/api/vendor';
import { BusinessOffer } from '@/types/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/design-system/components/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/design-system/components/Table';
import { Button } from '@/design-system/components/Button';
import { Badge } from '@/design-system/components/Badge';
import { Input } from '@/design-system/components/Input';
import { BusinessNavTabs } from '@/features/vendor/BusinessNavTabs';

export default function OffersPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const [offers, setOffers] = useState<BusinessOffer[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('15');
  const [isCreating, setIsCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const loadOffers = () => {
    setLoading(true);
    vendorApi
      .getOffers(id)
      .then(res => {
        setOffers(res.data || []);
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (id) loadOffers();
  }, [id]);

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsCreating(true);
    try {
      await vendorApi.createOffer(id, {
        title: title.trim(),
        description: description.trim(),
        discountType,
        discountValue: Number(discountValue) || 10,
        status: 'active',
      });
      setTitle('');
      setDescription('');
      setDiscountValue('15');
      setShowForm(false);
      loadOffers();
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (offerId: string) => {
    if (!confirm('Are you sure you want to delete this special offer?')) return;
    try {
      await vendorApi.deleteOffer(offerId);
      loadOffers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleStatus = async (offerId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await vendorApi.updateOfferStatus(offerId, newStatus);
      loadOffers();
    } catch (error) {
      console.error(error);
    }
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
              Special Offers &amp; Group Discounts
            </h1>
            <p className="text-xs text-[var(--color-wakeru-text-secondary)] mt-0.5">
              Incentivize group getaways and advance bookings with promotional badges.
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={() => setShowForm(!showForm)}
          className="text-xs font-semibold gap-1.5"
        >
          <span>{showForm ? '✕ Close Form' : '+ Add Special Offer'}</span>
        </Button>
      </div>

      <BusinessNavTabs businessId={id} activeTab="offers" />

      {/* Offer Form Modal / Collapsible */}
      {showForm && (
        <Card className="border-[var(--color-wakeru-primary)]/40 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Create New Promotional Offer</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateOffer} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Offer Headline"
                  placeholder="e.g. Early Bird Sunset Package - 15% OFF"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-wakeru-text-secondary)]">
                      Discount Type
                    </label>
                    <select
                      className="h-10 rounded-[var(--radius-control)] border border-[var(--color-wakeru-border-strong)] bg-[var(--color-wakeru-bg)] px-3 text-xs font-medium text-[var(--color-wakeru-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-wakeru-primary)]"
                      value={discountType}
                      onChange={e => setDiscountType(e.target.value)}
                    >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FIXED_AMOUNT">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <Input
                    label="Value"
                    type="number"
                    value={discountValue}
                    onChange={e => setDiscountValue(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-wakeru-text-secondary)] mb-1">
                  Conditions &amp; Description
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. Valid for bookings of 3 nights or more booked at least 14 days prior to check-in."
                  className="w-full h-20 p-2.5 rounded-[var(--radius-control)] border border-[var(--color-wakeru-border-strong)] bg-[var(--color-wakeru-bg)] text-xs text-[var(--color-wakeru-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-wakeru-primary)]"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isCreating}>
                  {isCreating ? 'Publishing...' : 'Publish Offer'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <Card className="animate-pulse h-48 bg-[var(--color-wakeru-surface-muted)]" />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Promotion Details</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers.map(offer => (
                <TableRow key={offer.id}>
                  <TableCell>
                    <div className="font-bold text-sm text-[var(--color-wakeru-text-primary)]">
                      {offer.title}
                    </div>
                    {offer.description && (
                      <div className="text-xs text-[var(--color-wakeru-text-secondary)] mt-0.5">
                        {offer.description}
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
                    {offer.discountValue
                      ? `${offer.discountValue}${offer.discountType === 'FIXED_AMOUNT' ? '₹' : '%'}`
                      : 'Special Deal'}
                  </TableCell>

                  <TableCell>
                    <Badge variant={offer.status === 'active' ? 'success' : 'default'} className="text-[10px]">
                      {offer.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleStatus(offer.id, offer.status)}
                      className="text-xs"
                    >
                      {offer.status === 'active' ? 'Pause' : 'Activate'}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(offer.id)}
                      className="text-xs"
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {offers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-xs text-[var(--color-wakeru-text-secondary)]">
                    No active offers yet. Create your first promotion to boost booking volume!
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
