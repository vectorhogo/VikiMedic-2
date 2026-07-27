/**
 * VikiMedic v2 - Role & Permission Engine
 * Clean Architecture Layer: Domain
 */

import {
  UserRole,
  Permission,
  PermissionModule,
  PermissionAction,
  FieldPermissionKey,
  SpecialPermissionKey,
  Role,
  ModulePermissionsMap,
} from './types';

export const PERMISSION_MODULES_CONFIG: { code: PermissionModule; titleFa: string; descriptionFa: string }[] = [
  { code: 'DASHBOARD', titleFa: 'داشبورد اصلی', descriptionFa: 'نمای کلی آمارها و شاخص‌های کلینیک' },
  { code: 'PATIENTS', titleFa: 'پرونده بیماران', descriptionFa: 'ثبت، ویرایش و مشاهده مشخصات بیماران' },
  { code: 'RECEPTION', titleFa: 'پذیرش و نوبت‌دهی', descriptionFa: 'مدیریت صف حضور و فراخوان بیماران' },
  { code: 'MEDICAL_RECORDS', titleFa: 'سوابق پزشکی (EMR)', descriptionFa: 'ثبت معاینات، تشخیص‌ها و نسخ الکترونیک' },
  { code: 'APPOINTMENTS', titleFa: 'تقویم رزرو نوبت', descriptionFa: 'برنامه‌ریزی و زمان‌بندی نوبت‌دهی پزشکان' },
  { code: 'SERVICES', titleFa: 'خدمات و تعرفه‌ها', descriptionFa: 'مدیریت کاتالوگ خدمات، پوشش بیمه و قیمت‌ها' },
  { code: 'MEDICINES', titleFa: 'داروخانه و انبار', descriptionFa: 'مدیریت موجودی داروها و تجهیزات مصرفی' },
  { code: 'BILLING', titleFa: 'صورتحساب و سفارشات', descriptionFa: 'ثبت فاکتورهای خدمات و سفارشات درمانی بیمار' },
  { code: 'PAYMENTS', titleFa: 'دریافت و پرداخت مالی', descriptionFa: 'تسویه نهایی در صندوق، کارتخوان و نقد' },
  { code: 'INVOICES', titleFa: 'مدیریت فاکتورها', descriptionFa: 'مشاهده، چاپ، ویرایش و بایگانی اسناد مالی' },
  { code: 'REPORTS', titleFa: 'گزارشات مدیریتی', descriptionFa: 'تحلیل‌های کارکرد پزشکان، درآمد و آمارها' },
  { code: 'SHIFT_MANAGEMENT', titleFa: 'مدیریت شیفت‌ها', descriptionFa: 'برنامه‌ریزی و تخصیص پرسنل در شیفت‌های کاری' },
  { code: 'USERS', titleFa: 'مدیریت کاربران و نقش‌ها', descriptionFa: 'تعریف حساب‌های کاربری و دسترسی‌های RBAC' },
  { code: 'SETTINGS', titleFa: 'تنظیمات کلینیک', descriptionFa: 'پیکربندی اطلاعات کلینیک و پارامترها' },
  { code: 'BACKUP', titleFa: 'پشتیبان‌گیری و بازیابی', descriptionFa: 'پشتیبان‌گیری از دیتابیس و بازیابی آفلاین' },
  { code: 'ACTIVITY_LOG', titleFa: 'سجل وقایع و امنیت', descriptionFa: 'سابقه لاگ‌های امنیتی، ورود و تغییرات سیستم' },
];

export const PERMISSION_ACTIONS_CONFIG: { code: PermissionAction; titleFa: string }[] = [
  { code: 'VIEW', titleFa: 'مشاهده' },
  { code: 'CREATE', titleFa: 'ایجاد' },
  { code: 'EDIT', titleFa: 'ویرایش' },
  { code: 'DELETE', titleFa: 'حذف' },
  { code: 'PRINT', titleFa: 'چاپ' },
  { code: 'EXPORT', titleFa: 'خروجی' },
  { code: 'APPROVE', titleFa: 'تأیید' },
  { code: 'RESTORE', titleFa: 'بازیابی' },
];

