'use client';

import React, { useEffect, useState } from 'react';
import { adminApi } from '@/api/admin';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/design-system/components/Table';
import { Button } from '@/design-system/components/Button';
import { Badge } from '@/design-system/components/Badge';
import { Card } from '@/design-system/components/Card';
import { Vendor } from '@/types/api';

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getVendors();
      setVendors(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleSuspend = async (id: string) => {
    if (!confirm('Are you sure you want to suspend this vendor account?')) return;
    try {
      await adminApi.suspendVendor(id);
      fetchVendors();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
          🤝 Partner Network
        </div>
        <h1 className="text-3xl font-extrabold text-[var(--color-wakeru-text-primary)]">
          Registered Vendor Partners
        </h1>
        <p className="text-sm text-[var(--color-wakeru-text-secondary)] mt-1">
          Authorized hosts, hotel operators, and experience guides on the Wakeru ecosystem.
        </p>
      </div>

      {loading ? (
        <Card className="animate-pulse h-64 bg-[var(--color-wakeru-surface-muted)]" />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor ID</TableHead>
                <TableHead>Host Name</TableHead>
                <TableHead>Registered Email</TableHead>
                <TableHead>Account Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.map(vendor => (
                <TableRow key={vendor.id}>
                  <TableCell className="font-mono font-bold text-xs text-[var(--color-wakeru-text-primary)]">
                    {vendor.id}
                  </TableCell>

                  <TableCell className="font-bold text-sm text-[var(--color-wakeru-text-primary)]">
                    {vendor.name}
                  </TableCell>

                  <TableCell className="text-xs font-mono text-[var(--color-wakeru-text-secondary)]">
                    {vendor.email}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={vendor.status === 'ACTIVE' ? 'success' : 'danger'}
                      className="text-[10px]"
                    >
                      {vendor.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant={vendor.status === 'ACTIVE' ? 'danger' : 'outline'}
                      size="sm"
                      onClick={() => handleSuspend(vendor.id)}
                      disabled={vendor.status === 'SUSPENDED'}
                      className="text-xs"
                    >
                      {vendor.status === 'SUSPENDED' ? 'Suspended' : 'Suspend Partner'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {vendors.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-xs text-[var(--color-wakeru-text-secondary)]">
                    No vendor partners found.
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
