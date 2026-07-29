/**
 * VikiMedic v2 - Role-Based Workspace Customization Service
 * Clean Architecture Layer: Infrastructure
 */

export type WorkspaceRole =
  | 'ADMIN'
  | 'CLINIC_MANAGER'
  | 'DOCTOR'
  | 'RECEPTIONIST'
  | 'NURSE'
  | 'ACCOUNTANT'
  | 'SECRETARY';

export interface DashboardCardConfig {
  id: string;
  titleFa: string;
  iconName: string;
  isVisible: boolean;
  order: number;
}

export interface QuickActionConfig {
  id: string;
  titleFa: string;
  descriptionFa: string;
  iconName: string;
  shortcut?: string;
  color: string;
  isVisible: boolean;
  order: number;
}

export interface RoleWorkspaceConfig {
  role: WorkspaceRole;
  roleTitleFa: string;
  defaultLandingPage: string;
  pinnedModules: string[];
  cards: DashboardCardConfig[];
  actions: QuickActionConfig[];
}

export const SUPPORTED_WORKSPACE_ROLES: { role: WorkspaceRole; titleFa: string }[] = [
  { role: 'ADMIN', titleFa: 'مدیر کل سیستم (Administrator)' },
  { role: 'CLINIC_MANAGER', titleFa: 'مدیر کلینیک (Manager)' },
  { role: 'DOCTOR', titleFa: 'پزشک معالج (Doctor)' },
  { role: 'RECEPTIONIST', titleFa: 'مسئول پذیرش (Receptionist)' },
  { role: 'NURSE', titleFa: 'پرستار (Nurse)' },
  { role: 'ACCOUNTANT', titleFa: 'حسابدار (Accountant)' },
  { role: 'SECRETARY', titleFa: 'منشی بخش (Secretary)' },
];

export const AVAILABLE_MODULES: { id: string; titleFa: string }[] = [
  { id: 'dashboard', titleFa: 'میز کار (Executive Dashboard)' },
  { id: 'patients', titleFa: 'مدیریت بیماران (Patients)' },
  { id: 'queue', titleFa: 'صف و نوبت‌دهی (Waiting Queue)' },
  { id: 'doctor', titleFa: 'معاینه و پرونده پزشک (Doctor EMR)' },
  { id: 'financials', titleFa: 'صندوق و امور مالی (Financials)' },
  { id: 'reports', titleFa: 'گزارشات مدیریتی (Reports)' },
  { id: 'shifts', titleFa: 'تحویل و مدیریت شیفت (Shifts)' },
  { id: 'inventory', titleFa: 'انبار و داروها (Inventory)' },
  { id: 'settings', titleFa: 'تنظیمات و مدیریت سیستم (Settings)' },
];

export const ALL_CARDS_MASTER: DashboardCardConfig[] = [
  { id: 'today_patients', titleFa: 'بیماران امروز', iconName: 'Users', isVisible: true, order: 1 },
  { id: 'waiting_queue', titleFa: 'صف انتظار', iconName: 'Clock', isVisible: true, order: 2 },
  { id: 'open_receptions', titleFa: 'پذیرش‌های باز', iconName: 'Building2', isVisible: true, order: 3 },
  { id: 'active_users', titleFa: 'کاربران فعال', iconName: 'ShieldCheck', isVisible: true, order: 4 },
  { id: 'today_revenue', titleFa: 'درآمد امروز', iconName: 'DollarSign', isVisible: true, order: 5 },
  { id: 'pending_payments', titleFa: 'پرداخت‌های معوق', iconName: 'Receipt', isVisible: true, order: 6 },
  { id: 'current_shift', titleFa: 'شیفت جاری', iconName: 'Activity', isVisible: true, order: 7 },
];

