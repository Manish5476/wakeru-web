"use client";

import React, { useEffect, useState } from "react";
import { adminApi } from "@/api/admin";
import { Business } from "@/types/api";
import { Table, TableHeader, TableRow, TableHead, TableCell } from "@/design-system/components/Table";
import { Badge } from "@/design-system/components/Badge";
import { Button } from "@/design-system/components/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/design-system/components/Card";

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('ALL');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

  const loadBusinesses = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getBusinesses(1);
      setBusinesses((res as any)?.data || []);
    } catch (err) {
      console.error("Failed to load businesses", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBusinesses();
  }, []);

  const handleVerify = async (id: string, status: string) => {
    try {
      await adminApi.verifyBusiness(id, status);
      setBusinesses(businesses.map(b => 
        b.id === id ? { ...b, verificationStatus: status as any } : b
      ));
      if (selectedBusiness && selectedBusiness.id === id) {
        setSelectedBusiness({ ...selectedBusiness, verificationStatus: status as any });
      }
    } catch (err) {
      console.error("Failed to verify business", err);
    }
  };

  const filteredBusinesses = businesses.filter((b) => {
    if (filter === 'ALL') return true;
    return b.verificationStatus === filter;
  });

  return (
    <div className="space-y-6 p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-wakeru-text-primary)]">Businesses & Verification</h1>
          <p className="text-sm text-[var(--color-wakeru-text-secondary)] mt-1">
            Review vendor applications, verify legitimate businesses, and manage local discovery eligibility.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          {(['ALL', 'PENDING', 'VERIFIED', 'REJECTED'] as const).map((status) => (
            <Button
              key={status}
              size="sm"
              variant={filter === status ? 'primary' : 'secondary'}
              onClick={() => setFilter(status)}
            >
              {status === 'ALL' ? 'All Businesses' : status}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-500">Loading businesses from registry...</div>
      ) : (
        <div className="border rounded-md overflow-hidden bg-white dark:bg-[var(--color-wakeru-surface)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <tbody>
              {filteredBusinesses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                    No businesses matching &ldquo;{filter}&rdquo; filter.
                  </TableCell>
                </TableRow>
              ) : (
                filteredBusinesses.map((business) => (
                  <TableRow key={business.id}>
                    <TableCell className="font-semibold text-[var(--color-wakeru-text-primary)]">
                      {business.businessName}
                    </TableCell>
                    <TableCell className="capitalize">{business.category}</TableCell>
                    <TableCell>
                      {business.city}, {business.country}
                    </TableCell>
                    <TableCell>
                      <Badge variant={business.status === 'active' ? 'default' : 'secondary'}>
                        {business.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          business.verificationStatus === 'VERIFIED'
                            ? 'default'
                            : business.verificationStatus === 'REJECTED'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {business.verificationStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="secondary" onClick={() => setSelectedBusiness(business)}>
                        Inspect
                      </Button>
                      {business.verificationStatus === 'PENDING' && (
                        <>
                          <Button size="sm" variant="primary" onClick={() => handleVerify(business.id, 'VERIFIED')}>
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleVerify(business.id, 'REJECTED')}>
                            Reject
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </tbody>
          </Table>
        </div>
      )}

      {/* Business Inspection Modal */}
      {selectedBusiness && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row justify-between items-start border-b pb-4">
              <div>
                <CardTitle className="text-xl font-bold">{selectedBusiness.businessName}</CardTitle>
                <div className="flex gap-2 mt-2">
                  <Badge variant="default">{selectedBusiness.category}</Badge>
                  <Badge variant={selectedBusiness.verificationStatus === 'VERIFIED' ? 'default' : 'secondary'}>
                    {selectedBusiness.verificationStatus}
                  </Badge>
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setSelectedBusiness(null)}>
                ✕
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold block text-gray-500">Address</span>
                  <p>{selectedBusiness.address || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-semibold block text-gray-500">City / Country</span>
                  <p>{selectedBusiness.city}, {selectedBusiness.country}</p>
                </div>
                <div>
                  <span className="font-semibold block text-gray-500">GPS Coordinates</span>
                  <p>{selectedBusiness.latitude ?? '0'}°, {selectedBusiness.longitude ?? '0'}°</p>
                </div>
                <div>
                  <span className="font-semibold block text-gray-500">Phone & WhatsApp</span>
                  <p>{selectedBusiness.phone || 'N/A'} {selectedBusiness.whatsapp ? `(WA: ${selectedBusiness.whatsapp})` : ''}</p>
                </div>
                {selectedBusiness.googleMapsUrl && (
                  <div className="col-span-2">
                    <span className="font-semibold block text-gray-500">Google Maps Link</span>
                    <a
                      href={selectedBusiness.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline truncate block"
                    >
                      {selectedBusiness.googleMapsUrl}
                    </a>
                  </div>
                )}
                {selectedBusiness.description && (
                  <div className="col-span-2">
                    <span className="font-semibold block text-gray-500">Description</span>
                    <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{selectedBusiness.description}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                {selectedBusiness.verificationStatus === 'PENDING' ? (
                  <>
                    <Button variant="destructive" onClick={() => handleVerify(selectedBusiness.id, 'REJECTED')}>
                      Reject Business
                    </Button>
                    <Button variant="primary" onClick={() => handleVerify(selectedBusiness.id, 'VERIFIED')}>
                      Approve & Verify Business
                    </Button>
                  </>
                ) : (
                  <Button variant="secondary" onClick={() => setSelectedBusiness(null)}>
                    Close
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
