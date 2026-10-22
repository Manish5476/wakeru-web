'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { notificationsApi, NotificationItem } from '@/api/notifications';
import { AppIcon } from '@/design-system/components/AppIcon';
import { Button } from '@/design-system/components/Button';
import { Card, CardContent } from '@/design-system/components/Card';
import { Badge } from '@/design-system/components/Badge';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<string>('all');

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await notificationsApi.getNotifications({ limit: 50 });
      const data = (res as any)?.data || res;
      setNotifications(data?.notifications || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => ((n._id || (n as any).id) === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await notificationsApi.deleteNotification(id);
      setNotifications(prev => prev.filter(n => (n._id || (n as any).id) !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filterType === 'all') return true;
    return n.type === filterType;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-wakeru-primary)] mb-1">
            <span>🔔 Activity &amp; Alerts</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--color-wakeru-text-primary)] tracking-tight">
            Notifications Center
          </h1>
          <p className="text-sm text-[var(--color-wakeru-text-secondary)] mt-1">
            Updates on shared expenses, settlement requests, trip invites, and milestones.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="self-start sm:self-auto text-xs">
            Mark all read ({unreadCount})
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-[var(--color-wakeru-border)] gap-2 overflow-x-auto pb-px">
        {['all', 'trip', 'expense', 'settlement', 'reminder'].map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilterType(tab)}
            className={`px-3 py-1.5 text-xs font-bold capitalize transition-colors border-b-2 whitespace-nowrap ${
              filterType === tab
                ? 'border-[var(--color-wakeru-primary)] text-[var(--color-wakeru-primary)]'
                : 'border-transparent text-[var(--color-wakeru-text-secondary)]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-[var(--color-wakeru-surface-muted)] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <Card className="p-12 text-center text-xs text-[var(--color-wakeru-text-secondary)] border-dashed border-[var(--color-wakeru-border-strong)]">
          <div className="text-3xl mb-2">✨</div>
          <p className="font-bold text-sm text-[var(--color-wakeru-text-primary)]">You are all caught up</p>
          <p className="mt-1">No pending notifications in this category.</p>
        </Card>
      ) : (
        <div className="divide-y divide-[var(--color-wakeru-border)] rounded-[var(--radius-card)] bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border)] overflow-hidden shadow-xs">
          {filteredNotifications.map(notification => {
            const notifId = notification._id || (notification as any).id;
            return (
              <div
                key={notifId}
                className={`p-4 flex items-start justify-between gap-3 transition-colors ${
                  !notification.isRead
                    ? 'bg-blue-50/40 dark:bg-blue-950/20'
                    : 'hover:bg-[var(--color-wakeru-surface-muted)]/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs ${
                      !notification.isRead
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {!notification.isRead ? '•' : '✓'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-[var(--color-wakeru-text-primary)]">
                        {notification.title}
                      </p>
                      <Badge variant="neutral" size="sm" className="capitalize text-[9px]">
                        {notification.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-[var(--color-wakeru-text-secondary)] mt-0.5">
                      {notification.message}
                    </p>
                    <span className="text-[10px] text-[var(--color-wakeru-text-tertiary)] block mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {!notification.isRead && (
                    <button
                      type="button"
                      onClick={() => handleMarkAsRead(notifId)}
                      className="text-[11px] font-semibold text-blue-600 hover:underline px-2 py-1"
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteNotification(notifId)}
                    className="p-1 rounded text-slate-400 hover:text-rose-500"
                    title="Delete"
                  >
                    <AppIcon name="trash" size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
