"use client";

import React from 'react';
import Link from 'next/link';

export type BusinessTabKey =
  | 'overview'
  | 'details'
  | 'services'
  | 'media'
  | 'offers'
  | 'bookings'
  | 'reservations'
  | 'leads'
  | 'reviews'
  | 'campaigns'
  | 'analytics';

interface BusinessNavTabsProps {
  businessId: string;
  activeTab: BusinessTabKey;
}

const TABS: { key: BusinessTabKey; label: string; href: (id: string) => string; icon: string }[] = [
  { key: 'details', label: 'Details', href: (id) => `/vendor/businesses/${id}`, icon: '🏢' },
  { key: 'overview', label: 'Overview', href: (id) => `/vendor/businesses/${id}/overview`, icon: '📊' },
  { key: 'services', label: 'Services & Pricing', href: (id) => `/vendor/businesses/${id}/services`, icon: '🏷️' },
  { key: 'media', label: 'Photos & Media', href: (id) => `/vendor/businesses/${id}/media`, icon: '📸' },
  { key: 'offers', label: 'Special Offers', href: (id) => `/vendor/businesses/${id}/offers`, icon: '🎁' },
  { key: 'bookings', label: 'Booking Requests', href: (id) => `/vendor/businesses/${id}/bookings`, icon: '📅' },
  { key: 'reservations', label: 'Reservations', href: (id) => `/vendor/businesses/${id}/reservations`, icon: '🎫' },
  { key: 'leads', label: 'Leads', href: (id) => `/vendor/businesses/${id}/leads`, icon: '📞' },
  { key: 'reviews', label: 'Reviews', href: (id) => `/vendor/businesses/${id}/reviews`, icon: '⭐' },
  { key: 'campaigns', label: 'Ads & Campaigns', href: (id) => `/vendor/businesses/${id}/campaigns`, icon: '🚀' },
  { key: 'analytics', label: 'Analytics', href: (id) => `/vendor/businesses/${id}/analytics`, icon: '📈' },
];

export function BusinessNavTabs({ businessId, activeTab }: BusinessNavTabsProps) {
  return (
    <div className="border-b border-[var(--color-wakeru-border-strong)] overflow-x-auto scrollbar-none">
      <nav className="flex space-x-1 min-w-max pb-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Link
              key={tab.key}
              href={tab.href(businessId)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                isActive
                  ? 'bg-[var(--color-wakeru-primary)] text-white shadow-sm'
                  : 'text-[var(--color-wakeru-text-secondary)] hover:text-[var(--color-wakeru-text-primary)] hover:bg-[var(--color-wakeru-surface-muted)]'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
