/**
 * VikiMedic v2 - Permission Guard UI Enforcer Component
 * Clean Architecture Layer: Presentation
 */

import React from 'react';
import { usePermission } from '../../../application/PermissionContext';
import {
  PermissionModule,
  PermissionAction,
  FieldPermissionKey,
  SpecialPermissionKey,
} from '../../../domain/types';

interface PermissionGuardProps {
  module?: PermissionModule;
  action?: PermissionAction;
  fieldKey?: FieldPermissionKey;
  specialKey?: SpecialPermissionKey;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  module,
  action = 'VIEW',
  fieldKey,
  specialKey,
  fallback = null,
  children,
}) => {
  const { canAccess, canEditField, hasSpecial } = usePermission();

  let isAllowed = true;

  if (module) {
    isAllowed = isAllowed && canAccess(module, action);
  }

  if (fieldKey) {
    isAllowed = isAllowed && canEditField(fieldKey);
  }

  if (specialKey) {
    isAllowed = isAllowed && hasSpecial(specialKey);
  }

  if (!isAllowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
