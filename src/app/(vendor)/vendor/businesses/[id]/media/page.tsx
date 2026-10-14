"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { vendorApi } from '@/api/vendor';
import { BusinessMedia } from '@/types/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/design-system/components/Card';
import { Button } from '@/design-system/components/Button';
import { Badge } from '@/design-system/components/Badge';
import { Input } from '@/design-system/components/Input';
import { BusinessNavTabs } from '@/features/vendor/BusinessNavTabs';

export default function BusinessMediaPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [media, setMedia] = useState<BusinessMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Upload form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'cover' | 'logo' | 'video'>('image');
  const [altText, setAltText] = useState('');
  const [isCover, setIsCover] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadMedia = () => {
    setLoading(true);
    vendorApi
      .getMedia(id)
      .then((res) => {
        const items = res?.data || (Array.isArray(res) ? res : []);
        setMedia(items);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load media.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (id) {
      loadMedia();
    }
  }, [id]);

  const handleUploadMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaUrl.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await vendorApi.uploadMedia(id, {
        url: mediaUrl.trim(),
        mediaType: isCover ? 'cover' : mediaType,
        type: isCover ? 'cover' : mediaType,
        altText: altText.trim() || undefined,
        isCover,
      });
      setMediaUrl('');
      setAltText('');
      setIsCover(false);
      setMediaType('image');
      setShowAddForm(false);
      loadMedia();
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || err?.message || 'Failed to upload media.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!confirm('Are you sure you want to delete this media item?')) return;
    try {
      await vendorApi.deleteMedia(mediaId);
      loadMedia();
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to delete media item.');
    }
  };

  const handleSetCover = async (mediaId: string) => {
    try {
      await vendorApi.setCoverMedia(id, mediaId);
      loadMedia();
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to set cover photo.');
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/vendor')}>
            &larr; Businesses
          </Button>
          <h1 className="text-3xl font-bold text-[var(--color-wakeru-text-primary)]">Media Management</h1>
        </div>
        <Button variant="primary" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Close Form' : '+ Add Photo / Media'}
        </Button>
      </div>

      <BusinessNavTabs businessId={id} activeTab="media" />

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {/* Upload Media Card */}
      {showAddForm && (
        <Card className="border-[var(--color-wakeru-primary)] border-2">
          <CardHeader>
            <CardTitle>Add New Photo or Video</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUploadMedia} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Media URL *"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  required
                />
                <div>
                  <label className="block text-sm font-medium mb-1">Media Type</label>
                  <select
                    value={mediaType}
                    onChange={(e) => setMediaType(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-md bg-transparent"
                  >
                    <option value="image">Standard Photo</option>
                    <option value="cover">Hero Cover Photo</option>
                    <option value="logo">Brand Logo</option>
                    <option value="video">Video</option>
                  </select>
                </div>
                <Input
                  label="Caption / Alt Text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="e.g. Luxury Suite with Balcony"
                />
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isCover"
                    checked={isCover}
                    onChange={(e) => setIsCover(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="isCover" className="text-sm font-medium">
                    Set as Primary Cover Photo
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Uploading...' : 'Upload & Submit for Review'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Media Grid */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Photos & Videos ({media.length})</CardTitle>
          <p className="text-xs text-[var(--color-wakeru-text-secondary)]">
            New photos are submitted for moderation and approved within minutes.
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-[var(--color-wakeru-text-secondary)]">Loading media gallery...</p>
          ) : media.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <span className="text-4xl block mb-2">📸</span>
              <p className="font-medium text-[var(--color-wakeru-text-primary)]">No photos uploaded yet</p>
              <p className="text-sm text-[var(--color-wakeru-text-secondary)] mb-4">
                Businesses with high-quality photos receive 3x more bookings from travelers.
              </p>
              <Button variant="primary" onClick={() => setShowAddForm(true)}>
                Add Your First Photo
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {media.map((item) => {
                const isItemCover = item.mediaType === 'cover' || item.isCover;
                return (
                  <div
                    key={item.id}
                    className="relative group rounded-xl overflow-hidden border border-[var(--color-wakeru-border)] bg-[var(--color-wakeru-surface-muted)] flex flex-col"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                      <img
                        src={item.url}
                        alt={item.altText || 'Business photo'}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
                      />

                      {/* Top Badges */}
                      <div className="absolute top-2 left-2 flex gap-1">
                        <Badge
                          variant={
                            item.moderationStatus === 'APPROVED'
                              ? 'default'
                              : item.moderationStatus === 'REJECTED'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {item.moderationStatus}
                        </Badge>
                        {isItemCover && (
                          <Badge variant="default" className="bg-amber-600 text-white">
                            ⭐ Cover
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="p-3 flex items-center justify-between bg-white dark:bg-[var(--color-wakeru-surface)]">
                      <div className="truncate pr-2">
                        <p className="text-xs font-medium truncate text-[var(--color-wakeru-text-primary)]">
                          {item.altText || item.mediaType}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        {!isItemCover && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleSetCover(item.id)}
                            className="text-xs px-2 py-1"
                          >
                            Set Cover
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteMedia(item.id)}
                          className="text-xs px-2 py-1"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
