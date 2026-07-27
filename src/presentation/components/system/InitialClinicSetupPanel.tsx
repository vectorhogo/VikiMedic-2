/**
 * VikiMedic v2 - Initial Clinic Setup & Safe Data Reset Panel (System Patch 01 & Patch 01.1)
 * Clean Architecture Layer: Presentation Component
 */

import React, { useState, useEffect } from 'react';
import {
  Building2,
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Save,
  Trash2,
  Lock,
  FileText,
  Clock,
  Printer,
  DollarSign,
  Globe,
  Database,
  Archive,
  UserCheck,
  Package,
  Layers,
  Sparkles,
  FileCheck,
  X,
  HelpCircle,
  Download,
  Image as ImageIcon,
  Activity,
  RotateCcw,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useClinic } from '../../../application/ClinicContext';
import { useAuth } from '../../../application/AuthContext';
import { LocalStorageManager } from '../../../infrastructure/storage';
import { SystemResetOptions, SystemResetReport, SystemSafetyCheckResult, SystemHealthReport } from '../../../domain/types';

interface InitialClinicSetupPanelProps {
  onOpenWizard?: () => void;
}

export const InitialClinicSetupPanel: React.FC<InitialClinicSetupPanelProps> = ({ onOpenWizard }) => {
  const {
    activeClinic,
    updateClinicSettings,
    executeSystemReset,
    systemResetReports,
    setIsSetupWizardOpen,
    validateResetSafetyChecks,
    restoreSystemBackup,
    performSystemHealthCheck,
    systemHealthReport,
  } = useClinic();

  const { activeUser, verifyCurrentUserPassword } = useAuth();
  
  // Section 1: Initial Clinic Setup permission granted ONLY to Administrator and Receptionist
  const userRole = activeUser?.role?.toUpperCase() || '';
  const hasAccess =
    userRole === 'ADMIN' ||
    userRole === 'ADMINISTRATOR' ||
    userRole === 'CLINIC_MANAGER' ||
    userRole === 'RECEPTIONIST';

  // Clinic Profile Editable Form State
  const [clinicName, setClinicName] = useState(activeClinic?.name || '');
  const [logoUrl, setLogoUrl] = useState(activeClinic?.logoUrl || '');
  const [phone, setPhone] = useState(activeClinic?.phone || '');
  const [emergencyPhone, setEmergencyPhone] = useState(activeClinic?.emergencyPhone || '');
  const [address, setAddress] = useState(activeClinic?.address || '');
  const [licenseNumber, setLicenseNumber] = useState(activeClinic?.licenseNumber || '');
  const [taxNumber, setTaxNumber] = useState(activeClinic?.taxNumber || '');
  const [description, setDescription] = useState(activeClinic?.description || '');
  const [workingHours, setWorkingHours] = useState(activeClinic?.workingHours || '۰۸:۰۰ الی ۲۱:۰۰');
  const [defaultCurrency, setDefaultCurrency] = useState(activeClinic?.defaultCurrency || 'تومان');
  const [defaultLanguage, setDefaultLanguage] = useState(activeClinic?.defaultLanguage || 'فارسی');
  const [defaultPrinter, setDefaultPrinter] = useState(activeClinic?.defaultPrinter || 'حرارتی ۸۰ میلی‌متری (فاکتور)');
  const [receiptTemplate, setReceiptTemplate] = useState(activeClinic?.receiptTemplate || 'استاندارد حرارتی');

  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

  // Safe Data Reset Form & Modal State
  const [resetOptions, setResetOptions] = useState<SystemResetOptions>({
    deleteUsers: false,
    deleteMedicines: false,
    deleteServices: false,
  });

  const [isResetConfirmModalOpen, setIsResetConfirmModalOpen] = useState(false);
  const [confirmKeyword, setConfirmKeyword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [safetyCheckResult, setSafetyCheckResult] = useState<SystemSafetyCheckResult | null>(null);

  const [lastReport, setLastReport] = useState<SystemResetReport | null>(
    systemResetReports.length > 0 ? systemResetReports[0] : null
  );

  const [currentHealthReport, setCurrentHealthReport] = useState<SystemHealthReport | null>(systemHealthReport);

  useEffect(() => {
    if (isResetConfirmModalOpen) {
      const safety = validateResetSafetyChecks();
      setSafetyCheckResult(safety);
    }
  }, [isResetConfirmModalOpen]);

  // Handle Clinic Information Save
  const handleSaveClinicInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClinic) return;

    updateClinicSettings({
      ...activeClinic,
      name: clinicName,
      logoUrl,
      phone,
      emergencyPhone,
      address,
      licenseNumber,
      taxNumber,
      description,
      workingHours,
      defaultCurrency,
      defaultLanguage,
      defaultPrinter,
      receiptTemplate,
    });

    setIsSavedSuccess(true);
    setTimeout(() => setIsSavedSuccess(false), 3000);
  };

  // Handle Safe Reset Execution
  const handleExecuteReset = async () => {
    if (confirmKeyword.trim().toUpperCase() !== 'RESET') {
      setResetError('جهت تایید، لطفاً کلمه RESET را به درستی وارد کنید.');
      return;
    }

    if (!adminPassword) {
      setResetError('وارد کردن رمز عبور کاربر جاری الزامی است.');
      return;
    }

    const isPasswordValid = await verifyCurrentUserPassword(adminPassword);
    if (!isPasswordValid) {
      setResetError('رمز عبور وارد شده اشتباه است. لطفاً رمز عبور حساب فعلی خود را وارد نمایید.');
      return;
    }

    if (safetyCheckResult && !safetyCheckResult.isPassed) {
      setResetError(`توقف پاکسازی: ${safetyCheckResult.failureReasons.join(' | ')}`);
      return;
    }

    setIsResetting(true);
    setResetError(null);

    const result = await executeSystemReset(resetOptions, adminPassword);

    setIsResetting(false);

    if (result.success && result.report) {
      // Section 1 Security Requirement: Log User, Role, Date, Time, Operation
      const now = new Date();
      LocalStorageManager.addAuthActivityLog({
        timestamp: now.toLocaleDateString('fa-IR') + ' - ' + now.toLocaleTimeString('fa-IR'),
        userId: activeUser?.id || 'UNKNOWN',
        username: activeUser?.username || activeUser?.fullName || 'UNKNOWN',
        fullName: activeUser?.fullName || 'کاربر',
        userRole: activeUser?.role || 'RECEPTIONIST',
        action: 'SETTINGS_UPDATE',
        details: `اجرای عملیات راه‌اندازی اولیه و بازنشانی ایمن داده‌ها (توسط: ${activeUser?.fullName} | نقش: ${activeUser?.role})`,
        device: 'Desktop Client / Security Enforced',
        clinicId: activeClinic?.id || 'clinic-01',
      });

      setLastReport(result.report);
      setIsResetConfirmModalOpen(false);
      setConfirmKeyword('');
      setAdminPassword('');
    } else {
      setResetError(result.error || 'خطا در انجام عملیات پاکسازی.');
    }
  };

  const handleRunHealthCheck = () => {
    const report = performSystemHealthCheck();
    setCurrentHealthReport(report);
  };

  const handleRestoreBackup = (backupId: string) => {
    if (window.confirm(`آیا از بازیابی نسخه پشتیبان (شناسه: ${backupId}) اطمینان دارید؟ داده‌های فعلی بازنویسی می‌شوند.`)) {
      restoreSystemBackup(backupId);
    }
  };

  if (!hasAccess) {
    return (
      <div className="p-8 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-800 dark:text-amber-200 space-y-3 dir-rtl">
        <div className="flex items-center gap-3 font-bold text-base">
          <ShieldAlert className="w-6 h-6 text-amber-600" />
          <span>محدودیت دسترسی - ویژه مدیر ارشد و مسؤول پذیرش</span>
        </div>
        <p className="text-xs leading-relaxed">
          ماژول «راه‌اندازی اولیه کلینیک» صرفاً جهت استفاده توسط مدیر کل سیستم و مسؤول پذیرش طراحی شده است. دسترسی سایر نقش‌های کاربری به این صفحه محدود گردیده است.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200 dir-rtl">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shadow-inner">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black">راه‌اندازی اولیه و پیکربندی کلینیک</h1>
              <span className="bg-purple-500/30 text-purple-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-purple-400/40">
                سامانه درمانگاهی
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              پیکربندی هویت کلینیک جدید، ویزارد ۶ مرحله‌ای، چک‌های ایمنی پاکسازی و بازیابی خودکار پشتیبان
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunHealthCheck}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700 transition"
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>بررسی سلامت سیستم</span>
          </button>

          <button
            onClick={() => {
              if (onOpenWizard) onOpenWizard();
              else setIsSetupWizardOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition"
          >
            <Sparkles className="w-4 h-4 text-purple-200 animate-pulse" />
            <span>ویزارد هوشمند راه‌اندازی جدید</span>
          </button>
        </div>
      </div>

      {/* SYSTEM HEALTH CHECK REPORT BOX */}
      {currentHealthReport && (
        <div className="bg-[var(--bg-surface)] border border-emerald-500/30 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
              <Activity className="w-4 h-4" />
              <span>نتایج بررسی سلامتی پایگاه‌داده و زیرساخت (System Health Check)</span>
            </div>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">
              زمان تست: {currentHealthReport.timestamp}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${currentHealthReport.databaseIntegrity ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-700'}`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <div className="truncate">
                <span className="font-bold block text-[10px]">یکپارچگی دیتابیس</span>
                <span className="text-[9px] opacity-80">{currentHealthReport.databaseIntegrity ? 'سالم و بدون خطا' : 'خطای داده'}</span>
              </div>
            </div>

            <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${currentHealthReport.relationshipValidation ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-700'}`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <div className="truncate">
                <span className="font-bold block text-[10px]">روابط پرونده‌ها</span>
                <span className="text-[9px] opacity-80">{currentHealthReport.relationshipValidation ? 'اعتبارسنجی شد' : 'ناهمخوانی'}</span>
              </div>
            </div>

            <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${currentHealthReport.settingsCheck ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300' : 'bg-amber-500/10 border-amber-500/30 text-amber-700'}`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <div className="truncate">
                <span className="font-bold block text-[10px]">تنظیمات کلینیک</span>
                <span className="text-[9px] opacity-80">{currentHealthReport.settingsCheck ? 'کامل' : 'تکمیل‌نشده'}</span>
              </div>
            </div>

            <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${currentHealthReport.storageValidation ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-700'}`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <div className="truncate">
                <span className="font-bold block text-[10px]">فضای ذخیره‌سازی</span>
                <span className="text-[9px] opacity-80">{currentHealthReport.storageValidation ? 'آماده و در دسترس' : 'پر شده'}</span>
              </div>
            </div>

            <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${currentHealthReport.backupValidation ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300' : 'bg-amber-500/10 border-amber-500/30 text-amber-700'}`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <div className="truncate">
                <span className="font-bold block text-[10px]">سیستم پشتیبان‌گیری</span>
                <span className="text-[9px] opacity-80">{currentHealthReport.backupValidation ? 'فعال' : 'بدون نسخه'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: EDIT CLINIC INFORMATION */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400 font-bold text-sm">
            <Building2 className="w-5 h-5" />
            <span>مشخصات پایه و شناسنامه کلینیک (Initial Clinic Information)</span>
          </div>
          {isSavedSuccess && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>اطلاعات کلینیک ذخیره گردید</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSaveClinicInfo} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            {/* Clinic Name */}
            <div className="space-y-1.5">
              <label className="font-bold text-[var(--text-main)] flex items-center gap-1.5">
                <span>نام رسمی کلینیک / مرکز درمان</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                placeholder="مانند: کلینیک تخصصی و فوق‌تخصصی ابن‌سینا"
                className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:border-blue-500 outline-none"
              />
            </div>

            {/* Clinic Logo URL */}
            <div className="space-y-1.5">
              <label className="font-bold text-[var(--text-main)] flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                <span>لوگو / آرم کلینیک (آدرس URL)</span>
              </label>
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:border-blue-500 outline-none dir-ltr font-mono text-[11px]"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="font-bold text-[var(--text-main)]">تلفن اصلی کلینیک</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="۰۲۱-۸۸۸۸۹۹۹۹"
                className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:border-blue-500 outline-none dir-ltr"
              />
            </div>

            {/* Emergency Phone */}
            <div className="space-y-1.5">
              <label className="font-bold text-[var(--text-main)]">تلفن اضطراری / همراه پشتیبانی</label>
              <input
                type="text"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder="۰۹۱۲۱۱۱۱۱۱۱"
                className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:border-blue-500 outline-none dir-ltr"
              />
            </div>

            {/* License Number */}
            <div className="space-y-1.5">
              <label className="font-bold text-[var(--text-main)]">شماره پروانه کسب / پروانه پزشکی</label>
              <input
                type="text"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="م/۱۲۳۴۵/الف"
                className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:border-blue-500 outline-none"
              />
            </div>

            {/* Tax Number */}
            <div className="space-y-1.5">
              <label className="font-bold text-[var(--text-main)]">کد اقتصادی / شناسه ملی</label>
              <input
                type="text"
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
                placeholder="۱۴۰۰۵۵۶۶۷۷۸"
                className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:border-blue-500 outline-none dir-ltr"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="font-bold text-[var(--text-main)]">آدرس کامل پستی کلینیک</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="تهران، خیابان ولیعصر، بالاتر از ظفر، پلاک ۱۲۰"
                className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:border-blue-500 outline-none"
              />
            </div>

            {/* Working Hours */}
            <div className="space-y-1.5">
              <label className="font-bold text-[var(--text-main)] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>ساعات کاری رسمی</span>
              </label>
              <input
                type="text"
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                placeholder="روزهای شنبه تا پنج‌شنبه: ۰۸:۰۰ الی ۲۱:۰۰"
                className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:border-blue-500 outline-none"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="font-bold text-[var(--text-main)]">توضیحات و معرفی کلینیک (جهت چاپ در سربرگ فاکتور)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="ارائه‌دهنده خدمات تخصصی پزشکی، جراحی محدود، رادیولوژی و آزمایشگاه آنلاین"
                className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:border-blue-500 outline-none"
              />
            </div>

            {/* Default Currency */}
            <div className="space-y-1.5">
              <label className="font-bold text-[var(--text-main)] flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                <span>واحد پول پیش‌فرض</span>
              </label>
              <select
                value={defaultCurrency}
                onChange={(e) => setDefaultCurrency(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:border-blue-500 outline-none"
              >
                <option value="تومان">تومان (Toman)</option>
                <option value="ریال">ریال (IRR)</option>
              </select>
            </div>

            {/* Default Language */}
            <div className="space-y-1.5">
              <label className="font-bold text-[var(--text-main)] flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>زبان پیش‌فرض رابط کاربری</span>
              </label>
              <select
                value={defaultLanguage}
                onChange={(e) => setDefaultLanguage(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:border-blue-500 outline-none"
              >
                <option value="فارسی">فارسی (Persian)</option>
                <option value="English">English</option>
              </select>
            </div>

            {/* Default Printer */}
            <div className="space-y-1.5">
              <label className="font-bold text-[var(--text-main)] flex items-center gap-1">
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>پرینتر پیش‌فرض قبوض</span>
              </label>
              <select
                value={defaultPrinter}
                onChange={(e) => setDefaultPrinter(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:border-blue-500 outline-none"
              >
                <option value="حرارتی ۸۰ میلی‌متری (فاکتور)">پرینتر حرارتی ۸۰ میلی‌متری (80mm Thermal)</option>
                <option value="پرینتر A5 ملخی">پرینتر A5 ملخی / لیزری</option>
                <option value="پرینتر A4 لیزری">پرینتر A4 رسمی (دی‌سایز)</option>
              </select>
            </div>

            {/* Receipt Template */}
            <div className="space-y-1.5">
              <label className="font-bold text-[var(--text-main)] flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>قالب چاپی فاکتور و قبوض</span>
              </label>
              <select
                value={receiptTemplate}
                onChange={(e) => setReceiptTemplate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:border-blue-500 outline-none"
              >
                <option value="استاندارد حرارتی">قالب ۱: استاندارد فیش پرینتر حرارتی</option>
                <option value="A5 ملخی رسمی">قالب ۲: سربرگ‌دار A5 دوبرگی</option>
                <option value="A4 سربرگ‌دار">قالب ۳: فاکتور رسمی صورتحساب A4</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition"
            >
              <Save className="w-4 h-4" />
              <span>ذخیره تغییرات شناسنامه کلینیک</span>
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: SAFE DATA RESET */}
      <div className="bg-[var(--bg-surface)] border border-rose-200 dark:border-rose-900/40 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-rose-200 dark:border-rose-900/40 pb-4">
          <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400 font-bold text-sm">
            <Trash2 className="w-5 h-5" />
            <span>پاکسازی ایمن داده‌ها (Safe Data Reset)</span>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            ویژه کلینیک جدید / راه‌اندازی اولیه
          </span>
        </div>

        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          دکمه «پاکسازی داده‌های عملیاتی کلینیک» نرم‌افزار را برای شروع به کار یک کلینیک جدید با پایگاه‌داده عملیاتی کاملاً تمیز آماده می‌سازد بدون اینکه ساختار برنامه یا اطلاعات پایه آسیب ببیند.
        </p>

        {/* Data Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          {/* Box 1: What WILL BE DELETED */}
          <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-200 dark:border-rose-900/30 space-y-3">
            <h3 className="font-bold text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>داده‌های عملیاتی حذف‌شونده (Delete Operational Data):</span>
            </h3>
            <ul className="grid grid-cols-2 gap-1.5 text-[11px] text-rose-900 dark:text-rose-200 font-medium">
              <li className="flex items-center gap-1.5">✓ پرونده بیماران (Patients)</li>
              <li className="flex items-center gap-1.5">✓ سوابق ویزیت‌ها (Visits)</li>
              <li className="flex items-center gap-1.5">✓ پرونده‌های پزشکی (Records)</li>
              <li className="flex items-center gap-1.5">✓ دستورات بالینی (Orders)</li>
              <li className="flex items-center gap-1.5">✓ فاکتورها و قبوض (Invoices)</li>
              <li className="flex items-center gap-1.5">✓ پرداخت‌ها و دریافتی‌ها</li>
              <li className="flex items-center gap-1.5">✓ دفاتر مالی و دفاتردار</li>
              <li className="flex items-center gap-1.5">✓ نوبت‌ها و صف انتظار</li>
              <li className="flex items-center gap-1.5">✓ تاریخچه شیفت‌ها (Histories)</li>
              <li className="flex items-center gap-1.5">✓ تحویل شیفت‌ها (Handovers)</li>
              <li className="flex items-center gap-1.5">✓ اعلان‌ها و لاگ‌های فعالیت</li>
              <li className="flex items-center gap-1.5">✓ فایل‌های موقت و PDFها</li>
            </ul>
          </div>

          {/* Box 2: What WILL BE KEPT */}
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-200 dark:border-emerald-900/30 space-y-3">
            <h3 className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>اطلاعات پایه محفوظ‌مانده (Keep Master Data):</span>
            </h3>
            <ul className="grid grid-cols-2 gap-1.5 text-[11px] text-emerald-900 dark:text-emerald-200 font-medium">
              <li className="flex items-center gap-1.5">✓ کاتالوگ داروها (Medicines)</li>
              <li className="flex items-center gap-1.5">✓ کاتالوگ خدمات و ویزیت‌ها</li>
              <li className="flex items-center gap-1.5">✓ دسته‌بندی خدمات کلینیک</li>
              <li className="flex items-center gap-1.5">✓ انواع بیمه‌های طرف قرارداد</li>
              <li className="flex items-center gap-1.5">✓ نقش‌ها و ماتریس دسترسی</li>
              <li className="flex items-center gap-1.5">✓ تنظیمات برنامه و تم‌ها</li>
              <li className="flex items-center gap-1.5">✓ پیکربندی شیفت‌ها (Schedule)</li>
              <li className="flex items-center gap-1.5">✓ قالب‌های چاپ و گزارشات</li>
            </ul>
          </div>
        </div>

        {/* Optional Checkboxes */}
        <div className="bg-[var(--bg-app)] border border-[var(--border-subtle)] p-4 rounded-xl space-y-3 text-xs">
          <h4 className="font-bold text-[var(--text-main)] flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-600" />
            <span>تنظیمات اختیاری پاکسازی اطلاعات پایه (Optional Reset Options):</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="flex items-center gap-2.5 cursor-pointer bg-[var(--bg-surface)] p-2.5 rounded-lg border border-[var(--border-subtle)] hover:border-purple-300 transition">
              <input
                type="checkbox"
                checked={resetOptions.deleteUsers}
                onChange={(e) => setResetOptions({ ...resetOptions, deleteUsers: e.target.checked })}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
              />
              <div>
                <span className="font-bold block text-[11px]">☐ حذف کاربران (Delete Users)</span>
                <span className="text-[10px] text-[var(--text-muted)]">حذف پرسنل غیرمدیر ارشد</span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer bg-[var(--bg-surface)] p-2.5 rounded-lg border border-[var(--border-subtle)] hover:border-purple-300 transition">
              <input
                type="checkbox"
                checked={resetOptions.deleteMedicines}
                onChange={(e) => setResetOptions({ ...resetOptions, deleteMedicines: e.target.checked })}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
              />
              <div>
                <span className="font-bold block text-[11px]">☐ حذف کاتالوگ داروها</span>
                <span className="text-[10px] text-[var(--text-muted)]">پاکسازی داروها و اقلام مصرفی</span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer bg-[var(--bg-surface)] p-2.5 rounded-lg border border-[var(--border-subtle)] hover:border-purple-300 transition">
              <input
                type="checkbox"
                checked={resetOptions.deleteServices}
                onChange={(e) => setResetOptions({ ...resetOptions, deleteServices: e.target.checked })}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
              />
              <div>
                <span className="font-bold block text-[11px]">☐ حذف کاتالوگ خدمات</span>
                <span className="text-[10px] text-[var(--text-muted)]">پاکسازی ویزیت‌ها و خدمات</span>
              </div>
            </label>
          </div>
        </div>

        {/* Reset Trigger Button */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span>قبل از اجرای پاکسازی، یک بکاپ کامل به صورت خودکار ایجاد می‌شود.</span>
          </div>

          <button
            onClick={() => setIsResetConfirmModalOpen(true)}
            className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>پاکسازی داده‌های کلینیک (Reset Clinic Data)</span>
          </button>
        </div>
      </div>

      {/* SECTION 3: BACKUP HISTORY & ROLLBACK POINT */}
      {systemResetReports.length > 0 && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <div className="flex items-center gap-2 text-purple-600 font-bold text-sm">
              <Archive className="w-5 h-5" />
              <span>تاریخچه پشتیبان‌های خودکار و نقاط بازیابی (Rollback Points)</span>
            </div>
            <span className="text-[11px] font-mono text-[var(--text-muted)]">
              تعداد نسخه‌ها: {systemResetReports.length}
            </span>
          </div>

          <div className="space-y-2">
            {systemResetReports.map((report) => (
              <div
                key={report.id}
                className="p-3 bg-[var(--bg-app)] rounded-xl border border-[var(--border-subtle)] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <strong className="font-bold text-purple-600 dark:text-purple-400 font-mono">
                      شناسه: {report.backupRefId}
                    </strong>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      ({report.date} - {report.time})
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    مجری: {report.administratorName} | حذفیات: {Object.values(report.deletedCounts).reduce((a: any, b: any) => (Number(a) || 0) + (Number(b) || 0), 0)} رکورد
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleRestoreBackup(report.backupRefId)}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center gap-1.5 transition shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>بازیابی دیتابیس (Rollback)</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONFIRMATION & SAFETY CHECKLIST MODAL */}
      {isResetConfirmModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[var(--bg-surface)] border border-rose-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 dir-rtl text-[var(--text-main)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
              <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 font-bold text-base">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
                <span>تایید نهایی و چک‌های ایمنی پاکسازی داده‌ها</span>
              </div>
              <button
                onClick={() => setIsResetConfirmModalOpen(false)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SAFETY CHECKLIST DISPLAY */}
            {safetyCheckResult && (
              <div className="p-4 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl space-y-2.5 text-xs">
                <span className="font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  چک‌لیست سلامت و ایمنی پیش از پاکسازی (Reset Safety Checklist)
                </span>

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                    <span>۱. نشست فعال مدیر ارشد سیستم (Admin Session):</span>
                    <span className={safetyCheckResult.sessionCheck ? 'text-emerald-600 font-bold flex items-center gap-1' : 'text-rose-600 font-bold'}>
                      {safetyCheckResult.sessionCheck ? <Check className="w-3.5 h-3.5" /> : 'نامعتبر'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                    <span>۲. عدم وجود صندوق/شیفت باز (Cashbox Status):</span>
                    <span className={safetyCheckResult.cashboxCheck ? 'text-emerald-600 font-bold flex items-center gap-1' : 'text-rose-600 font-bold'}>
                      {safetyCheckResult.cashboxCheck ? <Check className="w-3.5 h-3.5" /> : 'شیفت باز'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                    <span>۳. سلامت سامانه پشتیبان‌گیری (Backup System):</span>
                    <span className={safetyCheckResult.backupCheck ? 'text-emerald-600 font-bold flex items-center gap-1' : 'text-rose-600 font-bold'}>
                      {safetyCheckResult.backupCheck ? <Check className="w-3.5 h-3.5" /> : 'خطا'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                    <span>۴. آمادگی حافظه ذخیره‌سازی (Storage Read/Write):</span>
                    <span className={safetyCheckResult.storageCheck ? 'text-emerald-600 font-bold flex items-center gap-1' : 'text-rose-600 font-bold'}>
                      {safetyCheckResult.storageCheck ? <Check className="w-3.5 h-3.5" /> : 'محدود'}
                    </span>
                  </div>
                </div>

                {!safetyCheckResult.isPassed && (
                  <div className="p-2.5 bg-rose-500/10 text-rose-700 dark:text-rose-300 rounded-lg text-[10px] font-bold">
                    ⚠️ تذکر: به علت عدم احراز چک‌های بالا، امکان اجرای پاکسازی وجود ندارد.
                  </div>
                )}
              </div>
            )}

            {resetError && (
              <div className="p-3 bg-rose-600 text-white font-bold rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{resetError}</span>
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-[var(--text-main)] block">
                  ۱. جهت تایید نهایی عبارت <span className="text-rose-600 font-black dir-ltr inline-block">RESET</span> را تایپ کنید:
                </label>
                <input
                  type="text"
                  value={confirmKeyword}
                  onChange={(e) => setConfirmKeyword(e.target.value)}
                  placeholder="RESET"
                  className="w-full p-2.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-[var(--bg-app)] focus:border-rose-600 outline-none dir-ltr font-mono font-bold text-center text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[var(--text-main)] block">
                  ۲. رمز عبور مدیر ارشد سیستم (Administrator Password):
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:border-blue-500 outline-none dir-ltr font-mono text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => setIsResetConfirmModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 transition"
              >
                انصراف
              </button>

              <button
                type="button"
                onClick={handleExecuteReset}
                disabled={isResetting || (safetyCheckResult ? !safetyCheckResult.isPassed : false)}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition disabled:opacity-50"
              >
                {isResetting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>در حال ایجاد پشتیبان و پاکسازی...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>تایید و اجرای پاکسازی قطعی</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
