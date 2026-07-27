/**
 * VikiMedic v2 - Configuration Profiles Management Panel
 * Clean Architecture Layer: Presentation
 * Enterprise Patch 01
 */

import React, { useState, useEffect } from 'react';
import {
  Sliders,
  CheckCircle2,
  Copy,
  Trash2,
  Download,
  Upload,
  Plus,
  Edit2,
  ShieldCheck,
  Building2,
  Palette,
  Printer,
  Clock,
  Volume2,
  Bot,
  AlertTriangle,
  Lock,
  X,
  Check,
} from 'lucide-react';
import { useClinic } from '../../../application/ClinicContext';
import { useTheme } from '../../ThemeContext';
import { ConfigurationProfile, ProfileContent } from '../../../domain/profileTypes';
import { ConfigProfileService } from '../../../infrastructure/configProfileService';

export const ConfigProfilesPanel: React.FC = () => {
  const { updateClinicSettings, addNotification } = useClinic();
  const { setTheme } = useTheme();

  const [profiles, setProfiles] = useState<ConfigurationProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<ConfigurationProfile | null>(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isActivateConfirmOpen, setIsActivateConfirmOpen] = useState<boolean>(false);
  const [targetProfileToActivate, setTargetProfileToActivate] = useState<ConfigurationProfile | null>(null);

  // Edit / Rename modal
  const [editingProfile, setEditingProfile] = useState<ConfigurationProfile | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // New Profile Form
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Profile Drawer Inspection
  const [inspectProfile, setInspectProfile] = useState<ConfigurationProfile | null>(null);

  const reloadProfiles = () => {
    const list = ConfigProfileService.getProfiles();
    setProfiles(list);
    const active = list.find((p) => p.isActive) || list[0];
    setActiveProfile(active);
  };

  useEffect(() => {
    reloadProfiles();
  }, []);

  // Handle Activate Profile
  const handleConfirmActivate = () => {
    if (!targetProfileToActivate) return;

    const success = ConfigProfileService.activateProfile(targetProfileToActivate.id, {
      onUpdateClinicSettings: (clinic) => updateClinicSettings(clinic),
      onSetTheme: (themeName) => setTheme(themeName),
    });

    if (success) {
      addNotification(`پروفایل (${targetProfileToActivate.name}) با موفقیت فعال گردید.`, 'success');
      reloadProfiles();
    }
    setIsActivateConfirmOpen(false);
    setTargetProfileToActivate(null);
  };

  // Handle Create
  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const created = ConfigProfileService.createProfile(newName, newDesc, activeProfile?.content);
    addNotification(`پروفایل جدید (${created.name}) ایجاد گردید.`, 'info');
    setIsCreateOpen(false);
    setNewName('');
    setNewDesc('');
    reloadProfiles();
  };

  // Handle Duplicate
  const handleDuplicate = (profile: ConfigurationProfile) => {
    const copy = ConfigProfileService.duplicateProfile(profile.id, `${profile.name} (نسخه کپی)`);
    if (copy) {
      addNotification(`نسخه کپی با نام (${copy.name}) ساخته شد.`, 'info');
      reloadProfiles();
    }
  };

  // Handle Delete
  const handleDelete = (profile: ConfigurationProfile) => {
    if (profile.isActive || profile.isDefault) {
      addNotification('پروفایل فعال یا پیش‌فرض سیستم قابل حذف نیست.', 'warning');
      return;
    }

    if (window.confirm(`آیا از حذف پروفایل "${profile.name}" اطمینان دارید؟`)) {
      ConfigProfileService.deleteProfile(profile.id);
      addNotification(`پروفایل (${profile.name}) حذف شد.`, 'info');
      reloadProfiles();
    }
  };

  // Handle Import JSON
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const imported = ConfigProfileService.importProfileFromJSON(content);
      if (imported) {
        addNotification(`پروفایل (${imported.name}) از فایل JSON بازیابی و افزوده شد.`, 'success');
        reloadProfiles();
      } else {
        addNotification('فایل ساختار صوتی یا JSON استاندارد پروفایل نداشت.', 'danger');
      }
    };
    reader.readAsText(file);
  };

  // Save Edit Profile Name / Description
  const handleSaveRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile || !editName.trim()) return;

    ConfigProfileService.renameProfile(editingProfile.id, editName, editDesc);
    addNotification('مشخصات پروفایل به‌روزرسانی شد.', 'info');
    setEditingProfile(null);
    reloadProfiles();
  };

  return (
    <div className="space-y-6 dir-rtl animate-in fade-in duration-150">
      {/* Top Banner & Core Assurance Card */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 rounded-3xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-2.5 py-0.5 rounded-lg text-[10px] font-bold">
              Configuration Profiles (Enterprise Patch 01)
            </span>
          </div>
          <h2 className="text-lg font-bold text-[var(--text-main)]">پروفایل‌های جامع پیکربندی سیستم (Configuration Profiles)</h2>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-2xl">
            تعریف، استخراج، بازیابی و سوئیچ آنی بین پروفایل‌های تنظیمات کلینیک شامل هدر قبوض، تم‌ها، چاپگر، ساعات کاری، شیفت‌ها و AI.
          </p>
        </div>

        {/* Safety Guarantee Badge */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-2xl flex items-center gap-3 text-emerald-700 dark:text-emerald-300 text-xs shrink-0 max-w-md">
          <ShieldCheck className="w-6 h-6 shrink-0 text-emerald-500" />
          <div className="space-y-0.5">
            <span className="font-bold block">تضمین عدم دستکاری داده‌های عملیاتی:</span>
            <span className="text-[11px] opacity-90 block">
              پرونده‌های پزشکی، فاکتورهای مالی، بیماران و گزارشات هنگام تغییر پروفایل کاملاً دست‌نخورده می‌مانند.
            </span>
          </div>
        </div>
      </div>

      {/* Profile Management Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[var(--bg-surface)] p-3.5 rounded-2xl border border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-md shadow-blue-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>ایجاد پروفایل جدید</span>
          </button>

          {/* Import JSON Button */}
          <label className="bg-[var(--bg-app)] hover:bg-slate-100 dark:hover:bg-slate-800 border border-[var(--border-subtle)] text-[var(--text-main)] font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition">
            <Upload className="w-4 h-4 text-emerald-500" />
            <span>بارگذاری فایل JSON</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {activeProfile && (
          <div className="text-xs text-[var(--text-muted)] flex items-center gap-2">
            <span>پروفایل فعال جاری:</span>
            <span className="font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              {activeProfile.name}
            </span>
          </div>
        )}
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className={`p-5 rounded-2xl border transition relative flex flex-col justify-between gap-4 ${
              profile.isActive
                ? 'bg-emerald-500/5 border-emerald-500/40 shadow-sm'
                : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-blue-500/30'
            }`}
          >
            {/* Top Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                      profile.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-700/20 text-slate-400'
                    }`}
                  >
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[var(--text-main)] flex items-center gap-1.5">
                      <span>{profile.name}</span>
                      {profile.isDefault && (
                        <span className="text-[10px] bg-blue-500/10 text-blue-500 px-1.5 py-0.2 rounded font-mono">
                          پیش‌فرض
                        </span>
                      )}
                    </h3>
                    <span className="text-[10px] text-[var(--text-muted)] block font-mono">
                      تاریخ ایجاد: {profile.createdAt}
                    </span>
                  </div>
                </div>

                {profile.isActive && (
                  <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>فعال</span>
                  </span>
                )}
              </div>

              <p className="text-xs text-[var(--text-muted)] leading-relaxed line-clamp-2">{profile.description}</p>

              {/* Profile Config Summary Pills */}
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-[var(--border-subtle)]">
                <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                  <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="truncate">{profile.content.clinicInfo.name}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                  <Palette className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>تم: {profile.content.theme}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                  <Printer className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>کاغذ: {profile.content.printerConfig.paperSize}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                  <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>ساعات: {profile.content.workingHours.startTime} - {profile.content.workingHours.endTime}</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions Toolbar */}
            <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
              {!profile.isActive ? (
                <button
                  onClick={() => {
                    setTargetProfileToActivate(profile);
                    setIsActivateConfirmOpen(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 transition shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>فعال‌سازی این پروفایل</span>
                </button>
              ) : (
                <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                  ✓ پروفایل فعال سیستم
                </span>
              )}

              <div className="flex items-center gap-1">
                {/* Inspect Details */}
                <button
                  onClick={() => setInspectProfile(profile)}
                  title="مشاهده جزئیات پروفایل"
                  className="p-1.5 rounded-lg bg-[var(--bg-app)] hover:bg-slate-700/20 text-[var(--text-muted)]"
                >
                  <Sliders className="w-4 h-4" />
                </button>

                {/* Edit Rename */}
                <button
                  onClick={() => {
                    setEditingProfile(profile);
                    setEditName(profile.name);
                    setEditDesc(profile.description);
                  }}
                  title="ویرایش نام و توضیحات"
                  className="p-1.5 rounded-lg bg-[var(--bg-app)] hover:bg-slate-700/20 text-[var(--text-muted)]"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                {/* Duplicate */}
                <button
                  onClick={() => handleDuplicate(profile)}
                  title="کپی و تکثیر پروفایل"
                  className="p-1.5 rounded-lg bg-[var(--bg-app)] hover:bg-slate-700/20 text-blue-400"
                >
                  <Copy className="w-4 h-4" />
                </button>

                {/* Export JSON */}
                <button
                  onClick={() => ConfigProfileService.exportProfileJSON(profile.id)}
                  title="دانلود فایل JSON"
                  className="p-1.5 rounded-lg bg-[var(--bg-app)] hover:bg-slate-700/20 text-emerald-400"
                >
                  <Download className="w-4 h-4" />
                </button>

                {/* Delete */}
                {!profile.isActive && !profile.isDefault && (
                  <button
                    onClick={() => handleDelete(profile)}
                    title="حذف پروفایل"
                    className="p-1.5 rounded-lg bg-[var(--bg-app)] hover:bg-rose-500/20 text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Activate Confirmation Modal */}
      {isActivateConfirmOpen && targetProfileToActivate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 dir-rtl animate-in fade-in duration-150">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-emerald-500">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[var(--text-main)]">تایید فعال‌سازی پروفایل جدید</h3>
                <span className="text-xs text-[var(--text-muted)]">Configuration Profile Activation</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2 text-xs leading-relaxed text-emerald-800 dark:text-emerald-200">
              <p className="font-bold">آیا از سوئیچ سیستم به پروفایل "{targetProfileToActivate.name}" اطمینان دارید؟</p>
              <ul className="list-disc list-inside space-y-1 text-[11px] opacity-90">
                <li>اطلاعات عنوان کلینیک، آدرس، تلفن و شماره پروانه به‌روزرسانی می‌شود.</li>
                <li>قالب و اندازه کاغذ چاپگر، هدر و پاورقی قبوض تغییر خواهد کرد.</li>
                <li>تم دیداری سیستم به ({targetProfileToActivate.content.theme}) تغییر می‌کند.</li>
                <li className="font-bold text-emerald-600 dark:text-emerald-300">
                  تضمین قطعی: پرونده‌های پزشکی، تراکنش‌های مالی، بیماران و گزارشات کاملاً دست‌نخورده می‌مانند.
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setIsActivateConfirmOpen(false);
                  setTargetProfileToActivate(null);
                }}
                className="px-4 py-2 rounded-xl border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-muted)] hover:bg-slate-800"
              >
                انصراف
              </button>
              <button
                onClick={handleConfirmActivate}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30"
              >
                تایید و فعال‌سازی پروفایل
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 dir-rtl animate-in fade-in duration-150">
          <form onSubmit={handleCreateProfile} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <h3 className="font-bold text-sm text-[var(--text-main)]">ایجاد پروفایل پیکربندی جدید</h3>
              <button onClick={() => setIsCreateOpen(false)} type="button" className="text-[var(--text-muted)] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[var(--text-muted)] block mb-1">نام پروفایل:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: پروفایل کلینیک شیفت شب"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl p-2.5 text-xs text-[var(--text-main)] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-[var(--text-muted)] block mb-1">توضیحات و کاربرد:</label>
                <textarea
                  rows={3}
                  placeholder="توضیحات درباره اهداف این پروفایل..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl p-2.5 text-xs text-[var(--text-main)] focus:outline-none focus:border-blue-500"
                />
              </div>

              <p className="text-[11px] text-[var(--text-muted)] bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/20">
                پروفایل جدید بر اساس تنظیمات فعال جاری سیستم نمونه‌برداری خواهد شد.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 rounded-xl border border-[var(--border-subtle)] text-xs text-[var(--text-muted)]"
              >
                انصراف
              </button>
              <button type="submit" className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs">
                ذخیره پروفایل
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rename Modal */}
      {editingProfile && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 dir-rtl animate-in fade-in duration-150">
          <form onSubmit={handleSaveRename} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <h3 className="font-bold text-sm text-[var(--text-main)]">ویرایش نام و توضیحات پروفایل</h3>
              <button onClick={() => setEditingProfile(null)} type="button" className="text-[var(--text-muted)] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[var(--text-muted)] block mb-1">نام پروفایل:</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl p-2.5 text-xs text-[var(--text-main)] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-[var(--text-muted)] block mb-1">توضیحات:</label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl p-2.5 text-xs text-[var(--text-main)] focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingProfile(null)}
                className="px-4 py-2 rounded-xl border border-[var(--border-subtle)] text-xs text-[var(--text-muted)]"
              >
                انصراف
              </button>
              <button type="submit" className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs">
                ذخیره تغییرات
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Inspect Profile Details Drawer */}
      {inspectProfile && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 dir-rtl animate-in fade-in duration-150">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] w-full max-w-2xl rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-sm text-[var(--text-main)]">جزئیات کامل پروفایل: {inspectProfile.name}</h3>
              </div>
              <button onClick={() => setInspectProfile(null)} type="button" className="text-[var(--text-muted)] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Clinic Info */}
              <div className="p-3.5 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-subtle)] space-y-2">
                <span className="font-bold text-blue-400 block">اطلاعات کلینیک:</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>نام کلینیک: {inspectProfile.content.clinicInfo.name}</div>
                  <div>شهر: {inspectProfile.content.clinicInfo.city}</div>
                  <div>تلفن: {inspectProfile.content.clinicInfo.phone}</div>
                  <div>پروانه: {inspectProfile.content.clinicInfo.licenseNumber}</div>
                  <div className="col-span-2">آدرس: {inspectProfile.content.clinicInfo.address}</div>
                </div>
              </div>

              {/* Printer Config & Receipt Layout */}
              <div className="p-3.5 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-subtle)] space-y-2">
                <span className="font-bold text-amber-400 block">تنظیمات چاپگر و قالب قبوض:</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>چاپگر: {inspectProfile.content.printerConfig.defaultPrinter}</div>
                  <div>سایز کاغذ: {inspectProfile.content.printerConfig.paperSize}</div>
                  <div>تعداد نسخه: {inspectProfile.content.printerConfig.copiesCount}</div>
                  <div>عنوان هدر: {inspectProfile.content.receiptLayout.headerTitleFa}</div>
                  <div className="col-span-2">پاورقی: {inspectProfile.content.receiptLayout.footerNoteFa}</div>
                </div>
              </div>

              {/* Hours & Preferences */}
              <div className="p-3.5 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-subtle)] space-y-2">
                <span className="font-bold text-emerald-400 block">ساعات کاری و تنظیمات سیستم:</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>ساعت شروع/پایان: {inspectProfile.content.workingHours.startTime} الی {inspectProfile.content.workingHours.endTime}</div>
                  <div>زبان / واحد پول: {inspectProfile.content.language} / {inspectProfile.content.currency}</div>
                  <div>تم دیداری: {inspectProfile.content.theme}</div>
                  <div>حالت AI: {inspectProfile.content.aiSettings?.mode || 'OFFLINE'}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-[var(--border-subtle)]">
              <button
                onClick={() => setInspectProfile(null)}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
