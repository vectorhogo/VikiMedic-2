/**
 * VikiMedic v2 - Domain Types & Entities
 * Clean Architecture Layer: Domain
 */

export type ThemeType = 'theme-default' | 'clinic-olive' | 'theme-dark' | 'theme-rose';

export type DefaultRoleCode =
  | 'ADMIN'
  | 'CLINIC_MANAGER'
  | 'DOCTOR'
  | 'RECEPTIONIST'
  | 'NURSE'
  | 'ACCOUNTANT'
  | 'LABORATORY_STAFF'
  | 'RADIOLOGY_STAFF'
  | 'SECURITY_GUARD'
  | 'GUEST';

export type UserRole = DefaultRoleCode | string;

// ============================================================
// Phase 03 - Part 02: Role & Permission Engine Types
// ============================================================

export type PermissionModule =
  | 'DASHBOARD'
  | 'PATIENTS'
  | 'RECEPTION'
  | 'MEDICAL_RECORDS'
  | 'APPOINTMENTS'
  | 'SERVICES'
  | 'MEDICINES'
  | 'BILLING'
  | 'PAYMENTS'
  | 'INVOICES'
  | 'REPORTS'
  | 'SHIFT_MANAGEMENT'
  | 'USERS'
  | 'SETTINGS'
  | 'BACKUP'
  | 'ACTIVITY_LOG';

export type SystemModuleKey = PermissionModule;

export type PermissionAction =
  | 'VIEW'
  | 'CREATE'
  | 'EDIT'
  | 'DELETE'
  | 'PRINT'
  | 'EXPORT'
  | 'APPROVE'
  | 'RESTORE';

export type FieldPermissionKey =
  | 'PATIENTS.EDIT_PHONE'
  | 'PATIENTS.EDIT_NATIONAL_ID'
  | 'PATIENTS.EDIT_INSURANCE_AFTER_PAYMENT'
  | 'PATIENTS.VIEW_NATIONAL_ID'
  | 'PATIENTS.VIEW_PHONE'
  | 'MEDICAL_RECORDS.EDIT_DIAGNOSIS'
  | 'BILLING.EDIT_ITEM_PRICE';

export type SpecialPermissionKey =
  | 'EDIT_PRICES'
  | 'APPLY_DISCOUNTS'
  | 'REFUND_PAYMENTS'
  | 'CLOSE_CASHBOX'
  | 'OPEN_CLOSED_SHIFT'
  | 'DELETE_INVOICE'
  | 'EDIT_MEDICAL_RECORDS'
  | 'MANAGE_USERS'
  | 'MANAGE_INITIAL_SETUP';

export type ModulePermissionsMap = Record<PermissionModule, PermissionAction[]>;

export interface Role {
  id: string;
  code: string; // Unique identifier code e.g. "ADMIN", "SENIOR_REC"
  nameFa: string; // Persian Display Title e.g. "سرپرست پذیرش"
  descriptionFa?: string;
  isSystemDefault: boolean; // Protect default roles from deletion
  isDisabled: boolean;
  parentRoleId?: string; // Role Inheritance link
  modulePermissions: ModulePermissionsMap;
  fieldPermissions: Record<FieldPermissionKey, boolean>;
  specialPermissions: Record<SpecialPermissionKey, boolean>;
  
  // Future-Ready Enterprise Scope Fields:
  departmentIds?: string[];
  branchIds?: string[];
  clinicIds?: string[];
  temporaryAccessUntil?: string; // ISO string for time-based access
  
  createdAt: string;
  updatedAt: string;
}

export type RoleAuditAction =
  | 'ROLE_CREATED'
  | 'ROLE_UPDATED'
  | 'ROLE_DISABLED'
  | 'ROLE_ENABLED'
  | 'ROLE_DELETED'
  | 'ROLE_DUPLICATED'
  | 'PERMISSION_CHANGED'
  | 'ROLE_ASSIGNED';

export interface RoleAuditLog {
  id: string;
  timestamp: string;
  operatorUserId: string;
  operatorName: string;
  operatorRole: string;
  targetRoleCode: string;
  targetRoleName: string;
  action: RoleAuditAction;
  details: string;
  clinicId: string;
}

export interface Clinic {
  id: string;
  name: string; // e.g. "کلینیک تخصصی نوین - شعبه ولیعصر"
  code: string; // e.g. "CLK-101"
  city: string;
  address: string;
  phone: string;
  emergencyPhone?: string;
  activeDoctorsCount: number;
  licenseNumber: string; // کد پروانه کسب/پزشکی
  isPrimary: boolean;
  logoUrl?: string;
  taxNumber?: string; // شماره اقتصادی / شناسه ملی
  description?: string; // معرفی و توضیحات کلینیک
  workingHours?: string; // ساعات کاری پیش‌فرض
  email?: string; // ایمیل رسمی کلینیک
  website?: string; // وب‌سایت کلینیک
  morningShiftHours?: string; // شیفت صبح
  eveningShiftHours?: string; // شیفت عصر
  nightShiftHours?: string; // شیفت شب
  defaultCurrency?: string; // تومان / ریال
  defaultLanguage?: string; // فارسی / انگلیسی
  defaultPrinter?: string; // پرینتر فاکتور پیش‌فرض
  a4Printer?: string; // پرینتر A4 پیش‌فرض
  defaultPaperSize?: string; // سایز کاغذ پیش‌فرض (80mm / A5 / A4)
  receiptTemplate?: string; // قالب فاکتور پیش‌فرض
}

// ============================================================
// System Patch 01 & 01.1: Initial Setup, Reset & First-Run Types
// ============================================================

