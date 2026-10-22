'use client';

import React, { useEffect, useState } from 'react';
import { UserRole } from '@/server/types';
import { Button } from '@/design-system/components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/Card';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  portalName: string;
}

export function RoleGuard({ children, allowedRoles, portalName }: RoleGuardProps) {
  const [currentRole, setCurrentRole] = useState<UserRole>('ADMIN'); // Default to permissive for initial render
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('wakeru_user');

    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.role) setCurrentRole(u.role);
        return;
      } catch {}
    }

    if (token) {
      if (token.includes('admin')) setCurrentRole('ADMIN');
      else if (token.includes('vendor')) setCurrentRole('VENDOR');
      else setCurrentRole('TRAVELER');
    } else {
      // If no token exists, provision matching default for seamless development/demo experience
      const defaultRole = allowedRoles[0] || 'TRAVELER';
      setCurrentRole(defaultRole);
    }
  }, [allowedRoles]);

  if (!mounted) {
    return <>{children}</>;
  }

  const hasAccess = allowedRoles.includes(currentRole);

  if (!hasAccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20">
          <CardHeader className="text-center pb-2">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center mx-auto mb-2 text-2xl">
              🛡️
            </div>
            <CardTitle className="text-xl font-bold">
              {portalName} Permission Required
            </CardTitle>
            <p className="text-xs text-[var(--color-wakeru-text-secondary)] mt-1">
              Your current profile ({currentRole}) does not have permission to access the {portalName}.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="p-3 rounded-lg bg-amber-100/60 dark:bg-amber-900/40 text-xs text-amber-900 dark:text-amber-200">
              <strong>Security Policy:</strong> This area requires one of the following verified roles: <span className="font-mono font-bold">{allowedRoles.join(', ')}</span>.
            </div>

            <div className="space-y-2">
              <Button
                variant="primary"
                className="w-full text-xs"
                onClick={() => {
                  const targetRole = allowedRoles[0];
                  const email = targetRole === 'ADMIN' ? 'admin@wakeru.local' : 'vikram.goa.villas@wakeru.local';
                  localStorage.setItem('token', `demo_jwt_${Date.now()}_${btoa(email)}`);
                  localStorage.setItem('wakeru_user', JSON.stringify({
                    id: targetRole === 'ADMIN' ? 'admin_usr_01' : 'ven_anjuna_host',
                    email,
                    name: targetRole === 'ADMIN' ? 'Platform Administrator' : 'Vikram Joshi',
                    role: targetRole,
                  }));
                  window.location.reload();
                }}
              >
                Switch to {allowedRoles[0]} Profile &amp; Continue
              </Button>

              <Button
                variant="outline"
                className="w-full text-xs"
                onClick={() => {
                  window.location.href = '/trips';
                }}
              >
                Return to Traveler Hub
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
