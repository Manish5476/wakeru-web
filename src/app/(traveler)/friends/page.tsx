'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { friendsApi } from '@/api/friends';
import { getInitials } from '@/lib/formatters';
import { AppIcon } from '@/design-system/components/AppIcon';
import { Button } from '@/design-system/components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/Card';
import { Badge } from '@/design-system/components/Badge';

export default function FriendsPage() {
  const [friends, setFriends] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [requestSentIds, setRequestSentIds] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [frRes, reqRes] = await Promise.allSettled([
        friendsApi.getFriends(),
        friendsApi.getPendingRequests(),
      ]);

      if (frRes.status === 'fulfilled') {
        const data = (frRes.value as any)?.data || frRes.value;
        setFriends(data?.friends || []);
      }
      if (reqRes.status === 'fulfilled') {
        const data = (reqRes.value as any)?.data || reqRes.value;
        setPendingRequests(data?.requests || []);
      }
    } catch (err) {
      console.error('Failed to load friends:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      setSearching(true);
      const res = await friendsApi.searchUsers(searchQuery.trim());
      const data = (res as any)?.data || res;
      setSearchResults(data?.users || []);
    } catch (err) {
      console.error('Search users error:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (userId: string) => {
    try {
      await friendsApi.sendRequest(userId);
      setRequestSentIds(prev => new Set([...prev, userId]));
    } catch (err: any) {
      alert(err.message || 'Failed to send friend request.');
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await friendsApi.acceptRequest(requestId);
      setPendingRequests(prev => prev.filter(r => (r._id || r.id) !== requestId));
      loadData();
    } catch (err: any) {
      alert('Failed to accept request.');
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await friendsApi.declineRequest(requestId);
      setPendingRequests(prev => prev.filter(r => (r._id || r.id) !== requestId));
    } catch (err: any) {
      alert('Failed to decline request.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-wakeru-primary)] mb-1">
          <span>👥 Travel Companions &amp; Network</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[var(--color-wakeru-text-primary)] tracking-tight">
          Friends &amp; Buddies
        </h1>
        <p className="text-sm text-[var(--color-wakeru-text-secondary)] mt-1">
          Connect with frequent travelers for faster 1-click expense splitting and trip invitations.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--color-wakeru-border)] gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('friends')}
          className={`px-4 py-2 text-xs font-bold transition-colors border-b-2 ${
            activeTab === 'friends'
              ? 'border-[var(--color-wakeru-primary)] text-[var(--color-wakeru-primary)]'
              : 'border-transparent text-[var(--color-wakeru-text-secondary)]'
          }`}
        >
          My Friends ({friends.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'requests'
              ? 'border-[var(--color-wakeru-primary)] text-[var(--color-wakeru-primary)]'
              : 'border-transparent text-[var(--color-wakeru-text-secondary)]'
          }`}
        >
          <span>Pending Requests</span>
          {pendingRequests.length > 0 && (
            <span className="bg-rose-500 text-white rounded-full h-4 w-4 text-[10px] flex items-center justify-center font-bold">
              {pendingRequests.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('search')}
          className={`px-4 py-2 text-xs font-bold transition-colors border-b-2 ${
            activeTab === 'search'
              ? 'border-[var(--color-wakeru-primary)] text-[var(--color-wakeru-primary)]'
              : 'border-transparent text-[var(--color-wakeru-text-secondary)]'
          }`}
        >
          Find New Friends 🔍
        </button>
      </div>

      {/* TAB: Friends List */}
      {activeTab === 'friends' && (
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-[var(--color-wakeru-surface-muted)] rounded-lg animate-pulse" />
              ))}
            </div>
          ) : friends.length === 0 ? (
            <Card className="p-8 text-center text-xs text-[var(--color-wakeru-text-secondary)] border-dashed border-[var(--color-wakeru-border-strong)]">
              <div className="text-3xl mb-2">🤝</div>
              <p className="font-bold text-sm text-[var(--color-wakeru-text-primary)]">No friends added yet</p>
              <p className="mt-1">Search for friends or invite companions to your trips to add them.</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setActiveTab('search')}>
                Find Friends
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {friends.map(friend => (
                <Card key={friend._id || friend.id} className="border-[var(--color-wakeru-border)]">
                  <CardContent className="p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center uppercase">
                        {getInitials(friend.displayName || friend.name || 'Friend')}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[var(--color-wakeru-text-primary)]">
                          {friend.displayName || friend.name}
                        </p>
                        <p className="text-[11px] text-[var(--color-wakeru-text-tertiary)]">{friend.email}</p>
                      </div>
                    </div>
                    <Badge variant="verified" size="sm">
                      Friend
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: Pending Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <Card className="p-8 text-center text-xs text-[var(--color-wakeru-text-secondary)] border-dashed border-[var(--color-wakeru-border-strong)]">
              No pending friend requests.
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map(req => {
                const reqId = req._id || req.id;
                const sender = req.sender || req.fromUser || {};
                return (
                  <Card key={reqId} className="border-[var(--color-wakeru-border)]">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center uppercase">
                          {getInitials(sender.displayName || sender.name || 'User')}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[var(--color-wakeru-text-primary)]">
                            {sender.displayName || sender.name || 'Travel Companion'}
                          </p>
                          <p className="text-[10px] text-[var(--color-wakeru-text-tertiary)]">
                            {sender.email || 'Sent you a friend request'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleAcceptRequest(reqId)}
                          className="text-xs"
                        >
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeclineRequest(reqId)}
                          className="text-xs"
                        >
                          Decline
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: Search */}
      {activeTab === 'search' && (
        <div className="space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Search by name or email address..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-[var(--radius-control)] border border-[var(--color-wakeru-border-strong)] bg-[var(--color-wakeru-surface-elevated)] focus:outline-none focus:ring-1 focus:ring-[var(--color-wakeru-primary)]"
            />
            <Button variant="primary" size="sm" type="submit" isLoading={searching}>
              Search
            </Button>
          </form>

          {searchResults.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-wakeru-text-secondary)]">
                Search Results ({searchResults.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {searchResults.map(u => {
                  const uid = u._id || u.id;
                  const isSent = requestSentIds.has(uid);
                  return (
                    <Card key={uid} className="border-[var(--color-wakeru-border)]">
                      <CardContent className="p-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center uppercase">
                            {getInitials(u.displayName || u.name || 'User')}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[var(--color-wakeru-text-primary)]">
                              {u.displayName || u.name}
                            </p>
                            <p className="text-[10px] text-[var(--color-wakeru-text-tertiary)]">{u.email}</p>
                          </div>
                        </div>
                        <Button
                          variant={isSent ? 'outline' : 'primary'}
                          size="sm"
                          disabled={isSent}
                          onClick={() => handleSendRequest(uid)}
                          className="text-xs"
                        >
                          {isSent ? 'Sent ✓' : '+ Add'}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