export interface SystemSafetyCheckResult {
  isSessionSafe: boolean;
  isCashboxClosed: boolean;
  isNoBackupRunning: boolean;
  isDatabaseHealthy: boolean;
  isStorageAvailable: boolean;
  isPassed: boolean;
  failureReasons: string[];
}

export interface SystemHealthReport {
  databaseIntegrity: boolean;
  relationshipValidation: boolean;
  missingSettingsCheck: boolean;
  storageValidation: boolean;
  backupValidation: boolean;
  passed: boolean;
  timestamp: string;
  details: string[];
}

export interface InitialStaffEntry {
  id: string;
  fullName: string;
  role: 'DOCTOR' | 'RECEPTIONIST' | 'NURSE' | 'SECURITY' | 'ACCOUNTANT' | 'SECRETARY';
  phone?: string;
  specialty?: string;
}

export interface SystemResetOptions {
  deleteUsers?: boolean;
  deleteMedicines?: boolean;
  deleteServices?: boolean;
}

export interface SystemResetReport {
  id: string;
  date: string;
  time: string;
  administratorName: string;
  administratorRole: string;
  deletedCounts: {
    patients: number;
    visits: number;
    medicalRecords: number;
    patientOrders: number;
    transactions: number;
    inventory: number;
    appointments: number;
    queue: number;
    shiftHandovers: number;
    shiftHistories: number;
    notifications: number;
    activityLogs: number;
    users?: number;
    medicines?: number;
    services?: number;
  };
  remainingCounts: {
    users: number;
    catalogItems: number;
    roles: number;
    shiftConfigs: number;
  };
  backupRefId: string;
  backupTimestamp: string;
}

export interface SystemBackupRecord {
  id: string;
  createdAt: string;
  createdBy: string;
  clinicId: string;
  dataSnapshot: Record<string, any>;
  recordCount: number;
}

// ============================================================
// Patch 03.0: User Management Foundation Domain Types
// ============================================================

export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'LOCKED' | 'ARCHIVED';

export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'ON_CALL' | 'TEMPORARY' | 'OTHER';

export interface UserStatusHistoryItem {
  id: string;
  previousStatus?: AccountStatus;
  newStatus: AccountStatus;
  changedBy: string;
  changedAt: string;
  reason?: string;
}

export type UserManagementLogAction =
  | 'USER_CREATED'
  | 'USER_EDITED'
  | 'ROLE_CHANGED'
  | 'PERMISSION_CHANGED'
  | 'PASSWORD_RESET'
  | 'ACCOUNT_LOCKED'
  | 'ACCOUNT_UNLOCKED'
  | 'STATUS_CHANGED';

export interface UserManagementLog {
  id: string;
  userId: string;
  userName: string;
  action: UserManagementLogAction;
  details: string;
  operatorId: string;
  operatorName: string;
  timestamp: string;
}

export interface UserStaff {
  id: string;

  // Personal Information
  firstName?: string;
  lastName?: string;
  fullName: string;
  nationalId?: string;
  personnelCode?: string;
  phone: string;
  mobile?: string;
  email: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  birthDate?: string;
  address?: string;
  avatarUrl?: string;
  profilePhotoUrl?: string;
  notes?: string;

  // Employment Information
  title: string; // Job Title
  department?: string; // e.g. "پزشکان", "پذیرش", "پرستاری", "مدیریت", "حسابداری", "امنیت"
  employmentType?: EmploymentType;
  startDate?: string;
  endDate?: string;
  clinicIds: string[];
  assignedShifts?: string[]; // e.g. ["MORNING", "EVENING", "NIGHT"]

  // Account & Security
  username?: string;
  role: UserRole;
  accountStatus: AccountStatus;
  permissionProfileType?: 'ROLE_DEFAULT' | 'CUSTOM';
  customModulePermissions?: ModulePermissionsMap;
  customFieldPermissions?: Record<FieldPermissionKey, boolean>;
  customSpecialPermissions?: Record<SpecialPermissionKey, boolean>;
  lastLogin?: string;
  lastLogout?: string;
  forcePasswordChange?: boolean;

  // Audit History
  createdBy?: string;
  createdAt?: string;
  modifiedBy?: string;
  updatedAt?: string;
  statusHistory?: UserStatusHistoryItem[];

  // Legacy/Clinical Fields
  isOnline: boolean;
  permissions: Permission[];
  medicalCouncilNumber?: string;
  specialty?: string;
}

export type Permission =
  | 'VIEW_PATIENTS'
  | 'CREATE_PATIENTS'
  | 'EDIT_PATIENTS'
  | 'DELETE_PATIENTS'
  | 'VIEW_QUEUE'
  | 'MANAGE_QUEUE'
  | 'DOCTOR_EMR'
  | 'VIEW_FINANCIALS'
  | 'CREATE_INVOICE'
  | 'VIEW_REPORTS'
  | 'MANAGE_STAFF'
  | 'MANAGE_CLINIC_SETTINGS'
  | 'ACCESS_PHARMACY';

export type Gender = 'MALE' | 'FEMALE';

export interface Patient {
  id: string;
  nationalId: string; // کد ملی (۱۰ رقمی)
  fileNumber: string; // شماره پرونده کلینیک
  firstName: string;
  lastName: string;
  fatherName?: string;
  gender: Gender;
  birthDate: string; // e.g. 1370/04/15
  phone: string; // شماره همراه
  emergencyPhone?: string;
  insuranceType: 'FREE' | 'TAMIN_INJTIMAI' | 'SALAMAT' | 'NIZAM_LASHKARI' | 'KOMITEH' | 'OTHER';
  insuranceNumber?: string;
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  address?: string;
  allergies?: string[];
  chronicDiseases?: string[];
  notes?: string;
  createdAt: string;
  clinicId: string;
  lastVisitDate?: string;
}