export const FIELD_PERMISSIONS_CONFIG: { key: FieldPermissionKey; titleFa: string; module: PermissionModule }[] = [
  { key: 'PATIENTS.EDIT_PHONE', titleFa: 'ویرایش شماره همراه بیمار', module: 'PATIENTS' },
  { key: 'PATIENTS.EDIT_NATIONAL_ID', titleFa: 'ویرایش کد ملی بیمار', module: 'PATIENTS' },
  { key: 'PATIENTS.EDIT_INSURANCE_AFTER_PAYMENT', titleFa: 'ویرایش نوع بیمه پس از تسویه حساب', module: 'PATIENTS' },
  { key: 'PATIENTS.VIEW_NATIONAL_ID', titleFa: 'مشاهده کد ملی کامل بیمار', module: 'PATIENTS' },
  { key: 'PATIENTS.VIEW_PHONE', titleFa: 'مشاهده شماره همراه بیمار', module: 'PATIENTS' },
  { key: 'MEDICAL_RECORDS.EDIT_DIAGNOSIS', titleFa: 'ویرایش تشخیص و متن پزشکی پزشک معالج', module: 'MEDICAL_RECORDS' },
  { key: 'BILLING.EDIT_ITEM_PRICE', titleFa: 'ویرایش تعرفه و قیمت خدمات در صورتحساب', module: 'BILLING' },
];

export const SPECIAL_PERMISSIONS_CONFIG: { key: SpecialPermissionKey; titleFa: string; descriptionFa: string }[] = [
  { key: 'EDIT_PRICES', titleFa: 'ویرایش قیمت‌ها و تعرفه‌ها', descriptionFa: 'امکان تغییر نرخ خدمات در کاتالوگ و صورتحساب' },
  { key: 'APPLY_DISCOUNTS', titleFa: 'اعمال تخفیف بر روی فاکتور', descriptionFa: 'امکان کسر مبلغ تخفیف ویژه از صورتحساب بیمار' },
  { key: 'REFUND_PAYMENTS', titleFa: 'استرداد وجه پرداخت‌شده', descriptionFa: 'امکان بازگرداندن و لغو تراکنش‌های مالی انجام شده' },
  { key: 'CLOSE_CASHBOX', titleFa: 'بستن صندوق مالی شیفت', descriptionFa: 'امکان بستن و تحویل نهایی صندوق در پایان شیفت' },
  { key: 'OPEN_CLOSED_SHIFT', titleFa: 'بازکردن مجدد شیفت بسته‌شده', descriptionFa: 'امکان اصلاح اسناد مالی شیفت‌های گذشته' },
  { key: 'DELETE_INVOICE', titleFa: 'حذف فاکتور مالی', descriptionFa: 'امکان ابطال و حذف کامل سند مالی از سیستم' },
  { key: 'EDIT_MEDICAL_RECORDS', titleFa: 'ویرایش سوابق پزشکی نهایی', descriptionFa: 'امکان اصلاح معاینات و نسخ ثبت‌شده گذشته' },
  { key: 'MANAGE_USERS', titleFa: 'مدیریت کاربران و دسترسی‌ها', descriptionFa: 'امکان تعریف، ویرایش و تخصیص نقش به پرسنل' },
  { key: 'MANAGE_INITIAL_SETUP', titleFa: 'مدیریت راه‌اندازی اولیه کلینیک', descriptionFa: 'امکان پیکربندی هویت کلینیک، پاکسازی و راه‌اندازی اولیه (قابل تخصیص به مدیر و مسئول پذیرش)' },
];

export const SYSTEM_MODULE_DEFINITIONS = PERMISSION_MODULES_CONFIG.map((m) => ({
  key: m.code,
  label: m.titleFa,
  description: m.descriptionFa,
}));

export const ALL_PERMISSION_ACTIONS = PERMISSION_ACTIONS_CONFIG.map((a) => ({
  key: a.code,
  label: a.titleFa,
}));

export const FIELD_PERMISSIONS = FIELD_PERMISSIONS_CONFIG.map((f) => ({
  key: f.key,
  label: f.titleFa,
  description: f.module,
}));

export const SPECIAL_PERMISSIONS = SPECIAL_PERMISSIONS_CONFIG.map((s) => ({
  key: s.key,
  label: s.titleFa,
  description: s.descriptionFa,
}));

