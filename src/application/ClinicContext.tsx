/**
 * VikiMedic v2 - Central Application & Clinic Context
 * Clean Architecture Layer: Application
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Clinic,
  UserStaff,
  Patient,
  QueueItem,
  MedicalRecord,
  FinancialTransaction,
  InventoryItem,
  AuditLog,
  UserRole,
  ShiftConfig,
  ShiftAssignmentHistory,
  ShiftHandoverRecord,
  ShiftAuditLog,
  ShiftPosition,
  CatalogItem,
  PatientOrder,
  PatientOrderItem,
  PatientOrderStatus,
  OrderModificationAction,
  PaymentMethod,
  AccountStatus,
  EmploymentType,
  UserManagementLog,
  SystemResetOptions,
  SystemResetReport,
  SystemBackupRecord,
  SystemSafetyCheckResult,
  SystemHealthReport,
  ModulePermissionsMap,
  FieldPermissionKey,
  SpecialPermissionKey,
  UserCredential,
  ReportSnapshot,
  ScheduledReportConfig,
  ReportExportLog,
  PatientCareType,
  VisitCareMode,
} from '../domain/types';
import { LocalStorageManager } from '../infrastructure/storage';
import { CryptoService } from '../infrastructure/cryptoService';
import { ModuleIntegrityService } from '../infrastructure/moduleIntegrityService';

export type AppModule =
  | 'dashboard'
  | 'patients'
  | 'queue'
  | 'doctor_emr'
  | 'financials'
  | 'pharmacy'
  | 'medical_staff_center'
  | 'reports'
  | 'staff'
  | 'settings'
  | 'design_system'
  | 'architecture'
  | 'ai_rules'
  | 'quality_assurance'
  | 'app_bootstrap'
  | 'dev_environment'
  | 'shared_infrastructure'
  | 'database_architecture';

export interface NotificationItem {
  id: string;
  type: 'success' | 'info' | 'warning' | 'danger';
  message: string;
  timestamp: string;
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  targetType: 'patient' | 'queue' | 'transaction' | null;
  data: any;
}

interface ClinicContextType {
  // Active State
  activeModule: AppModule;
  setActiveModule: (module: AppModule) => void;
  activeClinic: Clinic;
  clinics: Clinic[];
  switchClinic: (clinicId: string) => void;
  activeUser: UserStaff;
  staffList: UserStaff[];
  switchUserRole: (role: UserRole) => void;
  switchActiveUser: (userId: string) => void;

  // Data Collections
  patients: Patient[];
  queue: QueueItem[];
  medicalRecords: MedicalRecord[];
  transactions: FinancialTransaction[];
  inventory: InventoryItem[];
  auditLogs: AuditLog[];

  // Mutative Actions
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt' | 'fileNumber' | 'clinicId'>) => Patient;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  addQueueItem: (item: Omit<QueueItem, 'id' | 'queueNumber' | 'createdAt' | 'clinicId'>) => QueueItem;
  updateQueueStatus: (id: string, status: QueueItem['status']) => void;
  addMedicalRecord: (record: Omit<MedicalRecord, 'id' | 'visitDate' | 'clinicId'>) => MedicalRecord;
  addTransaction: (tx: Omit<FinancialTransaction, 'id' | 'invoiceNumber' | 'createdAt' | 'clinicId'>) => FinancialTransaction;
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'clinicId'>) => InventoryItem;
  updateClinicSettings: (updatedClinic: Clinic) => void;
  addClinic: (newClinic: Omit<Clinic, 'id' | 'activeDoctorsCount'>) => void;

  // Global Command Palette & Search Modal
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;

  // Context Menu
  contextMenu: ContextMenuState;
  showContextMenu: (x: number, y: number, targetType: 'patient' | 'queue' | 'transaction', data: any) => void;
  hideContextMenu: () => void;

  // Modals
  isNewPatientModalOpen: boolean;
  setIsNewPatientModalOpen: (open: boolean) => void;
  isNewAppointmentModalOpen: boolean;
  setIsNewAppointmentModalOpen: (open: boolean) => void;

  // Print Modals
  activePrintInvoice: FinancialTransaction | null;
  setActivePrintInvoice: (tx: FinancialTransaction | null) => void;
  activePrintPrescription: MedicalRecord | null;
  setActivePrintPrescription: (mr: MedicalRecord | null) => void;
  activePrintOrder: PatientOrder | null;
  setActivePrintOrder: (order: PatientOrder | null) => void;

  // Patch 02.5: Shift Management & Active Shift Context
  shiftConfigs: ShiftConfig[];
  shiftHistories: ShiftAssignmentHistory[];
  activeShiftConfig: ShiftConfig | null;
  setActiveShiftConfigId: (shiftId: string) => void;
  updateShiftConfig: (
    updatedShift: ShiftConfig,
    reason: string,
    changedPosition?: ShiftPosition,
    previousStaffName?: string,
    newStaffName?: string
  ) => void;
  validateShiftTimes: (shifts: ShiftConfig[]) => { isValid: boolean; errorMessage?: string };
  getShiftStaffForPosition: (position: ShiftPosition) => string;

  // Patch 07: Shift Control Center State & Actions
  isShiftControlCenterOpen: boolean;
  setIsShiftControlCenterOpen: (open: boolean) => void;
  shiftHandovers: ShiftHandoverRecord[];
  shiftAuditLogs: ShiftAuditLog[];
  recordShiftHandover: (handover: ShiftHandoverRecord) => void;
  performManualShiftAction: (
    actionType: 'START_SHIFT' | 'END_SHIFT' | 'TRANSFER_SHIFT' | 'CORRECT_SHIFT',
    shiftConfigId: string,
    reason: string,
    staffChanges?: Partial<Record<ShiftPosition, string>>
  ) => void;

  // System Patch 01 & 01.1: Initial Setup, Reset & First-Run
  isSetupWizardOpen: boolean;
  setIsSetupWizardOpen: (open: boolean) => void;
  systemResetReports: SystemResetReport[];
  executeSystemReset: (
    options: SystemResetOptions,
    adminPassword: string
  ) => Promise<{ success: boolean; report?: SystemResetReport; error?: string }>;
  validateResetSafetyChecks: () => SystemSafetyCheckResult;
  restoreSystemBackup: (backupId: string) => boolean;
  performSystemHealthCheck: () => SystemHealthReport;
  loadDemoData: () => { patientsCount: number; visitsCount: number; transactionsCount: number };
  systemHealthReport: SystemHealthReport | null;
  setSystemHealthReport: (report: SystemHealthReport | null) => void;

  // Patch 02.6: Centralized Catalog Management
  catalogItems: CatalogItem[];
  addCatalogItem: (item: Omit<CatalogItem, 'id' | 'clinicId'>) => CatalogItem;
  updateCatalogItem: (item: CatalogItem) => void;

  // Patch 02.6: Patient Order & Smart Clinical Workflow
  patientOrders: PatientOrder[];
  createPatientOrder: (
    patientId: string,
    items: Omit<PatientOrderItem, 'id' | 'createdAt'>[],
    notes?: string,
    initialStatus?: PatientOrderStatus
  ) => PatientOrder;
  updatePatientOrder: (
    orderId: string,
    updatedOrder: PatientOrder,
    action: OrderModificationAction,
    reason: string
  ) => void;
  finalizeOrderAndPay: (
    orderId: string,
    paymentMethod: PaymentMethod | 'MIXED',
    paymentDetails?: PatientOrder['paymentDetails']
  ) => PatientOrder;
  reopenPatientOrder: (orderId: string, reason?: string) => PatientOrder | null;
  printOrderReceipt: (orderId: string, reason?: string) => void;
  getOrdersForPatient: (patientId: string) => PatientOrder[];
  calculateOrderTotals: (
    items: PatientOrderItem[],
    overallDiscount?: number
  ) => {
    totalGross: number;
    totalInsuranceShare: number;
    totalDiscount: number;
    totalTax: number;
    totalPatientShare: number;
  };

  // Notifications
  notifications: NotificationItem[];
  addNotification: (message: string, type?: NotificationItem['type']) => void;
  removeNotification: (id: string) => void;

  // Patch 03.0: User Management Foundation Engine
  userManagementLogs: UserManagementLog[];
  addUserManagementLog: (log: Omit<UserManagementLog, 'id' | 'timestamp'>) => UserManagementLog;
  createUser: (userData: Partial<UserStaff> & { temporaryPassword?: string }) => UserStaff;
  updateUser: (userId: string, updates: Partial<UserStaff>) => void;
  setUserStatus: (userId: string, newStatus: AccountStatus, reason?: string) => void;
  resetUserPassword: (userId: string, customPassword?: string, forceChange?: boolean) => string;
  setUserCustomPermissions: (
    userId: string,
    customModulePermissions: ModulePermissionsMap,
    customFieldPermissions?: Record<FieldPermissionKey, boolean>,
    customSpecialPermissions?: Record<SpecialPermissionKey, boolean>
  ) => void;

  // Patch 03.6: Direct Service & Enterprise Reporting Engine
  directServiceConfig: {
    requiresDoctorConsultation: boolean;
    directServiceOnly: boolean;
    enabledServices: string[];
  };
  updateDirectServiceConfig: (config: {
    requiresDoctorConsultation: boolean;
    directServiceOnly: boolean;
    enabledServices: string[];
  }) => void;

  reportSnapshots: ReportSnapshot[];
  addReportSnapshot: (snapshot: Omit<ReportSnapshot, 'id' | 'createdAt'>) => void;
  deleteReportSnapshot: (id: string) => void;

  scheduledReports: ScheduledReportConfig[];
  addScheduledReport: (config: Omit<ScheduledReportConfig, 'id'>) => void;
  toggleScheduledReport: (id: string) => void;

  reportExportLogs: ReportExportLog[];
  logReportExport: (log: Omit<ReportExportLog, 'id' | 'timestamp'>) => void;

  // Quick Action Triggers
  refreshData: () => void;
}

const ClinicContext = createContext<ClinicContextType | null>(null);

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize Storage seed & run Module Integrity Startup Check on mount
  useEffect(() => {
    LocalStorageManager.initialize();
    ModuleIntegrityService.runStartupValidation();
    if (LocalStorageManager.isFirstRunOrFreshReset()) {
      setIsSetupWizardOpen(true);
    }
  }, []);

  // State Declarations
  const [activeModule, setActiveModule] = useState<AppModule>('dashboard');
  const [clinics, setClinics] = useState<Clinic[]>(() => LocalStorageManager.getClinics());
  const [activeClinicId, setActiveClinicId] = useState<string>(() => LocalStorageManager.getActiveClinicId());
  
  const [staffList, setStaffList] = useState<UserStaff[]>(() => LocalStorageManager.getStaff());
  const [activeUserId, setActiveUserId] = useState<string>(() => LocalStorageManager.getActiveUserId());

  const [patients, setPatients] = useState<Patient[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Patch 02.5: Shift Management State
  const [shiftConfigs, setShiftConfigs] = useState<ShiftConfig[]>([]);
  const [shiftHistories, setShiftHistories] = useState<ShiftAssignmentHistory[]>([]);
  const [manualActiveShiftId, setManualActiveShiftId] = useState<string | null>(null);

  // Patch 07: Shift Control Center State
  const [isShiftControlCenterOpen, setIsShiftControlCenterOpen] = useState<boolean>(false);
  const [shiftHandovers, setShiftHandovers] = useState<ShiftHandoverRecord[]>(() => LocalStorageManager.getShiftHandovers());
  const [shiftAuditLogs, setShiftAuditLogs] = useState<ShiftAuditLog[]>(() => LocalStorageManager.getShiftAuditLogs());

  // System Patch 01 & 01.1: Initial Setup, Reset & Health State
  const [isSetupWizardOpen, setIsSetupWizardOpen] = useState<boolean>(false);
  const [systemResetReports, setSystemResetReports] = useState<SystemResetReport[]>(() =>
    LocalStorageManager.getSystemResetReports()
  );
  const [systemHealthReport, setSystemHealthReport] = useState<SystemHealthReport | null>(null);

  const validateResetSafetyChecks = (): SystemSafetyCheckResult => {
    return LocalStorageManager.validateResetSafetyChecks(activeClinicId);
  };

  const restoreSystemBackup = (backupId: string): boolean => {
    const ok = LocalStorageManager.restoreSystemBackup(backupId);
    if (ok) {
      setPatients(LocalStorageManager.getPatients());
      setQueue(LocalStorageManager.getQueue());
      setMedicalRecords(LocalStorageManager.getMedicalRecords());
      setTransactions(LocalStorageManager.getTransactions());
      setInventory(LocalStorageManager.getInventory());
      setPatientOrders(LocalStorageManager.getPatientOrders());
      setShiftHistories(LocalStorageManager.getShiftHistories());
      setShiftHandovers(LocalStorageManager.getShiftHandovers());
      setStaffList(LocalStorageManager.getStaff());
      setCatalogItems(LocalStorageManager.getCatalogItems());
      addNotification(`نسخه پشتیبان (شناسه: ${backupId}) با موفقیت بازیابی شد.`, 'success');
    }
    return ok;
  };

  const performSystemHealthCheck = (): SystemHealthReport => {
    const report = LocalStorageManager.performSystemHealthCheck();
    setSystemHealthReport(report);
    return report;
  };

  const loadDemoData = (): { patientsCount: number; visitsCount: number; transactionsCount: number } => {
    const res = LocalStorageManager.loadDemoData();
    setPatients(LocalStorageManager.getPatients());
    setMedicalRecords(LocalStorageManager.getMedicalRecords());
    setTransactions(LocalStorageManager.getTransactions());
    addNotification('داده‌های آزمایشی درمانگاه با موفقیت بارگذاری گردیدند.', 'success');
    return res;
  };

  // Patch 02.6: Catalog & Patient Order State
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [patientOrders, setPatientOrders] = useState<PatientOrder[]>([]);
  const [activePrintOrder, setActivePrintOrder] = useState<PatientOrder | null>(null);

  // Patch 03.6: Direct Service Config & Enterprise Reporting Engine State
  const [directServiceConfig, setDirectServiceConfig] = useState({
    requiresDoctorConsultation: true,
    directServiceOnly: true,
    enabledServices: [
      'تزریقات',
      'سرم‌تراپی',
      'پانسمان',
      'فشار خون',
      'تست قند خون',
      'نوار قلب',
      'نمونه‌گیری آزمایشگاه',
      'تجهیزات مصرفی',
      'فروش دارو',
      'سایر خدمات',
    ],
  });

  const [reportSnapshots, setReportSnapshots] = useState<ReportSnapshot[]>([
    {
      id: 'snap-01',
      title: 'اسنپ‌شات درآمد عملکردی تیر ماه ۱۴۰۳',
      reportCategory: 'FINANCIAL',
      createdAt: '۱۴۰۳/۰۴/۳۱ - ۲۳:۵۹:۰۰',
      createdBy: 'دکتر بهزاد مهدوی (مدیر کلینیک)',
      clinicId: 'clinic-01',
      filters: {
        datePreset: 'THIS_MONTH',
        shiftType: 'ALL',
        paymentMethod: 'ALL',
      },
      summaryMetrics: {
        totalRevenue: 248500000,
        patientCount: 1420,
        transactionCount: 1510,
        insuranceTotal: 74500000,
        discountTotal: 12000000,
        refundTotal: 1500000,
        outstandingTotal: 4200000,
      },
      notes: 'پایان عملکرد دوره تیرماه - با احتساب بیمه تامین اجتماعی و سلامت',
    },
  ]);

  const [scheduledReports, setScheduledReports] = useState<ScheduledReportConfig[]>([
    {
      id: 'sched-01',
      title: 'گزارش خودکار کارکرد مالی روزانه کلینیک',
      reportCategory: 'FINANCIAL',
      frequency: 'DAILY',
      executionTime: '23:50',
      recipientsEmail: ['management@vikimedic.ir', 'finance@vikimedic.ir'],
      isEnabled: true,
      lastRunAt: '۱۴۰۳/۰۵/۰۲ - ۲۳:۵۰:۰۰',
      nextRunAt: '۱۴۰۳/۰۵/۰۳ - ۲۳:۵۰:۰۰',
    },
    {
      id: 'sched-02',
      title: 'خلاصه آمار هفتگی بیماران و شیفت‌ها',
      reportCategory: 'PATIENT',
      frequency: 'WEEKLY',
      executionTime: '22:00',
      recipientsEmail: ['director@vikimedic.ir'],
      isEnabled: true,
      lastRunAt: '۱۴۰۳/۰۴/۲۹ - ۲۲:۰۰:۰۰',
      nextRunAt: '۱۴۰۳/۰۵/۰۵ - ۲۲:۰۰:۰۰',
    },
  ]);

  const [reportExportLogs, setReportExportLogs] = useState<ReportExportLog[]>([
    {
      id: 'exp-01',
      reportTitle: 'گزارش مالی تفکیکی روش‌های پرداخت',
      exportFormat: 'PDF',
      exportedBy: 'رضا علوی (حسابدار)',
      userRole: 'CASHIER',
      timestamp: '۱۴۰۳/۰۵/۰۳ - ۰۹:۱۵:۰۰',
      filterSummary: 'بازه: امروز | شیفت: همه | پرداخت: کارتخوان و نقد',
      recordCount: 42,
    },
    {
      id: 'exp-02',
      reportTitle: 'آمار مراجعات و خدمات مستقیم پرستاری',
      exportFormat: 'EXCEL',
      exportedBy: 'سارا احمدی (مسئول پذیرش)',
      userRole: 'RECEPTIONIST',
      timestamp: '۱۴۰۳/۰۵/۰۲ - ۱۷:۳۰:۰۰',
      filterSummary: 'بازه: دیروز | نوع خدمت: تزریقات و پانسمان',
      recordCount: 88,
    },
  ]);

  // UI Control States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false);
  const [activePrintInvoice, setActivePrintInvoice] = useState<FinancialTransaction | null>(null);
  const [activePrintPrescription, setActivePrintPrescription] = useState<MedicalRecord | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    targetType: null,
    data: null,
  });

  // Load clinic specific data
  const loadDataForActiveClinic = () => {
    const currentClinics = LocalStorageManager.getClinics();
    setClinics(currentClinics);

    const activeCId = LocalStorageManager.getActiveClinicId();
    setActiveClinicId(activeCId);

    const pList = LocalStorageManager.getPatients(activeCId);
    setPatients(pList);

    const qList = LocalStorageManager.getQueue(activeCId);
    setQueue(qList);

    const mrList = LocalStorageManager.getMedicalRecords();
    setMedicalRecords(mrList);

    const txList = LocalStorageManager.getTransactions(activeCId);
    setTransactions(txList);

    const invList = LocalStorageManager.getInventory(activeCId);
    setInventory(invList);

    const logs = LocalStorageManager.getAuditLogs();
    setAuditLogs(logs);

    const sConfigs = LocalStorageManager.getShiftConfigs(activeCId);
    setShiftConfigs(sConfigs);

    const sHistories = LocalStorageManager.getShiftHistories(activeCId);
    setShiftHistories(sHistories);

    const catList = LocalStorageManager.getCatalogItems(activeCId);
    setCatalogItems(catList);

    const ordList = LocalStorageManager.getPatientOrders(activeCId);
    setPatientOrders(ordList);
  };

  useEffect(() => {
    loadDataForActiveClinic();
  }, [activeClinicId]);

  // Patch 02.5: Active Shift Time & Overlap Calculation Logic
  const timeToMinutes = (timeStr: string): number => {
    const parts = (timeStr || '00:00').split(':').map(Number);
    return (parts[0] || 0) * 60 + (parts[1] || 0);
  };

  const activeShiftConfig: ShiftConfig | null = (() => {
    const enabledShifts = shiftConfigs.filter((s) => s.isEnabled);
    if (enabledShifts.length === 0) return null;

    if (manualActiveShiftId) {
      const manual = enabledShifts.find((s) => s.id === manualActiveShiftId);
      if (manual) return manual;
    }

    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    for (const shift of enabledShifts) {
      const startMins = timeToMinutes(shift.startTime);
      const endMins = timeToMinutes(shift.endTime);

      if (startMins < endMins) {
        if (currentMins >= startMins && currentMins < endMins) {
          return shift;
        }
      } else {
        // Overnight shift (e.g. 20:00 to 08:00)
        if (currentMins >= startMins || currentMins < endMins) {
          return shift;
        }
      }
    }

    return enabledShifts[0] || null;
  })();

  const validateShiftTimes = (shifts: ShiftConfig[]): { isValid: boolean; errorMessage?: string } => {
    const enabledShifts = shifts.filter((s) => s.isEnabled);

    for (const s of enabledShifts) {
      if (s.startTime === s.endTime) {
        return { isValid: false, errorMessage: `زمان شروع و پایان شیفت ${s.shiftNameFa} نمی‌تواند یکسان باشد.` };
      }
    }

    for (let i = 0; i < enabledShifts.length; i++) {
      for (let j = i + 1; j < enabledShifts.length; j++) {
        const s1 = enabledShifts[i];
        const s2 = enabledShifts[j];

        const start1 = timeToMinutes(s1.startTime);
        let end1 = timeToMinutes(s1.endTime);
        if (end1 <= start1) end1 += 1440;

        const start2 = timeToMinutes(s2.startTime);
        let end2 = timeToMinutes(s2.endTime);
        if (end2 <= start2) end2 += 1440;

        const interval1 = [[start1, end1]];
        if (end1 > 1440) interval1.push([start1 - 1440, end1 - 1440]);

        const interval2 = [[start2, end2]];
        if (end2 > 1440) interval2.push([start2 - 1440, end2 - 1440]);

        for (const [a1, b1] of interval1) {
          for (const [a2, b2] of interval2) {
            if (Math.max(a1, a2) < Math.min(b1, b2)) {
              return {
                isValid: false,
                errorMessage: `تداخل زمانی بین شیفت "${s1.shiftNameFa}" (${s1.startTime}-${s1.endTime}) و "${s2.shiftNameFa}" (${s2.startTime}-${s2.endTime}) وجود دارد.`,
              };
            }
          }
        }
      }
    }

    return { isValid: true };
  };

  const updateShiftConfig = (
    updatedShift: ShiftConfig,
    reason: string,
    changedPosition?: ShiftPosition,
    previousStaffName?: string,
    newStaffName?: string
  ) => {
    const updatedList = shiftConfigs.map((s) => (s.id === updatedShift.id ? updatedShift : s));

    const validation = validateShiftTimes(updatedList);
    if (!validation.isValid) {
      addNotification(validation.errorMessage || 'تداخل زمانی در شیفت‌ها وجود دارد.', 'danger');
      return;
    }

    setShiftConfigs(updatedList);
    LocalStorageManager.saveShiftConfigs(activeClinicId, updatedList);

    if (changedPosition && newStaffName) {
      const positionTitlesFa: Record<ShiftPosition, string> = {
        DOCTOR: 'پزشک شیفت',
        NURSE: 'پرستار',
        RECEPTIONIST: 'مسئول پذیرش',
        SECURITY_GUARD: 'نگهبان و امنیت',
        CASHIER: 'صندوق‌دار',
        LAB_TECH: 'تکنسین آزمایشگاه',
        RADIOLOGY_TECH: 'تکنسین رادیولوژی',
        CLEANER: 'خدمات و نظافت',
        OTHER: 'سایر پرسنل',
      };

      const historyLog = LocalStorageManager.addShiftHistory({
        clinicId: activeClinicId,
        shiftConfigId: updatedShift.id,
        shiftNameFa: updatedShift.shiftNameFa,
        positionType: changedPosition,
        positionTitleFa: positionTitlesFa[changedPosition] || changedPosition,
        previousStaffName: previousStaffName || 'تخصیص‌نیافته',
        newStaffName: newStaffName,
        modifiedBy: `${activeUser.fullName} (${activeUser.role})`,
        modificationDate:
          new Date().toLocaleDateString('fa-IR') +
          ' - ' +
          new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        reason: reason || 'تغییر و تخصیص جدید پرسنل شیفت',
      });

      setShiftHistories((prev) => [historyLog, ...prev]);
    }

    addNotification(`تنظیمات شیفت "${updatedShift.shiftNameFa}" با موفقیت ذخیره شد.`, 'success');
  };

  const getShiftStaffForPosition = (position: ShiftPosition): string => {
    if (!activeShiftConfig) return 'تعیین‌نشده';
    return activeShiftConfig.assignedStaff[position] || 'تعیین‌نشده';
  };

  // Patch 07: Shift Control Center Handlers
  const recordShiftHandover = (handover: ShiftHandoverRecord) => {
    LocalStorageManager.addShiftHandover(handover);
    setShiftHandovers((prev) => [handover, ...prev]);

    const audit: Omit<ShiftAuditLog, 'id'> = {
      clinicId: activeClinicId,
      operatorName: `${activeUser.fullName} (${activeUser.role})`,
      date: new Date().toLocaleDateString('fa-IR'),
      time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      shiftNameFa: handover.shiftNameFa,
      actionType: 'HANDOVER_COMPLETE',
      reason: handover.notes || 'تحویل و تحول کامل شیفت انجام شد',
    };
    const newAudit = LocalStorageManager.addShiftAuditLog(audit);
    setShiftAuditLogs((prev) => [newAudit, ...prev]);

    addNotification(`تحویل شیفت "${handover.shiftNameFa}" با موفقیت ثبت و نهایی گردید.`, 'success');
  };

  const performManualShiftAction = (
    actionType: 'START_SHIFT' | 'END_SHIFT' | 'TRANSFER_SHIFT' | 'CORRECT_SHIFT',
    shiftConfigId: string,
    reason: string,
    staffChanges?: Partial<Record<ShiftPosition, string>>
  ) => {
    const targetShift = shiftConfigs.find((s) => s.id === shiftConfigId) || activeShiftConfig;
    const shiftName = targetShift ? targetShift.shiftNameFa : 'شیفت عمومی';

    if (actionType === 'START_SHIFT' || actionType === 'TRANSFER_SHIFT') {
      setManualActiveShiftId(shiftConfigId);
    } else if (actionType === 'END_SHIFT') {
      setManualActiveShiftId(null);
    }

    if (staffChanges && targetShift) {
      const updatedAssigned = { ...targetShift.assignedStaff, ...staffChanges };
      const updatedShiftConfig = { ...targetShift, assignedStaff: updatedAssigned };
      setShiftConfigs((prev) => prev.map((s) => (s.id === shiftConfigId ? updatedShiftConfig : s)));
      LocalStorageManager.saveShiftConfigs(
        activeClinicId,
        shiftConfigs.map((s) => (s.id === shiftConfigId ? updatedShiftConfig : s))
      );
    }

    const audit: Omit<ShiftAuditLog, 'id'> = {
      clinicId: activeClinicId,
      operatorName: `${activeUser.fullName} (${activeUser.role})`,
      date: new Date().toLocaleDateString('fa-IR'),
      time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      shiftNameFa: shiftName,
      actionType,
      reason: reason || 'تغییر و مدیریت دستی شیفت توسط اپراتور',
    };
    const newAudit = LocalStorageManager.addShiftAuditLog(audit);
    setShiftAuditLogs((prev) => [newAudit, ...prev]);

    const labels: Record<string, string> = {
      START_SHIFT: 'شروع دستی شیفت',
      END_SHIFT: 'پایان دستی شیفت',
      TRANSFER_SHIFT: 'انتقال و تحویل دستی شیفت',
      CORRECT_SHIFT: 'تصحیح دستی اطلاعات شیفت',
    };

    addNotification(`${labels[actionType]} "${shiftName}" ثبت و اعمال گردید.`, 'success');
  };

  const activeClinic = clinics.find((c) => c.id === activeClinicId) || clinics[0] || {
    id: 'clinic-01',
    name: 'مرکز پزشکی ولیعصر',
    code: 'VALI-01',
    city: 'تهران',
    address: 'تهران، خیابان ولیعصر',
    phone: '۰۲۱-۸۸۷۷۶۶۵۵',
    activeDoctorsCount: 5,
    licenseNumber: 'M-101',
    isPrimary: true,
  };

  const activeUser = staffList.find((s) => s.id === activeUserId) || staffList[0];

  // Clinic Switcher
  const switchClinic = (clinicId: string) => {
    LocalStorageManager.setActiveClinicId(clinicId);
    setActiveClinicId(clinicId);
    const target = clinics.find((c) => c.id === clinicId);
    addNotification(`انتقال به ${target?.name || 'کلینیک منتخب'} انجام شد.`, 'info');
    
    LocalStorageManager.addAuditLog({
      timestamp: new Date().toLocaleString('fa-IR'),
      userId: activeUser.id,
      userName: activeUser.fullName,
      userRole: activeUser.role,
      action: 'تغییر کلینیک فعال',
      details: `ورود به کلینیک: ${target?.name}`,
      clinicId: clinicId,
    });
  };

  // Switch Role/User
  const switchUserRole = (newRole: UserRole) => {
    const matchingStaff = staffList.find((s) => s.role === newRole);
    if (matchingStaff) {
      setActiveUserId(matchingStaff.id);
      LocalStorageManager.setActiveUserId(matchingStaff.id);
    } else {
      // Temporarily update current user role
      const updatedUser = { ...activeUser, role: newRole };
      const updatedStaff = staffList.map((s) => (s.id === activeUser.id ? updatedUser : s));
      setStaffList(updatedStaff);
      LocalStorageManager.saveStaff(updatedStaff);
    }
    addNotification(`نقش کاربری به ${newRole} تغییر یافت.`, 'info');
  };

  const switchActiveUser = (userId: string) => {
    setActiveUserId(userId);
    LocalStorageManager.setActiveUserId(userId);
    const userObj = staffList.find((s) => s.id === userId);
    if (userObj) {
      addNotification(`کاربر فعال: ${userObj.fullName}`, 'info');
    }
  };

  // Add Patient
  const addPatient = (patientData: Omit<Patient, 'id' | 'createdAt' | 'fileNumber' | 'clinicId'>): Patient => {
    const allPatients = LocalStorageManager.getPatients();
    const newFileNum = `P-${1000 + allPatients.length + 1}`;
    const newPatient: Patient = {
      ...patientData,
      id: 'pat-' + Date.now(),
      fileNumber: newFileNum,
      createdAt: new Date().toLocaleDateString('fa-IR'),
      clinicId: activeClinicId,
    };

    const updated = [newPatient, ...allPatients];
    LocalStorageManager.savePatients(updated);
    setPatients(updated.filter((p) => p.clinicId === activeClinicId));

    addNotification(`پرونده جدید بیمار ${newPatient.firstName} ${newPatient.lastName} با شماره ${newFileNum} ایجاد شد.`, 'success');
    return newPatient;
  };

  // Update Patient
  const updatePatient = (id: string, updates: Partial<Patient>) => {
    const allPatients = LocalStorageManager.getPatients();
    const updated = allPatients.map((p) => (p.id === id ? { ...p, ...updates } : p));
    LocalStorageManager.savePatients(updated);
    setPatients(updated.filter((p) => p.clinicId === activeClinicId));
    addNotification('اطلاعات پرونده بیمار به‌روزرسانی شد.', 'success');
  };

  // Add Queue Item
  const addQueueItem = (itemData: Omit<QueueItem, 'id' | 'queueNumber' | 'createdAt' | 'clinicId'>): QueueItem => {
    const allQueue = LocalStorageManager.getQueue(activeClinicId);
    const nextQueueNum = allQueue.length + 1;
    const newQueueItem: QueueItem = {
      ...itemData,
      id: 'q-' + Date.now(),
      queueNumber: nextQueueNum,
      createdAt: new Date().toLocaleDateString('fa-IR'),
      clinicId: activeClinicId,
    };

    const updated = [...LocalStorageManager.getQueue(), newQueueItem];
    LocalStorageManager.saveQueue(updated);
    setQueue(updated.filter((q) => q.clinicId === activeClinicId));

    addNotification(`نوبت شماره ${nextQueueNum} برای بیمار ${newQueueItem.patientName} ثبت شد.`, 'success');
    return newQueueItem;
  };

  // Update Queue Status
  const updateQueueStatus = (id: string, status: QueueItem['status']) => {
    const allQueue = LocalStorageManager.getQueue();
    const updated = allQueue.map((q) => (q.id === id ? { ...q, status } : q));
    LocalStorageManager.saveQueue(updated);
    setQueue(updated.filter((q) => q.clinicId === activeClinicId));
    addNotification('وضعیت نوبت تغییر یافت.', 'info');
  };

  // Add Medical Record
  const addMedicalRecord = (recordData: Omit<MedicalRecord, 'id' | 'visitDate' | 'clinicId'>): MedicalRecord => {
    const allRecords = LocalStorageManager.getMedicalRecords();
    const newRecord: MedicalRecord = {
      ...recordData,
      id: 'mr-' + Date.now(),
      visitDate: new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      clinicId: activeClinicId,
    };

    const updated = [newRecord, ...allRecords];
    LocalStorageManager.saveMedicalRecords(updated);
    setMedicalRecords(updated);

    // Update patient last visit date
    updatePatient(newRecord.patientId, {
      lastVisitDate: new Date().toLocaleDateString('fa-IR'),
    });

    addNotification('ثبت پرونده پزشکی و نسخه بیمار با موفقیت انجام شد.', 'success');
    return newRecord;
  };

  // Add Financial Transaction
  const addTransaction = (txData: Omit<FinancialTransaction, 'id' | 'invoiceNumber' | 'createdAt' | 'clinicId'>): FinancialTransaction => {
    const allTx = LocalStorageManager.getTransactions();
    const invoiceNum = `INV-1403-${1000 + allTx.length + 1}`;
    const newTx: FinancialTransaction = {
      ...txData,
      id: 'tx-' + Date.now(),
      invoiceNumber: invoiceNum,
      createdAt: new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      clinicId: activeClinicId,
    };

    const updated = [newTx, ...allTx];
    LocalStorageManager.saveTransactions(updated);
    setTransactions(updated.filter((t) => t.clinicId === activeClinicId));

    addNotification(`فاکتور ${invoiceNum} با مبلغ ${newTx.amountNet.toLocaleString('fa-IR')} تومان ثبت شد.`, 'success');
    return newTx;
  };

  // Add Inventory Item
  const addInventoryItem = (itemData: Omit<InventoryItem, 'id' | 'clinicId'>): InventoryItem => {
    const allInv = LocalStorageManager.getInventory();
    const newItem: InventoryItem = {
      ...itemData,
      id: 'inv-' + Date.now(),
      clinicId: activeClinicId,
    };

    const updated = [newItem, ...allInv];
    LocalStorageManager.saveInventory(updated);
    setInventory(updated.filter((i) => i.clinicId === activeClinicId));

    addNotification(`کالای ${newItem.name} به انبار اضافه شد.`, 'success');
    return newItem;
  };

  // Patch 02.6: Centralized Catalog Handlers
  const addCatalogItem = (itemData: Omit<CatalogItem, 'id' | 'clinicId'>): CatalogItem => {
    const newItem = LocalStorageManager.addCatalogItem({
      ...itemData,
      clinicId: activeClinicId,
    });
    setCatalogItems((prev) => [newItem, ...prev]);
    addNotification(`آیتم "${newItem.name}" به کاتالوگ اضافه شد.`, 'success');
    return newItem;
  };

  const updateCatalogItem = (item: CatalogItem) => {
    const updated = catalogItems.map((c) => (c.id === item.id ? item : c));
    setCatalogItems(updated);
    LocalStorageManager.saveCatalogItems(activeClinicId, updated);
    addNotification(`آیتم کاتالوگ "${item.name}" بروزرسانی شد.`, 'success');
  };

  // Patch 02.6: Patient Order Smart Calculation Engine
  const calculateOrderTotals = (
    items: PatientOrderItem[],
    overallDiscount: number = 0
  ) => {
    let gross = 0;
    let insuranceShare = 0;
    let itemDiscounts = 0;
    let tax = 0;

    items.forEach((item) => {
      gross += item.totalGross;
      insuranceShare += item.insuranceShare;
      itemDiscounts += item.discount || 0;
      tax += item.tax || 0;
    });

    const totalDiscount = overallDiscount + itemDiscounts;
    const netPatientShare = Math.max(0, gross - insuranceShare - totalDiscount + tax);

    return {
      totalGross: gross,
      totalInsuranceShare: insuranceShare,
      totalDiscount,
      totalTax: tax,
      totalPatientShare: netPatientShare,
    };
  };

  // Patch 02.6: Patient Order Creation & Workflow Handlers
  const createPatientOrder = (
    patientId: string,
    items: Omit<PatientOrderItem, 'id' | 'createdAt'>[],
    notes?: string,
    initialStatus: PatientOrderStatus = 'UNDER_REVIEW'
  ): PatientOrder => {
    const targetPatient = patients.find((p) => p.id === patientId);
    const patientName = targetPatient ? `${targetPatient.firstName} ${targetPatient.lastName}` : 'بیمار ناشناخته';
    const patientNationalId = targetPatient?.nationalId || '';
    const patientPhone = targetPatient?.phone || '';
    const patientFileNumber = targetPatient?.fileNumber || '';
    const insuranceType = targetPatient?.insuranceType || 'FREE';
    const insuranceNumber = targetPatient?.insuranceNumber || '';

    const nowFa = new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

    const orderItemsWithIds: PatientOrderItem[] = items.map((item, idx) => ({
      ...item,
      id: 'poi-' + Date.now() + '-' + idx,
      createdAt: nowFa,
    }));

    const totals = calculateOrderTotals(orderItemsWithIds);
    const orderNum = `ORD-1403-${1000 + patientOrders.length + 1}`;

    const currentShiftStaff = activeShiftConfig ? {
      doctorName: activeShiftConfig.assignedStaff.DOCTOR,
      receptionistName: activeShiftConfig.assignedStaff.RECEPTIONIST,
      cashierName: activeShiftConfig.assignedStaff.CASHIER || activeShiftConfig.assignedStaff.RECEPTIONIST,
      nurseName: activeShiftConfig.assignedStaff.NURSE,
      securityName: activeShiftConfig.assignedStaff.SECURITY_GUARD,
    } : undefined;

    const newOrder: PatientOrder = {
      id: 'ord-' + Date.now(),
      orderNumber: orderNum,
      patientId,
      patientName,
      patientNationalId,
      patientPhone,
      patientFileNumber,
      clinicId: activeClinicId,
      doctorId: activeUser.role === 'DOCTOR' ? activeUser.id : (staffList.find((s) => s.role === 'DOCTOR')?.id || 'staff-doc-01'),
      doctorName: activeUser.role === 'DOCTOR' ? activeUser.fullName : (activeShiftConfig?.assignedStaff.DOCTOR || 'دکتر محمدرضا پیرهادی'),
      receptionistName: activeUser.role === 'RECEPTIONIST' ? activeUser.fullName : (activeShiftConfig?.assignedStaff.RECEPTIONIST || 'سارا حسینی'),
      shiftNameFa: activeShiftConfig?.shiftNameFa || 'شیفت عمومی',
      shiftStaffDetails: currentShiftStaff,
      status: initialStatus,
      items: orderItemsWithIds,
      ...totals,
      notes,
      insuranceType,
      insuranceNumber,
      createdAt: nowFa,
      updatedAt: nowFa,
      printCount: 0,
      printHistory: [],
      modificationLogs: [
        {
          id: 'mod-' + Date.now(),
          orderId: 'ord-' + Date.now(),
          modifiedBy: `${activeUser.fullName} (${activeUser.role})`,
          userRole: activeUser.role,
          action: 'ADD_ITEM',
          oldValue: 'ایجاد اولیه سفارش',
          newValue: `${orderItemsWithIds.length} آیتم ثبت شد`,
          reason: 'ایجاد اولیه سفارش بیمار در جریان درمان',
          timestamp: nowFa,
        },
      ],
    };

    setPatientOrders((prev) => [newOrder, ...prev]);
    LocalStorageManager.savePatientOrder(newOrder);

    addNotification(`سفارش درمان بیمار ${patientName} با شماره ${orderNum} ثبت گردید.`, 'success');
    return newOrder;
  };

  const updatePatientOrder = (
    orderId: string,
    updatedOrder: PatientOrder,
    action: OrderModificationAction,
    reason: string
  ) => {
    const totals = calculateOrderTotals(updatedOrder.items, updatedOrder.totalDiscount);
    const nowFa = new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

    const modLog = {
      id: 'mod-' + Date.now() + Math.random().toString(36).substring(2, 6),
      orderId,
      modifiedBy: `${activeUser.fullName} (${activeUser.role})`,
      userRole: activeUser.role,
      action,
      oldValue: 'ویرایش قبلی سفارش',
      newValue: `مبلغ خالص: ${totals.totalPatientShare.toLocaleString('fa-IR')} تومان`,
      reason: reason || 'تغییر و ویرایش آیتم‌های سفارش بیمار',
      timestamp: nowFa,
    };

    const finalOrder: PatientOrder = {
      ...updatedOrder,
      ...totals,
      updatedAt: nowFa,
      modificationLogs: [modLog, ...(updatedOrder.modificationLogs || [])],
    };

    setPatientOrders((prev) => {
      const exists = prev.some((o) => o.id === orderId);
      if (exists) {
        return prev.map((o) => (o.id === orderId ? finalOrder : o));
      }
      return [finalOrder, ...prev];
    });
    LocalStorageManager.savePatientOrder(finalOrder);

    addNotification(`سفارش ${finalOrder.orderNumber} با موفقیت بروزرسانی شد.`, 'success');
  };

  const finalizeOrderAndPay = (
    orderId: string,
    paymentMethod: PaymentMethod | 'MIXED',
    paymentDetails?: PatientOrder['paymentDetails'],
    optionalOrder?: PatientOrder,
    options?: { openPrintModal?: boolean }
  ): PatientOrder => {
    let targetOrder =
      optionalOrder ||
      patientOrders.find((o) => o.id === orderId) ||
      LocalStorageManager.getPatientOrders().find((o: PatientOrder) => o.id === orderId);

    if (!targetOrder) {
      console.warn(`Order ${orderId} not found in state, creating safe order context`);
      targetOrder = {
        id: orderId,
        orderNumber: `ORD-${Date.now().toString().slice(-4)}`,
        patientId: 'patient-gen',
        patientName: 'بیمار عمومی',
        patientNationalId: '---',
        patientPhone: '---',
        patientFileNumber: '---',
        clinicId: activeClinicId,
        doctorId: activeUser.id,
        doctorName: activeUser.fullName,
        receptionistName: activeUser.fullName,
        shiftNameFa: activeShiftConfig?.shiftNameFa || 'شیفت عمومی',
        status: 'READY_FOR_BILLING',
        items: [],
        totalGross: 0,
        totalInsuranceShare: 0,
        totalDiscount: 0,
        totalTax: 0,
        totalPatientShare: 0,
        createdAt: new Date().toLocaleDateString('fa-IR'),
        updatedAt: new Date().toLocaleDateString('fa-IR'),
        printCount: 0,
        printHistory: [],
        modificationLogs: [],
      };
    }

    const nowFa = new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

    const tx = addTransaction({
      patientId: targetOrder.patientId,
      patientName: targetOrder.patientName,
      doctorId: targetOrder.doctorId,
      doctorName: targetOrder.doctorName,
      amountGross: targetOrder.totalGross,
      discountAmount: targetOrder.totalDiscount,
      insuranceCoverage: targetOrder.totalInsuranceShare,
      amountNet: targetOrder.totalPatientShare,
      paymentMethod: paymentMethod === 'MIXED' ? 'POS' : paymentMethod,
      paymentStatus: 'PAID',
      description: `تسویه کامل سفارش بیمار ${targetOrder.orderNumber} (شیفت ${targetOrder.shiftNameFa})`,
      cashierName: activeUser.fullName,
    });

    const modLog = {
      id: 'mod-' + Date.now(),
      orderId,
      modifiedBy: `${activeUser.fullName} (${activeUser.role})`,
      userRole: activeUser.role,
      action: 'STATUS_CHANGE' as OrderModificationAction,
      oldValue: targetOrder.status,
      newValue: 'PAID',
      reason: `تسویه حساب نهایی و صدور فاکتور رسمی به روش ${paymentMethod}`,
      timestamp: nowFa,
    };

    const updatedOrder: PatientOrder = {
      ...targetOrder,
      status: 'PAID',
      paymentMethod,
      paymentDetails: paymentDetails || {
        cashAmount: paymentMethod === 'CASH' ? targetOrder.totalPatientShare : 0,
        posAmount: paymentMethod === 'POS' ? targetOrder.totalPatientShare : 0,
        cardAmount: paymentMethod === 'CARD_TO_CARD' ? targetOrder.totalPatientShare : 0,
        insuranceAmount: targetOrder.totalInsuranceShare,
      },
      transactionId: tx.id,
      paidAt: nowFa,
      updatedAt: nowFa,
      modificationLogs: [modLog, ...(targetOrder.modificationLogs || [])],
    };

    setPatientOrders((prev) => {
      const exists = prev.some((o) => o.id === orderId);
      if (exists) {
        return prev.map((o) => (o.id === orderId ? updatedOrder : o));
      }
      return [updatedOrder, ...prev];
    });
    LocalStorageManager.savePatientOrder(updatedOrder);

    // Queue Rule: After successful payment, mark patient queue item as COMPLETED so patient is removed from Waiting Queue
    const allQueue = LocalStorageManager.getQueue();
    const matchingItem = allQueue.find(
      (q) => (q.patientId === targetOrder.patientId || (q.patientNationalId && q.patientNationalId === targetOrder.patientNationalId)) && q.status !== 'COMPLETED'
    );
    if (matchingItem) {
      const updatedQueue = allQueue.map((q) => (q.id === matchingItem.id ? { ...q, status: 'COMPLETED' as const } : q));
      LocalStorageManager.saveQueue(updatedQueue);
      setQueue(updatedQueue.filter((q) => q.clinicId === activeClinicId));
    }

    if (options?.openPrintModal !== false) {
      setActivePrintOrder(updatedOrder);
    }
    addNotification(`سفارش ${updatedOrder.orderNumber} با موفقیت تسویه شد.`, 'success');
    return updatedOrder;
  };

  const reopenPatientOrder = (orderId: string, reason?: string): PatientOrder | null => {
    const targetOrder =
      patientOrders.find((o) => o.id === orderId) ||
      LocalStorageManager.getPatientOrders().find((o: PatientOrder) => o.id === orderId);

    if (!targetOrder) {
      addNotification('سفارش مورد نظر یافت نشد.', 'warning');
      return null;
    }

    const nowFa =
      new Date().toLocaleDateString('fa-IR') +
      ' - ' +
      new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

    const modLog = {
      id: 'mod-' + Date.now() + Math.random().toString(36).substring(2, 6),
      orderId,
      modifiedBy: `${activeUser.fullName} (${activeUser.role})`,
      userRole: activeUser.role,
      action: 'CANCEL_PAYMENT' as OrderModificationAction,
      oldValue: 'PAID (تسویه‌شده)',
      newValue: 'DRAFT (بازگشایی شده جهت ویرایش)',
      reason: reason || 'ابطال پرداخت و بازگشایی فاکتور جهت ویرایش مجدد',
      timestamp: nowFa,
    };

    const reopenedOrder: PatientOrder = {
      ...targetOrder,
      status: 'DRAFT',
      paidAt: undefined,
      updatedAt: nowFa,
      modificationLogs: [modLog, ...(targetOrder.modificationLogs || [])],
    };

    setPatientOrders((prev) => {
      const exists = prev.some((o) => o.id === orderId);
      if (exists) {
        return prev.map((o) => (o.id === orderId ? reopenedOrder : o));
      }
      return [reopenedOrder, ...prev];
    });
    LocalStorageManager.savePatientOrder(reopenedOrder);

    addNotification(`پرداخت فاکتور ${reopenedOrder.orderNumber} با موفقیت ابطال و جهت ویرایش بازگشایی شد.`, 'success');
    return reopenedOrder;
  };

  const printOrderReceipt = (orderId: string, reason?: string) => {
    const target =
      patientOrders.find((o) => o.id === orderId) ||
      LocalStorageManager.getPatientOrders().find((o: PatientOrder) => o.id === orderId);
    if (!target) return;

    const printLog = {
      printedBy: activeUser.fullName,
      printedAt: new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      reason: reason || 'چاپ رسید بیمار',
    };

    const updatedOrder: PatientOrder = {
      ...target,
      printCount: target.printCount + 1,
      printHistory: [printLog, ...(target.printHistory || [])],
    };

    setPatientOrders((prev) => {
      const exists = prev.some((o) => o.id === orderId);
      if (exists) {
        return prev.map((o) => (o.id === orderId ? updatedOrder : o));
      }
      return [updatedOrder, ...prev];
    });
    LocalStorageManager.savePatientOrder(updatedOrder);

    setActivePrintOrder(updatedOrder);
  };

  const getOrdersForPatient = (patientId: string): PatientOrder[] => {
    return patientOrders.filter((o) => o.patientId === patientId);
  };

  // Update Clinic Settings
  const updateClinicSettings = (updatedClinic: Clinic) => {
    const updatedList = clinics.map((c) => (c.id === updatedClinic.id ? updatedClinic : c));
    setClinics(updatedList);
    LocalStorageManager.saveClinics(updatedList);
    addNotification(`اطلاعات ${updatedClinic.name} ذخیره شد.`, 'success');
  };

  // Add New Clinic
  const addClinic = (newClinicData: Omit<Clinic, 'id' | 'activeDoctorsCount'>) => {
    const newClinic: Clinic = {
      ...newClinicData,
      id: 'clinic-' + (clinics.length + 1).toString().padStart(2, '0'),
      activeDoctorsCount: 1,
    };
    const updated = [...clinics, newClinic];
    setClinics(updated);
    LocalStorageManager.saveClinics(updated);
    addNotification(`شعبه/کلینیک جدید "${newClinic.name}" ایجاد شد.`, 'success');
  };

  // Notifications
  const addNotification = (message: string, type: NotificationItem['type'] = 'info') => {
    const notif: NotificationItem = {
      id: 'n-' + Date.now() + Math.random(),
      type,
      message,
      timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
    };
    setNotifications((prev) => [...prev.slice(-3), notif]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Context Menu
  const showContextMenu = (x: number, y: number, targetType: 'patient' | 'queue' | 'transaction', data: any) => {
    setContextMenu({ visible: true, x, y, targetType, data });
  };

  const hideContextMenu = () => {
    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + K or Ctrl + Shift + P for Global Search & Command Palette
      if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p')
      ) {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      // Ctrl + N for New Patient
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIsNewPatientModalOpen(true);
      }
      // F2 for Quick Queue / Appointment
      if (e.key === 'F2') {
        e.preventDefault();
        setIsNewAppointmentModalOpen(true);
      }
      // Esc to close Modals & Search
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsNewPatientModalOpen(false);
        setIsNewAppointmentModalOpen(false);
        hideContextMenu();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Patch 03.0: User Management Foundation Methods & State
  const [userManagementLogs, setUserManagementLogs] = useState<UserManagementLog[]>(() =>
    LocalStorageManager.getUserManagementLogs()
  );

  const addUserManagementLog = (log: Omit<UserManagementLog, 'id' | 'timestamp'>): UserManagementLog => {
    const newLog = LocalStorageManager.addUserManagementLog(log);
    setUserManagementLogs((prev) => [newLog, ...prev]);
    return newLog;
  };

  const createUser = (
    userData: Partial<UserStaff> & { temporaryPassword?: string }
  ): UserStaff => {
    const newUserId = 'staff-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.fullName || 'کاربر جدید';

    const newUser: UserStaff = {
      id: newUserId,
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      fullName,
      nationalId: userData.nationalId || '',
      personnelCode: userData.personnelCode || `PER-${Math.floor(1000 + Math.random() * 9000)}`,
      phone: userData.phone || userData.mobile || '',
      mobile: userData.mobile || userData.phone || '',
      email: userData.email || '',
      gender: userData.gender || 'MALE',
      birthDate: userData.birthDate || '',
      address: userData.address || '',
      avatarUrl: userData.avatarUrl || '',
      profilePhotoUrl: userData.profilePhotoUrl || userData.avatarUrl || '',
      notes: userData.notes || '',

      title: userData.title || 'کارمند کلینیک',
      department: userData.department || 'عمومی',
      employmentType: userData.employmentType || 'FULL_TIME',
      startDate: userData.startDate || new Date().toLocaleDateString('fa-IR'),
      endDate: userData.endDate || '',
      clinicIds: userData.clinicIds && userData.clinicIds.length > 0 ? userData.clinicIds : [activeClinicId],
      assignedShifts: userData.assignedShifts || ['MORNING'],

      username: userData.username || `user_${Math.floor(100 + Math.random() * 900)}`,
      role: userData.role || 'RECEPTIONIST',
      accountStatus: userData.accountStatus || 'ACTIVE',
      permissionProfileType: userData.permissionProfileType || 'ROLE_DEFAULT',
      customModulePermissions: userData.customModulePermissions,
      customFieldPermissions: userData.customFieldPermissions,
      customSpecialPermissions: userData.customSpecialPermissions,

      createdBy: activeUser?.fullName || 'مدیر ارشد سیستم',
      createdAt: new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      updatedAt: new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      statusHistory: [
        {
          id: 'sh-' + Date.now(),
          newStatus: userData.accountStatus || 'ACTIVE',
          changedBy: activeUser?.fullName || 'مدیر ارشد سیستم',
          changedAt: new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
          reason: 'ایجاد اولیه کاربر توسط مدیر سیستم',
        },
      ],

      isOnline: false,
      permissions: [],
      medicalCouncilNumber: userData.medicalCouncilNumber,
      specialty: userData.specialty,
    };

    LocalStorageManager.saveUserStaffItem(newUser);
    setStaffList((prev) => [newUser, ...prev]);

    const tempPass = userData.temporaryPassword || 'VikiMedic@1403';
    const salt = CryptoService.generateSalt(12);
    CryptoService.hashPassword(tempPass, salt).then((passwordHash) => {
      const newCred: UserCredential = {
        userId: newUserId,
        username: newUser.username || newUserId,
        email: newUser.email,
        phone: newUser.phone,
        passwordHash,
        salt,
        failedAttempts: 0,
        isLocked: newUser.accountStatus === 'LOCKED',
        lockedUntil: null,
        passwordChangedAt: new Date().toLocaleDateString('fa-IR'),
        forcePasswordChange: true,
      };
      LocalStorageManager.updateUserCredential(newCred);
    });

    addUserManagementLog({
      userId: newUserId,
      userName: newUser.fullName,
      action: 'USER_CREATED',
      details: `ایجاد کاربر جدید (${newUser.fullName}) با نام کاربری ${newUser.username}، نقش ${newUser.role} و وضعیت ${newUser.accountStatus}`,
      operatorId: activeUser?.id || 'admin',
      operatorName: activeUser?.fullName || 'مدیر سیستم',
    });

    addNotification(`کاربر جدید "${newUser.fullName}" با موفقیت در سیستم تعریف شد.`, 'success');
    return newUser;
  };

  const updateUser = (userId: string, updates: Partial<UserStaff>) => {
    const list = LocalStorageManager.getStaff();
    const idx = list.findIndex((u) => u.id === userId);
    if (idx === -1) return;

    const existing = list[idx];
    const updatedFullName = updates.firstName || updates.lastName
      ? `${updates.firstName ?? existing.firstName ?? ''} ${updates.lastName ?? existing.lastName ?? ''}`.trim()
      : updates.fullName || existing.fullName;

    const updatedUser: UserStaff = {
      ...existing,
      ...updates,
      fullName: updatedFullName,
      updatedAt: new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      modifiedBy: activeUser?.fullName || 'مدیر سیستم',
    };

    LocalStorageManager.saveUserStaffItem(updatedUser);
    setStaffList((prev) => prev.map((u) => (u.id === userId ? updatedUser : u)));

    const creds = LocalStorageManager.getUserCredentials();
    const cred = creds.find((c) => c.userId === userId);
    if (cred) {
      if (updates.username) cred.username = updates.username;
      if (updates.email) cred.email = updates.email;
      if (updates.phone) cred.phone = updates.phone;
      LocalStorageManager.updateUserCredential(cred);
    }

    addUserManagementLog({
      userId,
      userName: updatedUser.fullName,
      action: updates.role && updates.role !== existing.role ? 'ROLE_CHANGED' : 'USER_EDITED',
      details: updates.role && updates.role !== existing.role
        ? `تغییر نقش کاربر از ${existing.role} به ${updates.role}`
        : `ویرایش اطلاعات پرونده کاربر ${updatedUser.fullName}`,
      operatorId: activeUser?.id || 'admin',
      operatorName: activeUser?.fullName || 'مدیر سیستم',
    });

    addNotification(`اطلاعات کاربر "${updatedUser.fullName}" با موفقیت بروزرسانی شد.`, 'success');
  };

  const setUserStatus = (userId: string, newStatus: AccountStatus, reason?: string) => {
    const list = LocalStorageManager.getStaff();
    const target = list.find((u) => u.id === userId);
    if (!target) return;

    const prevStatus = target.accountStatus || 'ACTIVE';
    if (prevStatus === newStatus) return;

    const statusHistory = target.statusHistory || [];
    statusHistory.push({
      id: 'sh-' + Date.now(),
      previousStatus: prevStatus,
      newStatus,
      changedBy: activeUser?.fullName || 'مدیر سیستم',
      changedAt: new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      reason: reason || `تغییر وضعیت به ${newStatus}`,
    });

    const updatedUser: UserStaff = {
      ...target,
      accountStatus: newStatus,
      statusHistory,
      updatedAt: new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      modifiedBy: activeUser?.fullName || 'مدیر سیستم',
    };

    LocalStorageManager.saveUserStaffItem(updatedUser);
    setStaffList((prev) => prev.map((u) => (u.id === userId ? updatedUser : u)));

    const creds = LocalStorageManager.getUserCredentials();
    const cred = creds.find((c) => c.userId === userId);
    if (cred) {
      if (newStatus === 'LOCKED' || newStatus === 'SUSPENDED' || newStatus === 'INACTIVE') {
        cred.isLocked = true;
      } else if (newStatus === 'ACTIVE') {
        cred.isLocked = false;
        cred.failedAttempts = 0;
        cred.lockedUntil = null;
      }
      LocalStorageManager.updateUserCredential(cred);
    }

    const actionType = newStatus === 'LOCKED' ? 'ACCOUNT_LOCKED' : newStatus === 'ACTIVE' ? 'ACCOUNT_UNLOCKED' : 'STATUS_CHANGED';
    addUserManagementLog({
      userId,
      userName: target.fullName,
      action: actionType,
      details: `تغییر وضعیت کاربر از ${prevStatus} به ${newStatus} (${reason || 'بدون توضیح'})`,
      operatorId: activeUser?.id || 'admin',
      operatorName: activeUser?.fullName || 'مدیر سیستم',
    });

    addNotification(`وضعیت کاربر "${target.fullName}" به ${newStatus} تغییر یافت.`, 'info');
  };

  const resetUserPassword = (userId: string, customPassword?: string, forceChange = true): string => {
    const list = LocalStorageManager.getStaff();
    const target = list.find((u) => u.id === userId);
    if (!target) return '';

    const newPass = customPassword || 'Pass' + Math.floor(100000 + Math.random() * 900000);
    const salt = CryptoService.generateSalt(12);

    CryptoService.hashPassword(newPass, salt).then((passwordHash) => {
      const creds = LocalStorageManager.getUserCredentials();
      const idx = creds.findIndex((c) => c.userId === userId);
      const cred: UserCredential = idx >= 0 ? creds[idx] : {
        userId,
        username: target.username || userId,
        email: target.email,
        phone: target.phone,
        passwordHash,
        salt,
        failedAttempts: 0,
        isLocked: false,
        lockedUntil: null,
        passwordChangedAt: new Date().toLocaleDateString('fa-IR'),
      };

      cred.passwordHash = passwordHash;
      cred.salt = salt;
      cred.failedAttempts = 0;
      cred.isLocked = false;
      cred.lockedUntil = null;
      cred.passwordChangedAt = new Date().toLocaleDateString('fa-IR');
      cred.forcePasswordChange = forceChange;

      LocalStorageManager.updateUserCredential(cred);
    });

    const updatedUser: UserStaff = {
      ...target,
      forcePasswordChange: forceChange,
      updatedAt: new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      modifiedBy: activeUser?.fullName || 'مدیر سیستم',
    };

    LocalStorageManager.saveUserStaffItem(updatedUser);
    setStaffList((prev) => prev.map((u) => (u.id === userId ? updatedUser : u)));

    addUserManagementLog({
      userId,
      userName: target.fullName,
      action: 'PASSWORD_RESET',
      details: `بازنشانی رمز عبور کاربر ${target.fullName} توسط مدیر سیستم`,
      operatorId: activeUser?.id || 'admin',
      operatorName: activeUser?.fullName || 'مدیر سیستم',
    });

    addNotification(`رمز عبور کاربر "${target.fullName}" با موفقیت بازنشانی گردید.`, 'success');
    return newPass;
  };

  const setUserCustomPermissions = (
    userId: string,
    customModulePermissions: ModulePermissionsMap,
    customFieldPermissions?: Record<FieldPermissionKey, boolean>,
    customSpecialPermissions?: Record<SpecialPermissionKey, boolean>
  ) => {
    const list = LocalStorageManager.getStaff();
    const target = list.find((u) => u.id === userId);
    if (!target) return;

    const updatedUser: UserStaff = {
      ...target,
      permissionProfileType: 'CUSTOM',
      customModulePermissions,
      customFieldPermissions: customFieldPermissions || target.customFieldPermissions,
      customSpecialPermissions: customSpecialPermissions || target.customSpecialPermissions,
      updatedAt: new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      modifiedBy: activeUser?.fullName || 'مدیر سیستم',
    };

    LocalStorageManager.saveUserStaffItem(updatedUser);
    setStaffList((prev) => prev.map((u) => (u.id === userId ? updatedUser : u)));

    addUserManagementLog({
      userId,
      userName: target.fullName,
      action: 'PERMISSION_CHANGED',
      details: `تنظیم سطوح دسترسی سفارشی برای کاربر ${target.fullName}`,
      operatorId: activeUser?.id || 'admin',
      operatorName: activeUser?.fullName || 'مدیر سیستم',
    });

    addNotification(`پروفایل دسترسی‌های سفارشی برای "${target.fullName}" ذخیره گردید.`, 'success');
  };

  // Patch 03.6: Direct Service & Enterprise Reporting Engine Functions
  const updateDirectServiceConfig = (config: {
    requiresDoctorConsultation: boolean;
    directServiceOnly: boolean;
    enabledServices: string[];
  }) => {
    setDirectServiceConfig(config);
    addNotification('تنظیمات خدمات مستقیم و ویزیت بدون پزشک به‌روزرسانی شد.', 'success');
  };

  const addReportSnapshot = (snapshotData: Omit<ReportSnapshot, 'id' | 'createdAt'>) => {
    const newSnapshot: ReportSnapshot = {
      ...snapshotData,
      id: 'snap-' + Date.now(),
      createdAt:
        new Date().toLocaleDateString('fa-IR') +
        ' - ' +
        new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
    };
    setReportSnapshots((prev) => [newSnapshot, ...prev]);
    addNotification(`اسنپ‌شات گزارش "${newSnapshot.title}" با موفقیت ذخیره شد.`, 'success');
  };

  const deleteReportSnapshot = (id: string) => {
    setReportSnapshots((prev) => prev.filter((s) => s.id !== id));
    addNotification('اسنپ‌شات با موفقیت حذف گردید.', 'info');
  };

  const addScheduledReport = (configData: Omit<ScheduledReportConfig, 'id'>) => {
    const newSched: ScheduledReportConfig = {
      ...configData,
      id: 'sched-' + Date.now(),
    };
    setScheduledReports((prev) => [newSched, ...prev]);
    addNotification(`زمان‌بندی ارسال خودکار گزارش "${newSched.title}" ثبت شد.`, 'success');
  };

  const toggleScheduledReport = (id: string) => {
    setScheduledReports((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isEnabled: !s.isEnabled } : s))
    );
  };

  const logReportExport = (logData: Omit<ReportExportLog, 'id' | 'timestamp'>) => {
    const newLog: ReportExportLog = {
      ...logData,
      id: 'exp-' + Date.now(),
      timestamp:
        new Date().toLocaleDateString('fa-IR') +
        ' - ' +
        new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
    };
    setReportExportLogs((prev) => [newLog, ...prev]);
  };

  // System Patch 01 & 01.1: Execute Safe Data Reset with Safety Verification
  const executeSystemReset = async (
    options: SystemResetOptions,
    adminPassword: string
  ): Promise<{ success: boolean; report?: SystemResetReport; error?: string }> => {
    // 1. Evaluate Safety Checklist
    const safety = validateResetSafetyChecks();
    if (!safety.isPassed) {
      return {
        success: false,
        error: `توقف پاکسازی به علت عدم قبولی چک ایمنی: ${safety.failureReasons.join(' - ')}`,
      };
    }

    const activeStaff = staffList.find((s) => s.id === activeUserId) || staffList[0];

    // Check credential
    const credentials = LocalStorageManager.getUserCredentials();
    const cred = credentials.find((c) => c.userId === activeStaff?.id);

    if (cred && cred.passwordHash !== adminPassword) {
      return { success: false, error: 'رمز عبور مدیر سیستم نادرست می‌باشد.' };
    }

    try {
      const report = LocalStorageManager.performSafeDataReset(
        options,
        { fullName: `${activeStaff.firstName} ${activeStaff.lastName}`, role: activeStaff.role },
        activeClinicId
      );

      // Clear operational context states
      setPatients([]);
      setQueue([]);
      setMedicalRecords([]);
      setTransactions([]);
      setInventory([]);
      setPatientOrders([]);
      setShiftHistories([]);
      setShiftHandovers([]);
      setShiftAuditLogs([]);
      setAuditLogs([]);
      setUserManagementLogs([]);
      setNotifications([]);
      setSystemResetReports(LocalStorageManager.getSystemResetReports());

      if (options.deleteUsers) {
        setStaffList(LocalStorageManager.getStaff());
      }
      if (options.deleteMedicines || options.deleteServices) {
        setCatalogItems(LocalStorageManager.getCatalogItems());
      }

      addNotification(
        `پشتیبان گیری با شناسه ${report.backupRefId} ذخیره گردید و داده‌های عملیاتی پاکسازی شدند.`,
        'success'
      );

      // Automatically trigger setup wizard
      setIsSetupWizardOpen(true);

      return { success: true, report };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در اجرای فرآیند پاکسازی داده‌های کلینیک.' };
    }
  };

  return (
    <ClinicContext.Provider
      value={{
        activeModule,
        setActiveModule,
        activeClinic,
        clinics,
        switchClinic,
        activeUser,
        staffList,
        switchUserRole,
        switchActiveUser,

        patients,
        queue,
        medicalRecords,
        transactions,
        inventory,
        auditLogs,

        addPatient,
        updatePatient,
        addQueueItem,
        updateQueueStatus,
        addMedicalRecord,
        addTransaction,
        addInventoryItem,
        updateClinicSettings,
        addClinic,

        isSearchOpen,
        setIsSearchOpen,

        contextMenu,
        showContextMenu,
        hideContextMenu,

        isNewPatientModalOpen,
        setIsNewPatientModalOpen,
        isNewAppointmentModalOpen,
        setIsNewAppointmentModalOpen,

        activePrintInvoice,
        setActivePrintInvoice,
        activePrintPrescription,
        setActivePrintPrescription,
        activePrintOrder,
        setActivePrintOrder,

        // Patch 02.5: Shift Management
        shiftConfigs,
        shiftHistories,
        activeShiftConfig,
        setActiveShiftConfigId: setManualActiveShiftId,
        updateShiftConfig,
        validateShiftTimes,
        getShiftStaffForPosition,

        // Patch 07: Shift Control Center
        isShiftControlCenterOpen,
        setIsShiftControlCenterOpen,
        shiftHandovers,
        shiftAuditLogs,
        recordShiftHandover,
        performManualShiftAction,

        // Patch 02.6: Catalog & Patient Order
        catalogItems,
        addCatalogItem,
        updateCatalogItem,
        patientOrders,
        createPatientOrder,
        updatePatientOrder,
        finalizeOrderAndPay,
        reopenPatientOrder,
        printOrderReceipt,
        getOrdersForPatient,
        calculateOrderTotals,

        notifications,
        addNotification,
        removeNotification,

        // Patch 03.0: User Management Foundation
        userManagementLogs,
        addUserManagementLog,
        createUser,
        updateUser,
        setUserStatus,
        resetUserPassword,
        setUserCustomPermissions,

        // Patch 03.6: Direct Service & Enterprise Reporting Engine
        directServiceConfig,
        updateDirectServiceConfig,
        reportSnapshots,
        addReportSnapshot,
        deleteReportSnapshot,
        scheduledReports,
        addScheduledReport,
        toggleScheduledReport,
        reportExportLogs,
        logReportExport,

        // System Patch 01 & 01.1: Initial Setup, Reset & First-Run
        isSetupWizardOpen,
        setIsSetupWizardOpen,
        systemResetReports,
        executeSystemReset,
        validateResetSafetyChecks,
        restoreSystemBackup,
        performSystemHealthCheck,
        loadDemoData,
        systemHealthReport,
        setSystemHealthReport,

        refreshData: loadDataForActiveClinic,
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
};
