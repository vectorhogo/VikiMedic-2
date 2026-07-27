/**
 * VikiMedic v2 - Dedicated Create User Form Component
 * Settings -> User Management -> Create User
 */

import React, { useState } from 'react';
import {
  User,
  Shield,
  Briefcase,
  Key,
  Building2,
  Calendar,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  RefreshCw,
  Sliders,
  Sparkles,
  ArrowRight,
  FileText,
  Clock,
  UserCheck,
  ChevronDown,
} from 'lucide-react';
import { useClinic } from '../../../application/ClinicContext';
import {
  UserRole,
  AccountStatus,
  EmploymentType,
  UserStaff,
  ModulePermissionsMap,
  SystemModuleKey,
  PermissionAction,
  FieldPermissionKey,
  SpecialPermissionKey,
} from '../../../domain/types';
import {
  SYSTEM_MODULE_DEFINITIONS,
  ALL_PERMISSION_ACTIONS,
  DEFAULT_ROLE_PERMISSIONS,
  FIELD_PERMISSIONS,
  SPECIAL_PERMISSIONS,
} from '../../../domain/permissions';

interface CreateUserFormProps {
  onSuccess?: (createdUser: UserStaff) => void;
  onCancel?: () => void;
}

export const CreateUserForm: React.FC<CreateUserFormProps> = ({ onSuccess, onCancel }) => {
  const { clinics, createUser, staffList } = useClinic();

  // Step / Tab state for smooth navigation
  const [activeStep, setActiveStep] = useState<'personal' | 'employment' | 'account' | 'permissions'>('personal');

  // Form Field States - Personal
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [personnelCode, setPersonnelCode] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [birthDate, setBirthDate] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [medicalCouncilNumber, setMedicalCouncilNumber] = useState('');
  const [specialty, setSpecialty] = useState('');

  // Form Field States - Employment
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('پذیرش و خدمات');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('FULL_TIME');
  const [startDate, setStartDate] = useState(() => new Date().toLocaleDateString('fa-IR'));
  const [endDate, setEndDate] = useState('');
  const [selectedClinicIds, setSelectedClinicIds] = useState<string[]>(
    clinics.map((c) => c.id)
  );
  const [assignedShifts, setAssignedShifts] = useState<('MORNING' | 'EVENING' | 'NIGHT')[]>(['MORNING']);

  // Form Field States - Account
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<UserRole>('RECEPTIONIST');
  const [accountStatus, setAccountStatus] = useState<AccountStatus>('ACTIVE');
  const [permissionProfileType, setPermissionProfileType] = useState<'ROLE_DEFAULT' | 'CUSTOM'>('ROLE_DEFAULT');
  const [passwordMode, setPasswordMode] = useState<'AUTO' | 'CUSTOM'>('AUTO');
  const [customPassword, setCustomPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forcePasswordChange, setForcePasswordChange] = useState(true);

  // Custom Permissions Matrix State
  const [customModules, setCustomModules] = useState<ModulePermissionsMap>(() =>
    JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMISSIONS.RECEPTIONIST))
  );
  const [customFields, setCustomFields] = useState<Record<FieldPermissionKey, boolean>>({
    VIEW_NATIONAL_ID: true,
    VIEW_FINANCIAL_BALANCES: false,
    EDIT_PATIENT_NATIONAL_ID: false,
  });
  const [customSpecials, setCustomSpecials] = useState<Record<SpecialPermissionKey, boolean>>({
    MANAGE_SYSTEM_SETTINGS: false,
    OVERRIDE_SHIFT: false,
    BYPASS_QUEUE: false,
    VOID_INVOICE: false,
    EXPORT_CONFIDENTIAL_LOGS: false,
  });

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-generate credentials button helper
  const handleAutoGenerateCredentials = () => {
    if (firstName && lastName) {
      const latinPrefix = 'user_' + Math.floor(1000 + Math.random() * 9000);
      setUsername(latinPrefix);
    } else {
      setUsername('user_' + Math.floor(1000 + Math.random() * 9000));
    }
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (DEFAULT_ROLE_PERMISSIONS[newRole]) {
      setCustomModules(JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMISSIONS[newRole])));
    }
  };

  // Form Validation
  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!firstName.trim()) errs.firstName = 'نام الزامی است.';
    if (!lastName.trim()) errs.lastName = 'نام خانوادگی الزامی است.';

    if (!mobile.trim()) {
      errs.mobile = 'شماره موبایل الزامی است.';
    } else if (!/^09\d{9}$/.test(mobile.trim().replace(/[۰-۹]/g, (d) => '0123456789'['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)]))) {
      errs.mobile = 'شماره موبایل معتبر نیست (مثال: 09123456789).';
    }

    if (!username.trim()) {
      errs.username = 'نام کاربری الزامی است.';
    } else if (username.length < 3) {
      errs.username = 'نام کاربری باید حداقل ۳ کاراکتر باشد.';
    } else {
      // Check duplicate username
      const dup = staffList.find((u) => u.username?.toLowerCase() === username.trim().toLowerCase());
      if (dup) {
        errs.username = 'این نام کاربری قبلاً در سیستم ثبت شده است.';
      }
    }

    if (passwordMode === 'CUSTOM') {
      if (!customPassword) {
        errs.customPassword = 'رمز عبور سفارشی الزامی است.';
      } else if (customPassword.length < 6) {
        errs.customPassword = 'رمز عبور باید حداقل ۶ کاراکتر باشد.';
      }
    }

    if (selectedClinicIds.length === 0) {
      errs.clinicIds = 'انتخاب حداقل یک شعبه/کلینیک الزامی است.';
    }

    if (!title.trim()) {
      errs.title = 'عنوان شغلی الزامی است.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      // Jump to step with error
      if (errors.firstName || errors.lastName || errors.mobile) {
        setActiveStep('personal');
      } else if (errors.title || errors.clinicIds) {
        setActiveStep('employment');
      } else if (errors.username || errors.customPassword) {
        setActiveStep('account');
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const generatedPass = passwordMode === 'CUSTOM' ? customPassword : 'Viki' + Math.floor(100000 + Math.random() * 900000);

      const createdUser = createUser({
        firstName,
        lastName,
        nationalId,
        personnelCode,
        mobile,
        phone: mobile,
        email,
        gender,
        birthDate,
        address,
        notes,
        medicalCouncilNumber,
        specialty,

        title,
        department,
        employmentType,
        startDate,
        endDate,
        clinicIds: selectedClinicIds,
        assignedShifts,

        username: username.trim(),
        role,
        accountStatus,
        permissionProfileType,
        customModulePermissions: permissionProfileType === 'CUSTOM' ? customModules : undefined,
        customFieldPermissions: permissionProfileType === 'CUSTOM' ? customFields : undefined,
        customSpecialPermissions: permissionProfileType === 'CUSTOM' ? customSpecials : undefined,

        temporaryPassword: generatedPass,
      });

      setIsSubmitting(false);
      if (onSuccess) {
        onSuccess(createdUser);
      }
    } catch (err) {
      setIsSubmitting(false);
      console.error('Failed to create user:', err);
    }
  };

  // Toggle Module Permission Cell
  const toggleModuleAction = (modKey: SystemModuleKey, act: PermissionAction) => {
    setCustomModules((prev) => {
      const currentActions = prev[modKey] || [];
      const hasAction = currentActions.includes(act);
      const newActions = hasAction
        ? currentActions.filter((a) => a !== act)
        : [...currentActions, act];
      return {
        ...prev,
        [modKey]: newActions,
      };
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-1/3 -top-10 w-40 h-40 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Shield className="w-4 h-4" />
              <span>پچ ۰۳.۰ - پایه مدیریت کاربران و دسترسی‌ها</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">ایجاد کاربر جدید در سیستم</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
              ثبت مشخصات پرسنلی، تعیین نقش سازمانی، اختصاص شعب فعالیت و پیکربندی سطح دسترسی ماژول‌ها.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition"
              >
                انصراف و بازگشت
              </button>
            )}
          </div>
        </div>

        {/* Step Navigation Bar */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => setActiveStep('personal')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition ${
              activeStep === 'personal'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>۱. اطلاعات فردی</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStep('employment')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition ${
              activeStep === 'employment'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>۲. انتصاب شغلی</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStep('account')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition ${
              activeStep === 'account'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>۳. حساب و امنیت</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStep('permissions')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition ${
              activeStep === 'permissions'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>۴. سطح دسترسی</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
        {/* Validation Alert */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-rose-900">خطا در ثبت اطلاعات کاربر</h4>
              <p className="text-xs text-rose-700 mt-1">
                لطفاً خطاهای مشخص‌شده در فرم زیر را برطرف کنید.
              </p>
              <ul className="list-disc list-inside text-xs text-rose-600 mt-2 space-y-1">
                {Object.values(errors).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* STEP 1: Personal Information */}
        {activeStep === 'personal' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                  ۱
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">مشخصات شناختی و فردی</h3>
                  <p className="text-xs text-slate-5-0">اطلاعات هویت پرسنلی و راه‌های ارتباطی مستقیم</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* First Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  نام <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="مثال: کامران"
                  className={`w-full h-11 px-3.5 rounded-xl border text-sm focus:outline-none transition ${
                    errors.firstName
                      ? 'border-rose-400 bg-rose-50/50 text-rose-900'
                      : 'border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10'
                  }`}
                />
                {errors.firstName && <span className="text-[11px] text-rose-600 mt-1 block">{errors.firstName}</span>}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  نام خانوادگی <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="مثال: احمدی"
                  className={`w-full h-11 px-3.5 rounded-xl border text-sm focus:outline-none transition ${
                    errors.lastName
                      ? 'border-rose-400 bg-rose-50/50 text-rose-900'
                      : 'border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10'
                  }`}
                />
                {errors.lastName && <span className="text-[11px] text-rose-600 mt-1 block">{errors.lastName}</span>}
              </div>

              {/* National ID */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  کد ملی <span className="text-slate-400 font-normal">(اختیاری)</span>
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  placeholder="۱۰ رقم کد ملی"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                />
              </div>

              {/* Personnel Code */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  کد پرسنلی <span className="text-slate-400 font-normal">(اختیاری)</span>
                </label>
                <input
                  type="text"
                  value={personnelCode}
                  onChange={(e) => setPersonnelCode(e.target.value)}
                  placeholder="مثال: PER-1004"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                />
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  شماره همراه <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    dir="ltr"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="09123456789"
                    className={`w-full h-11 px-3.5 pl-10 rounded-xl border text-sm font-mono focus:outline-none transition ${
                      errors.mobile
                        ? 'border-rose-400 bg-rose-50/50 text-rose-900'
                        : 'border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10'
                    }`}
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                </div>
                {errors.mobile && <span className="text-[11px] text-rose-600 mt-1 block">{errors.mobile}</span>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  پست الکترونیک (ایمیل) <span className="text-slate-400 font-normal">(اختیاری)</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    dir="ltr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@vikimedic.ir"
                    className="w-full h-11 px-3.5 pl-10 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">جنسیت</label>
                <div className="grid grid-cols-2 gap-2 h-11 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setGender('MALE')}
                    className={`rounded-lg text-xs font-bold transition ${
                      gender === 'MALE' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    مرد
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('FEMALE')}
                    className={`rounded-lg text-xs font-bold transition ${
                      gender === 'FEMALE' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    زن
                  </button>
                </div>
              </div>

              {/* Medical Council Number (if Doctor) */}
              {role === 'DOCTOR' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">شماره نظام پزشکی</label>
                    <input
                      type="text"
                      value={medicalCouncilNumber}
                      onChange={(e) => setMedicalCouncilNumber(e.target.value)}
                      placeholder="مثال: ۱۰۴۵۸۲"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">تخصص / صلاحیت بالینی</label>
                    <input
                      type="text"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      placeholder="مثال: متخصص داخلی و فوق غدد"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Address & Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">آدرس سکونت / تماس</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="تهران، خیابان ..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">ملاحظات و توضیحات تکمیلی پرونده</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="توضیحات و سوابق انتظامی یا اداری..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setActiveStep('employment')}
                className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition"
              >
                <span>مرحله بعد: انتصاب شغلی</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Employment Information */}
        {activeStep === 'employment' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                  ۲
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">مشخصات انتصاب شغلی و شعب</h3>
                  <p className="text-xs text-slate-500">موقعیت اداری، بخش مربوطه، شیفت‌های کاری و شعب مجاز فعالیت</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Job Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  عنوان شغلی / پست سازمانی <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: سرپرست پذیرش و نوبت‌دهی"
                  className={`w-full h-11 px-3.5 rounded-xl border text-sm focus:outline-none transition ${
                    errors.title
                      ? 'border-rose-400 bg-rose-50/50 text-rose-900'
                      : 'border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10'
                  }`}
                />
                {errors.title && <span className="text-[11px] text-rose-600 mt-1 block">{errors.title}</span>}
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">بخش / دپارتمان</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-500 bg-white"
                >
                  <option value="مدیریت ارشد">مدیریت ارشد</option>
                  <option value="پزشکان">پزشکان و کادر درمان</option>
                  <option value="پذیرش و خدمات">پذیرش و خدمات مراجعین</option>
                  <option value="پرستاری">پرستاری و مراقبت</option>
                  <option value="امور مالی و حسابداری">امور مالی و حسابداری</option>
                  <option value="آزمایشگاه">آزمایشگاه و پاراکلینیک</option>
                  <option value="تصویربرداری">رادیولوژی و تصویربرداری</option>
                  <option value="حراست و امنیت">حراست و انتظامات</option>
                  <option value="پشتیبانی و فناوری">پشتیبانی و فناوری اطلاعات</option>
                </select>
              </div>

              {/* Employment Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">نوع استخدام / همکاری</label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-500 bg-white font-medium"
                >
                  <option value="FULL_TIME">تمام وقت (رسمی/پیمانی)</option>
                  <option value="PART_TIME">پاره وقت</option>
                  <option value="CONTRACT">قراردادی / ساعتی</option>
                  <option value="SHIFT_BASED">شیفتی / کیس پرفيس</option>
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">تاریخ شروع همکاری</label>
                <div className="relative">
                  <input
                    type="text"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="۱۴۰۳/۰۱/۰۱"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-500"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* End Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  تاریخ پایان قرارداد <span className="text-slate-400 font-normal">(در صورت وجود)</span>
                </label>
                <input
                  type="text"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="۱۴۰۳/۱۲/۲۹"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Multi-Clinic Selection */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    <span>شعب و کلینیک‌های مجاز فعالیت کاربر <span className="text-rose-500">*</span></span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    کاربر تنها قادر به ورود و مشاهده اطلاعات شعب علامت‌گذاری‌شده خواهد بود.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedClinicIds(clinics.map((c) => c.id))}
                    className="text-[11px] font-bold text-emerald-700 hover:underline"
                  >
                    انتخاب همه
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {clinics.map((c) => {
                  const isChecked = selectedClinicIds.includes(c.id);
                  return (
                    <label
                      key={c.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                        isChecked
                          ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedClinicIds((prev) => [...prev, c.id]);
                          } else {
                            setSelectedClinicIds((prev) => prev.filter((id) => id !== c.id));
                          }
                        }}
                        className="mt-1 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <div className="text-xs font-bold">{c.name}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          کد: {c.code} | {c.city}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
              {errors.clinicIds && <span className="text-[11px] text-rose-600 block">{errors.clinicIds}</span>}
            </div>

            {/* Shift Assignments */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>شیفت‌های کاری تخصیص‌یافته</span>
              </h4>
              <div className="flex flex-wrap gap-3">
                {[
                  { key: 'MORNING', label: 'شیفت صبح (۰۷:۳۰ الی ۱۵:۳۰)' },
                  { key: 'EVENING', label: 'شیفت عصر (۱۵:۳۰ الی ۲۳:۳۰)' },
                  { key: 'NIGHT', label: 'شیفت شب (۲۳:۳۰ الی ۰۷:۳۰)' },
                ].map((s) => {
                  const isChecked = assignedShifts.includes(s.key as any);
                  return (
                    <label
                      key={s.key}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer transition ${
                        isChecked
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAssignedShifts((prev) => [...prev, s.key as any]);
                          } else {
                            setAssignedShifts((prev) => prev.filter((x) => x !== s.key));
                          }
                        }}
                        className="rounded text-emerald-500 focus:ring-slate-900"
                      />
                      <span>{s.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setActiveStep('personal')}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                مرحله قبل
              </button>

              <button
                type="button"
                onClick={() => setActiveStep('account')}
                className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition"
              >
                <span>مرحله بعد: حساب و امنیت</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Account & Security */}
        {activeStep === 'account' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                  ۳
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">تنظیمات حساب کاربری و احراز هویت</h3>
                  <p className="text-xs text-slate-500">تعیین شناسه کاربری، نقش سازمانی، رمز عبور اولیه و وضعیت حساب</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Username */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  نام کاربری (شناسه ورود) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    dir="ltr"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="مثال: dr_ahmadi"
                    className={`w-full h-11 px-3.5 pr-10 rounded-xl border text-sm font-mono focus:outline-none transition ${
                      errors.username
                        ? 'border-rose-400 bg-rose-50/50 text-rose-900'
                        : 'border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10'
                    }`}
                  />
                  <UserCheck className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
                </div>
                {errors.username && <span className="text-[11px] text-rose-600 mt-1 block">{errors.username}</span>}
                <button
                  type="button"
                  onClick={handleAutoGenerateCredentials}
                  className="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold mt-1 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  پیشنهاد نام کاربری خودکار
                </button>
              </div>

              {/* System Role */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  نقش پیش‌فرض سیستم <span className="text-rose-500">*</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500 bg-white"
                >
                  <option value="ADMIN">Administrator (مدیر ارشد سیستم)</option>
                  <option value="CLINIC_MANAGER">Clinic Manager (مدیر کلینیک)</option>
                  <option value="DOCTOR">Doctor (پزشک)</option>
                  <option value="RECEPTIONIST">Receptionist (مسئول پذیرش)</option>
                  <option value="NURSE">Nurse (پرستار / کادر بالینی)</option>
                  <option value="ACCOUNTANT">Accountant (حسابدار / امور مالی)</option>
                  <option value="LAB_STAFF">Laboratory Staff (پرسنل آزمایشگاه)</option>
                  <option value="RADIOLOGY_STAFF">Radiology Staff (پرسنل تصویربرداری)</option>
                  <option value="SECURITY_GUARD">Security Guard (حراست / نگهبانی)</option>
                  <option value="GUEST">Guest (مهمان / کاربر محدود)</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  مجموعه دسترسی‌های پیش‌فرض این نقش بر روی پروفایل کاربر اعمال می‌شود.
                </p>
              </div>

              {/* Account Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">وضعیت اولیه حساب</label>
                <select
                  value={accountStatus}
                  onChange={(e) => setAccountStatus(e.target.value as AccountStatus)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm font-bold focus:outline-none focus:border-emerald-500 bg-white"
                >
                  <option value="ACTIVE">فعال (Active) - آماده بهره‌برداری</option>

                  <option value="INACTIVE">غیرفعال (Inactive)</option>
                  <option value="SUSPENDED">معلق (Suspended)</option>
                  <option value="LOCKED">قفل‌شده (Locked)</option>
                </select>
              </div>
            </div>

            {/* Password Configuration */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-emerald-600" />
                    <span>تنظیم رمز عبور اولیه کاربر</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    شما می‌توانید رمز عبور موقت توسط سیستم تولید کنید یا رمز عبور دستی تعیین نمایید.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                    passwordMode === 'AUTO'
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="pwd_mode"
                    checked={passwordMode === 'AUTO'}
                    onChange={() => setPasswordMode('AUTO')}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <div className="text-xs font-bold">تولید رمز عبور موقت هوشمند (پیشنهادی)</div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      یک رمز عبور امن اتفاقی (مثال: <span className="font-mono font-bold text-slate-800">Viki@1403</span>)
                      تولید و پس از ایجاد در اختار مدیر قرار می‌گیرد.
                    </div>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                    passwordMode === 'CUSTOM'
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="pwd_mode"
                    checked={passwordMode === 'CUSTOM'}
                    onChange={() => setPasswordMode('CUSTOM')}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <div className="text-xs font-bold">تعیین رمز عبور دستی توسط مدیر</div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      وارد کردن کلمه عبور اختصاصی که بر اساس شیوه‌نامه امنیت سنجیده می‌شود.
                    </div>
                  </div>
                </label>
              </div>

              {passwordMode === 'CUSTOM' && (
                <div className="pt-2 animate-in fade-in duration-150">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    رمز عبور جدید <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative max-w-md">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      dir="ltr"
                      value={customPassword}
                      onChange={(e) => setCustomPassword(e.target.value)}
                      placeholder="حداقل ۶ کاراکتر"
                      className="w-full h-11 px-3.5 pr-10 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.customPassword && (
                    <span className="text-[11px] text-rose-600 mt-1 block">{errors.customPassword}</span>
                  )}
                </div>
              )}

              <div className="pt-2 border-t border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={forcePasswordChange}
                    onChange={(e) => setForcePasswordChange(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    الزام کاربر به تغییر رمز عبور در نخستین ورود به سامانه (Force Change on First Login)
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setActiveStep('employment')}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                مرحله قبل
              </button>

              <button
                type="button"
                onClick={() => setActiveStep('permissions')}
                className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition"
              >
                <span>مرحله بعد: تنظیمات دسترسی</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Permissions Configuration */}
        {activeStep === 'permissions' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                  ۴
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">سازنده گرافیکی پروفایل دسترسی‌ها (Permission Builder)</h3>
                  <p className="text-xs text-slate-500">انتخاب مدل دسترسی پیش‌فرض نقش یا اعمال دسترسی‌های سفارشی ماژولار</p>
                </div>
              </div>
            </div>

            {/* Profile Selection Option */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label
                className={`p-4 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                  permissionProfileType === 'ROLE_DEFAULT'
                    ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-500/10'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="perm_profile"
                  checked={permissionProfileType === 'ROLE_DEFAULT'}
                  onChange={() => setPermissionProfileType('ROLE_DEFAULT')}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>استفاده از پروفایل استاندارد نقش ({role})</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] rounded-full">توصیه‌شده</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    دسترسی‌های این کاربر به صورت خودکار بر اساس شیوه‌نامه استاندارد نقش {role} ارزیابی و بروزرسانی می‌شود.
                  </p>
                </div>
              </label>

              <label
                className={`p-4 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                  permissionProfileType === 'CUSTOM'
                    ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-500/10'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="perm_profile"
                  checked={permissionProfileType === 'CUSTOM'}
                  onChange={() => setPermissionProfileType('CUSTOM')}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="text-sm font-bold text-slate-900">تعریف دسترسی‌های سفارشی و اختصاصی (Custom Matrix)</div>
                  <p className="text-xs text-slate-500 mt-1">
                    مستثنی کردن کاربر از الگوی پیش‌فرض و تنظیم دقیق مجوز‌های خواندن، ویرایش، حذف و تایید هر ماژول.
                  </p>
                </div>
              </label>
            </div>

            {/* Custom Permissions Grid Builder */}
            {permissionProfileType === 'CUSTOM' && (
              <div className="space-y-6 pt-2 animate-in fade-in duration-200">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    شما در حال تنظیم سطح دسترسی سفارشی برای این کاربر هستید. تغییرات بعدی نقش استاندارد، بر روی مجوزهای سفارشی این کاربر تاثیر نخواهد گذاشت.
                  </span>
                </div>

                {/* Modules Grid Table */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="bg-slate-900 text-white p-4 font-bold text-xs flex justify-between items-center">
                    <span>ماتریس دسترسی ماژول‌های عملیاتی</span>
                    <span className="text-[11px] text-slate-400 font-normal">کلید‌های دسترسی: R=خواندن | C=ایجاد | E=ویرایش | D=حذف | A=تایید | EX=خروجی</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 text-xs font-bold border-b border-slate-200">
                          <th className="p-3">نام ماژول</th>
                          {ALL_PERMISSION_ACTIONS.map((act) => (
                            <th key={act.key} className="p-3 text-center">
                              {act.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {SYSTEM_MODULE_DEFINITIONS.map((mod) => {
                          const currentActions = customModules[mod.key] || [];
                          return (
                            <tr key={mod.key} className="hover:bg-slate-50/80 transition">
                              <td className="p-3 font-bold text-slate-800">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                  <span>{mod.label}</span>
                                </div>
                                <div className="text-[10px] text-slate-400 font-normal pr-4">{mod.description}</div>
                              </td>

                              {ALL_PERMISSION_ACTIONS.map((act) => {
                                const isChecked = currentActions.includes(act.key);
                                return (
                                  <td key={act.key} className="p-3 text-center">
                                    <button
                                      type="button"
                                      onClick={() => toggleModuleAction(mod.key, act.key)}
                                      className={`w-7 h-7 rounded-lg text-[10px] font-black transition ${
                                        isChecked
                                          ? 'bg-emerald-600 text-white shadow-sm'
                                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                      }`}
                                    >
                                      {isChecked ? '✓' : '-'}
                                    </button>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Special Permissions Toggles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Field Level Permissions */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <h4 className="text-xs font-bold text-slate-900">دسترسی‌های فیلد‌محور (Field Level)</h4>
                    <div className="space-y-2">
                      {FIELD_PERMISSIONS.map((fp) => {
                        const isChecked = !!customFields[fp.key];
                        return (
                          <label
                            key={fp.key}
                            className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer"
                          >
                            <div>
                              <div className="text-xs font-bold text-slate-800">{fp.label}</div>
                              <div className="text-[10px] text-slate-500">{fp.description}</div>
                            </div>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) =>
                                setCustomFields((prev) => ({
                                  ...prev,
                                  [fp.key]: e.target.checked,
                                }))
                              }
                              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                            />
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Special Operations Permissions */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <h4 className="text-xs font-bold text-slate-900">مجوز عملیات ویژه و حساس (Special Rights)</h4>
                    <div className="space-y-2">
                      {SPECIAL_PERMISSIONS.map((sp) => {
                        const isChecked = !!customSpecials[sp.key];
                        return (
                          <label
                            key={sp.key}
                            className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer"
                          >
                            <div>
                              <div className="text-xs font-bold text-slate-800">{sp.label}</div>
                              <div className="text-[10px] text-slate-500">{sp.description}</div>
                            </div>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) =>
                                setCustomSpecials((prev) => ({
                                  ...prev,
                                  [sp.key]: e.target.checked,
                                }))
                              }
                              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                            />
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setActiveStep('account')}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                مرحله قبل
              </button>

              <div className="flex items-center gap-3">
                {onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs rounded-xl transition"
                  >
                    انصراف
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>تایید و ثبت نهایی کاربر جدید</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
