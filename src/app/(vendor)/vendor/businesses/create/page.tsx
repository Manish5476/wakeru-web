"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { vendorApi } from '@/api/vendor';
import { masterApi } from '@/api/master';
import { MasterItem } from '@/types/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/design-system/components/Card';
import { Button } from '@/design-system/components/Button';
import { Input } from '@/design-system/components/Input';

interface CategoryOption {
  key: string;
  label: string;
}

const DEFAULT_CATEGORIES: CategoryOption[] = [
  { key: 'hotel', label: 'Hotel' },
  { key: 'resort', label: 'Resort' },
  { key: 'homestay', label: 'Homestay' },
  { key: 'hostel', label: 'Hostel' },
  { key: 'restaurant', label: 'Restaurant' },
  { key: 'cafe', label: 'Cafe' },
  { key: 'bakery', label: 'Bakery' },
  { key: 'cab', label: 'Cab / Taxi' },
  { key: 'bike_rental', label: 'Bike Rental' },
  { key: 'car_rental', label: 'Car Rental' },
  { key: 'tour_guide', label: 'Tour Guide' },
  { key: 'tour_operator', label: 'Tour Operator' },
  { key: 'activity_provider', label: 'Activity Provider' },
  { key: 'shop', label: 'Shop / Store' },
  { key: 'travel_agent', label: 'Travel Agent' },
  { key: 'photographer', label: 'Photographer' },
];

function extractCoordsFromUrl(url?: string): { lat?: number; lng?: number } {
  if (!url || typeof url !== 'string') return {};
  const trimmed = url.trim();

  const atMatch = trimmed.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    const lat = parseFloat(atMatch[1]);
    const lng = parseFloat(atMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }

  const qMatch = trimmed.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (qMatch) {
    const lat = parseFloat(qMatch[1]);
    const lng = parseFloat(qMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }

  const embedMatch = trimmed.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (embedMatch) {
    const lat = parseFloat(embedMatch[1]);
    const lng = parseFloat(embedMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }

  return {};
}

export default function CreateBusinessPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<CategoryOption[]>(DEFAULT_CATEGORIES);
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  const [postalCode, setPostalCode] = useState('');
  const [address, setAddress] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [description, setDescription] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    masterApi
      .getBusinessCategories()
      .then((res: any) => {
        const items = res?.data?.data || res?.data;
        if (Array.isArray(items) && items.length > 0) {
          const mapped: CategoryOption[] = items.map((item: MasterItem) => ({
            key: item.code.toLowerCase(),
            label: item.name || item.code,
          }));
          setCategories(mapped);
          if (!category && mapped.length > 0) {
            setCategory(mapped[0].key);
          }
        } else if (!category) {
          setCategory(DEFAULT_CATEGORIES[0].key);
        }
      })
      .catch(() => {
        if (!category) {
          setCategory(DEFAULT_CATEGORIES[0].key);
        }
      });
  }, []);

  const handleMapsUrlChange = (val: string) => {
    setGoogleMapsUrl(val);
    const coords = extractCoordsFromUrl(val);
    if (coords.lat != null && coords.lng != null) {
      setLatitude(coords.lat.toString());
      setLongitude(coords.lng.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !category || !city.trim()) {
      setError('Please fill in all required fields (Business Name, Category, City).');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    let latVal = 0;
    let lngVal = 0;
    if (latitude.trim()) latVal = parseFloat(latitude.trim()) || 0;
    if (longitude.trim()) lngVal = parseFloat(longitude.trim()) || 0;

    let formattedWebsite = websiteUrl.trim();
    if (formattedWebsite && !/^https?:\/\//i.test(formattedWebsite)) {
      formattedWebsite = `https://${formattedWebsite}`;
    }

    const payload: any = {
      businessName: businessName.trim(),
      category: category.toLowerCase(),
      city: city.trim(),
      country: country.trim() || 'India',
      address: address.trim() || city.trim(),
      latitude: latVal,
      longitude: lngVal,
    };

    if (subcategory.trim()) payload.subcategory = subcategory.trim();
    if (state.trim()) payload.state = state.trim();
    if (postalCode.trim()) payload.postalCode = postalCode.trim();
    if (googleMapsUrl.trim()) payload.googleMapsUrl = googleMapsUrl.trim();
    if (phone.trim()) payload.phone = phone.trim();
    if (whatsapp.trim()) payload.whatsapp = whatsapp.trim();
    if (email.trim()) payload.email = email.trim();
    if (formattedWebsite) payload.websiteUrl = formattedWebsite;
    if (description.trim()) payload.description = description.trim();

    try {
      const res: any = await vendorApi.createBusiness(payload);
      const newId = res?.data?.id || res?.data?.business?.id;
      if (newId) {
        router.push(`/vendor/businesses/${newId}`);
      } else {
        router.push('/vendor');
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || err?.message || 'Failed to create business.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/vendor"
            className="text-sm text-[var(--color-wakeru-text-secondary)] hover:underline inline-flex items-center gap-1 mb-2"
          >
            ← Back to Businesses
          </Link>
          <h1 className="text-3xl font-bold text-[var(--color-wakeru-text-primary)]">
            Register New Business
          </h1>
          <p className="text-sm text-[var(--color-wakeru-text-secondary)]">
            Create a local property, service, or travel business listing on Wakeru.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Details */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Business Name *"
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              placeholder="e.g. Goa Palms Resort, Ocean Pearl Cafe"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Business Category *
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-transparent"
                  required
                >
                  <option value="" disabled>Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.key} value={cat.key}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Specific Subcategory"
                value={subcategory}
                onChange={e => setSubcategory(e.target.value)}
                placeholder="e.g. Heritage Homestay, Italian Bistro"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded-md bg-transparent"
                placeholder="Describe your business, amenities, and unique offerings for travelers..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Location & Map */}
        <Card>
          <CardHeader>
            <CardTitle>Location & Coordinates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Google Maps Link (Paste here to auto-fill coordinates)"
              value={googleMapsUrl}
              onChange={e => handleMapsUrlChange(e.target.value)}
              placeholder="https://maps.app.goo.gl/... or https://google.com/maps?q=..."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Latitude"
                value={latitude}
                onChange={e => setLatitude(e.target.value)}
                placeholder="e.g. 15.2993"
              />
              <Input
                label="Longitude"
                value={longitude}
                onChange={e => setLongitude(e.target.value)}
                placeholder="e.g. 74.1240"
              />
            </div>

            <Input
              label="Street Address"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="e.g. Near Calangute Beach, Main Road"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="City *"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="e.g. Goa"
                required
              />
              <Input
                label="State"
                value={state}
                onChange={e => setState(e.target.value)}
                placeholder="e.g. Goa"
              />
              <Input
                label="Postal Code"
                value={postalCode}
                onChange={e => setPostalCode(e.target.value)}
                placeholder="e.g. 403516"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+91 9876543210"
            />
            <Input
              label="WhatsApp Number"
              value={whatsapp}
              onChange={e => setWhatsapp(e.target.value)}
              placeholder="+91 9876543210"
            />
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="contact@business.com"
            />
            <Input
              label="Website URL"
              value={websiteUrl}
              onChange={e => setWebsiteUrl(e.target.value)}
              placeholder="https://mybusiness.com"
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href="/vendor">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Registering...' : 'Register Business'}
          </Button>
        </div>
      </form>
    </div>
  );
}