export type QueueStatus = 'WAITING' | 'IN_CONSULTATION' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export type PatientCareType = 'INTERNAL_DOCTOR' | 'EXTERNAL_DOCTOR' | 'NO_DOCTOR' | 'EMERGENCY';
export type VisitCareMode = 'DOCTOR_CONSULTATION' | 'DIRECT_SERVICE';

export interface ExternalDoctorDetails {
  doctorName: string;
  clinicName?: string;
  hospitalName?: string;
  prescriptionNumber?: string;
  notes?: string;
}

export interface QueueItem {
  id: string;
  queueNumber: number; // شماره نوبت
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientNationalId: string;
  fileNumber: string;
  doctorId: string;
  doctorName: string;
  clinicId: string;
  scheduledTime: string; // e.g. 10:30
  status: QueueStatus;
  visitType: 'GENERAL' | 'CHECKUP' | 'SPECIALIST' | 'EMERGENCY' | 'FOLLOWUP' | 'DIRECT_SERVICE';
  visitMode?: VisitCareMode;
  patientType?: PatientCareType;
  externalDoctorDetails?: ExternalDoctorDetails;
  directServicesList?: string[]; // e.g. ["تزریقات", "پانسمان", "نوار قلب"]
  createdAt: string;
  notes?: string;
}

export interface PrescriptionItem {
  id: string;
  drugName: string; // نام دارو (فارسی/انگلیسی)
  dosage: string; // دوز مصرفی (مثلا: هر ۸ ساعت یک عدد)
  quantity: number; // تعداد
  instructions?: string; // توضیحات تکمیلی
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  medicalCouncilNumber: string;
  clinicId: string;
  visitDate: string; // تاریخ و زمان
  chiefComplaint: string; // شرح حال اولیه بیمار
  diagnosis: string; // تشخیص پزشکی
  systolicBP?: number; // فشار خون سیستولیک
  diastolicBP?: number; // فشار خون دیاستولیک
  pulseRate?: number; // ضربان قلب
  temperature?: number; // درجه حرارت بدن
  weight?: number; // وزن به کیلوگرم
  treatmentNotes?: string;
  prescriptions: PrescriptionItem[];
  nextVisitDate?: string;
}

export type PaymentMethod = 'CASH' | 'POS' | 'CARD_TO_CARD' | 'INSURANCE' | 'CREDIT';

export interface FinancialTransaction {
  id: string;
  invoiceNumber: string; // شماره فاکتور
  patientId: string;
  patientName: string;
  clinicId: string;
  doctorId?: string;
  doctorName?: string;
  amountGross: number; // مبلغ کل به تومان
  discountAmount: number; // تخفیف
  insuranceCoverage: number; // سهم بیمه
  amountNet: number; // مبلغ قابل پرداخت
  paymentMethod: PaymentMethod;
  paymentStatus: 'PAID' | 'PENDING' | 'PARTIAL' | 'REFUNDED';
  description: string;
  createdAt: string; // تاریخ شمس/میلادی
  cashierName: string;
}

export interface InventoryItem {
  id: string;
  clinicId: string;
  code: string;
  name: string;
  category: 'DRUG' | 'EQUIPMENT' | 'CONSUMABLE' | 'OFFICE';
  unit: string;
  stockQuantity: number;
  minStockLevel: number;
  unitPrice: number;
  expiryDate?: string;
  location?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  clinicId: string;
}

// Patch 02.5: Shift Management & Staff Assignment Types
export type ShiftType = 'MORNING' | 'EVENING' | 'NIGHT' | 'CUSTOM';

export type ShiftPosition =
  | 'DOCTOR'
  | 'NURSE'
  | 'RECEPTIONIST'
  | 'SECURITY_GUARD'
  | 'CASHIER'
  | 'LAB_TECH'
  | 'RADIOLOGY_TECH'
  | 'CLEANER'
  | 'OTHER';

export interface ShiftStaffMember {
  position: ShiftPosition;
  positionTitleFa: string;
  staffName: string;
  staffId?: string;
  isDefault: boolean;
}

export interface ShiftConfig {
  id: string;
  clinicId: string;
  shiftType: ShiftType;
  shiftNameFa: string; // e.g. "شیفت صبح"
  startTime: string; // "08:00"
  endTime: string;   // "14:00"
  isEnabled: boolean;
  displayOrder: number;
  assignedStaff: Record<ShiftPosition, string>; // position -> staff name
}

export interface ShiftAssignmentHistory {
  id: string;
  clinicId: string;
  shiftConfigId: string;
  shiftNameFa: string;
  positionType: ShiftPosition;
  positionTitleFa: string;
  previousStaffName: string;
  newStaffName: string;
  modifiedBy: string;
  modificationDate: string;
  reason: string;
}

export interface ShiftHandoverChecklist {
  cashboxChecked: boolean;
  pendingPaymentsReviewed: boolean;
  waitingPatientsReviewed: boolean;
  reportsSaved: boolean;
  medicineRequestsReviewed: boolean;
}

export interface ShiftHandoverRecord {
  id: string;
  clinicId: string;
  shiftConfigId: string;
  shiftNameFa: string;
  initiatedAt: string;
  completedAt?: string;
  outgoingStaff: {
    doctor: string;
    receptionist: string;
    nurse: string;
    security: string;
  };
  incomingStaff: {
    doctor: string;
    receptionist: string;
    nurse: string;
    security: string;
  };
  staffReplacements?: {
    position: ShiftPosition;
    positionTitleFa: string;
    scheduledName: string;
    actualName: string;
    reason: string;
  }[];
  arrivalTime?: string;
  confirmedBy?: string;
  delayMinutes: number;
  waitingMinutes: number;
  overtimeMinutes: number;
  notes?: string;
  checklist: ShiftHandoverChecklist;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'MANUAL_OVERRIDE';
  isManualChange?: boolean;
  manualChangeType?: 'START' | 'END' | 'TRANSFER' | 'CORRECT';
  operatorName: string;
}

