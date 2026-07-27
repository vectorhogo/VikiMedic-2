/**
 * VikiMedic v2 - Permission Context & RBAC Engine
 * Clean Architecture Layer: Application
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Role,
  RoleAuditLog,
  PermissionModule,
  PermissionAction,
  FieldPermissionKey,
  SpecialPermissionKey,
  RoleAuditAction,
} from '../domain/types';
import { DEFAULT_SYSTEM_ROLES } from '../domain/permissions';
import { LocalStorageManager } from '../infrastructure/storage';
import { useClinic } from './ClinicContext';

interface PermissionContextType {
  roles: Role[];
  roleLogs: RoleAuditLog[];
  
  // Validation Methods
  canAccess: (module: PermissionModule, action?: PermissionAction) => boolean;
  canEditField: (fieldKey: FieldPermissionKey) => boolean;
  hasSpecial: (specialKey: SpecialPermissionKey) => boolean;
  isModuleVisible: (module: PermissionModule) => boolean;
  
  // Role Operations
  createRole: (roleData: Omit<Role, 'id' | 'isSystemDefault' | 'createdAt' | 'updatedAt'>) => Role;
  updateRole: (roleId: string, updates: Partial<Role>) => void;
  toggleRoleStatus: (roleId: string) => void;
  duplicateRole: (sourceRoleId: string, newCode: string, newNameFa: string, descriptionFa?: string) => Role;
  deleteCustomRole: (roleId: string) => void;
  assignUserRole: (userId: string, newRoleCode: string) => boolean;
  
  // Refresher
  refreshPermissions: () => void;
}

const PermissionContext = createContext<PermissionContextType | null>(null);

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeUser, staffList, addNotification, activeClinic } = useClinic();
  
  const [roles, setRoles] = useState<Role[]>(() => LocalStorageManager.getRoles());
  const [roleLogs, setRoleLogs] = useState<RoleAuditLog[]>(() => LocalStorageManager.getRoleAuditLogs());

  const refreshPermissions = () => {
    const currentRoles = LocalStorageManager.getRoles();
    setRoles(currentRoles);
    const logs = LocalStorageManager.getRoleAuditLogs();
    setRoleLogs(logs);
  };

  useEffect(() => {
    refreshPermissions();
  }, [activeClinic.id]);

  // Current active role entity
  const currentRoleEntity: Role | undefined = roles.find(
    (r) => r.code.toUpperCase() === (activeUser.role || '').toUpperCase()
  ) || DEFAULT_SYSTEM_ROLES.find((r) => r.code === 'ADMIN');

  // Permission Validation Helpers
  const canAccess = (module: PermissionModule, action: PermissionAction = 'VIEW'): boolean => {
    // Administrator ALWAYS has full access (System Protection)
    if (activeUser.role === 'ADMIN' || currentRoleEntity?.code === 'ADMIN') {
      return true;
    }

    if (!currentRoleEntity || currentRoleEntity.isDisabled) {
      return false;
    }

    // Temporary/time-based permission expiry check
    if (currentRoleEntity.temporaryAccessUntil) {
      const now = new Date();
      const expiry = new Date(currentRoleEntity.temporaryAccessUntil);
      if (now > expiry) {
        return false;
      }
    }

    const actions = currentRoleEntity.modulePermissions[module] || [];
    return actions.includes(action);
  };

  const canEditField = (fieldKey: FieldPermissionKey): boolean => {
    if (activeUser.role === 'ADMIN' || currentRoleEntity?.code === 'ADMIN') {
      return true;
    }
    if (!currentRoleEntity || currentRoleEntity.isDisabled) {
      return false;
    }
    return currentRoleEntity.fieldPermissions[fieldKey] ?? false;
  };

  const hasSpecial = (specialKey: SpecialPermissionKey): boolean => {
    if (activeUser.role === 'ADMIN' || currentRoleEntity?.code === 'ADMIN') {
      return true;
    }
    if (!currentRoleEntity || currentRoleEntity.isDisabled) {
      return false;
    }
    return currentRoleEntity.specialPermissions[specialKey] ?? false;
  };

  const isModuleVisible = (module: PermissionModule): boolean => {
    return canAccess(module, 'VIEW');
  };

  // Log Role Change Event
  const logRoleAction = (
    targetRoleCode: string,
    targetRoleName: string,
    action: RoleAuditAction,
    details: string
  ) => {
    const nowFa =
      new Date().toLocaleDateString('fa-IR') +
      ' - ' +
      new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

    const newLog = LocalStorageManager.addRoleAuditLog({
      timestamp: nowFa,
      operatorUserId: activeUser.id,
      operatorName: activeUser.fullName,
      operatorRole: activeUser.role,
      targetRoleCode,
      targetRoleName,
      action,
      details,
      clinicId: activeClinic.id,
    });

    setRoleLogs((prev) => [newLog, ...prev]);
  };

  // Role Operations
  const createRole = (
    roleData: Omit<Role, 'id' | 'isSystemDefault' | 'createdAt' | 'updatedAt'>
  ): Role => {
    const existing = roles.find((r) => r.code.toUpperCase() === roleData.code.toUpperCase());
    if (existing) {
      addNotification(`کد نقش "${roleData.code}" قبلاً ثبت شده است.`, 'danger');
      throw new Error(`Role code ${roleData.code} already exists.`);
    }

    const nowFa = new Date().toLocaleDateString('fa-IR');
    const newRole: Role = {
      ...roleData,
      id: 'role-custom-' + Date.now(),
      code: roleData.code.toUpperCase(),
      isSystemDefault: false,
      isDisabled: false,
      createdAt: nowFa,
      updatedAt: nowFa,
    };

    const updatedRoles = [...roles, newRole];
    setRoles(updatedRoles);
    LocalStorageManager.saveRole(newRole);

    logRoleAction(newRole.code, newRole.nameFa, 'ROLE_CREATED', `ایجاد نقش سفارشی جدید: ${newRole.nameFa}`);
    addNotification(`نقش جدید "${newRole.nameFa}" با موفقیت تعریف شد.`, 'success');
    return newRole;
  };

  const updateRole = (roleId: string, updates: Partial<Role>) => {
    const target = roles.find((r) => r.id === roleId);
    if (!target) return;

    // Safeguard: Do not allow renaming or disabling ADMIN role code
    if (target.code === 'ADMIN') {
      delete updates.code;
      delete updates.isDisabled;
    }

    const nowFa = new Date().toLocaleDateString('fa-IR');
    const updatedRole: Role = {
      ...target,
      ...updates,
      updatedAt: nowFa,
    };

    const updatedRoles = roles.map((r) => (r.id === roleId ? updatedRole : r));
    setRoles(updatedRoles);
    LocalStorageManager.saveRole(updatedRole);

    logRoleAction(updatedRole.code, updatedRole.nameFa, 'ROLE_UPDATED', `بروزرسانی دسترسی‌های نقش "${updatedRole.nameFa}"`);
    addNotification(`تغییرات نقش "${updatedRole.nameFa}" با موفقیت ذخیره شد.`, 'success');
  };

  const toggleRoleStatus = (roleId: string) => {
    const target = roles.find((r) => r.id === roleId);
    if (!target) return;

    if (target.code === 'ADMIN') {
      addNotification('نقش مدیریت کل سیستم قابل غیرفعال‌سازی نمی‌باشد.', 'danger');
      return;
    }

    const newDisabled = !target.isDisabled;
    updateRole(roleId, { isDisabled: newDisabled });

    logRoleAction(
      target.code,
      target.nameFa,
      newDisabled ? 'ROLE_DISABLED' : 'ROLE_ENABLED',
      `وضعیت نقش به ${newDisabled ? 'غیرفعال' : 'فعال'} تغییر یافت`
    );
  };

  const duplicateRole = (
    sourceRoleId: string,
    newCode: string,
    newNameFa: string,
    descriptionFa?: string
  ): Role => {
    const source = roles.find((r) => r.id === sourceRoleId);
    if (!source) throw new Error('Source role not found');

    const created = createRole({
      code: newCode,
      nameFa: newNameFa,
      descriptionFa: descriptionFa || `رونویسی شده از نقش ${source.nameFa}`,
      isDisabled: false,
      parentRoleId: source.id,
      modulePermissions: JSON.parse(JSON.stringify(source.modulePermissions)),
      fieldPermissions: { ...source.fieldPermissions },
      specialPermissions: { ...source.specialPermissions },
      departmentIds: source.departmentIds ? [...source.departmentIds] : undefined,
      branchIds: source.branchIds ? [...source.branchIds] : undefined,
      clinicIds: source.clinicIds ? [...source.clinicIds] : undefined,
    });

    logRoleAction(created.code, created.nameFa, 'ROLE_DUPLICATED', `ایجاد نقش جدید ارث‌بری شده از ${source.nameFa}`);
    return created;
  };

  const deleteCustomRole = (roleId: string) => {
    const target = roles.find((r) => r.id === roleId);
    if (!target) return;

    if (target.isSystemDefault) {
      addNotification('نقش‌های پیش‌فرض سیستم قابل حذف نمی‌باشند.', 'danger');
      return;
    }

    // Check if users are assigned to this role
    const assignedUsers = staffList.filter((s) => s.role === target.code);
    if (assignedUsers.length > 0) {
      addNotification(`امکان حذف وجود ندارد؛ ${assignedUsers.length} کاربر دارای این نقش هستند.`, 'danger');
      return;
    }

    const deleted = LocalStorageManager.deleteRole(roleId);
    if (deleted) {
      setRoles((prev) => prev.filter((r) => r.id !== roleId));
      logRoleAction(target.code, target.nameFa, 'ROLE_DELETED', `حذف نقش سفارشی "${target.nameFa}"`);
      addNotification(`نقش "${target.nameFa}" حذف گردید.`, 'info');
    }
  };

  const assignUserRole = (userId: string, newRoleCode: string): boolean => {
    const targetUser = staffList.find((s) => s.id === userId);
    if (!targetUser) return false;

    // Protection rule: Prevent locking out all administrators
    if (targetUser.role === 'ADMIN' && newRoleCode !== 'ADMIN') {
      const remainingAdmins = staffList.filter((s) => s.id !== userId && s.role === 'ADMIN');
      if (remainingAdmins.length === 0) {
        addNotification('خطای امنیتی: سیستم باید حداقل یک مدیر کل فعال داشته باشد.', 'danger');
        return false;
      }
    }

    // Update user role in staff list
    const updatedStaff = staffList.map((s) => (s.id === userId ? { ...s, role: newRoleCode } : s));
    LocalStorageManager.saveStaff(updatedStaff);

    const roleObj = roles.find((r) => r.code === newRoleCode);
    logRoleAction(
      newRoleCode,
      roleObj?.nameFa || newRoleCode,
      'ROLE_ASSIGNED',
      `تخصیص نقش ${roleObj?.nameFa || newRoleCode} به کاربر ${targetUser.fullName}`
    );

    addNotification(`نقش کاربر ${targetUser.fullName} به ${roleObj?.nameFa || newRoleCode} تغییر یافت.`, 'success');
    return true;
  };

  return (
    <PermissionContext.Provider
      value={{
        roles,
        roleLogs,
        canAccess,
        canEditField,
        hasSpecial,
        isModuleVisible,
        createRole,
        updateRole,
        toggleRoleStatus,
        duplicateRole,
        deleteCustomRole,
        assignUserRole,
        refreshPermissions,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermission = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermission must be used within a PermissionProvider');
  }
  return context;
};
