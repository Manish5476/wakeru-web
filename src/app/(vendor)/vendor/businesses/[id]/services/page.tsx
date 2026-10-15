"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { vendorApi } from '@/api/vendor';
import { BusinessService } from '@/types/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/design-system/components/Table';
import { Button } from '@/design-system/components/Button';
import { Input } from '@/design-system/components/Input';
import { Badge } from '@/design-system/components/Badge';
import { useParams, useRouter } from 'next/navigation';
import { BusinessNavTabs } from '@/features/vendor/BusinessNavTabs';

const CATEGORY_FACILITIES_MAP: Record<string, string[]> = {
  room: [
    'Air Conditioning',
    'Free High-Speed Wi-Fi',
    'Private Balcony / Terrace',
    'Sea / Mountain View',
    'Complimentary Breakfast',
    'Swimming Pool Access',
    'Attached Private Bath',
    'Smart TV / OTT',
    'Room Service',
    'Workstation / Desk',
  ],
  table: [
    'Outdoor Garden Seating',
    'Vegetarian Friendly',
    'Vegan Options Available',
    'Craft Cocktails / Bar',
    'Live Acoustic Music',
    'Air Conditioned Seating',
    'Romantic Candlelight Setup',
    'Valet Parking',
  ],
  menu_item: [
    'Chef Special',
    'Gluten-Free',
    'Organic Ingredients',
    'Spicy',
    'Beverage Included',
  ],
  rental_unit: [
    'Automatic Transmission',
    'Manual Transmission',
    'Safety Helmet Included',
    'Comprehensive Insurance',
    'Unlimited Kilometers',
    'Phone Mount & USB Charger',
    '24/7 Roadside Assistance',
  ],
  activity: [
    'Certified Instructor',
    'Safety Gear & Lifevests',
    'Complimentary Photos/Videos',
    'Beginner Friendly',
    'First Aid Certified',
  ],
  tour: [
    'Licensed Tour Guide',
    'Hotel Pickup & Drop',
    'Complimentary Refreshments',
    'Audio Tour Headsets',
    'Entry Tickets Included',
  ],
  package: [
    'All-Inclusive Stays',
    'Guided Excursions',
    'Airport Transfers',
    'Daily Meals Included',
  ],
  other: [
    'Instant Confirmation',
    'Flexible Rescheduling',
    'Family Friendly',
    'Multi-language Support',
  ],
};