export interface ShiftAuditLog {
  id: string;
  clinicId: string;
  operatorName: string;
  date: string;
  time: string;
  shiftNameFa: string;
  actionType: 'START_SHIFT' | 'END_SHIFT' | 'TRANSFER_SHIFT' | 'CORRECT_SHIFT' | 'REPLACE_STAFF' | 'HANDOVER_COMPLETE';
  oldStaffName?: string;
  newStaffName?: string;
  positionTitleFa?: string;
  reason: string;
}

// Patch 02.6 & Catalog Patch 01: Catalog, Smart Clinical Workflow & Patient Order Types
export type CatalogItemType =
  | 'MEDICINE'
  | 'PRODUCT'
  | 'CONSUMABLE'
  | 'MEDICAL_SERVICE'
  | 'LAB_SERVICE'
  | 'RADIOLOGY_SERVICE'
  | 'DOCTOR_VISIT'
  | 'OTHER'
  | 'VISIT'
  | 'SERVICE'
  | 'LAB'
  | 'RADIOLOGY'
  | 'INJECTION'
  | 'EQUIPMENT';

export interface CatalogInsuranceRule {
  isCovered: boolean;
  coveragePercentage: number; // e.g. 70 (%)
  maxCoveredAmountRial?: number;
}

export interface InsuranceCoverageRule {
  id: string;
  providerId?: string;
  providerName: string; // e.g. "تأمین اجتماعی", "بیمه سلامت", "نیروهای مسلح", "بیمه صادرات"
  coveragePercentage: number; // 0-100 (%)
  maxCoverageAmount?: number; // Optional max covered amount in Toman
  fixedCoverageAmount?: number; // Optional fixed coverage amount in Toman
  effectiveDate: string; // ISO date string e.g. "2026-01-01"
  expirationDate?: string; // Optional ISO date string
  status: 'ACTIVE' | 'EXPIRED' | 'INACTIVE';
}

export interface CatalogPriceVersion {
  id: string;
  salePrice: number;
  purchasePrice?: number;
  currency: string; // e.g. "تومان"
  effectiveDate: string; // ISO string or YYYY-MM-DD
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  createdBy?: string;
  notes?: string;
}

export interface CatalogItem {
  id: string;
  clinicId: string;
  code: string; // e.g. "SRV-101", "DRG-202"
  barcode?: string;
  name: string; // e.g. "ویزیت متخصص غدد", "قرص لوزارتان ۵۰mg"
  category: string; // e.g. "ویزیت", "دارویی", "آزمایشگاه", "رادیولوژی", "خدمات عمومی"
  type: CatalogItemType;
  price: number; // Sale price in Toman
  purchasePrice?: number; // Purchase price in Toman (Required for MEDICINE, PRODUCT, CONSUMABLE)
  currency?: string; // Default 'تومان'
  effectiveDate?: string; // YYYY-MM-DD
  unit: string; // e.g. "عدد", "جلسه", "خدمت"
  insuranceRule: CatalogInsuranceRule; // Legacy rule for backward compatibility
  insuranceRules?: InsuranceCoverageRule[]; // Multi-provider coverage rules
  priceHistory?: CatalogPriceVersion[]; // Price version history
  taxPercentage: number; // e.g. 0 or 10 (%)
  status: 'ACTIVE' | 'INACTIVE';
  description?: string;
}

export function isPurchasePriceRequired(type: CatalogItemType): boolean {
  return (
    type === 'MEDICINE' ||
    type === 'PRODUCT' ||
    type === 'CONSUMABLE' ||
    type === 'EQUIPMENT'
  );
}

export interface CatalogItemProfit {
  grossProfit: number;
  profitMarginPct: number;
  markupPct: number;
}

export function calculateCatalogProfit(
  salePrice: number,
  purchasePrice?: number
): CatalogItemProfit {
  const pPrice = purchasePrice || 0;
  const grossProfit = salePrice - pPrice;
  const profitMarginPct = salePrice > 0 ? (grossProfit / salePrice) * 100 : 0;
  const markupPct = pPrice > 0 ? (grossProfit / pPrice) * 100 : 0;

  return {
    grossProfit,
    profitMarginPct: Math.round(profitMarginPct * 100) / 100,
    markupPct: Math.round(markupPct * 100) / 100,
  };
}

