import React from 'react';

import { useAuth } from '../../hooks/useAuth';

interface RequirePermissionProps {
  permission: string | string[];
  mode?: 'all' | 'any';
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const RequirePermission: React.FC<RequirePermissionProps> = ({
  permission,
  mode = 'all',
  fallback = null,
  children,
}) => {
  const { hasPermission } = useAuth();

  if (!hasPermission(permission, mode)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
