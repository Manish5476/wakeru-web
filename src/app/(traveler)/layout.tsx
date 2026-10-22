'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function NavLink({
  href,
  children,
  exact = false,
}: {
  href: string;
  children: React.ReactNode;
  exact?: boolean;
}) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`text-sm font-semibold transition-colors px-3 py-1.5 rounded-[var(--radius-control)] ${
        isActive
          ? 'text-[var(--color-wakeru-primary)] bg-[var(--color-wakeru-primary)]/8'
          : 'text-[var(--color-wakeru-text-secondary)] hover:text-[var(--color-wakeru-text-primary)] hover:bg-[var(--color-wakeru-surface-muted)]'
      }`}
    >
      {children}
    </Link>
  );
}

export default function TravelerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-wakeru-bg)] flex flex-col">
      <header className="sticky top-0 z-50 bg-[var(--color-wakeru-surface-elevated)]/95 backdrop-blur-sm border-b border-[var(--color-wakeru-border)] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo + Nav */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-[var(--color-wakeru-text-primary)] hover:text-[var(--color-wakeru-primary)] transition-colors"
            >
              <span className="text-2xl leading-none">🌴</span>
              <span>TripSplit</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLink href="/trips">
                <span className="flex items-center gap-1.5">
                  <span>Trips &amp; Split</span>
                  <span className="text-[9px] uppercase font-black tracking-wider px-1.5 py-0.5 rounded-full bg-[var(--color-wakeru-primary)]/15 text-[var(--color-wakeru-primary)]">
                    Hub
                  </span>
                </span>
              </NavLink>
              <NavLink href="/discover">Discover</NavLink>
              <NavLink href="/saved">Wishlist 🔖</NavLink>
              <NavLink href="/bookings">My Bookings</NavLink>
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Link
              href="/vendor"
              className="hidden sm:inline-flex items-center text-xs font-semibold text-[var(--color-wakeru-text-secondary)] hover:text-[var(--color-wakeru-text-primary)] transition-colors border border-[var(--color-wakeru-border)] px-3 py-1.5 rounded-full hover:border-[var(--color-wakeru-border-strong)]"
            >
              Host Portal 🏡
            </Link>

            <Link
              href="/admin"
              className="hidden lg:inline-flex items-center text-xs font-semibold text-[var(--color-wakeru-text-secondary)] hover:text-[var(--color-wakeru-text-primary)] transition-colors border border-[var(--color-wakeru-border)] px-3 py-1.5 rounded-full hover:border-[var(--color-wakeru-border-strong)]"
            >
              Admin 🛡️
            </Link>

            {/* Avatar / Profile switcher */}
            <Link href="/login" title="Switch Demo Account">
              <div className="relative group cursor-pointer">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[var(--color-wakeru-primary)] to-emerald-700 text-white font-bold text-xs flex items-center justify-center ring-2 ring-[var(--color-wakeru-primary)]/20 shadow-sm transition-transform group-hover:scale-105">
                  AL
                </div>
                <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[var(--color-wakeru-surface-elevated)] rounded-full" />
              </div>
            </Link>
          </div>
        </div>

        {/* Mobile bottom nav bar */}
        <div className="flex md:hidden border-t border-[var(--color-wakeru-border)] bg-[var(--color-wakeru-surface-elevated)]">
          <MobileNavItem href="/trips" icon="✈️" label="Trips" />
          <MobileNavItem href="/discover" icon="🧭" label="Discover" />
          <MobileNavItem href="/saved" icon="🔖" label="Wishlist" />
          <MobileNavItem href="/bookings" icon="🗓️" label="Bookings" />
          <MobileNavItem href="/vendor" icon="🏡" label="Host" />
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-[var(--color-wakeru-surface-elevated)] border-t border-[var(--color-wakeru-border)] mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--color-wakeru-text-secondary)]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[var(--color-wakeru-text-primary)]">🌴 TripSplit × Wakeru</span>
            <span>·</span>
            <span>&copy; {new Date().getFullYear()} Autonomous group expense splitting &amp; vacation hub.</span>
          </div>
          <div className="flex flex-wrap gap-4 sm:gap-6">
            <Link href="/trips" className="hover:text-[var(--color-wakeru-text-primary)] transition-colors">Trips Hub</Link>
            <Link href="/discover" className="hover:text-[var(--color-wakeru-text-primary)] transition-colors">Discover</Link>
            <Link href="/saved" className="hover:text-[var(--color-wakeru-text-primary)] transition-colors">Wishlist</Link>
            <Link href="/bookings" className="hover:text-[var(--color-wakeru-text-primary)] transition-colors">Bookings</Link>
            <Link href="/vendor" className="hover:text-[var(--color-wakeru-text-primary)] transition-colors">Host Portal</Link>
            <Link href="/admin" className="hover:text-[var(--color-wakeru-text-primary)] transition-colors">Admin Console</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MobileNavItem({ href, icon, label }: { href: string; icon: string; label: string }) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 text-center transition-colors ${
        isActive
          ? 'text-[var(--color-wakeru-primary)] font-bold'
          : 'text-[var(--color-wakeru-text-secondary)]'
      }`}
    >
      <span className="text-lg leading-none">{icon}</span>
      <span className="text-[10px] font-semibold tracking-wide">{label}</span>
    </Link>
  );
}
