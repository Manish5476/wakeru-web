'use client';

import React, { useEffect, useState } from 'react';
import { adminApi } from '@/api/admin';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/design-system/components/Table';
import { Button } from '@/design-system/components/Button';
import { Badge } from '@/design-system/components/Badge';
import { Card } from '@/design-system/components/Card';
import { BusinessReview } from '@/types/api';

interface ReviewReport {
  id: string;
  reviewId: string;
  reason: string;
  status: string;
  createdAt: string;
  reportedBy?: string;
  review?: BusinessReview;
}

export default function ReviewReportsPage() {
  const [reports, setReports] = useState<ReviewReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getReviewReports();
      const data = (response as any).data ? (response as any).data : response;
      setReports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load review reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async (reportId: string) => {
    try {
      await adminApi.dismissReviewReport(reportId);
      setReports(prev => prev.filter(r => r.id !== reportId));
    } catch (error) {
      console.error('Failed to dismiss report:', error);
    }
  };

  const handleDelete = async (reviewId: string, reportId: string) => {
    if (!confirm('Are you sure you want to delete this reported review from public view?')) return;
    try {
      await adminApi.deleteReview(reviewId);
      setReports(prev => prev.filter(r => r.id !== reportId));
    } catch (error) {
      console.error('Failed to delete review:', error);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
          ⭐ Community Trust &amp; Moderation
        </div>
        <h1 className="text-3xl font-extrabold text-[var(--color-wakeru-text-primary)]">
          Reported Reviews &amp; Disputes
        </h1>
        <p className="text-sm text-[var(--color-wakeru-text-secondary)] mt-1">
          Review community flags, competitor disputes, and inappropriate traveler feedback.
        </p>
      </div>

      {loading ? (
        <Card className="animate-pulse h-64 bg-[var(--color-wakeru-surface-muted)]" />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report Date</TableHead>
                <TableHead>Dispute Reason</TableHead>
                <TableHead>Review Reference</TableHead>
                <TableHead>Reported By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map(report => (
                <TableRow key={report.id}>
                  <TableCell className="text-xs text-[var(--color-wakeru-text-secondary)] whitespace-nowrap">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </TableCell>

                  <TableCell className="max-w-xs">
                    <p className="text-xs font-medium text-[var(--color-wakeru-text-primary)]">
                      {report.reason}
                    </p>
                  </TableCell>

                  <TableCell className="font-mono text-xs font-bold text-[var(--color-wakeru-text-primary)]">
                    {report.reviewId}
                  </TableCell>

                  <TableCell className="text-xs text-[var(--color-wakeru-text-secondary)]">
                    {report.reportedBy || 'Host Partner'}
                  </TableCell>

                  <TableCell>
                    <Badge variant="warning" className="text-[10px]">
                      {report.status || 'PENDING'}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDismiss(report.id)}
                      className="text-xs"
                    >
                      Dismiss Flag
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(report.reviewId, report.id)}
                      className="text-xs"
                    >
                      Remove Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {reports.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-xs text-[var(--color-wakeru-text-secondary)]">
                    No pending review dispute reports in queue.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