export const ALL_ACTIONS: PermissionAction[] = ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'PRINT', 'EXPORT', 'APPROVE', 'RESTORE'];
export const READ_ONLY_ACTIONS: PermissionAction[] = ['VIEW', 'PRINT', 'EXPORT'];

function createFullModuleMap(): ModulePermissionsMap {
  const map: Partial<ModulePermissionsMap> = {};
  PERMISSION_MODULES_CONFIG.forEach((m) => {
    map[m.code] = [...ALL_ACTIONS];
  });
  return map as ModulePermissionsMap;
}

function createEmptyModuleMap(): ModulePermissionsMap {
  const map: Partial<ModulePermissionsMap> = {};
  PERMISSION_MODULES_CONFIG.forEach((m) => {
    map[m.code] = [];
  });
  return map as ModulePermissionsMap;
}

function createAllFieldPermissions(value: boolean): Record<FieldPermissionKey, boolean> {
  return {
    'PATIENTS.EDIT_PHONE': value,
    'PATIENTS.EDIT_NATIONAL_ID': value,
    'PATIENTS.EDIT_INSURANCE_AFTER_PAYMENT': value,
    'PATIENTS.VIEW_NATIONAL_ID': true,
    'PATIENTS.VIEW_PHONE': true,
    'MEDICAL_RECORDS.EDIT_DIAGNOSIS': value,
    'BILLING.EDIT_ITEM_PRICE': value,
  };
}

function createAllSpecialPermissions(value: boolean): Record<SpecialPermissionKey, boolean> {
  return {
    EDIT_PRICES: value,
    APPLY_DISCOUNTS: value,
    REFUND_PAYMENTS: value,
    CLOSE_CASHBOX: value,
    OPEN_CLOSED_SHIFT: value,
    DELETE_INVOICE: value,
    EDIT_MEDICAL_RECORDS: value,
    MANAGE_USERS: value,
    MANAGE_INITIAL_SETUP: value,
  };
}

// ============================================================
// DEFAULT 10 SYSTEM ROLES IMPLEMENTATION
// ============================================================

