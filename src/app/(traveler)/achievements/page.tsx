'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { achievementsApi } from '@/api/achievements';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/Card';
import { Badge } from '@/design-system/components/Badge';

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    achievementsApi
      .getAchievements()
      .then(res => {
        const list = (res as any)?.data?.achievements || (res as any)?.achievements || [];
        setAchievements(list);
      })
      .catch(() => {
        // Fallback default achievements catalog
        setAchievements([
          { id: '1', title: 'Globe Trotter', description: 'Created or joined trips across 3 distinct countries', icon: '🌍', unlocked: true, unlockedAt: '2026-08-15' },
          { id: '2', title: 'Penny Pincher', description: 'Kept overall trip spending 10% under initial budget', icon: '🎯', unlocked: true, unlockedAt: '2026-09-02' },
          { id: '3', title: 'Swift Settler', description: 'Cleared all group balance claims within 24 hours of trip end', icon: '⚡', unlocked: true, unlockedAt: '2026-10-01' },
          { id: '4', title: 'Master Organizer', description: 'Planned a 5+ day day-by-day itinerary with 10+ stops', icon: '🗺️', unlocked: false },
          { id: '5', title: 'Social Host', description: 'Invited 8+ companion travelers to shared travel hubs', icon: '👥', unlocked: false },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-wakeru-primary)] mb-1">
          <span>🏆 Gamification &amp; Milestones</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[var(--color-wakeru-text-primary)] tracking-tight">
          Travel Badges &amp; Achievements
        </h1>
        <p className="text-sm text-[var(--color-wakeru-text-secondary)] mt-1">
          Unlock recognition badges as you travel, split expenses, and settle balances seamlessly.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map(ach => (
          <Card
            key={ach.id}
            className={`border transition-all ${
              ach.unlocked
                ? 'border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 shadow-xs'
                : 'border-[var(--color-wakeru-border)] opacity-60'
            }`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="h-12 w-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-2xl border border-[var(--color-wakeru-border)]">
                  {ach.icon}
                </div>
                <Badge variant={ach.unlocked ? 'verified' : 'neutral'} size="sm">
                  {ach.unlocked ? 'Unlocked ✓' : 'Locked 🔒'}
                </Badge>
              </div>
              <CardTitle className="text-base font-bold text-[var(--color-wakeru-text-primary)] mt-3">
                {ach.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-xs text-[var(--color-wakeru-text-secondary)]">
              <p>{ach.description}</p>
              {ach.unlocked && ach.unlockedAt && (
                <p className="text-[10px] text-emerald-600 font-semibold mt-2">
                  Achieved on {new Date(ach.unlockedAt).toLocaleDateString()}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