export function calculateInsuranceCoverageForItem(
  item: CatalogItem,
  providerName?: string,
  salePriceOverride?: number
): { coverageAmount: number; coveragePct: number; appliedRule?: InsuranceCoverageRule } {
  const price = salePriceOverride !== undefined ? salePriceOverride : item.price;
  if (!providerName || providerName === 'آزاد' || providerName === 'FREE') {
    return { coverageAmount: 0, coveragePct: 0 };
  }

  // Find active rule for specified provider
  const activeRule = item.insuranceRules?.find(
    (r) =>
      r.status === 'ACTIVE' &&
      r.providerName.trim().toLowerCase() === providerName.trim().toLowerCase()
  );

  if (activeRule) {
    let coverage = 0;
    // Calculation Priority: Fixed Amount > Percentage
    if (activeRule.fixedCoverageAmount && activeRule.fixedCoverageAmount > 0) {
      coverage = activeRule.fixedCoverageAmount;
    } else {
      coverage = (price * activeRule.coveragePercentage) / 100;
    }

    // Max coverage cap constraint
    if (activeRule.maxCoverageAmount && activeRule.maxCoverageAmount > 0) {
      coverage = Math.min(coverage, activeRule.maxCoverageAmount);
    }

    // Coverage cannot exceed sale price or be below 0
    coverage = Math.min(coverage, price);
    coverage = Math.max(0, coverage);

    const effectivePct = price > 0 ? (coverage / price) * 100 : 0;
    return {
      coverageAmount: Math.round(coverage),
      coveragePct: Math.round(effectivePct * 100) / 100,
      appliedRule: activeRule,
    };
  }

  // Fallback to default insuranceRule
  if (item.insuranceRule && item.insuranceRule.isCovered) {
    let coverage = (price * item.insuranceRule.coveragePercentage) / 100;
    if (
      item.insuranceRule.maxCoveredAmountRial &&
      item.insuranceRule.maxCoveredAmountRial > 0
    ) {
      coverage = Math.min(coverage, item.insuranceRule.maxCoveredAmountRial);
    }
    coverage = Math.min(coverage, price);
    return {
      coverageAmount: Math.round(coverage),
      coveragePct: item.insuranceRule.coveragePercentage,
    };
  }

  return { coverageAmount: 0, coveragePct: 0 };
}

export function normalizePersianText(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/‌/g, ' ')
    .replace(/\s+/g, ' ');
}

export function checkCatalogDuplicate(
  items: CatalogItem[],
  newItem: { code: string; barcode?: string; name: string },
  currentId?: string
): { isDuplicate: boolean; reason?: string; conflictingItem?: CatalogItem } {
  const normCode = newItem.code.trim().toLowerCase();
  const normBarcode = newItem.barcode ? newItem.barcode.trim().toLowerCase() : '';
  const normName = normalizePersianText(newItem.name);

  for (const item of items) {
    if (currentId && item.id === currentId) continue;

    if (item.code.trim().toLowerCase() === normCode) {
      return {
        isDuplicate: true,
        reason: `کد اختصاصی «${item.code}» تکراری است و قبلاً برای «${item.name}» ثبت شده است.`,
        conflictingItem: item,
      };
    }

    if (
      normBarcode &&
      item.barcode &&
      item.barcode.trim().toLowerCase() === normBarcode
    ) {
      return {
        isDuplicate: true,
        reason: `بارکد تجاری «${item.barcode}» تکراری است و قبلاً برای «${item.name}» ثبت شده است.`,
        conflictingItem: item,
      };
    }

    if (normalizePersianText(item.name) === normName) {
      return {
        isDuplicate: true,
        reason: `عنوان هم‌نام «${item.name}» قبلاً در کاتالوگ با کد (${item.code}) ثبت گردیده است.`,
        conflictingItem: item,
      };
    }
  }

  return { isDuplicate: false };
}

export interface CatalogDiagnosticReport {
  timestamp: string;
  totalItems: number;
  activeItemsCount: number;
  inactiveItemsCount: number;
  validCategoriesCount: number;
  priceIssuesCount: number;
  brokenReferencesCount: number;
  duplicatesCount: number;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  details: string[];
}

export function runCatalogDiagnosticCheck(items: CatalogItem[]): CatalogDiagnosticReport {
  const details: string[] = [];
  let priceIssuesCount = 0;
  let brokenReferencesCount = 0;
  let duplicatesCount = 0;

  if (!items || items.length === 0) {
    return {
      timestamp: new Date().toISOString(),
      totalItems: 0,
      activeItemsCount: 0,
      inactiveItemsCount: 0,
      validCategoriesCount: 0,
      priceIssuesCount: 0,
      brokenReferencesCount: 0,
      duplicatesCount: 0,
      status: 'CRITICAL',
      details: ['کاتالوگ کاملاً خالی است. هیچ خدمت یا دارویی یافت نشد.'],
    };
  }

  const activeItems = items.filter((i) => i.status === 'ACTIVE');
  const inactiveItems = items.filter((i) => i.status === 'INACTIVE');
  const categories = new Set(items.map((i) => i.category?.trim()).filter(Boolean));

  if (activeItems.length === 0) {
    details.push('هشدار: هیچ آیتم فعالی برای انتخاب در پذیرش وجود ندارد.');
  }

  const seenIds = new Set<string>();
  const seenCodes = new Set<string>();
  const seenBarcodes = new Set<string>();

  items.forEach((item, index) => {
    // ID Check
    if (!item.id || seenIds.has(item.id)) {
      brokenReferencesCount++;
      details.push(`شناسه تکراری یا مفقود در ردیف ${index + 1}: ${item.id || 'بدون شناسه'}`);
    } else {
      seenIds.add(item.id);
    }

    // Code Check
    const codeKey = item.code?.trim().toLowerCase();
    if (!codeKey) {
      brokenReferencesCount++;
      details.push(`آیتم «${item.name || index + 1}» فاقد کد اختصاصی است.`);
    } else if (seenCodes.has(codeKey)) {
      duplicatesCount++;
      details.push(`کد اختصاصی تکراری «${item.code}» برای آیتم «${item.name}»`);
    } else {
      seenCodes.add(codeKey);
    }

    // Barcode Check
    if (item.barcode?.trim()) {
      const barcodeKey = item.barcode.trim().toLowerCase();
      if (seenBarcodes.has(barcodeKey)) {
        duplicatesCount++;
        details.push(`بارکد تکراری «${item.barcode}» برای آیتم «${item.name}»`);
      } else {
        seenBarcodes.add(barcodeKey);
      }
    }

    // Sale Price Check
    if (typeof item.price !== 'number' || isNaN(item.price) || item.price < 0) {
      priceIssuesCount++;
      details.push(`تعرفه فروش نامعتبر در «${item.name}»: ${item.price}`);
    }

    // Purchase Price Check for Products/Medicines
    if (isPurchasePriceRequired(item.type)) {
      if (
        item.purchasePrice === undefined ||
        item.purchasePrice === null ||
        isNaN(item.purchasePrice) ||
        item.purchasePrice < 0
      ) {
        priceIssuesCount++;
        details.push(`قیمت خرید برای دارو/کالای «${item.name}» تعیین نشده یا منفی است.`);
      }
    }

    // Category Check
    if (!item.category || !item.category.trim()) {
      details.push(`آیتم «${item.name}» فاقد دسته‌بندی موضوعی است.`);
    }
  });

  let status: 'HEALTHY' | 'WARNING' | 'CRITICAL' = 'HEALTHY';
  if (priceIssuesCount > 0 || brokenReferencesCount > 0 || duplicatesCount > 0) {
    status = brokenReferencesCount > 0 ? 'CRITICAL' : 'WARNING';
  }

  if (details.length === 0) {
    details.push('تمام آیتم‌های کاتالوگ سالم، دارای تعرفه معتبر و آماده همگام‌سازی لحظه‌ای با پذیرش هستند.');
  }

  return {
    timestamp: new Date().toISOString(),
    totalItems: items.length,
    activeItemsCount: activeItems.length,
    inactiveItemsCount: inactiveItems.length,
    validCategoriesCount: categories.size,
    priceIssuesCount,
    brokenReferencesCount,
    duplicatesCount,
    status,
    details,
  };
}

