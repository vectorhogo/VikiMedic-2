/**
 * VikiMedic v2 - Domain Types & Entities
 * Clean Architecture Layer: Domain
 */

export type ThemeType = 'theme-default' | 'theme-dark' | 'theme-rose';

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
  | 'MANAGE_USERS';

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
}

// ============================================================
// Patch 03.0: User Management Foundation Domain Types
// ============================================================

export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'LOCKED' | 'ARCHIVED';

export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'TEMPORARY' | 'OTHER';

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

// Patch 02.6: Catalog, Smart Clinical Workflow & Patient Order Types
export type CatalogItemType =
  | 'VISIT'
  | 'MEDICINE'
  | 'SERVICE'
  | 'LAB'
  | 'RADIOLOGY'
  | 'INJECTION'
  | 'CONSUMABLE'
  | 'EQUIPMENT'
  | 'OTHER';

export interface CatalogInsuranceRule {
  isCovered: boolean;
  coveragePercentage: number; // e.g. 70 (%)
  maxCoveredAmountRial?: number;
}

export interface CatalogItem {
  id: string;
  clinicId: string;
  code: string; // e.g. "SRV-101", "DRG-202"
  barcode?: string;
  name: string; // e.g. "ویزیت متخصص غدد", "قرص لوزارتان ۵۰mg"
  category: string; // e.g. "ویزیت", "دارویی", "آزمایشگاه", "رادیولوژی", "خدمات عمومی"
  type: CatalogItemType;
  price: number; // Base price in Toman
  unit: string; // e.g. "عدد", "جلسه", "خدمت"
  insuranceRule: CatalogInsuranceRule;
  taxPercentage: number; // e.g. 0 or 10 (%)
  status: 'ACTIVE' | 'INACTIVE';
  description?: string;
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
  | 'STATUS_CHANGE';

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
  | 'CREDENTIAL_CREATED';

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
  | 'CUSTOM';

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


