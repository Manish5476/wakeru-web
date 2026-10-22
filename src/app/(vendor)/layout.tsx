import React from 'react';
import Link from 'next/link';
import { RoleGuard } from '@/features/auth/RoleGuard';

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['VENDOR', 'ADMIN']} portalName="Vendor Partner Portal">
      <div className="min-h-screen bg-[var(--color-wakeru-surface-muted)] flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-[var(--color-wakeru-surface-elevated)] border-r border-[var(--color-wakeru-border)] flex-shrink-0 flex flex-col">
          <div className="p-6 border-b border-[var(--color-wakeru-border)]">
            <Link href="/vendor" className="text-xl font-bold text-[var(--color-wakeru-text-primary)]">
              Vendor Portal
            </Link>
            <p className="text-xs text-[var(--color-wakeru-text-secondary)] mt-1">Wakeru Local</p>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <Link href="/vendor" className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-[var(--color-wakeru-surface-muted)] text-[var(--color-wakeru-text-primary)]">
              Dashboard
            </Link>
            <Link href="/vendor/businesses" className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-[var(--color-wakeru-surface-muted)] text-[var(--color-wakeru-text-secondary)]">
              My Businesses
            </Link>
            <Link href="/vendor/campaigns" className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-[var(--color-wakeru-surface-muted)] text-[var(--color-wakeru-text-secondary)]">
              Campaigns
            </Link>
            <Link href="/vendor/analytics" className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-[var(--color-wakeru-surface-muted)] text-[var(--color-wakeru-text-secondary)]">
              Analytics
            </Link>
          </nav>
          <div className="p-4 border-t border-[var(--color-wakeru-border)] space-y-2 text-xs">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-[var(--color-wakeru-primary)] text-white flex items-center justify-center text-xs font-bold">V</div>
              <div className="text-sm">
                <p className="font-medium">Vikram Joshi</p>
                <p className="text-xs text-[var(--color-wakeru-text-secondary)]">Verified Host</p>
              </div>
            </div>
            <div className="pt-2 border-t border-[var(--color-wakeru-border)]">
              <Link href="/trips" className="block text-[var(--color-wakeru-text-secondary)] hover:text-[var(--color-wakeru-primary)] transition-colors">
                ➔ Open Traveler Portal
              </Link>
            </div>
          </div>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-[var(--color-wakeru-bg)]">
          {children}
        </main>
      </div>
    </RoleGuard>
  );
}
