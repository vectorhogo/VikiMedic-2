/**
 * VikiMedic v2 - Initial Clinic Setup Wizard Modal (System Patch 01.1)
 * Clean Architecture Layer: Presentation Component
 */

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  Printer,
  Clock,
  Phone,
  MapPin,
  Globe,
  Mail,
  UserCheck,
  Users,
  ShieldCheck,
  Plus,
  Trash2,
  Database,
  PlayCircle,
  FileText,
  Activity,
  UserPlus,
  AlertTriangle,
  Stethoscope,
  HeartPulse,
} from 'lucide-react';
import { useClinic } from '../../../application/ClinicContext';
import { InitialStaffEntry, SystemHealthReport } from '../../../domain/types';

export const InitialClinicSetupWizardModal: React.FC = () => {
  const {
    activeClinic,
    updateClinicSettings,
    isSetupWizardOpen,
    setIsSetupWizardOpen,
    addNotification,
    loadDemoData,
    performSystemHealthCheck,
    createUser,
    addClinic,
  } = useClinic();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);

  // Step 1: Clinic Information
  const [name, setName] = useState(activeClinic?.name || '');
  const [logoUrl, setLogoUrl] = useState(activeClinic?.logoUrl || '');
  const [city, setCity] = useState(activeClinic?.city || 'تهران');
  const [address, setAddress] = useState(activeClinic?.address || '');
  const [phone, setPhone] = useState(activeClinic?.phone || '');
  const [email, setEmail] = useState(activeClinic?.email || 'info@clinic.ir');
  const [website, setWebsite] = useState(activeClinic?.website || 'www.clinic.ir');
  const [licenseNumber, setLicenseNumber] = useState(activeClinic?.licenseNumber || 'م/۱۲۳۴۵/الف');

  // Step 2: Working Hours & Shifts
  const [morningShiftHours, setMorningShiftHours] = useState(activeClinic?.morningShiftHours || '۰۸:۰۰ الی ۱۴:۰۰');
  const [eveningShiftHours, setEveningShiftHours] = useState(activeClinic?.eveningShiftHours || '۱۴:۰۰ الی ۲۰:۰۰');
  const [nightShiftHours, setNightShiftHours] = useState(activeClinic?.nightShiftHours || '۲۰:۰۰ الی ۰۸:۰۰ (آنکال)');

  // Step 3: Default Printers & Paper Size
  const [defaultPrinter, setDefaultPrinter] = useState(activeClinic?.defaultPrinter || 'حرارتی ۸۰ میلی‌متری (فاکتور)');
  const [a4Printer, setA4Printer] = useState(activeClinic?.a4Printer || 'پرینتر A4/A5 لیزری شبکه');
  const [defaultPaperSize, setDefaultPaperSize] = useState(activeClinic?.defaultPaperSize || '80mm');
  const [defaultCurrency, setDefaultCurrency] = useState(activeClinic?.defaultCurrency || 'تومان');

  // Step 4: Administrator
  const [adminFullName, setAdminFullName] = useState('مدیر ارشد سامانه');
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminPasswordConfirm, setAdminPasswordConfirm] = useState('');

  // Step 5: Initial Staff List
  const [initialStaff, setInitialStaff] = useState<InitialStaffEntry[]>([
    { id: '1', fullName: 'دکتر محمد حیدری', role: 'DOCTOR', specialty: 'عمومی و اورژانس', phone: '09121110001' },
    { id: '2', fullName: 'مریم رضایی', role: 'RECEPTIONIST', phone: '09121110002' },
  ]);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<InitialStaffEntry['role']>('DOCTOR');
  const [newStaffSpecialty, setNewStaffSpecialty] = useState('');

  // Step 6: Mode Selection & Health Check
  const [startupMode, setStartupMode] = useState<'PRODUCTION' | 'DEMO'>('PRODUCTION');
  const [healthCheckResult, setHealthCheckResult] = useState<SystemHealthReport | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (currentStep === 6 && !healthCheckResult) {
      const res = performSystemHealthCheck();
      setHealthCheckResult(res);
    }
  }, [currentStep]);

  if (!isSetupWizardOpen) return null;

  const handleAddStaffMember = () => {
    if (!newStaffName.trim()) return;
    setInitialStaff((prev) => [
      ...prev,
      {
        id: 'staff-' + Date.now(),
        fullName: newStaffName.trim(),
        role: newStaffRole,
        specialty: newStaffSpecialty,
      },
    ]);
    setNewStaffName('');
    setNewStaffSpecialty('');
  };

  const handleRemoveStaffMember = (id: string) => {
    setInitialStaff((prev) => prev.filter((s) => s.id !== id));
  };

  const handleFinishWizard = () => {
    if (!activeClinic) return;

    // 1. Update Clinic Settings
    updateClinicSettings({
      ...activeClinic,
      name: name || 'کلینیک پزشکی تندرستی',
      logoUrl,
      city,
      address,
      phone,
      email,
      website,
      licenseNumber,
      morningShiftHours,
      eveningShiftHours,
      nightShiftHours,
      workingHours: `${morningShiftHours} - ${eveningShiftHours}`,
      defaultPrinter,
      a4Printer,
      defaultPaperSize,
      defaultCurrency,
    });

    // 2. Create Initial Staff if provided
    initialStaff.forEach((s) => {
      try {
        createUser({
          fullName: s.fullName,
          role: s.role === 'DOCTOR' ? 'DOCTOR' : s.role === 'RECEPTIONIST' ? 'RECEPTIONIST' : s.role === 'NURSE' ? 'NURSE' : s.role === 'ACCOUNTANT' ? 'ACCOUNTANT' : 'RECEPTIONIST',
          phoneNumber: s.phone || '09120000000',
          specialty: s.specialty,
        });
      } catch {
        // Ignore duplicate or existing admin
      }
    });

    // 3. Handle Demo vs Production Data Mode
    if (startupMode === 'DEMO') {
      const res = loadDemoData();
      addNotification(`حالت آزمایشی با ${res.patientsCount} بیمار و ${res.visitsCount} ویزیت فعال شد.`, 'success');
    } else {
      addNotification(`کلینیک با حالت عملیاتی خام (تولید) با موفقیت راه‌اندازی گردید.`, 'success');
    }

    // 4. Mark finished and show welcome summary screen
    setIsFinished(true);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 dir-rtl text-[var(--text-main)] relative overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Decorative Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-base font-black">ویزارد راه‌اندازی و مقداردهی اولیه کلینیک</h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                پیکربندی هوشمند هویت، ساعات کاری، پرینترها، مدیر سیستم و حالت داده‌های اولیه
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSetupWizardOpen(false)}
            className="p-1.5 rounded-xl text-[var(--text-muted)] hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Stepper Progress Indicator */}
        {!isFinished && (
          <div className="grid grid-cols-6 gap-1.5 text-center text-xs">
            {[
              { step: 1, label: 'هویت' },
              { step: 2, label: 'ساعات' },
              { step: 3, label: 'چاپگر' },
              { step: 4, label: 'مدیریت' },
              { step: 5, label: 'پرسنل' },
              { step: 6, label: 'راه اندازی' },
            ].map((item) => (
              <div
                key={item.step}
                className={`p-2 rounded-xl border transition ${
                  currentStep === item.step
                    ? 'bg-purple-600 text-white border-purple-600 font-bold shadow-md'
                    : currentStep > item.step
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-300 dark:border-emerald-800 font-bold'
                    : 'bg-[var(--bg-app)] text-[var(--text-muted)] border-[var(--border-subtle)]'
                }`}
              >
                <div className="text-[9px]">گام {item.step}</div>
                <div className="text-[10px] truncate">{item.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* STEP 1: CLINIC IDENTITY & CONTACT */}
        {!isFinished && currentStep === 1 && (
          <div className="space-y-4 text-xs animate-in fade-in">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-700 dark:text-blue-300 font-bold flex items-center gap-2">
              <Building2 className="w-4 h-4 shrink-0" />
              <span>گام ۱: مشخصات شناسه، برند، آدرس و تماس درمانگاه</span>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="font-bold text-[var(--text-main)] block">
                  نام رسمی کلینیک / درمانگاه <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: کلینیک تخصصی و فوق‌تخصصی درمان مهر"
                  className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:border-purple-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-[var(--text-main)] block">شهر اصلی</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="تهران"
                    className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:border-purple-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[var(--text-main)] block">آدرس اینترنتی لوگو (Logo URL)</label>
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:border-purple-500 outline-none dir-ltr font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[var(--text-main)] block">آدرس پستی کامل کلینیک</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="تهران، خیابان ولیعصر، بالاتر از ظفر، پلاک ۱۲۰"
                  className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:border-purple-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-[var(--text-main)] block">تلفن ثابت کلینیک</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="۰۲۱-۸۸۸۸۹۹۹۹"
                    className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:border-purple-500 outline-none dir-ltr"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[var(--text-main)] block">پست الکترونیک (Email)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="info@clinic.ir"
                    className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:border-purple-500 outline-none dir-ltr"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[var(--text-main)] block">وب‌سایت (اختیاری)</label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="www.clinic.ir"
                    className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:border-purple-500 outline-none dir-ltr"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: WORKING HOURS & SHIFTS */}
        {!isFinished && currentStep === 2 && (
          <div className="space-y-4 text-xs animate-in fade-in">
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-700 dark:text-purple-300 font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 shrink-0" />
              <span>گام ۲: تنظیم ساعات کاری رسمی و بازه‌های نوبت‌دهی شیفت‌ها</span>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="font-bold text-[var(--text-main)] block">شیفت صبح (Working Hours Morning)</label>
                <input
                  type="text"
                  value={morningShiftHours}
                  onChange={(e) => setMorningShiftHours(e.target.value)}
                  placeholder="۰۸:۰۰ الی ۱۴:۰۰"
                  className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:border-purple-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[var(--text-main)] block">شیفت عصر (Working Hours Evening)</label>
                <input
                  type="text"
                  value={eveningShiftHours}
                  onChange={(e) => setEveningShiftHours(e.target.value)}
                  placeholder="۱۴:۰۰ الی ۲۰:۰۰"
                  className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:border-purple-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[var(--text-main)] block">شیفت شب / آنلاین (Working Hours Night)</label>
                <input
                  type="text"
                  value={nightShiftHours}
                  onChange={(e) => setNightShiftHours(e.target.value)}
                  placeholder="۲۰:۰۰ الی ۰۸:۰۰ (آنکال و اورژانس)"
                  className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:border-purple-500 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: DEFAULT PRINTERS & FINANCIAL */}
        {!isFinished && currentStep === 3 && (
          <div className="space-y-4 text-xs animate-in fade-in">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-2">
              <Printer className="w-4 h-4 shrink-0" />
              <span>گام ۳: انتخاب پرینترهای پیش‌فرض، ابعاد کاغذ و واحد پول</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-[var(--text-main)] block">پرینتر قبوض و فاکتور حرارتی</label>
                <select
                  value={defaultPrinter}
                  onChange={(e) => setDefaultPrinter(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:border-purple-500 outline-none"
                >
                  <option value="حرارتی ۸۰ میلی‌متری (فاکتور)">پرینتر حرارتی ۸۰ میلی‌متری (فاکتور فوری)</option>
                  <option value="پرینتر فیش حرارتی ۵۸ میلی‌متری">پرینتر فیش حرارتی ۵۸ میلی‌متری</option>
                  <option value="پرینتر لیزری A5">پرینتر لیزری A5</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[var(--text-main)] block">پرینتر نسخه و گزارشات A4</label>
                <select
                  value={a4Printer}
                  onChange={(e) => setA4Printer(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:border-purple-500 outline-none"
                >
                  <option value="پرینتر A4/A5 لیزری شبکه">پرینتر HP Laser304 / Canon A4 شبکه</option>
                  <option value="پرینتر A4 جوهرافشان رنگی">پرینتر A4 جوهرافشان رنگی</option>
                  <option value="خروجی مستقیم PDF (بدون چاپ)">خروجی مستقیم PDF (بدون چاپ)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[var(--text-main)] block">سایز کاغذ پیش‌فرض فاکتور</label>
                <select
                  value={defaultPaperSize}
                  onChange={(e) => setDefaultPaperSize(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:border-purple-500 outline-none"
                >
                  <option value="80mm">کاغذ حرارتی ۸۰ میلی‌متری</option>
                  <option value="A5">سایز استاندارد A5 سربرگ‌دار</option>
                  <option value="A4">سایز استاندارد A4 رسمی</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[var(--text-main)] block">واحد پول حسابداری</label>
                <select
                  value={defaultCurrency}
                  onChange={(e) => setDefaultCurrency(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:border-purple-500 outline-none"
                >
                  <option value="تومان">تومان (Toman)</option>
                  <option value="ریال">ریال (IRR)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: ADMINISTRATOR ACCOUNT */}
        {!isFinished && currentStep === 4 && (
          <div className="space-y-4 text-xs animate-in fade-in">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-700 dark:text-amber-300 font-bold flex items-center gap-2">
              <UserCheck className="w-4 h-4 shrink-0" />
              <span>گام ۴: تایید یا ایجاد حساب مدیر ارشد کلینیک (Administrator)</span>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="font-bold text-[var(--text-main)] block">نام و نام خانوادگی مدیر ارشد</label>
                <input
                  type="text"
                  value={adminFullName}
                  onChange={(e) => setAdminFullName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:border-purple-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-[var(--text-main)] block">نام کاربری ارشد (Username)</label>
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:border-purple-500 outline-none dir-ltr font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[var(--text-main)] block">رمز عبور اصلی (Password)</label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:border-purple-500 outline-none dir-ltr font-mono"
                  />
                </div>
              </div>

              <p className="text-[11px] text-[var(--text-muted)] bg-amber-500/5 p-2.5 rounded-xl border border-amber-500/10">
                💡 این حساب کاربری دسترسی کامل به تمامی بخش‌های مالی، مدیریت پرسنل و پاکسازی داده‌ها خواهد داشت.
              </p>
            </div>
          </div>
        )}

        {/* STEP 5: INITIAL STAFF LIST */}
        {!isFinished && currentStep === 5 && (
          <div className="space-y-4 text-xs animate-in fade-in">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-700 dark:text-indigo-300 font-bold flex items-center gap-2">
              <Users className="w-4 h-4 shrink-0" />
              <span>گام ۵: تعریف پرسنل اولیه درمانگاه (پزشکان، پذیرش، پرستاری)</span>
            </div>

            {/* Staff Entry Form */}
            <div className="p-3 bg-[var(--bg-app)] rounded-2xl border border-[var(--border-subtle)] space-y-2">
              <span className="font-bold block text-[11px]">افزودن عضو جدید تیم</span>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="نام و نام خانوادگی"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="p-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] outline-none"
                />

                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value as any)}
                  className="p-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] outline-none"
                >
                  <option value="DOCTOR">پزشک معالج</option>
                  <option value="RECEPTIONIST">مسئول پذیرش</option>
                  <option value="NURSE">پرستار / بهیار</option>
                  <option value="ACCOUNTANT">حسابدار / مالی</option>
                  <option value="SECURITY">نگهبان / انتظام</option>
                </select>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="تخصص / توضیحات"
                    value={newStaffSpecialty}
                    onChange={(e) => setNewStaffSpecialty(e.target.value)}
                    className="w-full p-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddStaffMember}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold flex items-center shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Staff Table / List */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {initialStaff.length === 0 ? (
                <div className="p-4 text-center text-[var(--text-muted)] bg-[var(--bg-app)] rounded-xl">
                  هیچ پرسنل اولیه اضافه نشده است (می‌توانید بعداً اضافه کنید).
                </div>
              ) : (
                initialStaff.map((s) => (
                  <div
                    key={s.id}
                    className="p-2.5 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 font-bold flex items-center justify-center text-[10px]">
                        {s.role === 'DOCTOR' ? 'دکتر' : 'پرسنل'}
                      </div>
                      <div>
                        <strong className="block text-xs font-bold">{s.fullName}</strong>
                        <span className="text-[10px] text-[var(--text-muted)]">
                          نقش: {s.role} {s.specialty ? `(${s.specialty})` : ''}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveStaffMember(s.id)}
                      className="text-rose-500 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* STEP 6: DEMO MODE VS PRODUCTION MODE & HEALTH CHECK */}
        {!isFinished && currentStep === 6 && (
          <div className="space-y-4 text-xs animate-in fade-in">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-2">
              <Database className="w-4 h-4 shrink-0" />
              <span>گام ۶: انتخاب حالت راه‌اندازی و بررسی سلامت پایگاه داده</span>
            </div>

            {/* Mode Option Cards */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStartupMode('PRODUCTION')}
                className={`p-4 rounded-2xl border text-right transition flex flex-col justify-between ${
                  startupMode === 'PRODUCTION'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-lg'
                    : 'bg-[var(--bg-app)] border-[var(--border-subtle)] hover:border-purple-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <ShieldCheck className="w-6 h-6" />
                    {startupMode === 'PRODUCTION' && <CheckCircle2 className="w-5 h-5 text-emerald-300" />}
                  </div>
                  <strong className="block text-sm font-black mb-1">حالت تولید (Production Mode)</strong>
                  <p className={`text-[11px] ${startupMode === 'PRODUCTION' ? 'text-purple-100' : 'text-[var(--text-muted)]'}`}>
                    راه‌اندازی کلینیک به‌صورت خام و بدون داده آزمایشی (مناسب برای شروع به کار واقعی درمانگاه)
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setStartupMode('DEMO')}
                className={`p-4 rounded-2xl border text-right transition flex flex-col justify-between ${
                  startupMode === 'DEMO'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                    : 'bg-[var(--bg-app)] border-[var(--border-subtle)] hover:border-blue-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <PlayCircle className="w-6 h-6" />
                    {startupMode === 'DEMO' && <CheckCircle2 className="w-5 h-5 text-emerald-300" />}
                  </div>
                  <strong className="block text-sm font-black mb-1">حالت آزمایشی (Demo Mode)</strong>
                  <p className={`text-[11px] ${startupMode === 'DEMO' ? 'text-blue-100' : 'text-[var(--text-muted)]'}`}>
                    بارگذاری داده‌های نمونه شامل بیماران، پرونده‌های پزشکی، تراکنش‌های مالی و گزارشات برای تست امکانات
                  </p>
                </div>
              </button>
            </div>

            {/* System Health Check Report */}
            {healthCheckResult && (
              <div className="p-3 bg-[var(--bg-app)] rounded-2xl border border-[var(--border-subtle)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1 text-[11px]">
                    <Activity className="w-3.5 h-3.5 text-emerald-500" />
                    گزارش بررسی یکپارچگی و سلامت سیستم
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-[10px]">
                    {healthCheckResult.passed ? 'سالم و آماده' : 'دارای هشدار'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="flex items-center gap-1 text-emerald-600">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>یکپارچگی دیتابیس: تایید شده</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>تست خواندن و نوشتن حافظه: موفق</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>بررسی روابط پرونده‌ها: معتبر</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>نسخه‌های پشتیبان: فعال</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* FINISHED WELCOME SCREEN SUMMARY */}
        {isFinished && (
          <div className="space-y-6 text-xs animate-in zoom-in-95 duration-200 text-center py-4">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 rounded-3xl mx-auto flex items-center justify-center font-bold shadow-inner">
              <CheckCircle2 className="w-10 h-10 animate-pulse" />
            </div>

            <div>
              <h2 className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                به سامانه مدیریت درمانگاه VikiMedic خوش آمدید!
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-1 max-w-lg mx-auto">
                کلینیک <strong className="text-[var(--text-main)]">{name}</strong> با موفقیت پیکربندی و آماده پذیرش بیماران گردید.
              </p>
            </div>

            {/* Next Suggested Actions */}
            <div className="p-4 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-2xl text-right space-y-3">
              <span className="font-bold text-purple-600 dark:text-purple-400 block text-xs">
                🚀 اقدامات پیشنهادی بعدی جهت تکمیل فرایند:
              </span>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>تکمیل لیست پزشکان و منشی‌ها</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-purple-500 shrink-0" />
                  <span>بررسی خدمات و تعرفه‌های درمانگاه</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>بررسی لیست داروهای داروخانه</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center gap-2">
                  <Printer className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>تست چاپی اولین فاکتور بیمار</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSetupWizardOpen(false)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl transition"
            >
              ورود به داشبورد اصلی کلینیک
            </button>
          </div>
        )}

        {/* Navigation Controls (Steps 1 to 6) */}
        {!isFinished && (
          <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
            <button
              type="button"
              disabled={currentStep === 1}
              onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-200 transition disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
              <span>گام قبلی</span>
            </button>

            {currentStep < 6 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => (prev + 1) as any)}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition"
              >
                <span>گام بعدی</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinishWizard}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition animate-bounce-short"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تایید نهایی و راه‌اندازی کلینیک</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
