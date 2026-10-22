'use client';

import React, { useEffect, useState } from 'react';
import { adminApi } from '@/api/admin';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/design-system/components/Table';
import { Button } from '@/design-system/components/Button';
import { Badge } from '@/design-system/components/Badge';
import { Card } from '@/design-system/components/Card';

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCampaigns();
      setCampaigns(res?.data ? res.data : res || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleReview = async (id: string, status: string) => {
    try {
      await adminApi.reviewCampaign(id, status);
      setCampaigns(prev =>
        prev.map(c => (c.id === id ? { ...c, moderationStatus: status, status: status === 'APPROVED' ? 'ACTIVE' : 'REJECTED' } : c))
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
          🚀 Promotional Placements
        </div>
        <h1 className="text-3xl font-extrabold text-[var(--color-wakeru-text-primary)]">
          Ad Campaign Moderation
        </h1>
        <p className="text-sm text-[var(--color-wakeru-text-secondary)] mt-1">
          Review and approve sponsored vendor visibility across Discover search feeds and travel blueprints.
        </p>
      </div>

      {loading ? (
        <Card className="animate-pulse h-64 bg-[var(--color-wakeru-surface-muted)]" />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign ID</TableHead>
                <TableHead>Campaign Title</TableHead>
                <TableHead>Daily Budget</TableHead>
                <TableHead>Moderation Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map(campaign => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-mono font-bold text-xs text-[var(--color-wakeru-text-primary)]">
                    {campaign.id}
                  </TableCell>

                  <TableCell>
                    <div className="font-bold text-sm text-[var(--color-wakeru-text-primary)]">
                      {campaign.title || campaign.name || 'Targeted Promo'}
                    </div>
                    {campaign.businessId && (
                      <div className="text-[10px] text-[var(--color-wakeru-text-muted)] font-mono">
                        Venue: {campaign.businessId}
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="font-bold text-xs text-[var(--color-wakeru-text-primary)]">
                    ₹{campaign.dailyBudgetMinor ? (campaign.dailyBudgetMinor / 100).toLocaleString('en-IN') : '500'} / day
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        campaign.moderationStatus === 'APPROVED' || campaign.status === 'ACTIVE'
                          ? 'success'
                          : campaign.moderationStatus === 'REJECTED'
                          ? 'danger'
                          : 'warning'
                      }
                      className="text-[10px]"
                    >
                      {campaign.moderationStatus || campaign.status || 'PENDING'}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleReview(campaign.id, 'APPROVED')}
                      className="text-xs"
                    >
                      Approve ✓
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleReview(campaign.id, 'REJECTED')}
                      className="text-xs"
                    >
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {campaigns.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-xs text-[var(--color-wakeru-text-secondary)]">
                    No active advertising campaigns pending review.
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
