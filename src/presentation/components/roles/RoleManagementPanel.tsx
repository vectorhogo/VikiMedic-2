/**
 * VikiMedic v2 - Role & Permission Management Panel (Phase 03 - Part 02)
 * Clean Architecture Layer: Presentation
 */

import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Users,
  Copy,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Lock,
  Eye,
  Settings,
  Search,
  Filter,
  RefreshCw,
  Clock,
  History,
  AlertTriangle,
  FileText,
  Key,
  Layers,
  Building2,
  Calendar,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { usePermission } from '../../../application/PermissionContext';
import { useClinic } from '../../../application/ClinicContext';
import {
  Role,
  PermissionModule,
  PermissionAction,
  FieldPermissionKey,
  SpecialPermissionKey,
} from '../../../domain/types';
import {
  PERMISSION_MODULES_CONFIG,
  PERMISSION_ACTIONS_CONFIG,
  FIELD_PERMISSIONS_CONFIG,
  SPECIAL_PERMISSIONS_CONFIG,
  ALL_ACTIONS,
  READ_ONLY_ACTIONS,
} from '../../../domain/permissions';

export const RoleManagementPanel: React.FC = () => {
  const {
    roles,
    roleLogs,
    createRole,
    updateRole,
    toggleRoleStatus,
    duplicateRole,
    deleteCustomRole,
    assignUserRole,
  } = usePermission();

  const { staffList, activeUser, addNotification } = useClinic();

  // Navigation Sub-Tabs
  const [activeTab, setActiveTab] = useState<'catalog' | 'matrix' | 'logs' | 'assignments'>('catalog');

  // Active Selected Role for Matrix Editing
  const [selectedRoleId, setSelectedRoleId] = useState<string>(() => roles[0]?.id || 'role-admin');
  const activeRole = roles.find((r) => r.id === selectedRoleId) || roles[0];

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'DEFAULT' | 'CUSTOM'>('ALL');

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRoleCode, setNewRoleCode] = useState('');
  const [newRoleNameFa, setNewRoleNameFa] = useState('');
  const [newRoleDescFa, setNewRoleDescFa] = useState('');
  const [baseRoleIdForInheritance, setBaseRoleIdForInheritance] = useState<string>('role-receptionist');

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedUserIdForAssign, setSelectedUserIdForAssign] = useState<string>('');
  const [targetRoleCodeForAssign, setTargetRoleCodeForAssign] = useState<string>('RECEPTIONIST');

  // Matrix Editing Local State Buffers
  const [editedModulePerms, setEditedModulePerms] = useState<Record<PermissionModule, PermissionAction[]>>(() =>
    activeRole ? JSON.parse(JSON.stringify(activeRole.modulePermissions)) : {}
  );

  const [editedFieldPerms, setEditedFieldPerms] = useState<Record<FieldPermissionKey, boolean>>(() =>
    activeRole ? { ...activeRole.fieldPermissions } : ({} as Record<FieldPermissionKey, boolean>)
  );

  const [editedSpecialPerms, setEditedSpecialPerms] = useState<Record<SpecialPermissionKey, boolean>>(() =>
    activeRole ? { ...activeRole.specialPermissions } : ({} as Record<SpecialPermissionKey, boolean>)
  );

  const [temporaryAccessUntil, setTemporaryAccessUntil] = useState<string>(
    activeRole?.temporaryAccessUntil || ''
  );

  // Sync Local Matrix State when switching selected role
  const handleSelectRoleForMatrix = (roleId: string) => {
    setSelectedRoleId(roleId);
    const target = roles.find((r) => r.id === roleId);
    if (target) {
      setEditedModulePerms(JSON.parse(JSON.stringify(target.modulePermissions)));
      setEditedFieldPerms({ ...target.fieldPermissions });
      setEditedSpecialPerms({ ...target.specialPermissions });
      setTemporaryAccessUntil(target.temporaryAccessUntil || '');
    }
  };

  // Toggle Single Action Checkbox
  const handleToggleAction = (module: PermissionModule, action: PermissionAction) => {
    if (activeRole.code === 'ADMIN') {
      addNotification('نقش مدیر کل سیستم همواره دارای تمام دسترسی‌ها می‌باشد.', 'info');
      return;
    }

    setEditedModulePerms((prev) => {
      const currentActions = prev[module] || [];
      const has = currentActions.includes(action);
      const nextActions = has
        ? currentActions.filter((a) => a !== action)
        : [...currentActions, action];

      return {
        ...prev,
        [module]: nextActions,
      };
    });
  };

  // Select / Deselect All for Module
  const handleToggleAllForModule = (module: PermissionModule) => {
    if (activeRole.code === 'ADMIN') return;
    const current = editedModulePerms[module] || [];
    const isFull = current.length === ALL_ACTIONS.length;

    setEditedModulePerms((prev) => ({
      ...prev,
      [module]: isFull ? [] : [...ALL_ACTIONS],
    }));
  };

  // Set Read-Only for Module
  const handleSetReadOnlyForModule = (module: PermissionModule) => {
    if (activeRole.code === 'ADMIN') return;
    setEditedModulePerms((prev) => ({
      ...prev,
      [module]: [...READ_ONLY_ACTIONS],
    }));
  };

  // Global Matrix Actions
  const handleSelectAllGlobal = () => {
    if (activeRole.code === 'ADMIN') return;
    const allMap: any = {};
    PERMISSION_MODULES_CONFIG.forEach((m) => {
      allMap[m.code] = [...ALL_ACTIONS];
    });
    setEditedModulePerms(allMap);
  };

  const handleClearAllGlobal = () => {
    if (activeRole.code === 'ADMIN') return;
    const emptyMap: any = {};
    PERMISSION_MODULES_CONFIG.forEach((m) => {
      emptyMap[m.code] = [];
    });
    setEditedModulePerms(emptyMap);
  };

  // Save Matrix Modifications
  const handleSaveMatrixChanges = () => {
    updateRole(activeRole.id, {
      modulePermissions: editedModulePerms,
      fieldPermissions: editedFieldPerms,
      specialPermissions: editedSpecialPerms,
      temporaryAccessUntil: temporaryAccessUntil || undefined,
    });
  };

  // Handle Create Role Submit
  const handleCreateRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleCode.trim() || !newRoleNameFa.trim()) {
      addNotification('لطفاً کد انگلیسی و عنوان فارسی نقش را وارد نمایید.', 'danger');
      return;
    }

    const baseRole = roles.find((r) => r.id === baseRoleIdForInheritance);

    createRole({
      code: newRoleCode.trim().toUpperCase(),
      nameFa: newRoleNameFa.trim(),
      descriptionFa: newRoleDescFa.trim() || `نقش ایجاد شده بر پایه ${baseRole?.nameFa || 'پیش‌فرض'}`,
      isDisabled: false,
      parentRoleId: baseRole?.id,
      modulePermissions: baseRole ? JSON.parse(JSON.stringify(baseRole.modulePermissions)) : ({} as any),
      fieldPermissions: baseRole ? { ...baseRole.fieldPermissions } : ({} as any),
      specialPermissions: baseRole ? { ...baseRole.specialPermissions } : ({} as any),
    });

    setIsCreateModalOpen(false);
    setNewRoleCode('');
    setNewRoleNameFa('');
    setNewRoleDescFa('');
  };

  // Filtered Roles
  const filteredRoles = roles.filter((role) => {
    const matchesSearch =
      role.nameFa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (role.descriptionFa && role.descriptionFa.toLowerCase().includes(searchQuery.toLowerCase()));

    if (filterType === 'DEFAULT') return matchesSearch && role.isSystemDefault;
    if (filterType === 'CUSTOM') return matchesSearch && !role.isSystemDefault;
    return matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12 font-vazir text-slate-800 dark:text-slate-100">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute left-0 top-0 h-full w-1/3 bg-white/5 blur-2xl transform -skew-x-12" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/30 px-3 py-1 text-xs font-semibold text-blue-200 border border-blue-400/30 backdrop-blur-md mb-3">
              <ShieldCheck className="w-4 h-4 text-blue-300" />
              <span>موتور مدیریت نقش‌ها و دسترسی‌های RBAC</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              سامانه کنترل دسترسی سطوح پیشرفته (Role & Permission Engine)
            </h1>
            <p className="mt-2 text-sm text-blue-100 max-w-2xl leading-relaxed">
              تعریف دقیق دسترسی‌های سازمانی، محدودیت‌های فیلدی، مجوزهای ویژه و ارث‌بری نقش‌ها با قابلیت اجرا کاملاً آفلاین و امنیت پایداری انحصاری.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-blue-900 hover:bg-blue-50 transition shadow-lg active:scale-95"
            >
              <Plus className="w-4 h-4 text-blue-700" />
              <span>ایجاد نقش جدید</span>
            </button>
            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600/60 hover:bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white border border-blue-400/30 transition backdrop-blur-md"
            >
              <Users className="w-4 h-4" />
              <span>تخصیص نقش به پرسنل</span>
            </button>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center sm:text-right">
          <div>
            <span className="block text-xs text-blue-200">کل نقش‌های فعال</span>
            <span className="text-xl font-bold text-white">{roles.length} نقش</span>
          </div>
          <div>
            <span className="block text-xs text-blue-200">نقش‌های پیش‌فرض سیستم</span>
            <span className="text-xl font-bold text-emerald-300">
              {roles.filter((r) => r.isSystemDefault).length} پیش‌فرض
            </span>
          </div>
          <div>
            <span className="block text-xs text-blue-200">نقش‌های سفارشی</span>
            <span className="text-xl font-bold text-amber-300">
              {roles.filter((r) => !r.isSystemDefault).length} سفارشی
            </span>
          </div>
          <div>
            <span className="block text-xs text-blue-200">کاربران دارای حساب</span>
            <span className="text-xl font-bold text-cyan-200">{staffList.length} نفر</span>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation Bar */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-reverse space-x-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`inline-flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'catalog'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>کاتالوگ و لیست نقش‌ها ({roles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`inline-flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'matrix'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>ویرایشگر ماتریس دسترسی‌ها</span>
        </button>

        <button
          onClick={() => setActiveTab('assignments')}
          className={`inline-flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'assignments'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>تخصیص نقش کاربران ({staffList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`inline-flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'logs'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          <History className="w-4 h-4" />
          <span>سجل تغییرات و لاگ امنیت ({roleLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: CATALOG OF ROLES */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          {/* Controls & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="جستجو در عنوان نقش، کد یا توضیحات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterType}
                onChange={(e: any) => setFilterType(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">همه نقش‌ها ({roles.length})</option>
                <option value="DEFAULT">پیش‌فرض سیستم ({roles.filter((r) => r.isSystemDefault).length})</option>
                <option value="CUSTOM">نقش‌های سفارشی ({roles.filter((r) => !r.isSystemDefault).length})</option>
              </select>
            </div>
          </div>

          {/* Role Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoles.map((role) => {
              const assignedUsers = staffList.filter((s) => s.role === role.code);
              const activeModuleCount = Object.values(role.modulePermissions || {}).filter(
                (a: any) => Array.isArray(a) && a.length > 0
              ).length;

              return (
                <div
                  key={role.id}
                  className={`relative flex flex-col justify-between rounded-xl border bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:shadow-md ${
                    role.isDisabled
                      ? 'border-slate-300 dark:border-slate-800 opacity-60 bg-slate-50 dark:bg-slate-950'
                      : role.code === 'ADMIN'
                      ? 'border-emerald-500/40 ring-1 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div>
                    {/* Header Badge */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {role.code}
                      </span>

                      <div className="flex items-center gap-2">
                        {role.isSystemDefault ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            <Shield className="w-3 h-3" />
                            پیش‌فرض
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            <Layers className="w-3 h-3" />
                            سفارشی
                          </span>
                        )}

                        {role.isDisabled && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            غیرفعال
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title & Desc */}
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
                      {role.nameFa}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[32px] leading-relaxed">
                      {role.descriptionFa || 'توضیحات تکمیلی ثبت نشده است.'}
                    </p>

                    {/* Stats Breakdown */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                        <Users className="w-3.5 h-3.5 text-blue-500" />
                        <span>تعداد کاربران:</span>
                        <strong className="text-slate-800 dark:text-slate-200">{assignedUsers.length} نفر</strong>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span>ماژول‌های فعال:</span>
                        <strong className="text-slate-800 dark:text-slate-200">{activeModuleCount} از ۱۶</strong>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        handleSelectRoleForMatrix(role.id);
                        setActiveTab('matrix');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>ویرایش ماتریس</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        title="ارث‌بری و رونویسی از این نقش"
                        onClick={() => {
                          duplicateRole(
                            role.id,
                            `${role.code}_COPY_${Math.floor(Math.random() * 100)}`,
                            `کپی ${role.nameFa}`
                          );
                        }}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      {role.code !== 'ADMIN' && (
                        <button
                          title={role.isDisabled ? 'فعال‌سازی نقش' : 'غیرفعال‌سازی نقش'}
                          onClick={() => toggleRoleStatus(role.id)}
                          className={`p-1.5 rounded-lg transition ${
                            role.isDisabled
                              ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950'
                              : 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950'
                          }`}
                        >
                          <Lock className="w-4 h-4" />
                        </button>
                      )}

                      {!role.isSystemDefault && (
                        <button
                          title="حذف نقش سفارشی"
                          onClick={() => deleteCustomRole(role.id)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: PERMISSION MATRIX EDITOR */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          {/* Active Role Switcher Panel */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                <Key className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">نقش در حال ویرایش:</span>
                <select
                  value={selectedRoleId}
                  onChange={(e) => handleSelectRoleForMatrix(e.target.value)}
                  className="mt-0.5 text-base font-extrabold bg-transparent text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id} className="bg-white dark:bg-slate-900 font-sans">
                      {r.nameFa} ({r.code}) {r.isSystemDefault ? '[پیش‌فرض]' : '[سفارشی]'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Global Matrix Shortcut Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleSelectAllGlobal}
                disabled={activeRole.code === 'ADMIN'}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold transition disabled:opacity-50"
              >
                انتخاب همه دسترسی‌ها
              </button>
              <button
                onClick={handleClearAllGlobal}
                disabled={activeRole.code === 'ADMIN'}
                className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 text-xs font-bold transition disabled:opacity-50"
              >
                پاکسازی دسترسی‌ها
              </button>
              <button
                onClick={handleSaveMatrixChanges}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold transition shadow-md active:scale-95"
              >
                ذخیره تغییرات این نقش
              </button>
            </div>
          </div>

          {/* Matrix Table: 16 Modules x 8 Actions */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>ماتریس ماژول‌های سیستم و عملیات مجاز (۱۶ ماژول × ۸ سطح عملیاتی)</span>
              </h3>
              <span className="text-xs text-slate-500">
                بر اساس آخرین استانداردهای امنیت سازمانی VikiMedic
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <th className="p-3.5 min-w-[200px]">عنوان ماژول</th>
                    {PERMISSION_ACTIONS_CONFIG.map((act) => (
                      <th key={act.code} className="p-3.5 text-center min-w-[80px]">
                        {act.titleFa}
                      </th>
                    ))}
                    <th className="p-3.5 text-center min-w-[120px]">میانبرهای ماژول</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {PERMISSION_MODULES_CONFIG.map((mod) => {
                    const currentActions = editedModulePerms[mod.code] || [];
                    const isAll = currentActions.length === ALL_ACTIONS.length;

                    return (
                      <tr
                        key={mod.code}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                      >
                        <td className="p-3.5">
                          <span className="font-extrabold text-slate-900 dark:text-white block">
                            {mod.titleFa}
                          </span>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {mod.descriptionFa}
                          </span>
                        </td>

                        {PERMISSION_ACTIONS_CONFIG.map((act) => {
                          const checked = currentActions.includes(act.code);
                          return (
                            <td key={act.code} className="p-3.5 text-center">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => handleToggleAction(mod.code, act.code)}
                                disabled={activeRole.code === 'ADMIN'}
                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                              />
                            </td>
                          );
                        })}

                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleToggleAllForModule(mod.code)}
                              disabled={activeRole.code === 'ADMIN'}
                              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 transition"
                            >
                              {isAll ? 'لغو همه' : 'انتخاب همه'}
                            </button>
                            <button
                              onClick={() => handleSetReadOnlyForModule(mod.code)}
                              disabled={activeRole.code === 'ADMIN'}
                              className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 text-[10px] font-bold text-blue-700 dark:text-blue-300 transition"
                            >
                              فقط‌خواندنی
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Field-Level Restrictions & Special Permissions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Field Level Permission Card */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Lock className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  محدودیت‌های دسترسی سطح فیلد (Field Level Permissions)
                </h3>
              </div>

              <div className="space-y-3">
                {FIELD_PERMISSIONS_CONFIG.map((field) => {
                  const isAllowed = editedFieldPerms[field.key] ?? false;
                  return (
                    <label
                      key={field.key}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isAllowed}
                          onChange={(e) => {
                            if (activeRole.code === 'ADMIN') return;
                            setEditedFieldPerms((prev) => ({
                              ...prev,
                              [field.key]: e.target.checked,
                            }));
                          }}
                          disabled={activeRole.code === 'ADMIN'}
                          className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                        />
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {field.titleFa}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {field.key}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Special Permissions Card */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  مجوزهای ویژه عملیاتی (Special Privileges)
                </h3>
              </div>

              <div className="space-y-3">
                {SPECIAL_PERMISSIONS_CONFIG.map((spec) => {
                  const isAllowed = editedSpecialPerms[spec.key] ?? false;
                  return (
                    <label
                      key={spec.key}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isAllowed}
                          onChange={(e) => {
                            if (activeRole.code === 'ADMIN') return;
                            setEditedSpecialPerms((prev) => ({
                              ...prev,
                              [spec.key]: e.target.checked,
                            }));
                          }}
                          disabled={activeRole.code === 'ADMIN'}
                          className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                            {spec.titleFa}
                          </span>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {spec.descriptionFa}
                          </span>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Future Ready Enterprise Scope & Time-Based Permissions */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Building2 className="w-5 h-5 text-purple-600" />
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                پیکربندی قلمرو سازمانی و دسترسی موقت زمان‌دار (Future Ready Scope)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  تاریخ انقضای دسترسی موقت (Time-based Temporary Access):
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
                  <input
                    type="date"
                    value={temporaryAccessUntil}
                    onChange={(e) => setTemporaryAccessUntil(e.target.value)}
                    className="w-full pr-10 pl-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  در صورت تعیین تاریخ، پس از انقضا تمام دسترسی‌های این نقش خودکار مسدود می‌گردد.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  قلمرو شعب و کلینیک‌های مجاز (Multi-Branch Authorization):
                </label>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 inline-block text-emerald-500 ml-1.5" />
                  <span>دسترسی پیش‌فرض به تمام شعب فعال کلینیک تخصصی VikiMedic برقرار است.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: USER ROLE ASSIGNMENT CATALOG */}
      {activeTab === 'assignments' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>جدول تخصیص نقش‌ها به اعضای پرسنل کلینیک</span>
            </h3>

            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
            >
              تغییر نقش کاربر
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                  <th className="p-3.5">نام و نام خانوادگی</th>
                  <th className="p-3.5">عنوان شغلی</th>
                  <th className="p-3.5">کد / ایمیل</th>
                  <th className="p-3.5">نقش فعلی سیستم</th>
                  <th className="p-3.5 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {staffList.map((staff) => {
                  const roleObj = roles.find((r) => r.code === staff.role);

                  return (
                    <tr key={staff.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-extrabold text-slate-900 dark:text-white">
                        {staff.fullName}
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-400">
                        {staff.title}
                      </td>
                      <td className="p-3.5 font-mono text-slate-500">
                        {staff.email}
                      </td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {roleObj?.nameFa || staff.role}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => {
                            setSelectedUserIdForAssign(staff.id);
                            setTargetRoleCodeForAssign(staff.role);
                            setIsAssignModalOpen(true);
                          }}
                          className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold transition"
                        >
                          تغییر نقش
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ROLE AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" />
              <span>سجل وقایع و تاریخچه تغییرات دسترسی‌ها (RBAC Security Audit Log)</span>
            </h3>
          </div>

          {roleLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              هیچ لاگی جهت نمایش ثبت نشده است.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {roleLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition text-xs flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold">
                        {log.action}
                      </span>
                      <strong className="text-slate-900 dark:text-white">
                        نقش هدف: {log.targetRoleName} ({log.targetRoleCode})
                      </strong>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">
                      {log.details}
                    </p>
                    <div className="text-[11px] text-slate-400">
                      اقدام‌کننده: {log.operatorName} ({log.operatorRole})
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">
                    {log.timestamp}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: CREATE NEW ROLE */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <span>تعریف نقش جدید در سیستم</span>
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  کد انگلیسی نقش (Code):
                </label>
                <input
                  type="text"
                  placeholder="مثال: SENIOR_RECEPTIONIST"
                  value={newRoleCode}
                  onChange={(e) => setNewRoleCode(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان فارسی نقش (Display Name):
                </label>
                <input
                  type="text"
                  placeholder="مثال: سرپرست ارشد پذیرش"
                  value={newRoleNameFa}
                  onChange={(e) => setNewRoleNameFa(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الگو / نقش پایه جهت ارث‌بری (Inheritance Base):
                </label>
                <select
                  value={baseRoleIdForInheritance}
                  onChange={(e) => setBaseRoleIdForInheritance(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      کپی از {r.nameFa} ({r.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  توضیحات نقش:
                </label>
                <textarea
                  rows={2}
                  placeholder="شرح مسئولیت‌های این نقش..."
                  value={newRoleDescFa}
                  onChange={(e) => setNewRoleDescFa(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-md"
                >
                  ایجاد و ذخیره نقش
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ASSIGN USER ROLE */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>تغییر و تخصیص نقش کاربر</span>
              </h3>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  انتخاب کاربر:
                </label>
                <select
                  value={selectedUserIdForAssign}
                  onChange={(e) => setSelectedUserIdForAssign(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- انتخاب کاربر --</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.title}) - نقش فعلی: {s.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  انتخاب نقش جدید:
                </label>
                <select
                  value={targetRoleCodeForAssign}
                  onChange={(e) => setTargetRoleCodeForAssign(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.code}>
                      {r.nameFa} ({r.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  انصراف
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedUserIdForAssign) return;
                    const success = assignUserRole(selectedUserIdForAssign, targetRoleCodeForAssign);
                    if (success) {
                      setIsAssignModalOpen(false);
                    }
                  }}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-md"
                >
                  اعمال و بروزرسانی نقش
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
