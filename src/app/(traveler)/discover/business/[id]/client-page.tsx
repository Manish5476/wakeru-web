'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/Card';
import { Button } from '@/design-system/components/Button';
import { Badge } from '@/design-system/components/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/design-system/components/Table';
import { discoveryApi } from '@/api/discover';
import { Business, BusinessService, BusinessReview } from '@/types/api';
import { useParams } from 'next/navigation';

export default function BusinessDetailClientPage() {
  const params = useParams();
  const businessId = params.id as string;
  
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<BusinessService[]>([]);
  const [reviews, setReviews] = useState<BusinessReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      discoveryApi.getBusinessDetail(businessId).catch(() => null),
      discoveryApi.getBusinessServices(businessId).catch(() => []),
      discoveryApi.getBusinessReviews(businessId).catch(() => [])
    ]).then(([b, s, r]) => {
      if (b) {
        setBusiness((b as any).data || b);
      }
      setServices((s as any).data || s);
      setReviews((r as any).data || r);
      setLoading(false);
    });
  }, [businessId]);

  if (loading) {
    return <div className="max-w-7xl mx-auto p-6 animate-pulse bg-[var(--color-wakeru-surface-muted)] h-96 rounded-xl mt-8"></div>;
  }

  if (!business) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center py-24">
        <h2 className="text-xl font-bold">Business not found</h2>
        <p className="text-[var(--color-wakeru-text-secondary)] mt-2">The business you are looking for does not exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header & Identity */}
      <header className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="default">{business.category}</Badge>
            {business.verificationStatus === 'VERIFIED' && <Badge variant="verified">Verified Identity</Badge>}
          </div>
          <h1 className="text-4xl font-bold text-[var(--color-wakeru-text-primary)]">{business.businessName}</h1>
          <p className="text-[var(--color-wakeru-text-secondary)] mt-2 text-lg">{business.address}, {business.city}, {business.country}</p>
        </div>
        <div className="flex flex-col gap-2">
          <Button size="lg">Request Booking</Button>
          <Button variant="outline" size="sm">Report Issue</Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* About */}
          <section>
            <h2 className="text-2xl font-bold mb-4">About</h2>
            <p className="text-[var(--color-wakeru-text-secondary)] leading-relaxed whitespace-pre-wrap">
              {business.description || 'No description provided.'}
            </p>
          </section>

          {/* Services */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Available Services</h2>
            {services.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map(s => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.serviceName || s.name}</TableCell>
                      <TableCell>{s.description || '-'}</TableCell>
                      <TableCell className="text-right font-semibold">
                        ₹{(((s.basePriceMinor ?? s.priceMinor ?? 0) / 100)).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-[var(--color-wakeru-text-muted)]">No services listed yet.</p>
            )}
          </section>

          {/* Reviews */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Traveler Reviews</h2>
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map(r => (
                  <Card key={r.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold">{r.rating} / 5</span>
                        <Badge variant="outline">Verified Booking</Badge>
                      </div>
                      <p className="text-[var(--color-wakeru-text-primary)]">{r.comment}</p>
                      {r.vendorReply && (
                        <div className="mt-4 p-3 bg-[var(--color-wakeru-surface-muted)] rounded-md">
                          <p className="text-sm font-semibold mb-1">Response from host</p>
                          <p className="text-sm text-[var(--color-wakeru-text-secondary)]">{r.vendorReply}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-[var(--color-wakeru-text-muted)]">No reviews yet. Be the first to review after your stay!</p>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Trust Signals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${business.verificationStatus === 'VERIFIED' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span>Identity {business.verificationStatus.toLowerCase()}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>{reviews.length} authentic reviews</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