export default function ServicesPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [services, setServices] = useState<BusinessService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [serviceName, setServiceName] = useState('');
  const [serviceType, setServiceType] = useState('room');
  const [price, setPrice] = useState('');
  const [priceUnit, setPriceUnit] = useState('per night');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('2');
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [customFacility, setCustomFacility] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Update default priceUnit when serviceType changes
  const handleTypeChange = (newType: string) => {
    setServiceType(newType);
    if (newType === 'room') setPriceUnit('per night');
    else if (newType === 'rental_unit') setPriceUnit('per day');
    else if (newType === 'table') setPriceUnit('cover charge');
    else if (newType === 'activity' || newType === 'tour') setPriceUnit('per person');
    else if (newType === 'menu_item') setPriceUnit('per portion');
    else setPriceUnit('per unit');

    // Reset facilities for new type
    setSelectedFacilities([]);
  };

  const availableFacilities = useMemo(() => {
    return CATEGORY_FACILITIES_MAP[serviceType] || CATEGORY_FACILITIES_MAP.other;
  }, [serviceType]);

  const toggleFacility = (facility: string) => {
    setSelectedFacilities(prev =>
      prev.includes(facility) ? prev.filter(f => f !== facility) : [...prev, facility]
    );
  };

  const handleAddCustomFacility = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFacility.trim()) return;
    if (!selectedFacilities.includes(customFacility.trim())) {
      setSelectedFacilities(prev => [...prev, customFacility.trim()]);
    }
    setCustomFacility('');
  };

  const loadServices = () => {
    setLoading(true);
    vendorApi
      .getServices(id)
      .then(res => {
        setServices(res.data);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load services.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadServices();
  }, [id]);

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim() || !price.trim()) return;

    setIsCreating(true);
    setError(null);
    setSuccess(null);
    try {
      const priceMinor = Math.round(parseFloat(price) * 100);
      const capacityNum = maxCapacity ? parseInt(maxCapacity, 10) : undefined;

      await vendorApi.createService(id, {
        serviceName: serviceName.trim(),
        name: serviceName.trim(),
        serviceType: serviceType || 'other',
        basePriceMinor: priceMinor,
        priceMinor,
        currency: 'INR',
        priceUnit: priceUnit.trim() || 'per unit',
        description: description.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        maxCapacity: isNaN(capacityNum as number) ? undefined : capacityNum,
        facilities: selectedFacilities.length > 0 ? selectedFacilities : undefined,
      });

      setSuccess(`Service "${serviceName.trim()}" added successfully!`);
      setServiceName('');
      setPrice('');
      setDescription('');
      setImageUrl('');
      setMaxCapacity('2');
      setSelectedFacilities([]);
      loadServices();
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || err?.message || 'Failed to create service.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await vendorApi.deleteService(serviceId);
      loadServices();
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to delete service.');
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/vendor')}>
            &larr; Businesses
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-wakeru-text-primary)]">
              Services & Offerings Catalogue
            </h1>
            <p className="text-xs text-[var(--color-wakeru-text-secondary)] mt-0.5">
              Add accommodations, rentals, tours, and dining packages with rich amenities and photos.
            </p>
          </div>
        </div>
      </div>

      <BusinessNavTabs businessId={id} activeTab="services" />

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-50 text-emerald-800 rounded-md border border-emerald-200">
          ✓ {success}
        </div>
      )}

      {/* Service Creation Form */}
      <form onSubmit={handleCreateService} className="space-y-5 p-5 border border-[var(--color-wakeru-border)] rounded-xl bg-white dark:bg-[var(--color-wakeru-surface)] shadow-sm">
        <div className="border-b pb-3">
          <h2 className="text-lg font-bold text-[var(--color-wakeru-text-primary)]">
            + Add New Service or Offering
          </h2>
          <p className="text-xs text-[var(--color-wakeru-text-secondary)]">
            Configure pricing, category-specific facilities, and visual representations for travelers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Service Name *" 
            value={serviceName} 
            onChange={e => setServiceName(e.target.value)} 
            placeholder="e.g. Deluxe Sea-View Room, Yamaha Aerox 155, Scuba Intro Dive"
            required 
          />

          <div>
            <label className="block text-sm font-medium mb-1">Service Type / Category *</label>
            <select
              value={serviceType}
              onChange={e => handleTypeChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-transparent text-sm"
            >
              <option value="room">🏨 Room / Accommodation</option>
              <option value="table">🍽️ Table Reservation / Dining</option>
              <option value="rental_unit">🚗 Rental Unit (Bike, Scooter, Car)</option>
              <option value="activity">🏄 Water Sports / Outdoor Activity</option>
              <option value="tour">🎒 Guided Tour / Sightseeing</option>
              <option value="package">📦 Complete Experience Package</option>
              <option value="menu_item">🍹 Special Menu Item / Tasting</option>
              <option value="other">✨ Other Custom Service</option>
            </select>
          </div>

          <Input 
            label="Price (INR ₹) *" 
            type="number"
            step="1"
            min="0"
            value={price} 
            onChange={e => setPrice(e.target.value)} 
            placeholder="e.g. 2400"
            required 
          />

          <Input 
            label="Price Unit" 
            value={priceUnit} 
            onChange={e => setPriceUnit(e.target.value)} 
            placeholder="e.g. per night, per person, per 24 hours"
          />

          <Input 
            label="Max Guests / Capacity" 
            type="number"
            min="1"
            value={maxCapacity} 
            onChange={e => setMaxCapacity(e.target.value)} 
            placeholder="e.g. 2"
          />

          <Input 
            label="Service Photo URL (optional)" 
            value={imageUrl} 
            onChange={e => setImageUrl(e.target.value)} 
            placeholder="https://images.unsplash.com/..."
          />
        </div>

        {/* Thumbnail Preview */}
        {imageUrl.trim() && (
          <div className="flex items-center gap-3 p-3 bg-[var(--color-wakeru-surface-muted)] rounded-lg">
            <img
              src={imageUrl}
              alt="Preview"
              className="w-16 h-16 object-cover rounded-md border"
              onError={(e) => ((e.target as any).style.display = 'none')}
            />
            <div className="text-xs text-[var(--color-wakeru-text-secondary)]">
              <span className="font-semibold block text-[var(--color-wakeru-text-primary)]">Photo Preview</span>
              This image will be showcased to travelers on the booking card and digital voucher.
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Service Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border rounded-md bg-transparent text-sm"
            placeholder="Detail what is included, check-in timings, policies, or gear provided..."
          />
        </div>

        {/* Category Facilities & Amenities Selector */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-[var(--color-wakeru-text-primary)]">
              Facilities & Included Amenities ({selectedFacilities.length} selected)
            </label>
            <span className="text-xs text-[var(--color-wakeru-text-muted)]">
              Tap chips to toggle
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {availableFacilities.map((facility) => {
              const isSelected = selectedFacilities.includes(facility);
              return (
                <button
                  type="button"
                  key={facility}
                  onClick={() => toggleFacility(facility)}
                  className={`text-xs px-3 py-1.5 rounded-full transition-all border font-medium flex items-center gap-1 ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-[var(--color-wakeru-surface-muted)] text-[var(--color-wakeru-text-secondary)] border-transparent hover:border-gray-300'
                  }`}
                >
                  <span>{isSelected ? '✓' : '+'}</span>
                  <span>{facility}</span>
                </button>
              );
            })}
          </div>

          {/* Add custom facility */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={customFacility}
              onChange={e => setCustomFacility(e.target.value)}
              placeholder="Add other custom amenity..."
              className="text-xs px-3 py-1.5 border rounded-lg bg-transparent flex-1 max-w-xs"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomFacility(e);
                }
              }}
            />
            <Button type="button" variant="outline" size="sm" onClick={handleAddCustomFacility} className="text-xs">
              + Add Amenity
            </Button>
          </div>
        </div>

        <div className="flex justify-end pt-3">
          <Button type="submit" disabled={isCreating} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            {isCreating ? 'Adding Service...' : 'Add Service to Catalogue'}
          </Button>
        </div>
      </form>

      {/* Services List Table */}
      {loading ? (
        <p className="text-[var(--color-wakeru-text-secondary)]">Loading catalogue...</p>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--color-wakeru-text-primary)]">
              Active Services ({services.length})
            </h2>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service / Image</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Facilities & Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-[var(--color-wakeru-text-secondary)] py-8">
                    No services found. Add your first service above to begin taking bookings.
                  </TableCell>
                </TableRow>
              ) : (
                services.map(service => {
                  const sName = service.serviceName || service.name || 'Unnamed';
                  const pMinor = service.basePriceMinor ?? service.priceMinor ?? 0;
                  const facilitiesList = Array.isArray(service.facilities) ? service.facilities : [];

                  return (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          {service.imageUrl ? (
                            <img
                              src={service.imageUrl}
                              alt={sName}
                              className="w-10 h-10 object-cover rounded-lg border shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-[var(--color-wakeru-surface-muted)] flex items-center justify-center text-sm shrink-0">
                              🏷️
                            </div>
                          )}
                          <span className="font-semibold text-sm">{sName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="capitalize px-2 py-0.5 text-xs rounded bg-gray-100 dark:bg-gray-800 font-mono">
                          {service.serviceType || 'other'}
                        </span>
                      </TableCell>
                      <TableCell className="font-bold">
                        ₹{(pMinor / 100).toLocaleString('en-IN')}
                        <span className="text-xs font-normal text-[var(--color-wakeru-text-muted)] block">
                          {service.priceUnit || 'per unit'}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-[var(--color-wakeru-text-secondary)]">
                        {service.maxCapacity ? `👥 ${service.maxCapacity} guests` : '-'}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {service.description && (
                          <p className="text-xs text-[var(--color-wakeru-text-secondary)] truncate mb-1">
                            {service.description}
                          </p>
                        )}
                        {facilitiesList.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {facilitiesList.slice(0, 3).map((f, i) => (
                              <span
                                key={i}
                                className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50"
                              >
                                {f}
                              </span>
                            ))}
                            {facilitiesList.length > 3 && (
                              <span className="text-[10px] text-gray-500">
                                +{facilitiesList.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="danger" size="sm" onClick={() => handleDelete(service.id)}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

