'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthContext';
import { notificationsApi } from '@/api/notifications';
import { GlobalBackground } from '@/design-system/components/GlobalBackground';
import { AppSidebar } from '@/design-system/components/AppSidebar';
import { GlobalHeader } from '@/design-system/components/GlobalHeader';
import { CustomBottomTabBar } from '@/design-system/components/CustomBottomTabBar';

export default function TravelerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isAuthenticated) {
      notificationsApi
        .getUnreadCount()
        .then(res => {
          if (res && res.data && typeof res.data.unreadCount === 'number') {
            setUnreadCount(res.data.unreadCount);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  // Bypass application shell for the official root landing page
  if (pathname === '/') {
    return <>{children}</>;
  }

  return (
    <GlobalBackground>
      {/* ── Left Floating/Docked AppSidebar (Exact Expo Spec) ── */}
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileDrawerOpen}
        onMobileClose={() => setMobileDrawerOpen(false)}
      />

      {/* ── Main Content Area with Responsive Sidebar Margins ── */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'md:ml-[88px]' : 'md:ml-[286px]'
        }`}
      >
        {/* ── Top GlobalHeader with Route Breadcrumb & Sync Status ── */}
        <GlobalHeader
          onMenuPress={() => setMobileDrawerOpen(true)}
          sidebarCollapsed={sidebarCollapsed}
        />

        {/* ── Page Canvas ── */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
          {children}
        </main>
      </div>

      {/* ── Luxury Floating Glass Bottom Nav for Mobile ── */}
      <CustomBottomTabBar
        unreadCount={unreadCount}
        onMenuPress={() => setMobileDrawerOpen(true)}
      />
    </GlobalBackground>
  );
}
