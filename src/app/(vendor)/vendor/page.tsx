"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { vendorApi } from '@/api/vendor';
import { Business } from '@/types/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/design-system/components/Card';
import { Badge } from '@/design-system/components/Badge';
import { Button } from '@/design-system/components/Button';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '@/design-system/components/Table';

export default function VendorDashboard() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    vendorApi.getBusinesses()
      .then((res) => {
        setBusinesses(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load businesses.');
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[var(--color-wakeru-text-primary)]">My Businesses</h1>
        <Link href="/vendor/businesses/create">
          <Button variant="primary">Add New Business</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Properties & Services</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-[var(--color-wakeru-text-secondary)]">Loading businesses...</p>
          ) : error ? (
            <p className="text-[var(--color-wakeru-danger)]">{error}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <tbody>
                {businesses.map((business) => (
                  <TableRow key={business.id}>
                    <TableCell className="font-medium">{business.businessName}</TableCell>
                    <TableCell>{business.category}</TableCell>
                    <TableCell>
                      <Badge variant={business.status === 'active' ? 'success' : 'default'}>
                        {business.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{business.city}, {business.country}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Link href={`/vendor/businesses/${business.id}`}>
                        <Button variant="outline" size="sm">Manage</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                {businesses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-[var(--color-wakeru-text-secondary)]">
                      No businesses found. Get started by adding a new one.
                    </TableCell>
                  </TableRow>
                )}
              </tbody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