export const DEFAULT_SYSTEM_ROLES: Role[] = [
  // 1. Administrator (مدیر ارشد سیستم)
  {
    id: 'role-admin',
    code: 'ADMIN',
    nameFa: 'مدیر ارشد سیستم (System Admin)',
    descriptionFa: 'دسترسی کامل و بدون محدودیت به تمامی بخش‌ها، تنظیمات، امنیت و دیتابیس',
    isSystemDefault: true,
    isDisabled: false,
    modulePermissions: createFullModuleMap(),
    fieldPermissions: createAllFieldPermissions(true),
    specialPermissions: createAllSpecialPermissions(true),
    createdAt: '1403/01/01',
    updatedAt: '1403/01/01',
  },

  // 2. Clinic Manager (مدیر کلینیک)
  {
    id: 'role-clinic-manager',
    code: 'CLINIC_MANAGER',
    nameFa: 'مدیر کلینیک (Clinic Manager)',
    descriptionFa: 'مدیریت عملیاتی کلینیک، گزارشات، پرسنل، شیفت‌ها و تأیید اسناد مالی',
    isSystemDefault: true,
    isDisabled: false,
    modulePermissions: {
      ...createEmptyModuleMap(),
      DASHBOARD: ['VIEW', 'EXPORT', 'PRINT'],
      PATIENTS: ['VIEW', 'CREATE', 'EDIT', 'PRINT', 'EXPORT'],
      RECEPTION: ['VIEW', 'CREATE', 'EDIT', 'PRINT', 'EXPORT'],
      MEDICAL_RECORDS: ['VIEW', 'PRINT', 'EXPORT'],
      APPOINTMENTS: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'PRINT', 'EXPORT'],
      SERVICES: ['VIEW', 'CREATE', 'EDIT', 'PRINT', 'EXPORT'],
      MEDICINES: ['VIEW', 'CREATE', 'EDIT', 'PRINT', 'EXPORT'],
      BILLING: ['VIEW', 'CREATE', 'EDIT', 'APPROVE', 'PRINT', 'EXPORT'],
      PAYMENTS: ['VIEW', 'CREATE', 'EDIT', 'APPROVE', 'PRINT', 'EXPORT'],
      INVOICES: ['VIEW', 'CREATE', 'EDIT', 'APPROVE', 'PRINT', 'EXPORT'],
      REPORTS: ['VIEW', 'PRINT', 'EXPORT'],
      SHIFT_MANAGEMENT: ['VIEW', 'CREATE', 'EDIT', 'APPROVE', 'PRINT', 'EXPORT'],
      USERS: ['VIEW', 'CREATE', 'EDIT'],
      SETTINGS: ['VIEW', 'EDIT'],
      BACKUP: ['VIEW', 'CREATE', 'EXPORT'],
      ACTIVITY_LOG: ['VIEW', 'EXPORT'],
    },
    fieldPermissions: {
      ...createAllFieldPermissions(true),
      'PATIENTS.EDIT_NATIONAL_ID': false,
    },
    specialPermissions: {
      EDIT_PRICES: true,
      APPLY_DISCOUNTS: true,
      REFUND_PAYMENTS: true,
      CLOSE_CASHBOX: true,
      OPEN_CLOSED_SHIFT: true,
      DELETE_INVOICE: false,
      EDIT_MEDICAL_RECORDS: false,
      MANAGE_USERS: true,
    },
    createdAt: '1403/01/01',
    updatedAt: '1403/01/01',
  },

  // 3. Doctor (پزشک معالج)
  {
    id: 'role-doctor',
    code: 'DOCTOR',
    nameFa: 'پزشک معالج (Doctor)',
    descriptionFa: 'ثبت معاینات، تشخیص، صدور نسخه الکترونیک و مشاهده پرونده پزشکی بیماران',
    isSystemDefault: true,
    isDisabled: false,
    modulePermissions: {
      ...createEmptyModuleMap(),
      DASHBOARD: ['VIEW'],
      PATIENTS: ['VIEW', 'CREATE', 'EDIT', 'PRINT'],
      RECEPTION: ['VIEW', 'EDIT'],
      MEDICAL_RECORDS: ['VIEW', 'CREATE', 'EDIT', 'PRINT', 'EXPORT'],
      APPOINTMENTS: ['VIEW', 'CREATE', 'EDIT', 'PRINT'],
      SERVICES: ['VIEW'],
      MEDICINES: ['VIEW'],
      BILLING: ['VIEW', 'CREATE'],
      PAYMENTS: ['VIEW'],
      INVOICES: ['VIEW'],
      REPORTS: ['VIEW'],
      SHIFT_MANAGEMENT: ['VIEW'],
      USERS: [],
      SETTINGS: [],
      BACKUP: [],
      ACTIVITY_LOG: [],
    },
    fieldPermissions: {
      ...createAllFieldPermissions(false),
      'PATIENTS.VIEW_NATIONAL_ID': true,
      'PATIENTS.VIEW_PHONE': true,
      'MEDICAL_RECORDS.EDIT_DIAGNOSIS': true,
    },
    specialPermissions: {
      ...createAllSpecialPermissions(false),
      EDIT_MEDICAL_RECORDS: true,
    },
    createdAt: '1403/01/01',
    updatedAt: '1403/01/01',
  },

  // 4. Receptionist (مسئول پذیرش)
  {
    id: 'role-receptionist',
    code: 'RECEPTIONIST',
    nameFa: 'مسئول پذیرش و نوبت‌دهی (Receptionist)',
    descriptionFa: 'پذیرش بیماران، تشکیل پرونده اولیه، ثبت نوبت و صدور اولیه سفارش درمانی',
    isSystemDefault: true,
    isDisabled: false,
    modulePermissions: {
      ...createEmptyModuleMap(),
      DASHBOARD: ['VIEW'],
      PATIENTS: ['VIEW', 'CREATE', 'EDIT', 'PRINT'],
      RECEPTION: ['VIEW', 'CREATE', 'EDIT', 'PRINT'],
      MEDICAL_RECORDS: ['VIEW'],
      APPOINTMENTS: ['VIEW', 'CREATE', 'EDIT', 'PRINT'],
      SERVICES: ['VIEW'],
      MEDICINES: ['VIEW'],
      BILLING: ['VIEW', 'CREATE', 'PRINT'],
      PAYMENTS: ['VIEW', 'CREATE', 'PRINT'],
      INVOICES: ['VIEW', 'PRINT'],
      REPORTS: [],
      SHIFT_MANAGEMENT: ['VIEW'],
      USERS: [],
      SETTINGS: [],
      BACKUP: [],
      ACTIVITY_LOG: [],
    },
    fieldPermissions: {
      'PATIENTS.EDIT_PHONE': true,
      'PATIENTS.EDIT_NATIONAL_ID': false,
      'PATIENTS.EDIT_INSURANCE_AFTER_PAYMENT': false,
      'PATIENTS.VIEW_NATIONAL_ID': true,
      'PATIENTS.VIEW_PHONE': true,
      'MEDICAL_RECORDS.EDIT_DIAGNOSIS': false,
      'BILLING.EDIT_ITEM_PRICE': false,
    },
    specialPermissions: {
      ...createAllSpecialPermissions(false),
      APPLY_DISCOUNTS: false,
      CLOSE_CASHBOX: false,
      MANAGE_INITIAL_SETUP: true,
    },
    createdAt: '1403/01/01',
    updatedAt: '1403/01/01',
  },

  // 5. Nurse (پرستار و کادر درمان)
  {
    id: 'role-nurse',
    code: 'NURSE',
    nameFa: 'پرستار و کادر درمان (Nurse)',
    descriptionFa: 'ثبت علائم حیاتی، انجام تزریقات و خدمات پرستاری و مشاهده پرونده بیمار',
    isSystemDefault: true,
    isDisabled: false,
    modulePermissions: {
      ...createEmptyModuleMap(),
      DASHBOARD: ['VIEW'],
      PATIENTS: ['VIEW'],
      RECEPTION: ['VIEW'],
      MEDICAL_RECORDS: ['VIEW', 'CREATE', 'PRINT'],
      APPOINTMENTS: ['VIEW'],
      SERVICES: ['VIEW'],
      MEDICINES: ['VIEW'],
      BILLING: ['VIEW'],
      PAYMENTS: [],
      INVOICES: [],
      REPORTS: [],
      SHIFT_MANAGEMENT: ['VIEW'],
      USERS: [],
      SETTINGS: [],
      BACKUP: [],
      ACTIVITY_LOG: [],
    },
    fieldPermissions: {
      ...createAllFieldPermissions(false),
      'PATIENTS.VIEW_NATIONAL_ID': true,
      'PATIENTS.VIEW_PHONE': true,
    },
    specialPermissions: createAllSpecialPermissions(false),
    createdAt: '1403/01/01',
    updatedAt: '1403/01/01',
  },

  // 6. Accountant (مدیر مالی و حسابداری)
  {
    id: 'role-accountant',
    code: 'ACCOUNTANT',
    nameFa: 'مدیر مالی و حسابداری (Accountant)',
    descriptionFa: 'مدیریت صندوق، تسویه صورتحساب‌ها، تخفیفات، استرداد و گزارشات درآمدی',
    isSystemDefault: true,
    isDisabled: false,
    modulePermissions: {
      ...createEmptyModuleMap(),
      DASHBOARD: ['VIEW', 'EXPORT', 'PRINT'],
      PATIENTS: ['VIEW'],
      RECEPTION: ['VIEW'],
      MEDICAL_RECORDS: [],
      APPOINTMENTS: ['VIEW'],
      SERVICES: ['VIEW', 'EDIT'],
      MEDICINES: ['VIEW'],
      BILLING: ['VIEW', 'CREATE', 'EDIT', 'APPROVE', 'PRINT', 'EXPORT'],
      PAYMENTS: ['VIEW', 'CREATE', 'EDIT', 'APPROVE', 'PRINT', 'EXPORT'],
      INVOICES: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'APPROVE', 'PRINT', 'EXPORT'],
      REPORTS: ['VIEW', 'PRINT', 'EXPORT'],
      SHIFT_MANAGEMENT: ['VIEW'],
      USERS: [],
      SETTINGS: [],
      BACKUP: [],
      ACTIVITY_LOG: ['VIEW'],
    },
    fieldPermissions: {
      ...createAllFieldPermissions(true),
      'MEDICAL_RECORDS.EDIT_DIAGNOSIS': false,
    },
    specialPermissions: {
      ...createAllSpecialPermissions(false),
      EDIT_PRICES: true,
      APPLY_DISCOUNTS: true,
      REFUND_PAYMENTS: true,
      CLOSE_CASHBOX: true,
      DELETE_INVOICE: true,
    },
    createdAt: '1403/01/01',
    updatedAt: '1403/01/01',
  },

  // 7. Laboratory Staff (مسئول آزمایشگاه)
  {
    id: 'role-lab-staff',
    code: 'LABORATORY_STAFF',
    nameFa: 'مسئول آزمایشگاه (Laboratory Staff)',
    descriptionFa: 'ثبت و پاسخ‌دهی آزمایش‌های پاراکلینیکی و پیگیری سفارشات نمونه‌گیری',
    isSystemDefault: true,
    isDisabled: false,
    modulePermissions: {
      ...createEmptyModuleMap(),
      DASHBOARD: ['VIEW'],
      PATIENTS: ['VIEW'],
      RECEPTION: ['VIEW'],
      MEDICAL_RECORDS: ['VIEW', 'CREATE', 'EDIT', 'PRINT'],
      SERVICES: ['VIEW'],
      BILLING: ['VIEW'],
      REPORTS: ['VIEW', 'PRINT'],
      SHIFT_MANAGEMENT: ['VIEW'],
      MEDICINES: [],
      PAYMENTS: [],
      INVOICES: [],
      USERS: [],
      SETTINGS: [],
      BACKUP: [],
      ACTIVITY_LOG: [],
      APPOINTMENTS: [],
    },
    fieldPermissions: {
      ...createAllFieldPermissions(false),
      'PATIENTS.VIEW_NATIONAL_ID': true,
      'PATIENTS.VIEW_PHONE': true,
    },
    specialPermissions: createAllSpecialPermissions(false),
    createdAt: '1403/01/01',
    updatedAt: '1403/01/01',
  },

  // 8. Radiology Staff (مسئول تصویربرداری و رادیولوژی)
  {
    id: 'role-radiology-staff',
    code: 'RADIOLOGY_STAFF',
    nameFa: 'مسئول رادیولوژی و تصویربرداری (Radiology Staff)',
    descriptionFa: 'ثبت نتایج سونوگرافی، رادیوگرافی و بارگذاری گزارشات تصویربرداری',
    isSystemDefault: true,
    isDisabled: false,
    modulePermissions: {
      ...createEmptyModuleMap(),
      DASHBOARD: ['VIEW'],
      PATIENTS: ['VIEW'],
      RECEPTION: ['VIEW'],
      MEDICAL_RECORDS: ['VIEW', 'CREATE', 'EDIT', 'PRINT'],
      SERVICES: ['VIEW'],
      BILLING: ['VIEW'],
      REPORTS: ['VIEW', 'PRINT'],
      SHIFT_MANAGEMENT: ['VIEW'],
      MEDICINES: [],
      PAYMENTS: [],
      INVOICES: [],
      USERS: [],
      SETTINGS: [],
      BACKUP: [],
      ACTIVITY_LOG: [],
      APPOINTMENTS: [],
    },
    fieldPermissions: {
      ...createAllFieldPermissions(false),
      'PATIENTS.VIEW_NATIONAL_ID': true,
      'PATIENTS.VIEW_PHONE': true,
    },
    specialPermissions: createAllSpecialPermissions(false),
    createdAt: '1403/01/01',
    updatedAt: '1403/01/01',
  },

  // 9. Security Guard (نگهبانی و حراست)
  {
    id: 'role-security-guard',
    code: 'SECURITY_GUARD',
    nameFa: 'نگهبانی و حراست (Security Guard)',
    descriptionFa: 'مشاهده لیست نوبت‌ها، صف حضور بیماران و پرسنل شیفت جهت انتظامات',
    isSystemDefault: true,
    isDisabled: false,
    modulePermissions: {
      ...createEmptyModuleMap(),
      DASHBOARD: ['VIEW'],
      PATIENTS: ['VIEW'],
      RECEPTION: ['VIEW'],
      APPOINTMENTS: ['VIEW'],
      SHIFT_MANAGEMENT: ['VIEW'],
      MEDICAL_RECORDS: [],
      SERVICES: [],
      MEDICINES: [],
      BILLING: [],
      PAYMENTS: [],
      INVOICES: [],
      REPORTS: [],
      USERS: [],
      SETTINGS: [],
      BACKUP: [],
      ACTIVITY_LOG: [],
    },
    fieldPermissions: {
      ...createAllFieldPermissions(false),
      'PATIENTS.VIEW_PHONE': true,
    },
    specialPermissions: createAllSpecialPermissions(false),
    createdAt: '1403/01/01',
    updatedAt: '1403/01/01',
  },

  // 10. Guest (میهمان / کاربر محدود)
  {
    id: 'role-guest',
    code: 'GUEST',
    nameFa: 'میهمان / کاربر محدود (Guest)',
    descriptionFa: 'دسترسی خواندن فقط جهت بررسی اولیه داشبورد عمومی کلینیک',
    isSystemDefault: true,
    isDisabled: false,
    modulePermissions: {
      ...createEmptyModuleMap(),
      DASHBOARD: ['VIEW'],
    },
    fieldPermissions: createAllFieldPermissions(false),
    specialPermissions: createAllSpecialPermissions(false),
    createdAt: '1403/01/01',
    updatedAt: '1403/01/01',
  },
];