export const ALL_ACTIONS_MASTER: QuickActionConfig[] = [
  {
    id: 'new_patient',
    titleFa: 'ثبت بیمار جدید',
    descriptionFa: 'تشکیل پرونده اولیه، ثبت مشخصات شناسنامه‌ای و تماس',
    iconName: 'UserPlus',
    shortcut: 'Ctrl+N',
    color: 'blue',
    isVisible: true,
    order: 1,
  },
  {
    id: 'new_reception',
    titleFa: 'پذیرش و نوبت‌دهی',
    descriptionFa: 'پذیرش بیمار در صف سالن انتظار و تخصیص پزشک معالج',
    iconName: 'Calendar',
    shortcut: 'F2',
    color: 'emerald',
    isVisible: true,
    order: 2,
  },
  {
    id: 'new_invoice',
    titleFa: 'صدور فاکتور و تسویه',
    descriptionFa: 'ثبت خدمات بالینی، محاسبه سهم بیمه و دریافت وجه',
    iconName: 'Receipt',
    color: 'amber',
    isVisible: true,
    order: 3,
  },
  {
    id: 'daily_reports',
    titleFa: 'گزارشات و تحلیل روزانه',
    descriptionFa: 'مشاهده آمار پذیرش، درآمد صندوق و نمودارهای مدیریتی',
    iconName: 'BarChart3',
    color: 'purple',
    isVisible: true,
    order: 4,
  },
  {
    id: 'shift_control',
    titleFa: 'مرکز کنترل شیفت',
    descriptionFa: 'برنامه‌ریزی، تحویل و تحول شیفت کاری پرسنل',
    iconName: 'Clock',
    color: 'indigo',
    isVisible: true,
    order: 5,
  },
  {
    id: 'search_patient',
    titleFa: 'جستجوی سریع پرونده',
    descriptionFa: 'جستجو بر اساس نام، کد ملی یا شماره همراه بیمار',
    iconName: 'Search',
    color: 'sky',
    isVisible: true,
    order: 6,
  },
  {
    id: 'receive_payment',
    titleFa: 'دریافت وجه صندوق',
    descriptionFa: 'ثبت تراکنش کارتخوان، نقد یا بیمه تکمیلی',
    iconName: 'CreditCard',
    color: 'teal',
    isVisible: true,
    order: 7,
  },
];