export interface PatientOrderItem {
  id: string;
  catalogItemId: string;
  itemCode: string;
  itemName: string;
  itemType: CatalogItemType;
  category: string;
  unitPrice: number;
  quantity: number;
  unit: string;
  totalGross: number; // unitPrice * quantity
  insuranceShare: number; // calculated based on patient insurance & coverage %
  patientShare: number; // totalGross - insuranceShare
  discount: number; // custom item discount
  tax: number; // tax amount
  totalNet: number; // patientShare - discount + tax
  instructions?: string; // e.g. "هر ۸ ساعت با آب فراوان"
  addedByRole: 'DOCTOR' | 'RECEPTIONIST' | 'ADMIN';
  addedByName: string;
  createdAt: string;
}

export type PatientOrderStatus =
  | 'DRAFT'
  | 'UNDER_REVIEW'
  | 'READY_FOR_BILLING'
  | 'PAID'
  | 'CANCELLED'
  | 'ARCHIVED';

export type OrderModificationAction =
  | 'ADD_ITEM'
  | 'REMOVE_ITEM'
  | 'EDIT_QUANTITY'
  | 'EDIT_PRICE'
  | 'APPLY_DISCOUNT'
  | 'CHANGE_INSURANCE'
  | 'STATUS_CHANGE'
  | 'CANCEL_PAYMENT'
  | 'REOPEN_ORDER';

export interface OrderModificationLog {
  id: string;
  orderId: string;
  modifiedBy: string;
  userRole: UserRole;
  action: OrderModificationAction;
  oldValue: string;
  newValue: string;
  reason: string;
  timestamp: string;
}

export interface PatientOrderPrintHistory {
  printedBy: string;
  printedAt: string;
  reason?: string;
}

export interface PatientOrder {
  id: string;
  orderNumber: string; // e.g. "ORD-1403-1001"
  patientId: string;
  patientName: string;
  patientNationalId: string;
  patientPhone: string;
  patientFileNumber: string;
  clinicId: string;
  doctorId: string;
  doctorName: string;
  receptionistName: string;
  shiftNameFa: string; // Attached current shift name
  shiftStaffDetails?: {
    doctorName: string;
    receptionistName: string;
    cashierName: string;
    nurseName: string;
    securityName: string;
  };
  status: PatientOrderStatus;
  items: PatientOrderItem[];
  totalGross: number;
  totalInsuranceShare: number;
  totalDiscount: number;
  totalTax: number;
  totalPatientShare: number; // Final net payable by patient
  notes?: string;
  insuranceType: 'FREE' | 'TAMIN_INJTIMAI' | 'SALAMAT' | 'NIZAM_LASHKARI' | 'KOMITEH' | 'OTHER';
  insuranceNumber?: string;
  visitMode?: VisitCareMode;
  patientType?: PatientCareType;
  externalDoctorDetails?: ExternalDoctorDetails;
  paymentMethod?: PaymentMethod | 'MIXED';
  paymentDetails?: {
    cashAmount: number;
    posAmount: number;
    cardAmount: number;
    insuranceAmount: number;
  };
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  printCount: number;
  printHistory: PatientOrderPrintHistory[];
  modificationLogs: OrderModificationLog[];
}

// ============================================================
// Phase 03 - Part 01: Authentication Core Domain Types
// ============================================================

export interface UserCredential {
  userId: string;
  username: string; // e.g. "admin", "doctor", "receptionist"
  email: string;
  phone: string;
  passwordHash: string; // Hashed password
  salt: string;
  failedAttempts: number;
  isLocked: boolean;
  lockedUntil: string | null; // ISO timestamp
  passwordChangedAt: string;
  forcePasswordChange?: boolean;
}

export interface AuthSession {
  sessionId: string;
  userId: string;
  username: string;
  fullName: string;
  role: UserRole;
  loginTime: string;
  lastActivity: string;
  device: string;
  platform: 'Desktop (Offline Native)' | 'Web Browser';
  clinicId: string;
  clinicName: string;
  shiftId?: string;
  shiftNameFa?: string;
  authToken: string;
  rememberMe: boolean;
}

