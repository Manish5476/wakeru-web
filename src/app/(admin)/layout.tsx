import React from 'react';
import Link from 'next/link';
import { RoleGuard } from '@/features/auth/RoleGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['ADMIN']} portalName="Admin Operations Console">
      <div className="min-h-screen bg-[var(--color-wakeru-surface-muted)] flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-[#0f172a] text-white flex-shrink-0 flex flex-col">
          <div className="p-6 border-b border-[#1e293b]">
            <Link href="/admin" className="text-xl font-bold flex items-center gap-2">
              <span>🛡️</span>
              <span>Wakeru Admin</span>
            </Link>
            <p className="text-xs text-slate-400 mt-1">Platform Operations Console</p>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <Link href="/admin" className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-[#1e293b] text-slate-300">
              📊 Overview
            </Link>
            <Link href="/admin/businesses" className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-[#1e293b] text-slate-300">
              🏢 Businesses &amp; Venues
            </Link>
            <Link href="/admin/bookings" className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-[#1e293b] text-slate-300">
              📅 Booking Queue
            </Link>
            <Link href="/admin/reservations" className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-[#1e293b] text-slate-300">
              🎫 Reservations
            </Link>
            <Link href="/admin/vendors" className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-[#1e293b] text-slate-300">
              🤝 Vendor Partners
            </Link>
            <Link href="/admin/media" className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-[#1e293b] text-slate-300">
              📸 Media Queue
            </Link>
            <Link href="/admin/reviews/reports" className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-[#1e293b] text-slate-300">
              ⭐ Reported Reviews
            </Link>
            <Link href="/admin/campaigns" className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-[#1e293b] text-slate-300">
              🚀 Ad Campaigns
            </Link>
            <Link href="/admin/demand" className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-[#1e293b] text-slate-300">
              📈 Demand Velocity
            </Link>
            <Link href="/admin/audit-logs" className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-[#1e293b] text-slate-300">
              🛡️ Audit Logs
            </Link>
          </nav>

          {/* Portal Switching Footer */}
          <div className="p-4 border-t border-[#1e293b] space-y-2 text-xs">
            <Link href="/trips" className="block text-slate-400 hover:text-white transition-colors">
              ➔ Open Traveler Portal
            </Link>
            <Link href="/vendor" className="block text-slate-400 hover:text-white transition-colors">
              ➔ Open Vendor Portal
            </Link>
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