// Map Old Permission Tokens to new Module/Action system
export const OLD_PERMISSION_MAP: Record<Permission, { module: PermissionModule; action: PermissionAction }> = {
  VIEW_PATIENTS: { module: 'PATIENTS', action: 'VIEW' },
  CREATE_PATIENTS: { module: 'PATIENTS', action: 'CREATE' },
  EDIT_PATIENTS: { module: 'PATIENTS', action: 'EDIT' },
  DELETE_PATIENTS: { module: 'PATIENTS', action: 'DELETE' },
  VIEW_QUEUE: { module: 'RECEPTION', action: 'VIEW' },
  MANAGE_QUEUE: { module: 'RECEPTION', action: 'EDIT' },
  DOCTOR_EMR: { module: 'MEDICAL_RECORDS', action: 'CREATE' },
  VIEW_FINANCIALS: { module: 'PAYMENTS', action: 'VIEW' },
  CREATE_INVOICE: { module: 'BILLING', action: 'CREATE' },
  VIEW_REPORTS: { module: 'REPORTS', action: 'VIEW' },
  MANAGE_STAFF: { module: 'USERS', action: 'EDIT' },
  MANAGE_CLINIC_SETTINGS: { module: 'SETTINGS', action: 'EDIT' },
  ACCESS_PHARMACY: { module: 'MEDICINES', action: 'VIEW' },
};