// PRESETS REQUIRED BY SPECIFICATION
export const PRESETS: Record<string, { nameFa: string; descriptionFa: string; config: (role: WorkspaceRole) => RoleWorkspaceConfig }> = {
  RECEPTION: {
    nameFa: 'میز کار پذیرش (Reception Workspace)',
    descriptionFa: 'تمرکز بر ثبت بیمار، صف انتظار سالن، نوبت‌دهی و پذیرش سریع',
    config: (role) => ({
      role,
      roleTitleFa: 'پذیرش کلینیک',
      defaultLandingPage: 'queue',
      pinnedModules: ['dashboard', 'patients', 'queue', 'financials'],
      cards: [
        { id: 'today_patients', titleFa: 'بیماران امروز', iconName: 'Users', isVisible: true, order: 1 },
        { id: 'waiting_queue', titleFa: 'صف انتظار', iconName: 'Clock', isVisible: true, order: 2 },
        { id: 'open_receptions', titleFa: 'پذیرش‌های باز', iconName: 'Building2', isVisible: true, order: 3 },
        { id: 'active_users', titleFa: 'کاربران فعال', iconName: 'ShieldCheck', isVisible: false, order: 4 },
        { id: 'today_revenue', titleFa: 'درآمد امروز', iconName: 'DollarSign', isVisible: false, order: 5 },
        { id: 'pending_payments', titleFa: 'پرداخت‌های معوق', iconName: 'Receipt', isVisible: false, order: 6 },
        { id: 'current_shift', titleFa: 'شیفت جاری', iconName: 'Activity', isVisible: true, order: 4 },
      ],
      actions: [
        { ...ALL_ACTIONS_MASTER[0], isVisible: true, order: 1 }, // new_patient
        { ...ALL_ACTIONS_MASTER[1], isVisible: true, order: 2 }, // new_reception
        { ...ALL_ACTIONS_MASTER[5], isVisible: true, order: 3 }, // search_patient
        { ...ALL_ACTIONS_MASTER[2], isVisible: true, order: 4 }, // new_invoice
        { ...ALL_ACTIONS_MASTER[3], isVisible: false, order: 5 },
        { ...ALL_ACTIONS_MASTER[4], isVisible: false, order: 6 },
        { ...ALL_ACTIONS_MASTER[6], isVisible: false, order: 7 },
      ],
    }),
  },
  DOCTOR: {
    nameFa: 'میز کار پزشک (Doctor Workspace)',
    descriptionFa: 'تمرکز بر صف انتظار بیماران مربوطه، ثبت معاینات EMR و نسخه الکترونیک',
    config: (role) => ({
      role,
      roleTitleFa: 'پزشک معالج',
      defaultLandingPage: 'queue',
      pinnedModules: ['dashboard', 'queue', 'doctor', 'patients'],
      cards: [
        { id: 'today_patients', titleFa: 'بیماران امروز', iconName: 'Users', isVisible: true, order: 1 },
        { id: 'waiting_queue', titleFa: 'صف انتظار', iconName: 'Clock', isVisible: true, order: 2 },
        { id: 'open_receptions', titleFa: 'پذیرش‌های باز', iconName: 'Building2', isVisible: true, order: 3 },
        { id: 'current_shift', titleFa: 'شیفت جاری', iconName: 'Activity', isVisible: true, order: 4 },
        { id: 'active_users', titleFa: 'کاربران فعال', iconName: 'ShieldCheck', isVisible: false, order: 5 },
        { id: 'today_revenue', titleFa: 'درآمد امروز', iconName: 'DollarSign', isVisible: false, order: 6 },
        { id: 'pending_payments', titleFa: 'پرداخت‌های معوق', iconName: 'Receipt', isVisible: false, order: 7 },
      ],
      actions: [
        { ...ALL_ACTIONS_MASTER[5], isVisible: true, order: 1 }, // search_patient
        { ...ALL_ACTIONS_MASTER[1], isVisible: true, order: 2 }, // new_reception
        { ...ALL_ACTIONS_MASTER[0], isVisible: false, order: 3 },
        { ...ALL_ACTIONS_MASTER[2], isVisible: false, order: 4 },
        { ...ALL_ACTIONS_MASTER[3], isVisible: false, order: 5 },
        { ...ALL_ACTIONS_MASTER[4], isVisible: false, order: 6 },
        { ...ALL_ACTIONS_MASTER[6], isVisible: false, order: 7 },
      ],
    }),
  },
  MANAGER: {
    nameFa: 'میز کار مدیر (Manager Workspace)',
    descriptionFa: 'دسترسی جامع به شاخص‌های کلیدی عملکرد، گزارشات، پرسنل و امور مالی',
    config: (role) => ({
      role,
      roleTitleFa: 'مدیر کلینیک',
      defaultLandingPage: 'dashboard',
      pinnedModules: ['dashboard', 'reports', 'settings', 'shifts', 'financials', 'patients'],
      cards: ALL_CARDS_MASTER.map((c) => ({ ...c, isVisible: true })),
      actions: ALL_ACTIONS_MASTER.map((a) => ({ ...a, isVisible: true })),
    }),
  },
  ACCOUNTANT: {
    nameFa: 'میز کار حسابدار (Accountant Workspace)',
    descriptionFa: 'تمرکز بر صدور فاکتور، تراکنش‌های صندوق، مطالبات معوق و گزارشات مالی',
    config: (role) => ({
      role,
      roleTitleFa: 'حسابدار کلینیک',
      defaultLandingPage: 'financials',
      pinnedModules: ['dashboard', 'financials', 'reports'],
      cards: [
        { id: 'today_revenue', titleFa: 'درآمد امروز', iconName: 'DollarSign', isVisible: true, order: 1 },
        { id: 'pending_payments', titleFa: 'پرداخت‌های معوق', iconName: 'Receipt', isVisible: true, order: 2 },
        { id: 'open_receptions', titleFa: 'پذیرش‌های باز', iconName: 'Building2', isVisible: true, order: 3 },
        { id: 'today_patients', titleFa: 'بیماران امروز', iconName: 'Users', isVisible: true, order: 4 },
        { id: 'waiting_queue', titleFa: 'صف انتظار', iconName: 'Clock', isVisible: false, order: 5 },
        { id: 'active_users', titleFa: 'کاربران فعال', iconName: 'ShieldCheck', isVisible: false, order: 6 },
        { id: 'current_shift', titleFa: 'شیفت جاری', iconName: 'Activity', isVisible: false, order: 7 },
      ],
      actions: [
        { ...ALL_ACTIONS_MASTER[2], isVisible: true, order: 1 }, // new_invoice
        { ...ALL_ACTIONS_MASTER[6], isVisible: true, order: 2 }, // receive_payment
        { ...ALL_ACTIONS_MASTER[3], isVisible: true, order: 3 }, // daily_reports
        { ...ALL_ACTIONS_MASTER[0], isVisible: false, order: 4 },
        { ...ALL_ACTIONS_MASTER[1], isVisible: false, order: 5 },
        { ...ALL_ACTIONS_MASTER[4], isVisible: false, order: 6 },
        { ...ALL_ACTIONS_MASTER[5], isVisible: false, order: 7 },
      ],
    }),
  },
  ADMIN: {
    nameFa: 'میز کار مدیر ارشد (Administrator Workspace)',
    descriptionFa: 'دسترسی کامل و بدون محدودیت به تمام کارت‌ها، میانبرها و ماژول‌ها',
    config: (role) => ({
      role,
      roleTitleFa: 'مدیر ارشد سیستم',
      defaultLandingPage: 'dashboard',
      pinnedModules: ['dashboard', 'patients', 'queue', 'doctor', 'financials', 'reports', 'shifts', 'settings'],
      cards: ALL_CARDS_MASTER.map((c) => ({ ...c, isVisible: true })),
      actions: ALL_ACTIONS_MASTER.map((a) => ({ ...a, isVisible: true })),
    }),
  },
};

