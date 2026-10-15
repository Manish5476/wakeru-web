"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { vendorApi } from '@/api/vendor';
import { Business } from '@/types/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/design-system/components/Card';
import { Input } from '@/design-system/components/Input';
import { Button } from '@/design-system/components/Button';
import { Badge } from '@/design-system/components/Badge';
import { VenueLocationMapCard } from '@/design-system/components/VenueLocationMapCard';
import { BusinessNavTabs } from '@/features/vendor/BusinessNavTabs';

export default function BusinessDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form state
  const [businessName, setBusinessName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('India');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [description, setDescription] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  useEffect(() => {
    if (!id) return;
    vendorApi
      .getBusinessById(id)
      .then((data: any) => {
        const b = data?.data || data;
        setBusiness(b);
        if (b) {
          setBusinessName(b.businessName || '');
          setCity(b.city || '');
          setCountry(b.country || 'India');
          setAddress(b.address || '');
          setPhone(b.phone || '');
          setWhatsapp(b.whatsapp || '');
          setDescription(b.description || '');
          setGoogleMapsUrl(b.googleMapsUrl || '');
          setLatitude(b.latitude ? String(b.latitude) : '');
          setLongitude(b.longitude ? String(b.longitude) : '');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handleUseCurrentLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
        setSuccessMsg('GPS coordinates captured from your current location! Click "Save Changes" to apply.');
      },
      (err) => {
        console.warn('Geolocation error', err);
        setErrorMsg('Could not detect location: ' + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !city.trim()) {
      setErrorMsg('Business name and city are required.');
      return;
    }

    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const payload: any = {
        businessName: businessName.trim(),
        city: city.trim(),
        country: country.trim(),
        address: address.trim(),
        phone: phone.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined,
        description: description.trim() || undefined,
        googleMapsUrl: googleMapsUrl.trim() || undefined,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
      };

      const res: any = await vendorApi.updateBusiness(id, payload);
      const updated = res?.data || res;
      setBusiness(updated);
      setSuccessMsg('Business details updated successfully!');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.response?.data?.message || err?.message || 'Failed to update business details.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading business profile...</div>;
  }

  if (!business) {
    return <div className="p-8 text-center text-red-500">Business not found.</div>;
  }

  const parsedLat = latitude ? parseFloat(latitude) : business.latitude;
  const parsedLng = longitude ? parseFloat(longitude) : business.longitude;

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/vendor')}>
            &larr; Businesses
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-wakeru-text-primary)]">
              {business.businessName}
            </h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="default" className="capitalize">
                {business.category}
              </Badge>
              <Badge
                variant={
                  business.verificationStatus === 'VERIFIED'
                    ? 'default'
                    : business.verificationStatus === 'REJECTED'
                    ? 'destructive'
                    : 'secondary'
                }
              >
                {business.verificationStatus === 'VERIFIED'
                  ? '✓ Verified Business'
                  : business.verificationStatus === 'PENDING'
                  ? '⏳ Pending Admin Verification'
                  : business.verificationStatus}
              </Badge>
            </div>
          </div>
        </div>

        <Button variant="secondary" onClick={() => window.open(`/discover/business/${id}`, '_blank')}>
          Preview Public Page ↗
        </Button>
      </div>

      <BusinessNavTabs businessId={id} activeTab="details" />

      {successMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 rounded-md border border-emerald-200">
          ✓ {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
          {errorMsg}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Business Information & Contact Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Business Name *"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
              />

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input
                  type="text"
                  value={business.category}
                  disabled
                  className="w-full px-3 py-2 border rounded-md bg-gray-100 dark:bg-gray-800 cursor-not-allowed capitalize text-sm"
                />
              </div>

              <Input
                label="City *"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />

              <Input
                label="Country *"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
              />

              <div className="md:col-span-2">
                <Input
                  label="Full Street Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Plot/Shop number, Street, Landmark"
                />
              </div>

              <Input
                label="Primary Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />

              <Input
                label="WhatsApp Number (for travelers)"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+91 98765 43210"
              />

              <div className="md:col-span-2">
                <Input
                  label="Google Maps Location URL"
                  value={googleMapsUrl}
                  onChange={(e) => setGoogleMapsUrl(e.target.value)}
                  placeholder="https://maps.google.com/..."
                />
              </div>

              <div>
                <Input
                  label="GPS Latitude"
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="e.g. 15.2993"
                />
              </div>

              <div>
                <Input
                  label="GPS Longitude"
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g. 74.1240"
                />
              </div>

              <div className="md:col-span-2 flex justify-start">
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 font-semibold hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
                >
                  📍 Capture Current Device GPS
                </button>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">About the Business</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-md bg-transparent text-sm"
                  placeholder="Describe your property, offerings, ambiance, and why travelers love visiting..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="secondary" onClick={() => router.push('/vendor')}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? 'Saving Changes...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Live Map Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle>Traveler Map & Pin Preview</CardTitle>
          <p className="text-xs text-[var(--color-wakeru-text-secondary)]">
            This is how your venue pin, category icon, and coordinates appear to travelers exploring on the discovery map.
          </p>
        </CardHeader>
        <CardContent>
          <VenueLocationMapCard
            venueName={businessName || business.businessName}
            category={business.category}
            address={address || business.address}
            city={city || business.city}
            country={country || business.country}
            latitude={parsedLat}
            longitude={parsedLng}
            googleMapsUrl={googleMapsUrl || business.googleMapsUrl}
            phone={phone || business.phone}
            cardTitle="Live Venue Pin Preview"
          />
        </CardContent>
      </Card>
    </div>
  );
}

