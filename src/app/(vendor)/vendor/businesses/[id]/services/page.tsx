"use client";

import React, { useEffect, useState } from 'react';
import { vendorApi } from '@/api/vendor';
import { BusinessService } from '@/types/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/design-system/components/Table';
import { Button } from '@/design-system/components/Button';
import { Input } from '@/design-system/components/Input';
import { useParams, useRouter } from 'next/navigation';
import { BusinessNavTabs } from '@/features/vendor/BusinessNavTabs';

export default function ServicesPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [services, setServices] = useState<BusinessService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [serviceName, setServiceName] = useState('');
  const [serviceType, setServiceType] = useState('other');
  const [price, setPrice] = useState('');
  const [priceUnit, setPriceUnit] = useState('per person');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

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
    try {
      const priceMinor = Math.round(parseFloat(price) * 100);
      await vendorApi.createService(id, {
        serviceName: serviceName.trim(),
        name: serviceName.trim(),
        serviceType: serviceType || 'other',
        basePriceMinor: priceMinor,
        priceMinor,
        currency: 'INR',
        priceUnit: priceUnit.trim() || 'per person',
        description: description.trim() || undefined,
      });
      setServiceName('');
      setPrice('');
      setDescription('');
      setServiceType('other');
      setPriceUnit('per person');
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
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/vendor')}>
            &larr; Businesses
          </Button>
          <h1 className="text-3xl font-bold text-[var(--color-wakeru-text-primary)]">Services & Pricing Catalogue</h1>
        </div>
      </div>

      <BusinessNavTabs businessId={id} activeTab="services" />

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleCreateService} className="space-y-4 p-4 border rounded-md bg-white dark:bg-[var(--color-wakeru-surface)]">
        <h2 className="text-xl font-semibold">Add New Service</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Service Name *" 
            value={serviceName} 
            onChange={e => setServiceName(e.target.value)} 
            placeholder="e.g. Deluxe Room, Sunset Cruise"
            required 
          />
          <div>
            <label className="block text-sm font-medium mb-1">Service Type</label>
            <select
              value={serviceType}
              onChange={e => setServiceType(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-transparent"
            >
              <option value="room">Room / Accommodation</option>
              <option value="table">Table Reservation</option>
              <option value="rental_unit">Rental Unit (Bike, Car, Gear)</option>
              <option value="activity">Activity</option>
              <option value="tour">Guided Tour</option>
              <option value="package">Travel Package</option>
              <option value="menu_item">Menu Item / Dining</option>
              <option value="other">Other Service</option>
            </select>
          </div>
          <Input 
            label="Price (INR ₹) *" 
            type="number"
            step="1"
            min="0"
            value={price} 
            onChange={e => setPrice(e.target.value)} 
            placeholder="e.g. 1500"
            required 
          />
          <Input 
            label="Price Unit" 
            value={priceUnit} 
            onChange={e => setPriceUnit(e.target.value)} 
            placeholder="e.g. per night, per person, per hour"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border rounded-md bg-transparent"
            placeholder="What is included in this service?"
          />
        </div>
        <Button type="submit" disabled={isCreating}>
          {isCreating ? 'Adding...' : 'Add Service'}
        </Button>
      </form>

      {loading ? (
        <p className="text-[var(--color-wakeru-text-secondary)]">Loading services...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-[var(--color-wakeru-text-secondary)] py-8">
                  No services found. Add your first service above.
                </TableCell>
              </TableRow>
            ) : (
              services.map(service => {
                const sName = service.serviceName || service.name || 'Unnamed';
                const pMinor = service.basePriceMinor ?? service.priceMinor ?? 0;
                return (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{sName}</TableCell>
                    <TableCell>
                      <span className="capitalize px-2 py-0.5 text-xs rounded bg-gray-100 dark:bg-gray-800">
                        {service.serviceType || 'other'}
                      </span>
                    </TableCell>
                    <TableCell>₹{(pMinor / 100).toLocaleString('en-IN')}</TableCell>
                    <TableCell>{service.priceUnit || 'per person'}</TableCell>
                    <TableCell>{service.description || '-'}</TableCell>
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
      )}
    </div>
  );
}