export type AuthActionType =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'ACCOUNT_LOCKED'
  | 'ACCOUNT_UNLOCKED'
  | 'LOGOUT'
  | 'SESSION_TIMEOUT'
  | 'SCREEN_LOCK'
  | 'SCREEN_UNLOCK'
  | 'PASSWORD_CHANGE'
  | 'CREDENTIAL_CREATED'
  | 'SETTINGS_UPDATE'
  | 'INITIAL_SETUP_RESET';

export interface AuthActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  username: string;
  fullName: string;
  userRole: UserRole;
  action: AuthActionType;
  details: string;
  device: string;
  clinicId: string;
  ipAddress?: string;
}

export interface PasswordPolicy {
  minLength: number;
  requireNumbers: boolean;
  requireLetters: boolean;
  maxFailedAttempts: number;
  lockoutDurationMinutes: number;
  inactivityTimeoutMinutes: number;
}

// ============================================================
// Patch 03.6: Enterprise Reporting Engine & Direct Service Types
// ============================================================

export type ReportDatePreset =
  | 'TODAY'
  | 'YESTERDAY'
  | 'THIS_WEEK'
  | 'LAST_WEEK'
  | 'THIS_MONTH'
  | 'LAST_MONTH'
  | 'THIS_YEAR'
  | 'CUSTOM'
  | 'CUSTOM_DATETIME';

export interface ReportFilterState {
  datePreset: ReportDatePreset;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  doctorId?: string;
  receptionistId?: string;
  shiftType?: 'ALL' | 'MORNING' | 'EVENING' | 'NIGHT';
  insuranceType?: string;
  patientId?: string;
  serviceId?: string;
  medicineId?: string;
  paymentMethod?: PaymentMethod | 'ALL';
  clinicId?: string;
  patientCareType?: 'ALL' | PatientCareType;
  visitCareMode?: 'ALL' | VisitCareMode;
  itemType?: 'ALL' | 'MEDICINE' | 'SERVICE' | 'PRODUCT' | 'CONSUMABLE';
  itemId?: string;
  category?: string;
  invoiceStatus?: 'ALL' | 'PAID' | 'READY_FOR_BILLING' | 'CANCELLED';
  groupBy?: 'ITEM' | 'DAY' | 'WEEK' | 'MONTH' | 'CATEGORY' | 'DOCTOR' | 'SHIFT';
  comparisonMode?: 'NONE' | 'PREVIOUS_PERIOD' | 'THIS_VS_LAST_MONTH' | 'SHIFTS';
  salesReportType?: 'COMBINED' | 'MEDICINE' | 'SERVICE' | 'PRODUCT' | 'CONSUMABLE';
}

export interface ReportSnapshot {
  id: string;
  title: string;
  reportCategory: 'FINANCIAL' | 'PATIENT' | 'SERVICE' | 'MEDICINE' | 'DOCTOR' | 'SHIFT' | 'EMPLOYEE';
  createdAt: string;
  createdBy: string;
  clinicId: string;
  filters: ReportFilterState;
  summaryMetrics: {
    totalRevenue: number;
    patientCount: number;
    transactionCount: number;
    insuranceTotal: number;
    discountTotal: number;
    refundTotal: number;
    outstandingTotal: number;
  };
  notes?: string;
}

export interface ScheduledReportConfig {
  id: string;
  title: string;
  reportCategory: 'FINANCIAL' | 'PATIENT' | 'SERVICE' | 'MEDICINE' | 'DOCTOR' | 'SHIFT' | 'EMPLOYEE';
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  executionTime: string; // "23:59"
  recipientsEmail: string[];
  isEnabled: boolean;
  lastRunAt?: string;
  nextRunAt?: string;
}

export interface ReportExportLog {
  id: string;
  reportTitle: string;
  exportFormat: 'PDF' | 'EXCEL' | 'CSV' | 'PRINT';
  exportedBy: string;
  userRole: UserRole;
  timestamp: string;
  filterSummary: string;
  recordCount: number;
}

// Catalog Patch 05: Excel Import, Mapping, Validation, Preview & Audit Types
export type CatalogTargetField =
  | 'name'
  | 'type'
  | 'category'
  | 'code'
  | 'barcode'
  | 'unit'
  | 'purchasePrice'
  | 'price'
  | 'description'
  | 'status'
  | 'insuranceSupport'
  | 'insuranceProvider'
  | 'insurancePercentage'
  | 'IGNORE';

export interface TargetFieldDefinition {
  key: CatalogTargetField;
  labelPersian: string;
  labelEnglish: string;
  required: boolean;
}

export type CatalogDuplicateStrategy = 'SKIP' | 'UPDATE' | 'CREATE_COPY';

export type ImportRowValidationStatus = 'VALID' | 'WARNING' | 'INVALID';

export type ImportPlannedAction = 'ADD' | 'UPDATE' | 'SKIP' | 'CREATE_COPY' | 'REJECTED';

export interface CatalogImportRowValidation {
  rowIndex: number; // 1-based index from Excel
  sourceData: Record<string, any>;
  mappedItem: {
    name: string;
    type: CatalogItemType;
    category: string;
    code: string;
    barcode: string;
    unit: string;
    purchasePrice: number;
    price: number;
    description: string;
    status: 'ACTIVE' | 'INACTIVE';
    insuranceSupport: boolean;
    insuranceProvider?: string;
    insurancePercentage?: number;
  };
  validationStatus: ImportRowValidationStatus;
  plannedAction: ImportPlannedAction;
  issues: string[];
  conflictingItem?: CatalogItem;
}

