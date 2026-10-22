'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { vendorApi } from '@/api/vendor';
import { Card, CardContent } from '@/design-system/components/Card';
import { Button } from '@/design-system/components/Button';
import { Badge } from '@/design-system/components/Badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/design-system/components/Table';
import { BusinessNavTabs } from '@/features/vendor/BusinessNavTabs';

interface Lead {
  id: string;
  travelerName: string;
  email: string;
  phone?: string;
  inquiry: string;
  status: 'NEW' | 'CONTACTED' | 'CONVERTED';
  createdAt: string;
}

export default function LeadsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'NEW' | 'CONTACTED' | 'CONVERTED'>('ALL');

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await vendorApi.getLeads(id);
      const list = (res as any)?.data || res;
      setLeads(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchLeads();
  }, [id]);

  const handleUpdateStatus = (leadId: string, nextStatus: Lead['status']) => {
    setLeads(prev =>
      prev.map(l => (l.id === leadId ? { ...l, status: nextStatus } : l))
    );
  };

  const filteredLeads = leads.filter(l => {
    if (statusFilter === 'ALL') return true;
    return l.status === statusFilter;
  });

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
              Traveler Leads &amp; Direct Inquiries
            </h1>
            <p className="text-xs text-[var(--color-wakeru-text-secondary)] mt-0.5">
              High-intent inquiries from travelers browsing your venue before locking in dates.
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 border-b sm:border-b-0 pb-2 sm:pb-0">
          {(['ALL', 'NEW', 'CONTACTED', 'CONVERTED'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                statusFilter === tab
                  ? 'bg-[var(--color-wakeru-primary)] text-white shadow-xs'
                  : 'bg-[var(--color-wakeru-surface-muted)] text-[var(--color-wakeru-text-secondary)] hover:text-[var(--color-wakeru-text-primary)]'
              }`}
            >
              {tab === 'ALL'
                ? `All Leads (${leads.length})`
                : tab === 'NEW'
                ? `New (${leads.filter(l => l.status === 'NEW').length})`
                : tab === 'CONTACTED'
                ? `Contacted (${leads.filter(l => l.status === 'CONTACTED').length})`
                : `Converted (${leads.filter(l => l.status === 'CONVERTED').length})`}
            </button>
          ))}
        </div>
      </div>

      <BusinessNavTabs businessId={id} activeTab="leads" />

      {loading ? (
        <Card className="animate-pulse h-64 bg-[var(--color-wakeru-surface-muted)]" />
      ) : filteredLeads.length === 0 ? (
        <Card>
          <CardContent className="text-center py-20 space-y-3">
            <span className="text-4xl block">💬</span>
            <h3 className="text-lg font-bold text-[var(--color-wakeru-text-primary)]">
              No leads matching this filter
            </h3>
            <p className="text-xs text-[var(--color-wakeru-text-secondary)] max-w-sm mx-auto">
              When prospective travelers send direct inquiries through your venue discovery page, they will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Traveler</TableHead>
                <TableHead>Inquiry Message</TableHead>
                <TableHead>Received</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Direct Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map(lead => {
                const phoneClean = lead.phone ? lead.phone.replace(/[^0-9]/g, '') : null;
                const whatsappUrl = phoneClean ? `https://wa.me/${phoneClean}` : null;

                return (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div className="font-bold text-sm text-[var(--color-wakeru-text-primary)]">
                        {lead.travelerName}
                      </div>
                      <div className="text-xs text-[var(--color-wakeru-text-secondary)] font-mono mt-0.5">
                        {lead.email}
                      </div>
                      {lead.phone && (
                        <div className="text-[11px] text-[var(--color-wakeru-text-muted)] font-mono">
                          {lead.phone}
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="max-w-md">
                      <p className="text-xs text-[var(--color-wakeru-text-primary)] leading-relaxed">
                        {lead.inquiry}
                      </p>
                    </TableCell>

                    <TableCell className="text-xs text-[var(--color-wakeru-text-secondary)] whitespace-nowrap">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          lead.status === 'CONVERTED'
                            ? 'success'
                            : lead.status === 'CONTACTED'
                            ? 'default'
                            : 'warning'
                        }
                        className="text-[11px]"
                      >
                        {lead.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right space-x-2 whitespace-nowrap">
                      {whatsappUrl && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
                        >
                          <span>💬</span>
                          <span>WhatsApp</span>
                        </a>
                      )}

                      <a
                        href={`mailto:${lead.email}?subject=Inquiry regarding your upcoming stay`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[var(--color-wakeru-border)] bg-[var(--color-wakeru-surface)] hover:bg-[var(--color-wakeru-surface-hover)] text-xs font-semibold transition-colors"
                      >
                        <span>✉️</span>
                        <span>Email</span>
                      </a>

                      {lead.status === 'NEW' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateStatus(lead.id, 'CONTACTED')}
                          className="text-xs"
                        >
                          Mark Contacted
                        </Button>
                      )}

                      {lead.status === 'CONTACTED' && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleUpdateStatus(lead.id, 'CONVERTED')}
                          className="text-xs"
                        >
                          Mark Converted ✓
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