const STORAGE_KEY_WORKSPACES = 'vikimedic_v2_role_workspaces';

export class WorkspaceService {
  public static getDefaultWorkspaceForRole(role: WorkspaceRole): RoleWorkspaceConfig {
    const roleUpper = (role || 'RECEPTIONIST').toUpperCase();
    if (roleUpper === 'ADMIN' || roleUpper === 'ADMINISTRATOR') {
      return PRESETS.ADMIN.config('ADMIN');
    }
    if (roleUpper === 'CLINIC_MANAGER' || roleUpper === 'MANAGER') {
      return PRESETS.MANAGER.config('CLINIC_MANAGER');
    }
    if (roleUpper === 'DOCTOR') {
      return PRESETS.DOCTOR.config('DOCTOR');
    }
    if (roleUpper === 'ACCOUNTANT') {
      return PRESETS.ACCOUNTANT.config('ACCOUNTANT');
    }
    if (roleUpper === 'NURSE') {
      return PRESETS.DOCTOR.config('NURSE');
    }
    if (roleUpper === 'SECRETARY') {
      return PRESETS.RECEPTION.config('SECRETARY');
    }
    // Default RECEPTIONIST
    return PRESETS.RECEPTION.config('RECEPTIONIST');
  }

  public static getAllRoleConfigs(): Record<string, RoleWorkspaceConfig> {
    if (typeof window === 'undefined') return {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY_WORKSPACES);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // Fallback
    }

    // Seed defaults
    const defaults: Record<string, RoleWorkspaceConfig> = {
      ADMIN: PRESETS.ADMIN.config('ADMIN'),
      CLINIC_MANAGER: PRESETS.MANAGER.config('CLINIC_MANAGER'),
      DOCTOR: PRESETS.DOCTOR.config('DOCTOR'),
      RECEPTIONIST: PRESETS.RECEPTION.config('RECEPTIONIST'),
      NURSE: PRESETS.DOCTOR.config('NURSE'),
      ACCOUNTANT: PRESETS.ACCOUNTANT.config('ACCOUNTANT'),
      SECRETARY: PRESETS.RECEPTION.config('SECRETARY'),
    };

    localStorage.setItem(STORAGE_KEY_WORKSPACES, JSON.stringify(defaults));
    return defaults;
  }

  public static getWorkspaceForRole(role: string): RoleWorkspaceConfig {
    const roleKey = role.toUpperCase();
    const all = this.getAllRoleConfigs();
    if (all[roleKey]) {
      return all[roleKey];
    }
    return this.getDefaultWorkspaceForRole(roleKey as WorkspaceRole);
  }

  public static saveRoleWorkspaceConfig(config: RoleWorkspaceConfig): void {
    const all = this.getAllRoleConfigs();
    all[config.role] = config;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_WORKSPACES, JSON.stringify(all));
    }
  }

  public static resetRoleToPreset(role: WorkspaceRole, presetKey: keyof typeof PRESETS): RoleWorkspaceConfig {
    const newConfig = PRESETS[presetKey].config(role);
    this.saveRoleWorkspaceConfig(newConfig);
    return newConfig;
  }
}