export interface CatalogImportAuditLog {
  id: string;
  importedBy: string;
  fileName: string;
  importTime: string; // ISO string
  result: 'SUCCESS' | 'PARTIAL' | 'FAILED' | 'ROLLED_BACK';
  rowsRead: number;
  itemsAdded: number;
  itemsUpdated: number;
  rowsSkipped: number;
  errorCount: number;
  warningCount: number;
  duplicateStrategy: CatalogDuplicateStrategy;
  details?: string;
}

export interface CatalogImportSummaryReport {
  fileName: string;
  importedBy: string;
  timestamp: string;
  rowsRead: number;
  itemsAdded: number;
  itemsUpdated: number;
  rowsSkipped: number;
  duplicatesFound: number;
  errorsCount: number;
  warningsCount: number;
  auditLogId: string;
}

// ============================================================
// Phase 03.8: Medical Staff Center (مرکز کادر درمان) Types
// ============================================================

export type StaffCategory =
  | 'DOCTOR'
  | 'NURSE'
  | 'MIDWIFE'
  | 'PSYCHOLOGIST'
  | 'NUTRITIONIST'
  | 'PHYSIOTHERAPIST'
  | 'TECHNICIAN'
  | 'OTHER';

export type StaffMemberStatus = 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';

export interface MedicalStaffMember {
  id: string;
  fullName: string;
  medicalCouncilNumber?: string; // شماره نظام پزشکی
  nationalId: string;
  phone: string;
  specialty: string;
  subSpecialty?: string;
  staffCategory: StaffCategory;
  employmentType: EmploymentType;
  employmentDate: string;
  status: StaffMemberStatus;
  photoUrl?: string;
  notes?: string;
  baseSalary?: number;
  workingDays?: string[];
}

export interface CommissionTier {
  id: string;
  tierName?: string;
  priority?: number;
  minRevenue: number;
  maxRevenue: number | null; // null for above
  commissionPercentage: number; // Doctor Percentage
  clinicPercentage?: number; // Clinic Percentage (100 - commissionPercentage)
  status?: 'ACTIVE' | 'INACTIVE';
  description?: string;
  shiftType?: 'ALL' | 'MORNING' | 'EVENING' | 'NIGHT';
  fixedAmount?: number; // Optional fixed amount for Fixed/Hybrid mode
}

export type CommissionCalculationMethod =
  | 'PERCENTAGE_OF_EXCESS'
  | 'PERCENTAGE_OF_TOTAL'
  | 'FIXED_PERCENTAGE'
  | 'MULTI_LEVEL_PERCENTAGE'
  | 'FIXED_AMOUNT'
  | 'HYBRID';

export type DoctorContractScope = 'PERSONAL' | 'DEPARTMENT' | 'CLINIC_DEFAULT';

export interface ContractAuditLog {
  id: string;
  contractId: string;
  action: 'Tier Created' | 'Tier Edited' | 'Tier Deleted' | 'Percentage Changed' | 'Revenue Recalculated' | 'Contract Saved';
  adminName: string;
  adminRole: string;
  timestamp: string;
  details: string;
}

export interface StaffContract {
  id: string;
  staffId: string;
  contractNumber: string;
  contractScope?: DoctorContractScope; // PERSONAL | DEPARTMENT | CLINIC_DEFAULT
  departmentName?: string;
  startDate: string;
  endDate: string;
  visitTariff: number;
  morningShiftTariff: number;
  eveningShiftTariff: number;
  nightShiftTariff: number;
  revenueThreshold: number; // آستانه درآمد
  calculationMethod: CommissionCalculationMethod;
  fixedBaseSalary?: number; // Base salary for Hybrid mode
  commissionTiers: CommissionTier[];
  insuranceSupport: boolean;
  contractStatus: 'ACTIVE' | 'EXPIRED' | 'DRAFT' | 'TERMINATED';
  createdAt: string;
  notes?: string;
  auditLogs?: ContractAuditLog[];
}

export interface ShiftPerformanceRecord {
  id: string;
  shiftDate: string;
  shiftType: 'MORNING' | 'EVENING' | 'NIGHT';
  staffId: string;
  patientsCount: number;
  visitCount: number;
  servicesCount: number;
  medicinesCount: number;
  totalRevenue: number;
  insuranceShare: number;
  cashShare: number;
  cardShare: number;
  averageVisitValue: number;
  workingHours: number;
  lateArrivalMinutes: number;
  extraHours: number;
}

export interface MonthlySettlementRecord {
  id: string;
  staffId: string;
  periodJalali: string; // e.g. "۱۴۰۵-۰۵"
  totalVisits: number;
  totalRevenue: number;
  calculatedCommission: number;
  bonusAmount: number;
  penaltyAmount: number;
  overtimeAmount: number;
  finalSettlementAmount: number;
  paymentStatus: 'PENDING' | 'APPROVED' | 'PAID' | 'CANCELLED';
  paymentDate?: string;
  paymentMethod?: 'DIRECT_TRANSFER' | 'CHEQUE' | 'CASH';
  receiptNumber?: string;
  approvedBy?: string;
  notes?: string;
}

export interface StaffScheduleItem {
  id: string;
  staffId: string;
  date: string;
  shiftType: 'MORNING' | 'EVENING' | 'NIGHT';
  status: 'SCHEDULED' | 'COMPLETED' | 'VACATION' | 'LEAVE' | 'REPLACED';
  replacementStaffId?: string;
  notes?: string;
}

export interface StaffAuditLogRecord {
  id: string;
  timestamp: string;
  userName: string;
  action: string;
  entityType: 'CONTRACT' | 'TARIFF' | 'COMMISSION' | 'SETTLEMENT' | 'SCHEDULE' | 'DOCTOR';
  details: string;
}