export function hasPermission(roleCode: UserRole, permission: Permission, customPermissions?: Permission[]): boolean {
  if (roleCode === 'ADMIN') return true;
  const mapped = OLD_PERMISSION_MAP[permission];
  if (!mapped) return false;
  
  const targetRole = DEFAULT_SYSTEM_ROLES.find((r) => r.code === roleCode);
  if (!targetRole || targetRole.isDisabled) return false;

  const actions = targetRole.modulePermissions[mapped.module] || [];
  return actions.includes(mapped.action);
}

export const ROLE_TITLES_FA: Record<string, string> = {
  ADMIN: 'مدیر کل سیستم (System Admin)',
  CLINIC_MANAGER: 'مدیر کلینیک (Clinic Manager)',
  DOCTOR: 'پزشک معالج (Doctor)',
  RECEPTIONIST: 'مسئول پذیرش (Receptionist)',
  NURSE: 'پرستار و کادر درمان (Nurse)',
  ACCOUNTANT: 'حسابدار کلینیک (Accountant)',
  LABORATORY_STAFF: 'مسئول آزمایشگاه (Laboratory Staff)',
  RADIOLOGY_STAFF: 'مسئول رادیولوژی (Radiology Staff)',
  SECURITY_GUARD: 'نگهبانی و حراست (Security Guard)',
  GUEST: 'میهمان / کاربر محدود (Guest)',
};

export const DEFAULT_ROLE_PERMISSIONS: Record<string, ModulePermissionsMap> = DEFAULT_SYSTEM_ROLES.reduce(
  (acc, role) => {
    acc[role.code] = role.modulePermissions;
    return acc;
  },
  {} as Record<string, ModulePermissionsMap>
);
