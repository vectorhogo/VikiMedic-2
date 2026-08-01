/**
 * VikiMedic v2 - Settings & Clinic Configuration Module
 * Clean Architecture Layer: Presentation
 */

import React, { useState } from 'react';
import {
  Settings,
  Building2,
  Database,
  Palette,
  Check,
  Plus,
  RefreshCw,
  Sliders,
  Clock,
  Users,
  History,
  AlertTriangle,
  Save,
  Shield,
  Briefcase,
  UserCheck,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { useClinic } from '../../application/ClinicContext';
import { useTheme } from '../ThemeContext';
import { getSupabaseStatus } from '../../infrastructure/supabaseClient';
import { ShiftConfig, ShiftPosition } from '../../domain/types';
import { UserManagementModule } from './UserManagementModule';
import { InitialClinicSetupPanel } from '../components/system/InitialClinicSetupPanel';
import { SystemValidationPanel } from '../components/settings/SystemValidationPanel';
import { ConfigProfilesPanel } from '../components/settings/ConfigProfilesPanel';
import { DisplayPerformancePanel } from '../components/settings/DisplayPerformancePanel';
import { WorkspaceCustomizationPanel } from '../components/system/WorkspaceCustomizationPanel';
import { ResetProtectionPanel } from '../components/system/ResetProtectionPanel';
import { ModuleIntegrityPanel } from '../components/settings/ModuleIntegrityPanel';

export const SettingsModule: React.FC = () => {
  const {
    activeClinic,
    updateClinicSettings,
    addClinic,
    clinics,
    shiftConfigs,
    shiftHistories,
    activeShiftConfig,
    updateShiftConfig,
    validateShiftTimes,
    staffList,
  } = useClinic();

  const { theme, setTheme } = useTheme();
  const supabaseStatus = getSupabaseStatus();

  // Active Settings Tab State
  const [activeTab, setActiveTab] = useState<
    | 'users'
    | 'workspace_customization'
    | 'reset_protection'
    | 'system_setup'
    | 'system_validation'
    | 'module_integrity'
    | 'config_profiles'
    | 'display'
    | 'general'
    | 'shifts'
    | 'shift_histories'
    | 'database'
  >('users');

  // Clinic Profile State
  const [clinicName, setClinicName] = useState(activeClinic.name);
  const [address, setAddress] = useState(activeClinic.address);
  const [phone, setPhone] = useState(activeClinic.phone);
  const [licenseNumber, setLicenseNumber] = useState(activeClinic.licenseNumber);

  // New Clinic Modal/Form State
  const [newClinicName, setNewClinicName] = useState('');
  const [newClinicCity, setNewClinicCity] = useState('تهران');
  const [newClinicAddress, setNewClinicAddress] = useState('');
  const [newClinicPhone, setNewClinicPhone] = useState('');
  const [newClinicLicense, setNewClinicLicense] = useState('م/۰۰۰۰۰/د');

  // Shift Editing Local State (map shiftId -> draft ShiftConfig)
  const [editingShifts, setEditingShifts] = useState<Record<string, ShiftConfig>>(() => {
    const map: Record<string, ShiftConfig> = {};
    shiftConfigs.forEach((s) => {
      map[s.id] = { ...s, assignedStaff: { ...s.assignedStaff } };
    });
    return map;
  });

  // Shift Change Reasons (map shiftId -> string)
  const [shiftReasons, setShiftReasons] = useState<Record<string, string>>({});

  // Sync editingShifts when shiftConfigs from context update
  React.useEffect(() => {
    const map: Record<string, ShiftConfig> = {};
    shiftConfigs.forEach((s) => {
      map[s.id] = { ...s, assignedStaff: { ...s.assignedStaff } };
    });
    setEditingShifts(map);
  }, [shiftConfigs]);

  const handleSaveActiveClinic = (e: React.FormEvent) => {
    e.preventDefault();
    updateClinicSettings({
      ...activeClinic,
      name: clinicName,
      address,
      phone,
      licenseNumber,
    });
  };

  const handleAddNewClinic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClinicName) return;

    addClinic({
      name: newClinicName,
      code: `CLK-0${clinics.length + 1}`,
      city: newClinicCity,
      address: newClinicAddress,
      phone: newClinicPhone,
      licenseNumber: newClinicLicense,
      isPrimary: false,
    });

    setNewClinicName('');
    setNewClinicAddress('');
    setNewClinicPhone('');
  };

  // Position Definitions with Farsi Labels
  const positionDefinitions: { type: ShiftPosition; labelFa: string; icon: any }[] = [
    { type: 'DOCTOR', labelFa: 'پزشک شیفت', icon: Briefcase },
    { type: 'RECEPTIONIST', labelFa: 'مسئول پذیرش', icon: UserCheck },
    { type: 'NURSE', labelFa: 'پرستار مقیم', icon: Users },
    { type: 'SECURITY_GUARD', labelFa: 'نگهبان و امنیت', icon: Shield },
    { type: 'CASHIER', labelFa: 'صندوق‌دار', icon: Check },
    { type: 'LAB_TECH', labelFa: 'تکنسین آزمایشگاه', icon: Sliders },
    { type: 'RADIOLOGY_TECH', labelFa: 'تکنسین رادیولوژی', icon: Settings },
    { type: 'CLEANER', labelFa: 'خدمات و نظافت', icon: Building2 },
    { type: 'OTHER', labelFa: 'سایر پرسنل موظف', icon: Plus },
  ];

  const handleShiftDraftChange = (shiftId: string, updates: Partial<ShiftConfig>) => {
    setEditingShifts((prev) => ({
      ...prev,
      [shiftId]: {
        ...prev[shiftId],
        ...updates,
      },
    }));
  };

  const handleStaffAssignmentChange = (shiftId: string, pos: ShiftPosition, staffName: string) => {
    setEditingShifts((prev) => ({
      ...prev,
      [shiftId]: {
        ...prev[shiftId],
        assignedStaff: {
          ...prev[shiftId].assignedStaff,
          [pos]: staffName,
        },
      },
    }));
  };

  const handleSaveSingleShift = (shiftId: string) => {
    const draft = editingShifts[shiftId];
    const original = shiftConfigs.find((s) => s.id === shiftId);
    if (!draft || !original) return;

    const reason = shiftReasons[shiftId] || 'به‌روزرسانی تنظیمات و پرسنل موظف شیفت';

    // Find position changes
    let changedPos: ShiftPosition | undefined;
    let prevStaff: string | undefined;
    let newStaff: string | undefined;

    for (const posDef of positionDefinitions) {
      const pos = posDef.type;
      if (draft.assignedStaff[pos] !== original.assignedStaff[pos]) {
        changedPos = pos;
        prevStaff = original.assignedStaff[pos];
        newStaff = draft.assignedStaff[pos];
        break; // log the primary position change
      }
    }

    updateShiftConfig(draft, reason, changedPos, prevStaff, newStaff);
  };

  return (
    <div className="p-6 space-y-6 text-[var(--text-main)] max-w-7xl mx-auto animate-in fade-in duration-150">
      {/* Title Header */}
      <div className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold">پیکربندی شیفت‌های کاری و تخصیص پرسنل</h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              مدیریت شیفت‌های صبگاهی، عصر، شب، تعریف پرسنل موظف و ثبت تاریخچه غیرقابل‌تغییر جابجایی پرسنل
            </p>
          </div>
        </div>

        {/* Active Shift Indicator Banner */}
        {activeShiftConfig && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 rounded-xl flex items-center gap-2.5 text-xs text-emerald-700 dark:text-emerald-300">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <span className="font-bold">شیفت فعال سیستم: {activeShiftConfig.shiftNameFa}</span>
              <span className="text-[11px] block text-emerald-600 dark:text-emerald-400 font-mono">
                ساعات: {activeShiftConfig.startTime} الی {activeShiftConfig.endTime} | پزشک: {activeShiftConfig.assignedStaff.DOCTOR} | پذیرش: {activeShiftConfig.assignedStaff.RECEPTIONIST}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition ${
            activeTab === 'users'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-[var(--bg-surface)] hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-muted)]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>مدیریت کاربران و دسترسی‌ها</span>
        </button>

        <button
          onClick={() => setActiveTab('system_validation')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition ${
            activeTab === 'system_validation'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-[var(--bg-surface)] hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-muted)]'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>ارزیابی آمادگی سیستم (Validation)</span>
        </button>

        <button
          onClick={() => setActiveTab('module_integrity')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition ${
            activeTab === 'module_integrity'
              ? 'bg-[#283F24] text-white shadow-md font-bold'
              : 'bg-[var(--bg-surface)] hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-muted)]'
          }`}
        >
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>پایش سلامت ماژول‌ها (Phase 00.5)</span>
        </button>

        <button
          onClick={() => setActiveTab('workspace_customization')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition ${
            activeTab === 'workspace_customization'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-[var(--bg-surface)] hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-muted)]'
          }`}
        >
          <Sliders className="w-4 h-4 text-purple-400" />
          <span>سفارشی‌سازی میز کار</span>
        </button>

        <button
          onClick={() => setActiveTab('reset_protection')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition ${
            activeTab === 'reset_protection'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-[var(--bg-surface)] hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-muted)]'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>پین امنیتی پاکسازی</span>
        </button>

        <button
          onClick={() => setActiveTab('config_profiles')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition ${
            activeTab === 'config_profiles'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-[var(--bg-surface)] hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-muted)]'
          }`}
        >
          <Sliders className="w-4 h-4 text-purple-400" />
          <span>پروفایل‌های پیکربندی (Profiles)</span>
        </button>

        <button
          onClick={() => setActiveTab('display')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition ${
            activeTab === 'display'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-[var(--bg-surface)] hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-muted)]'
          }`}
        >
          <Palette className="w-4 h-4 text-pink-400" />
          <span>نمایش و عملکرد (Display)</span>
        </button>

        <button
          onClick={() => setActiveTab('system_setup')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition ${
            activeTab === 'system_setup'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-[var(--bg-surface)] hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-muted)]'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>راه‌اندازی اولیه و پاکسازی</span>
        </button>

        <button
          onClick={() => setActiveTab('shifts')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition ${
            activeTab === 'shifts'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-[var(--bg-surface)] hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-muted)]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>پیکربندی شیفت‌ها و پرسنل</span>
        </button>

        <button
          onClick={() => setActiveTab('shift_histories')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition ${
            activeTab === 'shift_histories'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-[var(--bg-surface)] hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-muted)]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>تاریخچه و لاگ جابجایی پرسنل ({shiftHistories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition ${
            activeTab === 'general'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-[var(--bg-surface)] hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-muted)]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>مشخصات کلینیک و شعب</span>
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition ${
            activeTab === 'database'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-[var(--bg-surface)] hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-muted)]'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>پایگاه‌داده و تم</span>
        </button>
      </div>

      {/* Tab 0: User Management Foundation (Patch 03.0) */}
      {activeTab === 'users' && <UserManagementModule />}

      {/* Tab: Workspace Customization */}
      {activeTab === 'workspace_customization' && <WorkspaceCustomizationPanel />}

      {/* Tab: Reset PIN Protection */}
      {activeTab === 'reset_protection' && <ResetProtectionPanel />}

      {/* Tab 0.1: System Readiness Validation (Enterprise Patch 01) */}
      {activeTab === 'system_validation' && (
        <SystemValidationPanel onNavigateTab={(tab) => setActiveTab(tab as any)} />
      )}

      {/* Tab 0.15: Module Integrity Checker (Phase 00.5 Core Infrastructure) */}
      {activeTab === 'module_integrity' && <ModuleIntegrityPanel />}

      {/* Tab 0.2: Configuration Profiles (Enterprise Patch 01) */}
      {activeTab === 'config_profiles' && <ConfigProfilesPanel />}

      {/* Tab 0.3: Display Settings & Adaptive Performance Mode (Performance Patch 01) */}
      {activeTab === 'display' && <DisplayPerformancePanel />}

      {/* Tab 0.5: Initial Clinic Setup & Safe Data Reset (System Patch 01) */}
      {activeTab === 'system_setup' && <InitialClinicSetupPanel />}

      {/* Tab 1: Shift Configuration & Staff Assignment */}
      {activeTab === 'shifts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {shiftConfigs.map((shift) => {
              const draft = editingShifts[shift.id] || shift;
              const isActive = activeShiftConfig?.id === shift.id;

              return (
                <div
                  key={shift.id}
                  className={`bg-[var(--bg-surface)] border rounded-2xl p-5 shadow-sm space-y-4 text-xs transition relative overflow-hidden ${
                    isActive
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                      : draft.isEnabled
                      ? 'border-[var(--border-subtle)]'
                      : 'border-slate-300 dark:border-slate-800 opacity-60'
                  }`}
                >
                  {/* Active Badge */}
                  {isActive && (
                    <div className="absolute top-0 left-0 bg-emerald-500 text-white font-bold text-[10px] px-3 py-1 rounded-br-xl shadow">
                      شیفت فعال فعلی
                    </div>
                  )}

                  {/* Shift Header & Enable Switch */}
                  <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                    <div className="flex items-center gap-2">
                      <Clock className={`w-4 h-4 ${isActive ? 'text-emerald-500' : 'text-blue-500'}`} />
                      <input
                        type="text"
                        value={draft.shiftNameFa}
                        onChange={(e) => handleShiftDraftChange(shift.id, { shiftNameFa: e.target.value })}
                        className="font-bold text-sm bg-transparent border-b border-dashed border-slate-400 dark:border-slate-600 outline-none w-36"
                      />
                    </div>

                    {/* Is Enabled Toggle */}
                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold">
                      <input
                        type="checkbox"
                        checked={draft.isEnabled}
                        onChange={(e) => handleShiftDraftChange(shift.id, { isEnabled: e.target.checked })}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span>{draft.isEnabled ? 'فعال' : 'غیرفعال'}</span>
                    </label>
                  </div>

                  {/* Shift Time Configuration (Start & End Time) */}
                  <div className="grid grid-cols-2 gap-3 bg-[var(--bg-app)] p-3 rounded-xl border border-[var(--border-subtle)]">
                    <div>
                      <label className="block mb-1 text-[11px] font-bold text-[var(--text-muted)]">ساعت شروع *</label>
                      <input
                        type="time"
                        value={draft.startTime}
                        onChange={(e) => handleShiftDraftChange(shift.id, { startTime: e.target.value })}
                        className="w-full p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] font-mono text-center font-bold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-[11px] font-bold text-[var(--text-muted)]">ساعت پایان *</label>
                      <input
                        type="time"
                        value={draft.endTime}
                        onChange={(e) => handleShiftDraftChange(shift.id, { endTime: e.target.value })}
                        className="w-full p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] font-mono text-center font-bold outline-none"
                      />
                    </div>
                  </div>

                  {/* Assigned Staff Section */}
                  <div className="space-y-2.5">
                    <h3 className="font-bold text-[11px] text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>پرسنل موظف شیفت ({shift.shiftNameFa})</span>
                    </h3>

                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {positionDefinitions.map(({ type, labelFa, icon: Icon }) => (
                        <div key={type} className="flex items-center justify-between gap-2">
                          <span className="text-[11px] text-[var(--text-muted)] w-28 truncate flex items-center gap-1">
                            <Icon className="w-3 h-3 text-slate-400" />
                            <span>{labelFa}:</span>
                          </span>

                          <input
                            type="text"
                            list={`staff-list-${shift.id}`}
                            value={draft.assignedStaff[type] || ''}
                            onChange={(e) => handleStaffAssignmentChange(shift.id, type, e.target.value)}
                            placeholder="نام و نام خانوادگی..."
                            className="flex-1 p-1.5 text-xs rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] font-medium outline-none"
                          />
                          <datalist id={`staff-list-${shift.id}`}>
                            {staffList.map((s) => (
                              <option key={s.id} value={s.fullName} />
                            ))}
                          </datalist>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Modification Reason Input */}
                  <div>
                    <label className="block mb-1 text-[10px] font-bold text-[var(--text-muted)]">
                      علت جابجایی / تغییر پرسنل (جهت ثبت در تاریخچه):
                    </label>
                    <input
                      type="text"
                      value={shiftReasons[shift.id] || ''}
                      onChange={(e) => setShiftReasons((prev) => ({ ...prev, [shift.id]: e.target.value }))}
                      placeholder="مثال: مرخصی استعلاجی / جابجایی برنامه هفتگی"
                      className="w-full p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] text-xs outline-none"
                    />
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={() => handleSaveSingleShift(shift.id)}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-2 shadow transition"
                  >
                    <Save className="w-4 h-4" />
                    <span>ذخیره تنظیمات {draft.shiftNameFa}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Shift Assignment History Audit Trail */}
      {activeTab === 'shift_histories' && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <div>
              <h2 className="font-bold text-sm flex items-center gap-2 text-blue-600">
                <History className="w-4 h-4" />
                <span>دفتر ثبت سوابق جابجایی و تغییر پرسنل شیفت‌ها (Audit Trail)</span>
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                طبق قواعد مخدوش‌ناپذیری مالی و عملیاتی ویکی‌مدیک، کلیه تغییرات پرسنل به‌صورت دائمی ذخیره شده و قابل حذف یا ویرایش نمی‌باشند.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
            <table className="w-full text-right text-xs">
              <thead className="bg-[var(--bg-app)] font-bold border-b border-[var(--border-subtle)]">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">نام شیفت</th>
                  <th className="p-3">سمت / موقعیت شغلی</th>
                  <th className="p-3">مسئول قبلی</th>
                  <th className="p-3">مسئول جدید</th>
                  <th className="p-3">تغییردهنده (ثبت‌کننده)</th>
                  <th className="p-3">تاریخ و زمان ثبت</th>
                  <th className="p-3">علت تغییر</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {shiftHistories.map((h, index) => (
                  <tr key={h.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="p-3 font-mono text-[var(--text-muted)]">{index + 1}</td>
                    <td className="p-3 font-bold text-blue-600 dark:text-blue-400">{h.shiftNameFa}</td>
                    <td className="p-3 font-medium">{h.positionTitleFa}</td>
                    <td className="p-3 text-rose-500 font-medium line-through decoration-rose-300">{h.previousStaffName}</td>
                    <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">{h.newStaffName}</td>
                    <td className="p-3 text-[var(--text-muted)]">{h.modifiedBy}</td>
                    <td className="p-3 font-mono text-[var(--text-muted)] dir-ltr text-right">{h.modificationDate}</td>
                    <td className="p-3 font-medium text-slate-700 dark:text-slate-300">{h.reason}</td>
                  </tr>
                ))}
                {shiftHistories.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-[var(--text-muted)]">
                      هنوز هیچ سابقه جابجایی پرسنل برای این کلینیک ثبت نشده است.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: General & Branches Settings */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Clinic Profile Form */}
          <form onSubmit={handleSaveActiveClinic} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-sm space-y-4 text-xs">
            <h2 className="font-bold text-sm flex items-center gap-2 text-blue-600">
              <Building2 className="w-4 h-4" />
              <span>تنظیمات شعبه فعال ({activeClinic.name})</span>
            </h2>

            <div>
              <label className="block mb-1 font-bold">نام رسمی کلینیک / مطب *</label>
              <input
                type="text"
                required
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] font-bold outline-none"
              />
            </div>

            <div>
              <label className="block mb-1 font-bold">شماره پروانه تاسیس / نظام پزشکی *</label>
              <input
                type="text"
                required
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] font-mono outline-none"
              />
            </div>

            <div>
              <label className="block mb-1 font-bold">شماره تلفن‌های کلینیک</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] font-mono outline-none"
              />
            </div>

            <div>
              <label className="block mb-1 font-bold">آدرس دقیق جهت درج در سربرگ فاکتور و نسخه</label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-2 shadow transition"
            >
              <Check className="w-4 h-4" />
              <span>ذخیره تغییرات شعبه</span>
            </button>
          </form>

          {/* Add New Clinic Branch */}
          <form onSubmit={handleAddNewClinic} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-sm space-y-4 text-xs">
            <h2 className="font-bold text-sm flex items-center gap-2 text-emerald-600">
              <Plus className="w-4 h-4" />
              <span>افزودن شعبه / کلینیک جدید (Multi-Clinic System)</span>
            </h2>

            <div>
              <label className="block mb-1 font-bold">نام شعبه جدید *</label>
              <input
                type="text"
                required
                value={newClinicName}
                onChange={(e) => setNewClinicName(e.target.value)}
                placeholder="مثال: کلینیک تخصصی تجریش"
                className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 font-bold">شهر</label>
                <input
                  type="text"
                  value={newClinicCity}
                  onChange={(e) => setNewClinicCity(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] outline-none"
                />
              </div>
              <div>
                <label className="block mb-1 font-bold">شماره پروانه</label>
                <input
                  type="text"
                  value={newClinicLicense}
                  onChange={(e) => setNewClinicLicense(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] font-mono outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 font-bold">تلفن تماس شعبه جدید</label>
              <input
                type="text"
                value={newClinicPhone}
                onChange={(e) => setNewClinicPhone(e.target.value)}
                placeholder="021-22003344"
                className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] font-mono outline-none"
              />
            </div>

            <div>
              <label className="block mb-1 font-bold">آدرس شعبه جدید</label>
              <textarea
                rows={2}
                value={newClinicAddress}
                onChange={(e) => setNewClinicAddress(e.target.value)}
                placeholder="آدرس شعبه جدید..."
                className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 shadow transition"
            >
              <Plus className="w-4 h-4" />
              <span>ایجاد و اضافه کردن شعبه جدید</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab 4: Supabase Status and Theme Settings */}
      {activeTab === 'database' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Database Connection Info */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-sm space-y-3 text-xs">
            <h2 className="font-bold text-sm flex items-center gap-2 text-purple-600">
              <Database className="w-4 h-4" />
              <span>وضعیت اتصال به پایگاه‌داده Supabase PostgreSQL</span>
            </h2>

            <div className="p-3 bg-[var(--bg-app)] rounded-xl border border-[var(--border-subtle)] space-y-2 font-mono">
              <div>وضعیت اتصال: <strong className={supabaseStatus.isConfigured ? 'text-emerald-500' : 'text-amber-500'}>{supabaseStatus.isConfigured ? 'متصل به Supabase Cloud' : 'حالت محلی (Local Client State Active)'}</strong></div>
              <div>URL: {supabaseStatus.url}</div>
            </div>

            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              توضیح: هم‌اکنون برنامه با ذخیره‌سازی پیشرفته محلی و قابلیت اتصال آماده به کلیدهای Supabase کار می‌کند.
            </p>
          </div>

          {/* Theme Settings */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-sm space-y-3 text-xs">
            <h2 className="font-bold text-sm flex items-center gap-2 text-pink-600">
              <Palette className="w-4 h-4" />
              <span>مدیریت تم و زیبایی بصری (Design System)</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <button
                onClick={() => setTheme('theme-default')}
                className={`p-3 rounded-xl border font-bold text-center transition ${
                  theme === 'theme-default' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-[var(--border-subtle)]'
                }`}
              >
                تم سفید پزشکی
              </button>
              <button
                onClick={() => setTheme('clinic-olive')}
                className={`p-3 rounded-xl border font-bold text-center transition ${
                  theme === 'clinic-olive' ? 'border-[#6F7952] bg-[#E7E9DC] text-[#20231D]' : 'border-[var(--border-subtle)]'
                }`}
              >
                سبز
              </button>
              <button
                onClick={() => setTheme('theme-dark')}
                className={`p-3 rounded-xl border font-bold text-center transition ${
                  theme === 'theme-dark' ? 'border-indigo-500 bg-slate-900 text-indigo-300' : 'border-[var(--border-subtle)]'
                }`}
              >
                تم دارک و شب
              </button>
              <button
                onClick={() => setTheme('theme-rose')}
                className={`p-3 rounded-xl border font-bold text-center transition ${
                  theme === 'theme-rose' ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-[var(--border-subtle)]'
                }`}
              >
                تم رز لوکس
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
