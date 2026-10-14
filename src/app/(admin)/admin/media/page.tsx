"use client";

import React, { useEffect, useState } from "react";
import { adminApi } from "@/api/admin";
import { BusinessMedia } from "@/types/api";
import { Table, TableHeader, TableRow, TableHead, TableCell } from "@/design-system/components/Table";
import { Badge } from "@/design-system/components/Badge";
import { Button } from "@/design-system/components/Button";

export default function MediaModerationPage() {
  const [mediaItems, setMediaItems] = useState<BusinessMedia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMedia() {
      try {
        const res = await adminApi.getMediaQueue();
        const items = (res as any)?.data || (Array.isArray(res) ? res : []);
        setMediaItems(items);
      } catch (err) {
        console.error("Failed to load media queue", err);
      } finally {
        setLoading(false);
      }
    }
    loadMedia();
  }, []);

  const handleReview = async (id: string, status: string) => {
    try {
      await adminApi.reviewMedia(id, status);
      setMediaItems(mediaItems.map(m => 
        m.id === id ? { ...m, moderationStatus: status as any } : m
      ));
    } catch (err) {
      console.error("Failed to review media", err);
    }
  };

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[var(--color-wakeru-text-primary)]">Media Moderation</h1>
      </div>

      {loading ? (
        <div>Loading media...</div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Business ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <tbody>
              {mediaItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No media items pending moderation.
                  </TableCell>
                </TableRow>
              ) : (
                mediaItems.map((media) => (
                  <TableRow key={media.id}>
                    <TableCell>
                      {media.mediaType === 'image' || media.mediaType === 'logo' || media.mediaType === 'cover' ? (
                        <img src={media.url} alt={media.altText || 'Media'} className="h-16 w-16 object-cover rounded" />
                      ) : (
                        <div className="h-16 w-16 bg-gray-200 flex items-center justify-center rounded text-xs text-gray-500">Video</div>
                      )}
                    </TableCell>
                    <TableCell className="capitalize">{media.mediaType}</TableCell>
                    <TableCell className="font-mono text-xs">{media.businessId}</TableCell>
                    <TableCell>
                      <Badge variant={media.moderationStatus === 'APPROVED' ? 'default' : media.moderationStatus === 'REJECTED' ? 'destructive' : 'secondary'}>
                        {media.moderationStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {media.moderationStatus === 'PENDING' && (
                        <>
                          <Button size="sm" onClick={() => handleReview(media.id, 'APPROVED')}>Approve</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleReview(media.id, 'REJECTED')}>Reject</Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
}
