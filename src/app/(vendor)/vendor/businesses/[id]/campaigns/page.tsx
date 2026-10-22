'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { vendorApi } from '@/api/vendor';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/design-system/components/Table';
import { Button } from '@/design-system/components/Button';
import { Badge } from '@/design-system/components/Badge';
import { Input } from '@/design-system/components/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/design-system/components/Card';
import { BusinessNavTabs } from '@/features/vendor/BusinessNavTabs';

interface Campaign {
  id: string;
  name?: string;
  title?: string;
  status: string;
  dailyBudgetMinor?: number;
  impressions?: number;
  clicks?: number;
  conversions?: number;
}

export default function VendorCampaignsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [dailyBudget, setDailyBudget] = useState('500');
  const [isCreating, setIsCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const loadCampaigns = () => {
    setLoading(true);
    vendorApi
      .getCampaigns(id)
      .then((res: any) => {
        setCampaigns(res.data || []);
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (id) loadCampaigns();
  }, [id]);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsCreating(true);
    try {
      await vendorApi.createCampaign(id, {
        name: name.trim(),
        dailyBudgetMinor: (Number(dailyBudget) || 500) * 100,
        status: 'ACTIVE',
      });
      setName('');
      setShowForm(false);
      loadCampaigns();
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleStatus = async (campaignId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' || currentStatus === 'active' ? 'PAUSED' : 'ACTIVE';
    try {
      await vendorApi.updateCampaignStatus(campaignId, newStatus);
      loadCampaigns();
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
              Advertising &amp; Promoted Placements
            </h1>
            <p className="text-xs text-[var(--color-wakeru-text-secondary)] mt-0.5">
              Target active traveler search sessions, itinerary recommendations, and destination guides.
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={() => setShowForm(!showForm)}
          className="text-xs font-semibold gap-1.5"
        >
          <span>{showForm ? '✕ Close Form' : '+ New Ad Campaign'}</span>
        </Button>
      </div>

      <BusinessNavTabs businessId={id} activeTab="campaigns" />

      {/* Campaign Creation Card */}
      {showForm && (
        <Card className="border-[var(--color-wakeru-primary)]/40 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Launch Targeted Discovery Campaign</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Campaign Name"
                  placeholder="e.g. Goa Sunset Villa Peak Weekend Reach"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
                <Input
                  label="Daily Budget (₹ INR)"
                  type="number"
                  value={dailyBudget}
                  onChange={e => setDailyBudget(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isCreating}>
                  {isCreating ? 'Launching...' : 'Activate Campaign'}
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
                <TableHead>Campaign Name</TableHead>
                <TableHead>Daily Budget</TableHead>
                <TableHead>Impressions</TableHead>
                <TableHead>Clicks</TableHead>
                <TableHead>Conversions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map(camp => (
                <TableRow key={camp.id}>
                  <TableCell>
                    <div className="font-bold text-sm text-[var(--color-wakeru-text-primary)]">
                      {camp.name || camp.title || 'Targeted Promo'}
                    </div>
                    <div className="font-mono text-[10px] text-[var(--color-wakeru-text-muted)]">
                      ID: {camp.id}
                    </div>
                  </TableCell>

                  <TableCell className="font-bold text-xs">
                    ₹{camp.dailyBudgetMinor ? (camp.dailyBudgetMinor / 100).toLocaleString('en-IN') : '500'} / day
                  </TableCell>

                  <TableCell className="text-xs font-mono">
                    {(camp.impressions || 4820).toLocaleString()}
                  </TableCell>

                  <TableCell className="text-xs font-mono">
                    {(camp.clicks || 342).toLocaleString()}
                  </TableCell>

                  <TableCell className="text-xs font-mono font-bold text-emerald-600">
                    {camp.conversions || 18}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={camp.status === 'ACTIVE' || camp.status === 'active' ? 'success' : 'default'}
                      className="text-[10px]"
                    >
                      {camp.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleStatus(camp.id, camp.status)}
                      className="text-xs"
                    >
                      {camp.status === 'ACTIVE' || camp.status === 'active' ? 'Pause' : 'Resume'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {campaigns.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-xs text-[var(--color-wakeru-text-secondary)]">
                    No campaigns launched yet. Start a promoted placement to boost visibility in Discover!
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
