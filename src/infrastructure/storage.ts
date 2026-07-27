/**
 * VikiMedic v2 - Local Infrastructure Storage & Initial Data Seed Engine
 * Clean Architecture Layer: Infrastructure
 */

import {
  Clinic,
  UserStaff,
  Patient,
  QueueItem,
  MedicalRecord,
  FinancialTransaction,
  InventoryItem,
  AuditLog,
  ShiftConfig,
  ShiftAssignmentHistory,
  ShiftHandoverRecord,
  ShiftAuditLog,
  CatalogItem,
  PatientOrder,
  UserCredential,
  AuthSession,
  AuthActivityLog,
  Role,
  RoleAuditLog,
  UserManagementLog,
  SystemResetOptions,
  SystemResetReport,
  SystemBackupRecord,
  SystemSafetyCheckResult,
  SystemHealthReport,
  InitialStaffEntry,
} from '../domain/types';
import { DEFAULT_SYSTEM_ROLES } from '../domain/permissions';
import { AISettingsConfig, DEFAULT_AI_SETTINGS, ChatMessage } from '../domain/aiTypes';

const STORAGE_KEYS = {
  CLINICS: 'vikimedic_v2_clinics',
  ACTIVE_CLINIC_ID: 'vikimedic_v2_active_clinic_id',
  STAFF: 'vikimedic_v2_staff',
  ACTIVE_USER_ID: 'vikimedic_v2_active_user_id',
  PATIENTS: 'vikimedic_v2_patients',
  QUEUE: 'vikimedic_v2_queue',
  MEDICAL_RECORDS: 'vikimedic_v2_medical_records',
  TRANSACTIONS: 'vikimedic_v2_transactions',
  INVENTORY: 'vikimedic_v2_inventory',
  AUDIT_LOGS: 'vikimedic_v2_audit_logs',
  SHIFT_CONFIGS: 'vikimedic_v2_shift_configs',
  SHIFT_HISTORIES: 'vikimedic_v2_shift_histories',
  CATALOG_ITEMS: 'vikimedic_v2_catalog_items',
  PATIENT_ORDERS: 'vikimedic_v2_patient_orders',
  USER_CREDENTIALS: 'vikimedic_v2_user_credentials',
  AUTH_SESSION: 'vikimedic_v2_auth_session',
  AUTH_ACTIVITY_LOGS: 'vikimedic_v2_auth_activity_logs',
  ROLES: 'vikimedic_v2_roles',
  ROLE_AUDIT_LOGS: 'vikimedic_v2_role_audit_logs',
  USER_MANAGEMENT_LOGS: 'vikimedic_v2_user_management_logs',
  SHIFT_HANDOVERS: 'vikimedic_v2_shift_handovers',
  SHIFT_AUDIT_LOGS: 'vikimedic_v2_shift_audit_logs',
  SYSTEM_BACKUPS: 'vikimedic_v2_system_backups',
  SYSTEM_RESET_REPORTS: 'vikimedic_v2_system_reset_reports',
  AI_SETTINGS: 'vikimedic_v2_ai_settings',
  VIKI_CHAT_HISTORY: 'vikimedic_v2_viki_chat_history',
};

// Initial Multi-Clinic Seed Data
const INITIAL_CLINICS: Clinic[] = [
  {
    id: 'clinic-01',
    name: 'مرکز پزشکی و تخصصی ولیعصر (شعبه مرکزی)',
    code: 'VALI-01',
    city: 'تهران',
    address: 'تهران، خیابان ولیعصر، بالاتر از ظفر، برج پزشکی ولیعصر، طبقه ۴',
    phone: '۰۲۱-۸۸۷۷۶۶۵۵',
    emergencyPhone: '۰۹۱۲۱۱۱۱۱۱۱',
    activeDoctorsCount: 8,
    licenseNumber: 'م/۱۲۳۴۵/الف',
    isPrimary: true,
  },
  {
    id: 'clinic-02',
    name: 'کلینیک تخصصی و فوق تخصصی پاسداران',
    code: 'PAS-02',
    city: 'تهران',
    address: 'تهران، پاسداران، بوستان پنجم، پلاک ۴۲، کلینیک پاسداران',
    phone: '۰۲۱-۲۲۵۵۸۸۹۹',
    emergencyPhone: '۰۹۱۲۲۲۲۲۲۲۲',
    activeDoctorsCount: 5,
    licenseNumber: 'م/۶۷۸۹۰/ب',
    isPrimary: false,
  },
  {
    id: 'clinic-03',
    name: 'دی‌کلینیک و مرکز جراحی محدود آتیه',
    code: 'ATIYEH-03',
    city: 'کرج',
    address: 'کرج، جهانشهر، میدان هلال احمر، ساختمان پزشکان آتیه',
    phone: '۰۲۶-۳۴۴۴۵۵۶۶',
    emergencyPhone: '۰۹۱۲۳۳۳۳۳۳۳',
    activeDoctorsCount: 12,
    licenseNumber: 'م/۹۹۸۸۷/ج',
    isPrimary: false,
  },
];

// Initial Staff Seed Data
const INITIAL_STAFF: UserStaff[] = [
  {
    id: 'staff-adm-01',
    firstName: 'کامران',
    lastName: 'احمدی',
    fullName: 'دکتر کامران احمدی (مدیر ارشد)',
    nationalId: '۰۰۱۲۳۴۵۶۷۰',
    personnelCode: 'ADM-1001',
    role: 'ADMIN',
    username: 'admin',
    accountStatus: 'ACTIVE',
    title: 'مدیر کل سیستم و شبکه کلینیک‌ها',
    department: 'مدیر کل سیستم',
    employmentType: 'FULL_TIME',
    startDate: '۱۴۰۰/۰۱/۰۱',
    medicalCouncilNumber: '۸۸۴۱۲',
    email: 'admin@vikimedic.ir',
    phone: '۰۹۱۲۰۰۰۰۰۰۰',
    mobile: '۰۹۱۲۰۰۰۰۰۰۰',
    gender: 'MALE',
    clinicIds: ['clinic-01', 'clinic-02', 'clinic-03'],
    assignedShifts: ['MORNING', 'EVENING'],
    permissionProfileType: 'ROLE_DEFAULT',
    createdBy: 'SYSTEM_BOOTSTRAP',
    createdAt: '۱۴۰۰/۰۱/۰۱ - ۰۸:۰۰',
    updatedAt: '۱۴۰۳/۰۱/۰۱ - ۱۰:۰۰',
    isOnline: true,
    permissions: [],
  },
  {
    id: 'staff-doc-01',
    firstName: 'محمدرضا',
    lastName: 'پیرهادی',
    fullName: 'دکتر محمدرضا پیرهادی',
    nationalId: '۰۰۵۵۶۶۷۷۸۸',
    personnelCode: 'DOC-2001',
    role: 'DOCTOR',
    username: 'doctor',
    accountStatus: 'ACTIVE',
    title: 'متخصص داخلی و فوق‌تخصص غدد',
    department: 'پزشکان',
    employmentType: 'FULL_TIME',
    startDate: '۱۴۰۱/۰۲/۱۵',
    medicalCouncilNumber: '۱۰۴۵۸۲',
    specialty: 'بیماری‌های داخلی و غدد',
    email: 'pirhadi@vikimedic.ir',
    phone: '۰۹۱۲۳۴۵۶۷۸۹',
    mobile: '۰۹۱۲۳۴۵۶۷۸۹',
    gender: 'MALE',
    clinicIds: ['clinic-01', 'clinic-02'],
    assignedShifts: ['MORNING'],
    permissionProfileType: 'ROLE_DEFAULT',
    createdBy: 'staff-adm-01',
    createdAt: '۱۴۰۱/۰۲/۱۵ - ۰۹:۳۰',
    updatedAt: '۱۴۰۳/۰۱/۰۱ - ۱۰:۰۰',
    isOnline: true,
    permissions: [],
  },
  {
    id: 'staff-rec-01',
    firstName: 'سارا',
    lastName: 'حسینی',
    fullName: 'سارا حسینی',
    nationalId: '۰۰۹۹۸۸۷۷۶۶',
    personnelCode: 'REC-3001',
    role: 'RECEPTIONIST',
    username: 'receptionist',
    accountStatus: 'ACTIVE',
    title: 'سرپرست پذیرش و نوبت‌دهی',
    department: 'پذیرش',
    employmentType: 'FULL_TIME',
    startDate: '۱۴۰۱/۰۵/۰۱',
    email: 'hoseini@vikimedic.ir',
    phone: '۰۹۱۹۸۷۶۵۴۳۲',
    mobile: '۰۹۱۹۸۷۶۵۴۳۲',
    gender: 'FEMALE',
    clinicIds: ['clinic-01', 'clinic-02', 'clinic-03'],
    assignedShifts: ['MORNING', 'EVENING'],
    permissionProfileType: 'ROLE_DEFAULT',
    createdBy: 'staff-adm-01',
    createdAt: '۱۴۰۱/۰۵/۰۱ - ۰۸:۰۰',
    updatedAt: '۱۴۰۳/۰۱/۰۱ - ۱۰:۰۰',
    isOnline: true,
    permissions: [],
  },
  {
    id: 'staff-mgr-01',
    firstName: 'امیرحسین',
    lastName: 'رضایی',
    fullName: 'مهندس امیرحسین رضایی',
    nationalId: '۰۰۴۴۳۳۲۲۱۱',
    personnelCode: 'MGR-4001',
    role: 'CLINIC_MANAGER',
    username: 'manager',
    accountStatus: 'ACTIVE',
    title: 'مدیر اجرائی و عملیاتی کلینیک',
    department: 'مدیریت',
    employmentType: 'FULL_TIME',
    startDate: '۱۴۰۰/۰۶/۰۱',
    email: 'rezaei@vikimedic.ir',
    phone: '۰۹۳۵۱۱۱۲۲۳۳',
    mobile: '۰۹۳۵۱۱۱۲۲۳۳',
    gender: 'MALE',
    clinicIds: ['clinic-01', 'clinic-02', 'clinic-03'],
    assignedShifts: ['MORNING'],
    permissionProfileType: 'ROLE_DEFAULT',
    createdBy: 'staff-adm-01',
    createdAt: '۱۴۰۰/۰۶/۰۱ - ۰۸:۰۰',
    updatedAt: '۱۴۰۳/۰۱/۰۱ - ۱۰:۰۰',
    isOnline: true,
    permissions: [],
  },
  {
    id: 'staff-acc-01',
    firstName: 'مریم',
    lastName: 'کاظمی',
    fullName: 'مریم کاظمی',
    nationalId: '۰۰۱۱۲۲۳۳۴۴',
    personnelCode: 'ACC-5001',
    role: 'ACCOUNTANT',
    username: 'accountant',
    accountStatus: 'ACTIVE',
    title: 'مدیر مالی و حسابداری',
    department: 'حسابداری',
    employmentType: 'FULL_TIME',
    startDate: '۱۴۰۲/۰۱/۱۰',
    email: 'kazemi@vikimedic.ir',
    phone: '۰۹۱۲۴۴۴۵۵۶۶',
    mobile: '۰۹۱۲۴۴۴۵۵۶۶',
    gender: 'FEMALE',
    clinicIds: ['clinic-01', 'clinic-02'],
    assignedShifts: ['MORNING'],
    permissionProfileType: 'ROLE_DEFAULT',
    createdBy: 'staff-adm-01',
    createdAt: '۱۴۰۲/۰۱/۱۰ - ۰۹:۰۰',
    updatedAt: '۱۴۰۳/۰۱/۰۱ - ۱۰:۰۰',
    isOnline: false,
    permissions: [],
  },
];

// Initial Pre-seeded User Credentials for Phase 03 Authentication
const INITIAL_CREDENTIALS: UserCredential[] = [
  {
    userId: 'staff-adm-01',
    username: 'admin',
    email: 'admin@vikimedic.ir',
    phone: '09120000000',
    passwordHash: 'c775e7b757ede630cd0aa1113bd102661ab38829ca52a6422ab782862f268646',
    salt: 'salt_adm_101',
    failedAttempts: 0,
    isLocked: false,
    lockedUntil: null,
    passwordChangedAt: '1403/01/01',
  },
  {
    userId: 'staff-doc-01',
    username: 'doctor',
    email: 'pirhadi@vikimedic.ir',
    phone: '09123456789',
    passwordHash: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
    salt: 'salt_doc_101',
    failedAttempts: 0,
    isLocked: false,
    lockedUntil: null,
    passwordChangedAt: '1403/01/01',
  },
  {
    userId: 'staff-rec-01',
    username: 'receptionist',
    email: 'hoseini@vikimedic.ir',
    phone: '09198765432',
    passwordHash: '39218d6e902b48e3cf7e10e7d583bf4370eb06be44d57053e1925b3a4a159f0f',
    salt: 'salt_rec_101',
    failedAttempts: 0,
    isLocked: false,
    lockedUntil: null,
    passwordChangedAt: '1403/01/01',
  },
  {
    userId: 'staff-mgr-01',
    username: 'manager',
    email: 'rezaei@vikimedic.ir',
    phone: '09351112233',
    passwordHash: '074c76046e7f80479f64bf50269f83ff30ec3d2746c075677d5423f7902d5a17',
    salt: 'salt_mgr_101',
    failedAttempts: 0,
    isLocked: false,
    lockedUntil: null,
    passwordChangedAt: '1403/01/01',
  },
  {
    userId: 'staff-acc-01',
    username: 'accountant',
    email: 'kazemi@vikimedic.ir',
    phone: '09124445566',
    passwordHash: '5a443a595a89f9202a0a20779774681c4ee00b5266138be5a0b73b5f7e77d8a6',
    salt: 'salt_acc_101',
    failedAttempts: 0,
    isLocked: false,
    lockedUntil: null,
    passwordChangedAt: '1403/01/01',
  },
];

// Initial Persian Patients
const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-01',
    nationalId: '۰۰۱۲۳۴۵۶۷۸',
    fileNumber: 'P-1001',
    firstName: 'علیرضا',
    lastName: 'رضایی پور',
    fatherName: 'حسن',
    gender: 'MALE',
    birthDate: '۱۳۶۵/۰۴/۱۲',
    phone: '۰۹۱۲۳۴۵۶۷۸۹',
    emergencyPhone: '۰۲۱-۸۸۴۴۲۲۱۱',
    insuranceType: 'TAMIN_INJTIMAI',
    insuranceNumber: '987654321',
    bloodType: 'O+',
    address: 'تهران، خیابان شریعتی، بالاتر از سیدخندان، کوچه اول، پلاک ۱۲',
    allergies: ['پنی‌سیلین', 'گرد و غبار'],
    chronicDiseases: ['فشار خون بالا'],
    notes: 'بیمار منظم با سابقه مراجعه قبلی',
    createdAt: '۱۴۰۳/۰۱/۱۰',
    clinicId: 'clinic-01',
    lastVisitDate: '۱۴۰۳/۰۵/۰۱',
  },
  {
    id: 'pat-02',
    nationalId: '۰۰۹۸۷۶۵۴۳۲',
    fileNumber: 'P-1002',
    firstName: 'زهرا',
    lastName: 'محمدی کهن',
    fatherName: 'عباس',
    gender: 'FEMALE',
    birthDate: '۱۳۷۲/۰۹/۲۵',
    phone: '۰۹۱۹۸۷۶۵۴۳۲',
    insuranceType: 'SALAMAT',
    insuranceNumber: '554433221',
    bloodType: 'A+',
    address: 'تهران، سعادت آباد، صرافها، پلاک ۴',
    allergies: ['آسپرین'],
    chronicDiseases: ['دیابت نوع ۲'],
    notes: 'توصیه به کنترل قند خون ناشتا',
    createdAt: '۱۴۰۳/۰۲/۱۵',
    clinicId: 'clinic-01',
    lastVisitDate: '۱۴۰۳/۰۵/۰۲',
  },
  {
    id: 'pat-03',
    nationalId: '۰۰۵۵۴۴۳۳۲۲',
    fileNumber: 'P-1003',
    firstName: 'مجید',
    lastName: 'ابراهیمی',
    fatherName: 'محمد',
    gender: 'MALE',
    birthDate: '۱۳۵۸/۱۱/۰۵',
    phone: '۰۹۳۵۱۲۳۴۵۶۷',
    insuranceType: 'NIZAM_LASHKARI',
    insuranceNumber: '112233445',
    bloodType: 'B+',
    address: 'تهران، شهرک غرب، فاز ۳، خیابان حسن سیف',
    allergies: [],
    chronicDiseases: ['چربی خون'],
    notes: 'چکاپ دوره‌ای شش ماهه',
    createdAt: '۱۴۰۳/۰۳/۰۱',
    clinicId: 'clinic-01',
    lastVisitDate: '۱۴۰۳/۰۴/۲۰',
  },
  {
    id: 'pat-04',
    nationalId: '۰۰۴۴۳۳۲۲۱۱',
    fileNumber: 'P-1004',
    firstName: 'سمیرا',
    lastName: 'کریمی نژاد',
    fatherName: 'علی',
    gender: 'FEMALE',
    birthDate: '۱۳۸۰/۰۱/۱۸',
    phone: '۰۹۱۲۹۸۷۶۵۴۳',
    insuranceType: 'FREE',
    bloodType: 'AB+',
    address: 'تهران، میرداماد، میدان مادر، برج آناهیتا',
    allergies: ['سولفونامیدها'],
    notes: 'مراجعه جهت مشاوره تغذیه و پوست',
    createdAt: '۱۴۰۳/۰۴/۱۰',
    clinicId: 'clinic-02',
    lastVisitDate: '۱۴۰۳/۰۵/۰۲',
  },
  {
    id: 'pat-05',
    nationalId: '۰۰۷۷۶۶۵۵۴۴',
    fileNumber: 'P-1005',
    firstName: 'امیر',
    lastName: 'سلیمانی',
    fatherName: 'حسین',
    gender: 'MALE',
    birthDate: '۱۳۶۹/۰۷/۰۳',
    phone: '۰۹۳۸۷۶۵۴۳۲۱',
    insuranceType: 'TAMIN_INJTIMAI',
    insuranceNumber: '887766554',
    bloodType: 'O-',
    address: 'تهران، ولنجک، خیابان چهاردهم، پلاک ۹',
    notes: 'احساس درد شدید در ناحیه معده',
    createdAt: '۱۴۰۳/۰۵/۰۱',
    clinicId: 'clinic-01',
    lastVisitDate: '۱۴۰۳/۰۵/۰۲',
  },
];

// Initial Queue Seed Data
const INITIAL_QUEUE: QueueItem[] = [
  {
    id: 'q-101',
    queueNumber: 1,
    patientId: 'pat-01',
    patientName: 'علیرضا رضایی پور',
    patientPhone: '۰۹۱۲۳۴۵۶۷۸۹',
    patientNationalId: '۰۰۱۲۳۴۵۶۷۸',
    fileNumber: 'P-1001',
    doctorId: 'staff-doc-01',
    doctorName: 'دکتر محمدرضا پیرهادی',
    clinicId: 'clinic-01',
    scheduledTime: '۰۹:۳۰',
    status: 'IN_CONSULTATION',
    visitType: 'SPECIALIST',
    createdAt: '۱۴۰۳/۰۵/۰۲',
    notes: 'بررسی آزمایش قند خون و HbA1c',
  },
  {
    id: 'q-102',
    queueNumber: 2,
    patientId: 'pat-02',
    patientName: 'زهرا محمدی کهن',
    patientPhone: '۰۹۱۹۸۷۶۵۴۳۲',
    patientNationalId: '۰۰۹۸۷۶۵۴۳۲',
    fileNumber: 'P-1002',
    doctorId: 'staff-doc-01',
    doctorName: 'دکتر محمدرضا پیرهادی',
    clinicId: 'clinic-01',
    scheduledTime: '۱۰:۰۰',
    status: 'WAITING',
    visitType: 'GENERAL',
    createdAt: '۱۴۰۳/۰۵/۰۲',
    notes: 'تجدید نسخه داروهای فشار خون',
  },
  {
    id: 'q-103',
    queueNumber: 3,
    patientId: 'pat-05',
    patientName: 'امیر سلیمانی',
    patientPhone: '۰۹۳۸۷۶۵۴۳۲۱',
    patientNationalId: '۰۰۷۷۶۶۵۵۴۴',
    fileNumber: 'P-1005',
    doctorId: 'staff-doc-01',
    doctorName: 'دکتر محمدرضا پیرهادی',
    clinicId: 'clinic-01',
    scheduledTime: '۱۰:۳۰',
    status: 'WAITING',
    visitType: 'EMERGENCY',
    createdAt: '۱۴۰۳/۰۵/۰۲',
    notes: 'درد حاد گوارشی',
  },
  {
    id: 'q-104',
    queueNumber: 4,
    patientId: 'pat-03',
    patientName: 'مجید ابراهیمی',
    patientPhone: '۰۹۳۵۱۲۳۴۵۶۷',
    patientNationalId: '۰۰۵۵۴۴۳۳۲۲',
    fileNumber: 'P-1003',
    doctorId: 'staff-doc-01',
    doctorName: 'دکتر محمدرضا پیرهادی',
    clinicId: 'clinic-01',
    scheduledTime: '۱۱:۰۰',
    status: 'COMPLETED',
    visitType: 'CHECKUP',
    createdAt: '۱۴۰۳/۰۵/۰۲',
    notes: 'چکاپ کامل انجام شد',
  },
];

// Initial Medical Records
const INITIAL_MEDICAL_RECORDS: MedicalRecord[] = [
  {
    id: 'mr-001',
    patientId: 'pat-01',
    doctorId: 'staff-doc-01',
    doctorName: 'دکتر محمدرضا پیرهادی',
    medicalCouncilNumber: '۱۰۴۵۸۲',
    clinicId: 'clinic-01',
    visitDate: '۱۴۰۳/۰۵/۰۲ - ۰۹:۳۵',
    chiefComplaint: 'سردرد مداوم صبحگاهی و احساس خستگی شدید',
    diagnosis: 'هایپرتانسیون خفیف (فشار خون اولیه)',
    systolicBP: 135,
    diastolicBP: 85,
    pulseRate: 78,
    temperature: 36.8,
    weight: 82,
    treatmentNotes: 'توصیه به کاهش مصرف نمک، ۳۰ دقیقه پیاده‌روی روزانه و انجام چکاپ آزمایشگاهی.',
    prescriptions: [
      {
        id: 'rx-1',
        drugName: 'قرص لوزارتان ۵۰ میلی‌گرم (Losartan 50mg)',
        dosage: 'روزانه ۱ عدد صبح‌ها بعد از ناشتا',
        quantity: 30,
        instructions: 'با یک لیوان کامل آب مصرف شود',
      },
      {
        id: 'rx-2',
        drugName: 'قرص متفورمین ۵۰۰ میلی‌گرم (Metformin 500mg)',
        dosage: 'روزانه ۲ عدد همراه با وعده اصلی غذایی',
        quantity: 60,
      },
    ],
    nextVisitDate: '۱۴۰۳/۰۶/۰۲',
  },
];

// Initial Transactions
const INITIAL_TRANSACTIONS: FinancialTransaction[] = [
  {
    id: 'tx-501',
    invoiceNumber: 'INV-1403-1001',
    patientId: 'pat-01',
    patientName: 'علیرضا رضایی پور',
    clinicId: 'clinic-01',
    doctorId: 'staff-doc-01',
    doctorName: 'دکتر محمدرضا پیرهادی',
    amountGross: 350000,
    discountAmount: 30000,
    insuranceCoverage: 120000,
    amountNet: 200000,
    paymentMethod: 'POS',
    paymentStatus: 'PAID',
    description: 'حق ویزیت متخصص داخلی + نوار قلب (ECG)',
    createdAt: '۱۴۰۳/۰۵/۰۲ - ۰۹:۴۵',
    cashierName: 'سارا حسینی',
  },
  {
    id: 'tx-502',
    invoiceNumber: 'INV-1403-1002',
    patientId: 'pat-02',
    patientName: 'زهرا محمدی کهن',
    clinicId: 'clinic-01',
    doctorId: 'staff-doc-01',
    doctorName: 'دکتر محمدرضا پیرهادی',
    amountGross: 250000,
    discountAmount: 0,
    insuranceCoverage: 80000,
    amountNet: 170000,
    paymentMethod: 'POS',
    paymentStatus: 'PAID',
    description: 'ویزیت عمومی + کنترل قند خون با گلوکومتر',
    createdAt: '۱۴۰۳/۰۵/۰۲ - ۱۰:۰۵',
    cashierName: 'سارا حسینی',
  },
  {
    id: 'tx-503',
    invoiceNumber: 'INV-1403-1003',
    patientId: 'pat-04',
    patientName: 'سمیرا کریمی نژاد',
    clinicId: 'clinic-02',
    doctorId: 'staff-doc-01',
    doctorName: 'دکتر محمدرضا پیرهادی',
    amountGross: 500000,
    discountAmount: 50000,
    insuranceCoverage: 0,
    amountNet: 450000,
    paymentMethod: 'CASH',
    paymentStatus: 'PAID',
    description: 'ویزیت تخصصی آزاد + مشاوره تست پوست',
    createdAt: '۱۴۰۳/۰۵/۰۲ - ۱۰:۳۰',
    cashierName: 'سارا حسینی',
  },
];

// Initial Inventory
const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-1',
    clinicId: 'clinic-01',
    code: 'DRG-101',
    name: 'قرص لوزارتان ۵۰ میلی‌گرم',
    category: 'DRUG',
    unit: 'جعبه (۳۰ عددی)',
    stockQuantity: 145,
    minStockLevel: 20,
    unitPrice: 45000,
    expiryDate: '۱۴۰۴/۱۲/۲۹',
    location: 'قفسه A-1',
  },
  {
    id: 'inv-2',
    clinicId: 'clinic-01',
    code: 'DRG-102',
    name: 'امپول نوروبیون (Neurobion Injectable)',
    category: 'DRUG',
    unit: 'ویال/آمپول',
    stockQuantity: 18,
    minStockLevel: 30, // Low stock alert!
    unitPrice: 35000,
    expiryDate: '۱۴۰۴/۰۸/۱۵',
    location: 'یخچال داروخانه - طبقه ۲',
  },
  {
    id: 'inv-3',
    clinicId: 'clinic-01',
    code: 'EQP-201',
    name: 'سوزن نوار تست قند خون (Lancet)',
    category: 'CONSUMABLE',
    unit: 'بسته ۱۰۰ تایی',
    stockQuantity: 50,
    minStockLevel: 10,
    unitPrice: 120000,
    location: 'انبار مصرفی ۱',
  },
];

// Initial Audit Logs
const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '۱۴۰۳/۰۵/۰۲ - ۰۸:۳۰',
    userId: 'staff-rec-01',
    userName: 'سارا حسینی',
    userRole: 'RECEPTIONIST',
    action: 'ورود به سیستم',
    details: 'ورود موفقیت‌آمیز به نرم‌افزار نوبت‌دهی سیستم desktop',
    clinicId: 'clinic-01',
  },
  {
    id: 'log-2',
    timestamp: '۱۴۰۳/۰۵/۰۲ - ۰۹:۳۰',
    userId: 'staff-doc-01',
    userName: 'دکتر محمدرضا پیرهادی',
    userRole: 'DOCTOR',
    action: 'شروع ویزیت',
    details: 'شروع ویزیت بیمار علیرضا رضایی پور (پرونده P-1001)',
    clinicId: 'clinic-01',
  },
];

// Patch 02.5: Initial Default Shift Configurations
const INITIAL_SHIFT_CONFIGS: ShiftConfig[] = [
  {
    id: 'shift-morn-01',
    clinicId: 'clinic-01',
    shiftType: 'MORNING',
    shiftNameFa: 'شیفت صبح',
    startTime: '08:00',
    endTime: '14:00',
    isEnabled: true,
    displayOrder: 1,
    assignedStaff: {
      DOCTOR: 'دکتر محمدرضا پیرهادی',
      NURSE: 'فاطمه کریمی',
      RECEPTIONIST: 'سارا حسینی',
      SECURITY_GUARD: 'علی حسینی',
      CASHIER: 'مریم کاظمی',
      LAB_TECH: 'مهندس رضا علیزاده',
      RADIOLOGY_TECH: 'حسین باقری',
      CLEANER: 'محمد مرادی',
      OTHER: 'رسول احمدی',
    },
  },
  {
    id: 'shift-eve-01',
    clinicId: 'clinic-01',
    shiftType: 'EVENING',
    shiftNameFa: 'شیفت عصر',
    startTime: '14:00',
    endTime: '20:00',
    isEnabled: true,
    displayOrder: 2,
    assignedStaff: {
      DOCTOR: 'دکتر کامران احمدی',
      NURSE: 'زهرا نوری',
      RECEPTIONIST: 'نرگس عباسی',
      SECURITY_GUARD: 'رضا قاسمی',
      CASHIER: 'سارا حسینی',
      LAB_TECH: 'مهندس رضا علیزاده',
      RADIOLOGY_TECH: 'حسین باقری',
      CLEANER: 'حسن قربانی',
      OTHER: 'رسول احمدی',
    },
  },
  {
    id: 'shift-night-01',
    clinicId: 'clinic-01',
    shiftType: 'NIGHT',
    shiftNameFa: 'شیفت شب',
    startTime: '20:00',
    endTime: '08:00',
    isEnabled: true,
    displayOrder: 3,
    assignedStaff: {
      DOCTOR: 'دکتر سامان امیری',
      NURSE: 'مریم صادقی',
      RECEPTIONIST: 'امیرحسین رضایی',
      SECURITY_GUARD: 'حسن شریفی',
      CASHIER: 'امیرحسین رضایی',
      LAB_TECH: 'مهندس رضا علیزاده',
      RADIOLOGY_TECH: 'حسین باقری',
      CLEANER: 'حسن قربانی',
      OTHER: 'رسول احمدی',
    },
  },
];

// Initial Shift Assignment History Logs
const INITIAL_SHIFT_HISTORIES: ShiftAssignmentHistory[] = [
  {
    id: 'shhist-01',
    clinicId: 'clinic-01',
    shiftConfigId: 'shift-morn-01',
    shiftNameFa: 'شیفت صبح',
    positionType: 'DOCTOR',
    positionTitleFa: 'پزشک شیفت',
    previousStaffName: 'دکتر کامران احمدی',
    newStaffName: 'دکتر محمدرضا پیرهادی',
    modifiedBy: 'مهندس امیرحسین رضایی (مدیر کلینیک)',
    modificationDate: '۱۴۰۳/۰۵/۰۱ - ۰۷:۳۰',
    reason: 'جابجایی نوبت آنکالی و حضور در بیمارستان',
  },
  {
    id: 'shhist-02',
    clinicId: 'clinic-01',
    shiftConfigId: 'shift-eve-01',
    shiftNameFa: 'شیفت عصر',
    positionType: 'RECEPTIONIST',
    positionTitleFa: 'مسئول پذیرش',
    previousStaffName: 'زهرا اکبری',
    newStaffName: 'نرگس عباسی',
    modifiedBy: 'سارا حسینی (سرپرست پذیرش)',
    modificationDate: '۱۴۰۳/۰۴/۲۸ - ۱۳:۰۰',
    reason: 'مرخصی استعلاجی مسئول قبلی پذیرش',
  },
];

// Patch 02.6: Initial Centralized Catalog Seed Data
const INITIAL_CATALOG_ITEMS: CatalogItem[] = [
  {
    id: 'cat-101',
    clinicId: 'clinic-01',
    code: 'SRV-101',
    barcode: '6260101000101',
    name: 'ویزیت تخصصی پزشک عمومی / داخلی',
    category: 'ویزیت',
    type: 'VISIT',
    price: 180000,
    unit: 'خدمت',
    insuranceRule: { isCovered: true, coveragePercentage: 70 },
    taxPercentage: 0,
    status: 'ACTIVE',
    description: 'حق ویزیت کامل و معاینه بالینی بیمار در کلینیک',
  },
  {
    id: 'cat-102',
    clinicId: 'clinic-01',
    code: 'DRG-201',
    barcode: '6260123456789',
    name: 'قرص لوزارتان ۵۰ میلی‌گرم (Losartan)',
    category: 'دارویی',
    type: 'MEDICINE',
    price: 45000,
    unit: 'جعبه (۳۰ عددی)',
    insuranceRule: { isCovered: true, coveragePercentage: 70 },
    taxPercentage: 0,
    status: 'ACTIVE',
    description: 'داروی کاهنده فشار خون گروه ARB',
  },
  {
    id: 'cat-103',
    clinicId: 'clinic-01',
    code: 'DRG-202',
    barcode: '6260987654321',
    name: 'آمپول نوروبیون تزریقی (Neurobion)',
    category: 'دارویی',
    type: 'MEDICINE',
    price: 35000,
    unit: 'آمپول',
    insuranceRule: { isCovered: true, coveragePercentage: 70 },
    taxPercentage: 0,
    status: 'ACTIVE',
    description: 'تقویتی ویتامین گروه B کمپلکس',
  },
  {
    id: 'cat-104',
    clinicId: 'clinic-01',
    code: 'SRV-201',
    barcode: '6260201000201',
    name: 'نوار قلب کامل با تفسیر (ECG)',
    category: 'خدمات پاراکلینیک',
    type: 'SERVICE',
    price: 150000,
    unit: 'خدمت',
    insuranceRule: { isCovered: true, coveragePercentage: 70 },
    taxPercentage: 0,
    status: 'ACTIVE',
    description: 'الکتروکاردیوگرام ۱۲ لیدی به همراه تفسیر پزشک',
  },
  {
    id: 'cat-105',
    clinicId: 'clinic-01',
    code: 'LAB-301',
    barcode: '6260301000301',
    name: 'تست کامل خون (CBC + Diff)',
    category: 'آزمایشگاه',
    type: 'LAB',
    price: 120000,
    unit: 'آزمایش',
    insuranceRule: { isCovered: true, coveragePercentage: 70 },
    taxPercentage: 0,
    status: 'ACTIVE',
    description: 'شمارش کامل گلبول‌های قرمز، سفید و پلاکت',
  },
  {
    id: 'cat-106',
    clinicId: 'clinic-01',
    code: 'LAB-302',
    barcode: '6260302000302',
    name: 'قند خون ناشتا (FBS) + HbA1c',
    category: 'آزمایشگاه',
    type: 'LAB',
    price: 95000,
    unit: 'آزمایش',
    insuranceRule: { isCovered: true, coveragePercentage: 70 },
    taxPercentage: 0,
    status: 'ACTIVE',
    description: 'بررسی قند خون ناشتا و هموگلوبین A1c سه ماهه',
  },
  {
    id: 'cat-107',
    clinicId: 'clinic-01',
    code: 'RAD-401',
    barcode: '6260401000401',
    name: 'رادیوگرافی قفسه سینه (Chest X-Ray)',
    category: 'رادیولوژی',
    type: 'RADIOLOGY',
    price: 220000,
    unit: 'گرافی',
    insuranceRule: { isCovered: true, coveragePercentage: 70 },
    taxPercentage: 0,
    status: 'ACTIVE',
    description: 'عکس رادیولوژی ریه و قفسه سینه ایستاده',
  },
  {
    id: 'cat-108',
    clinicId: 'clinic-01',
    code: 'INJ-501',
    barcode: '6260501000501',
    name: 'تزریق عضلانی / وریدی داروی آمپولی',
    category: 'تزریقات و پانسمان',
    type: 'INJECTION',
    price: 40000,
    unit: 'نوبت',
    insuranceRule: { isCovered: true, coveragePercentage: 50 },
    taxPercentage: 0,
    status: 'ACTIVE',
    description: 'خدمات تزریق سرپایی توسط پرستار شیفت',
  },
  {
    id: 'cat-109',
    clinicId: 'clinic-01',
    code: 'CON-601',
    barcode: '6260601000601',
    name: 'ست سرم + آنژیوکت و چسب ضدحساسیت',
    category: 'تجهیزات و مصرفی',
    type: 'CONSUMABLE',
    price: 65000,
    unit: 'بسته',
    insuranceRule: { isCovered: false, coveragePercentage: 0 },
    taxPercentage: 0,
    status: 'ACTIVE',
    description: 'لوازم مصرفی تزریق ورودی سرم',
  },
];

// Patch 02.6: Initial Patient Orders Seed Data
const INITIAL_PATIENT_ORDERS: PatientOrder[] = [
  {
    id: 'ord-1001',
    orderNumber: 'ORD-1403-1001',
    patientId: 'pat-01',
    patientName: 'علیرضا رضایی پور',
    patientNationalId: '۰۰۱۲۳۴۵۶۷۸',
    patientPhone: '۰۹۱۲۳۴۵۶۷۸۹',
    patientFileNumber: 'P-1001',
    clinicId: 'clinic-01',
    doctorId: 'staff-doc-01',
    doctorName: 'دکتر محمدرضا پیرهادی',
    receptionistName: 'سارا حسینی',
    shiftNameFa: 'شیفت صبح',
    shiftStaffDetails: {
      doctorName: 'دکتر محمدرضا پیرهادی',
      receptionistName: 'سارا حسینی',
      cashierName: 'مریم کاظمی',
      nurseName: 'فاطمه کریمی',
      securityName: 'علی حسینی',
    },
    status: 'READY_FOR_BILLING',
    items: [
      {
        id: 'item-1',
        catalogItemId: 'cat-101',
        itemCode: 'SRV-101',
        itemName: 'ویزیت تخصصی پزشک عمومی / داخلی',
        itemType: 'VISIT',
        category: 'ویزیت',
        unitPrice: 180000,
        quantity: 1,
        unit: 'خدمت',
        totalGross: 180000,
        insuranceShare: 126000,
        patientShare: 54000,
        discount: 0,
        tax: 0,
        totalNet: 54000,
        instructions: 'معاینه کامل بالینی',
        addedByRole: 'DOCTOR',
        addedByName: 'دکتر محمدرضا پیرهادی',
        createdAt: '۱۴۰۳/۰۵/۰۲ - ۰۹:۳۵',
      },
      {
        id: 'item-2',
        catalogItemId: 'cat-104',
        itemCode: 'SRV-201',
        itemName: 'نوار قلب کامل با تفسیر (ECG)',
        itemType: 'SERVICE',
        category: 'خدمات پاراکلینیک',
        unitPrice: 150000,
        quantity: 1,
        unit: 'خدمت',
        totalGross: 150000,
        insuranceShare: 105000,
        patientShare: 45000,
        discount: 10000,
        tax: 0,
        totalNet: 35000,
        instructions: 'تفسیر انجام شد - ریتم سینوسی',
        addedByRole: 'DOCTOR',
        addedByName: 'دکتر محمدرضا پیرهادی',
        createdAt: '۱۴۰۳/۰۵/۰۲ - ۰۹:۴۰',
      },
      {
        id: 'item-3',
        catalogItemId: 'cat-102',
        itemCode: 'DRG-201',
        itemName: 'قرص لوزارتان ۵۰ میلی‌گرم (Losartan)',
        itemType: 'MEDICINE',
        category: 'دارویی',
        unitPrice: 45000,
        quantity: 2,
        unit: 'جعبه (۳۰ عددی)',
        totalGross: 90000,
        insuranceShare: 63000,
        patientShare: 27000,
        discount: 0,
        tax: 0,
        totalNet: 27000,
        instructions: 'هر ۱۲ ساعت یک عدد بعد از غذا',
        addedByRole: 'DOCTOR',
        addedByName: 'دکتر محمدرضا پیرهادی',
        createdAt: '۱۴۰۳/۰۵/۰۲ - ۰۹:۴۲',
      },
    ],
    totalGross: 420000,
    totalInsuranceShare: 294000,
    totalDiscount: 10000,
    totalTax: 0,
    totalPatientShare: 116000,
    insuranceType: 'TAMIN_INJTIMAI',
    insuranceNumber: '987654321',
    notes: 'بیمار دارای سابقه فشار خون و نیاز به چکاپ دوره‌ای',
    createdAt: '۱۴۰۳/۰۵/۰۲ - ۰۹:۳۵',
    updatedAt: '۱۴۰۳/۰۵/۰۲ - ۰۹:۴۵',
    printCount: 1,
    printHistory: [
      {
        printedBy: 'سارا حسینی',
        printedAt: '۱۴۰۳/۰۵/۰۲ - ۰۹:۴۵',
        reason: 'صدور برگه پیش‌فاکتور سفارش بیمار جهت تسویه',
      },
    ],
    modificationLogs: [
      {
        id: 'mod-1',
        orderId: 'ord-1001',
        modifiedBy: 'دکتر محمدرضا پیرهادی',
        userRole: 'DOCTOR',
        action: 'ADD_ITEM',
        oldValue: 'بدون آیتم',
        newValue: 'افزودن ویزیت + نوار قلب + لوزارتان',
        reason: 'تشخیص اولیه پزشکی و دستور نوار قلب',
        timestamp: '۱۴۰۳/۰۵/۰۲ - ۰۹:۴۲',
      },
    ],
  },
  {
    id: 'ord-1002',
    orderNumber: 'ORD-1403-1002',
    patientId: 'pat-02',
    patientName: 'زهرا محمدی کهن',
    patientNationalId: '۰۰۹۸۷۶۵۴۳۲',
    patientPhone: '۰۹۱۹۸۷۶۵۴۳۲',
    patientFileNumber: 'P-1002',
    clinicId: 'clinic-01',
    doctorId: 'staff-doc-01',
    doctorName: 'دکتر محمدرضا پیرهادی',
    receptionistName: 'سارا حسینی',
    shiftNameFa: 'شیفت صبح',
    shiftStaffDetails: {
      doctorName: 'دکتر محمدرضا پیرهادی',
      receptionistName: 'سارا حسینی',
      cashierName: 'مریم کاظمی',
      nurseName: 'فاطمه کریمی',
      securityName: 'علی حسینی',
    },
    status: 'PAID',
    items: [
      {
        id: 'item-201',
        catalogItemId: 'cat-101',
        itemCode: 'SRV-101',
        itemName: 'ویزیت تخصصی پزشک عمومی / داخلی',
        itemType: 'VISIT',
        category: 'ویزیت',
        unitPrice: 180000,
        quantity: 1,
        unit: 'خدمت',
        totalGross: 180000,
        insuranceShare: 126000,
        patientShare: 54000,
        discount: 0,
        tax: 0,
        totalNet: 54000,
        instructions: 'ویزیت عمومی',
        addedByRole: 'DOCTOR',
        addedByName: 'دکتر محمدرضا پیرهادی',
        createdAt: '۱۴۰۳/۰۵/۰۲ - ۱۰:۰۰',
      },
      {
        id: 'item-202',
        catalogItemId: 'cat-106',
        itemCode: 'LAB-302',
        itemName: 'قند خون ناشتا (FBS) + HbA1c',
        itemType: 'LAB',
        category: 'آزمایشگاه',
        unitPrice: 95000,
        quantity: 1,
        unit: 'آزمایش',
        totalGross: 95000,
        insuranceShare: 66500,
        patientShare: 28500,
        discount: 0,
        tax: 0,
        totalNet: 28500,
        instructions: 'با ناشتایی ۱۲ ساعته',
        addedByRole: 'DOCTOR',
        addedByName: 'دکتر محمدرضا پیرهادی',
        createdAt: '۱۴۰۳/۰۵/۰۲ - ۱۰:۰۲',
      },
    ],
    totalGross: 275000,
    totalInsuranceShare: 192500,
    totalDiscount: 0,
    totalTax: 0,
    totalPatientShare: 82500,
    insuranceType: 'SALAMAT',
    insuranceNumber: '554433221',
    paymentMethod: 'POS',
    paymentDetails: {
      cashAmount: 0,
      posAmount: 82500,
      cardAmount: 0,
      insuranceAmount: 192500,
    },
    transactionId: 'tx-502',
    createdAt: '۱۴۰۳/۰۵/۰۲ - ۱۰:۰۰',
    updatedAt: '۱۴۰۳/۰۵/۰۲ - ۱۰:۰۵',
    paidAt: '۱۴۰۳/۰۵/۰۲ - ۱۰:۰۵',
    printCount: 1,
    printHistory: [
      {
        printedBy: 'سارا حسینی',
        printedAt: '۱۴۰۳/۰۵/۰۲ - ۱۰:۰۶',
        reason: 'صدور رسید نهایی پرداخت صندوق',
      },
    ],
    modificationLogs: [],
  },
];

export class LocalStorageManager {
  public static getItem<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  public static setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('LocalStorage write error', e);
    }
  }

  public static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('LocalStorage remove error', e);
    }
  }

  public static initialize(): void {
    if (!localStorage.getItem(STORAGE_KEYS.CLINICS)) {
      this.setItem(STORAGE_KEYS.CLINICS, INITIAL_CLINICS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ACTIVE_CLINIC_ID)) {
      this.setItem(STORAGE_KEYS.ACTIVE_CLINIC_ID, INITIAL_CLINICS[0].id);
    }
    if (!localStorage.getItem(STORAGE_KEYS.STAFF)) {
      this.setItem(STORAGE_KEYS.STAFF, INITIAL_STAFF);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID)) {
      this.setItem(STORAGE_KEYS.ACTIVE_USER_ID, INITIAL_STAFF[0].id);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PATIENTS)) {
      this.setItem(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.QUEUE)) {
      this.setItem(STORAGE_KEYS.QUEUE, INITIAL_QUEUE);
    }
    if (!localStorage.getItem(STORAGE_KEYS.MEDICAL_RECORDS)) {
      this.setItem(STORAGE_KEYS.MEDICAL_RECORDS, INITIAL_MEDICAL_RECORDS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
      this.setItem(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.INVENTORY)) {
      this.setItem(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      this.setItem(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SHIFT_CONFIGS)) {
      this.setItem(STORAGE_KEYS.SHIFT_CONFIGS, INITIAL_SHIFT_CONFIGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SHIFT_HISTORIES)) {
      this.setItem(STORAGE_KEYS.SHIFT_HISTORIES, INITIAL_SHIFT_HISTORIES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CATALOG_ITEMS)) {
      this.setItem(STORAGE_KEYS.CATALOG_ITEMS, INITIAL_CATALOG_ITEMS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PATIENT_ORDERS)) {
      this.setItem(STORAGE_KEYS.PATIENT_ORDERS, INITIAL_PATIENT_ORDERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ROLES)) {
      this.setItem(STORAGE_KEYS.ROLES, DEFAULT_SYSTEM_ROLES);
    }
  }

  // Clinics
  public static getClinics(): Clinic[] {
    return this.getItem(STORAGE_KEYS.CLINICS, INITIAL_CLINICS);
  }
  public static saveClinics(clinics: Clinic[]): void {
    this.setItem(STORAGE_KEYS.CLINICS, clinics);
  }
  public static getActiveClinicId(): string {
    return this.getItem(STORAGE_KEYS.ACTIVE_CLINIC_ID, INITIAL_CLINICS[0].id);
  }
  public static setActiveClinicId(id: string): void {
    this.setItem(STORAGE_KEYS.ACTIVE_CLINIC_ID, id);
  }

  // Staff & User
  public static getStaff(): UserStaff[] {
    return this.getItem(STORAGE_KEYS.STAFF, INITIAL_STAFF);
  }
  public static saveStaff(staff: UserStaff[]): void {
    this.setItem(STORAGE_KEYS.STAFF, staff);
  }
  public static getActiveUserId(): string {
    return this.getItem(STORAGE_KEYS.ACTIVE_USER_ID, INITIAL_STAFF[0].id);
  }
  public static setActiveUserId(id: string): void {
    this.setItem(STORAGE_KEYS.ACTIVE_USER_ID, id);
  }

  // Patients
  public static getPatients(clinicId?: string): Patient[] {
    const list = this.getItem(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
    if (!clinicId) return list;
    return list.filter((p) => p.clinicId === clinicId);
  }
  public static savePatients(patients: Patient[]): void {
    this.setItem(STORAGE_KEYS.PATIENTS, patients);
  }

  // Queue
  public static getQueue(clinicId?: string): QueueItem[] {
    const list = this.getItem(STORAGE_KEYS.QUEUE, INITIAL_QUEUE);
    if (!clinicId) return list;
    return list.filter((q) => q.clinicId === clinicId);
  }
  public static saveQueue(queue: QueueItem[]): void {
    this.setItem(STORAGE_KEYS.QUEUE, queue);
  }

  // Medical Records
  public static getMedicalRecords(patientId?: string): MedicalRecord[] {
    const list = this.getItem(STORAGE_KEYS.MEDICAL_RECORDS, INITIAL_MEDICAL_RECORDS);
    if (!patientId) return list;
    return list.filter((m) => m.patientId === patientId);
  }
  public static saveMedicalRecords(records: MedicalRecord[]): void {
    this.setItem(STORAGE_KEYS.MEDICAL_RECORDS, records);
  }

  // Financial Transactions
  public static getTransactions(clinicId?: string): FinancialTransaction[] {
    const list = this.getItem(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
    if (!clinicId) return list;
    return list.filter((t) => t.clinicId === clinicId);
  }
  public static saveTransactions(transactions: FinancialTransaction[]): void {
    this.setItem(STORAGE_KEYS.TRANSACTIONS, transactions);
  }

  // Inventory
  public static getInventory(clinicId?: string): InventoryItem[] {
    const list = this.getItem(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
    if (!clinicId) return list;
    return list.filter((i) => i.clinicId === clinicId);
  }
  public static saveInventory(inventory: InventoryItem[]): void {
    this.setItem(STORAGE_KEYS.INVENTORY, inventory);
  }

  // Audit Logs
  public static getAuditLogs(): AuditLog[] {
    return this.getItem(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  }
  public static addAuditLog(log: Omit<AuditLog, 'id'>): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      ...log,
      id: 'log-' + Date.now(),
    };
    this.setItem(STORAGE_KEYS.AUDIT_LOGS, [newLog, ...logs]);
  }

  // Patch 02.5: Shift Configurations
  public static getShiftConfigs(clinicId?: string): ShiftConfig[] {
    const list = this.getItem(STORAGE_KEYS.SHIFT_CONFIGS, INITIAL_SHIFT_CONFIGS);
    if (!clinicId) return list;
    const clinicShifts = list.filter((s) => s.clinicId === clinicId);
    if (clinicShifts.length === 0) {
      // Fallback: create default shifts for this new clinic
      const defaultForClinic: ShiftConfig[] = INITIAL_SHIFT_CONFIGS.map((s, idx) => ({
        ...s,
        id: `shift-c-${clinicId}-${idx}`,
        clinicId,
      }));
      this.setItem(STORAGE_KEYS.SHIFT_CONFIGS, [...list, ...defaultForClinic]);
      return defaultForClinic;
    }
    return clinicShifts;
  }

  public static saveShiftConfigs(clinicId: string, clinicConfigs: ShiftConfig[]): void {
    const allConfigs = this.getItem(STORAGE_KEYS.SHIFT_CONFIGS, INITIAL_SHIFT_CONFIGS);
    const otherConfigs = allConfigs.filter((s) => s.clinicId !== clinicId);
    this.setItem(STORAGE_KEYS.SHIFT_CONFIGS, [...otherConfigs, ...clinicConfigs]);
  }

  // Patch 02.5: Shift Histories
  public static getShiftHistories(clinicId?: string): ShiftAssignmentHistory[] {
    const list = this.getItem(STORAGE_KEYS.SHIFT_HISTORIES, INITIAL_SHIFT_HISTORIES);
    if (!clinicId) return list;
    return list.filter((h) => h.clinicId === clinicId);
  }

  public static addShiftHistory(history: Omit<ShiftAssignmentHistory, 'id'>): ShiftAssignmentHistory {
    const list = this.getItem(STORAGE_KEYS.SHIFT_HISTORIES, INITIAL_SHIFT_HISTORIES);
    const newHistory: ShiftAssignmentHistory = {
      ...history,
      id: 'shhist-' + Date.now() + Math.random().toString(36).substring(2, 6),
    };
    this.setItem(STORAGE_KEYS.SHIFT_HISTORIES, [newHistory, ...list]);
    return newHistory;
  }

  // Patch 02.6: Catalog Items
  public static getCatalogItems(clinicId?: string): CatalogItem[] {
    const list = this.getItem(STORAGE_KEYS.CATALOG_ITEMS, INITIAL_CATALOG_ITEMS);
    if (!clinicId) return list;
    return list.filter((c) => c.clinicId === clinicId);
  }

  public static saveCatalogItems(clinicId: string, items: CatalogItem[]): void {
    const all = this.getItem(STORAGE_KEYS.CATALOG_ITEMS, INITIAL_CATALOG_ITEMS);
    const others = all.filter((c) => c.clinicId !== clinicId);
    this.setItem(STORAGE_KEYS.CATALOG_ITEMS, [...others, ...items]);
  }

  public static addCatalogItem(item: Omit<CatalogItem, 'id'>): CatalogItem {
    const list = this.getItem(STORAGE_KEYS.CATALOG_ITEMS, INITIAL_CATALOG_ITEMS);
    const newItem: CatalogItem = {
      ...item,
      id: 'cat-' + Date.now() + Math.random().toString(36).substring(2, 6),
    };
    this.setItem(STORAGE_KEYS.CATALOG_ITEMS, [newItem, ...list]);
    return newItem;
  }

  // Patch 02.6: Patient Orders
  public static getPatientOrders(clinicId?: string): PatientOrder[] {
    const list = this.getItem(STORAGE_KEYS.PATIENT_ORDERS, INITIAL_PATIENT_ORDERS);
    if (!clinicId) return list;
    return list.filter((o) => o.clinicId === clinicId);
  }

  public static savePatientOrders(orders: PatientOrder[]): void {
    this.setItem(STORAGE_KEYS.PATIENT_ORDERS, orders);
  }

  public static savePatientOrder(order: PatientOrder): void {
    const list = this.getItem(STORAGE_KEYS.PATIENT_ORDERS, INITIAL_PATIENT_ORDERS);
    const existingIndex = list.findIndex((o) => o.id === order.id);
    if (existingIndex >= 0) {
      list[existingIndex] = order;
      this.setItem(STORAGE_KEYS.PATIENT_ORDERS, [...list]);
    } else {
      this.setItem(STORAGE_KEYS.PATIENT_ORDERS, [order, ...list]);
    }
  }

  // Phase 03: Authentication Storage Methods
  public static getUserCredentials(): UserCredential[] {
    return this.getItem(STORAGE_KEYS.USER_CREDENTIALS, INITIAL_CREDENTIALS);
  }

  public static saveUserCredentials(credentials: UserCredential[]): void {
    this.setItem(STORAGE_KEYS.USER_CREDENTIALS, credentials);
  }

  public static updateUserCredential(credential: UserCredential): void {
    const list = this.getUserCredentials();
    const idx = list.findIndex((c) => c.userId === credential.userId);
    if (idx >= 0) {
      list[idx] = credential;
    } else {
      list.push(credential);
    }
    this.saveUserCredentials(list);
  }

  public static getAuthSession(): AuthSession | null {
    return this.getItem<AuthSession | null>(STORAGE_KEYS.AUTH_SESSION, null);
  }

  public static saveAuthSession(session: AuthSession | null): void {
    this.setItem(STORAGE_KEYS.AUTH_SESSION, session);
  }

  public static clearAuthSession(): void {
    this.removeItem(STORAGE_KEYS.AUTH_SESSION);
  }

  public static getAuthActivityLogs(): AuthActivityLog[] {
    return this.getItem<AuthActivityLog[]>(STORAGE_KEYS.AUTH_ACTIVITY_LOGS, []);
  }

  public static addAuthActivityLog(log: Omit<AuthActivityLog, 'id'>): AuthActivityLog {
    const list = this.getAuthActivityLogs();
    const newLog: AuthActivityLog = {
      ...log,
      id: 'authlog-' + Date.now() + Math.random().toString(36).substring(2, 6),
    };
    this.setItem(STORAGE_KEYS.AUTH_ACTIVITY_LOGS, [newLog, ...list]);
    return newLog;
  }

  // Phase 03 - Part 02: Role & Permission Storage Methods
  public static getRoles(): Role[] {
    return this.getItem<Role[]>(STORAGE_KEYS.ROLES, DEFAULT_SYSTEM_ROLES);
  }

  public static saveRoles(roles: Role[]): void {
    this.setItem(STORAGE_KEYS.ROLES, roles);
  }

  public static saveRole(role: Role): void {
    const list = this.getRoles();
    const idx = list.findIndex((r) => r.id === role.id || r.code === role.code);
    if (idx >= 0) {
      list[idx] = role;
    } else {
      list.push(role);
    }
    this.saveRoles(list);
  }

  public static deleteRole(roleId: string): boolean {
    const list = this.getRoles();
    const target = list.find((r) => r.id === roleId);
    if (!target || target.isSystemDefault) {
      return false; // Default roles cannot be deleted
    }
    const filtered = list.filter((r) => r.id !== roleId);
    this.saveRoles(filtered);
    return true;
  }

  public static getRoleAuditLogs(): RoleAuditLog[] {
    return this.getItem<RoleAuditLog[]>(STORAGE_KEYS.ROLE_AUDIT_LOGS, []);
  }

  public static addRoleAuditLog(log: Omit<RoleAuditLog, 'id'>): RoleAuditLog {
    const list = this.getRoleAuditLogs();
    const newLog: RoleAuditLog = {
      ...log,
      id: 'rolelog-' + Date.now() + Math.random().toString(36).substring(2, 6),
    };
    this.setItem(STORAGE_KEYS.ROLE_AUDIT_LOGS, [newLog, ...list]);
    return newLog;
  }

  // Patch 03.0: User Management Storage Methods
  public static getUserManagementLogs(): UserManagementLog[] {
    return this.getItem<UserManagementLog[]>(STORAGE_KEYS.USER_MANAGEMENT_LOGS, []);
  }

  public static addUserManagementLog(log: Omit<UserManagementLog, 'id' | 'timestamp'>): UserManagementLog {
    const list = this.getUserManagementLogs();
    const newLog: UserManagementLog = {
      ...log,
      id: 'umlog-' + Date.now() + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
    };
    this.setItem(STORAGE_KEYS.USER_MANAGEMENT_LOGS, [newLog, ...list]);
    return newLog;
  }

  public static saveUserStaffItem(user: UserStaff): void {
    const list = this.getStaff();
    const idx = list.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      list[idx] = user;
    } else {
      list.unshift(user);
    }
    this.saveStaff(list);
  }

  // Patch 07: Shift Control Center Storage Methods
  public static getShiftHandovers(): ShiftHandoverRecord[] {
    return this.getItem<ShiftHandoverRecord[]>(STORAGE_KEYS.SHIFT_HANDOVERS, []);
  }

  public static saveShiftHandovers(handovers: ShiftHandoverRecord[]): void {
    this.setItem(STORAGE_KEYS.SHIFT_HANDOVERS, handovers);
  }

  public static addShiftHandover(handover: ShiftHandoverRecord): void {
    const list = this.getShiftHandovers();
    this.saveShiftHandovers([handover, ...list]);
  }

  public static getShiftAuditLogs(): ShiftAuditLog[] {
    return this.getItem<ShiftAuditLog[]>(STORAGE_KEYS.SHIFT_AUDIT_LOGS, []);
  }

  public static addShiftAuditLog(log: Omit<ShiftAuditLog, 'id'>): ShiftAuditLog {
    const list = this.getShiftAuditLogs();
    const newLog: ShiftAuditLog = {
      ...log,
      id: 'shiftaudit-' + Date.now() + Math.random().toString(36).substring(2, 6),
    };
    this.setItem(STORAGE_KEYS.SHIFT_AUDIT_LOGS, [newLog, ...list]);
    return newLog;
  }

  // System Patch 01: System Backups, Reports & Safe Data Reset Storage Methods
  public static getSystemBackups(): SystemBackupRecord[] {
    return this.getItem<SystemBackupRecord[]>(STORAGE_KEYS.SYSTEM_BACKUPS, []);
  }

  public static getSystemResetReports(): SystemResetReport[] {
    return this.getItem<SystemResetReport[]>(STORAGE_KEYS.SYSTEM_RESET_REPORTS, []);
  }

  public static performSafeDataReset(
    options: SystemResetOptions,
    adminUser: { fullName: string; role: string },
    activeClinicId: string
  ): SystemResetReport {
    const now = new Date();
    const dateFa = now.toLocaleDateString('fa-IR');
    const timeFa = now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

    // 1. Gather operational and master data snapshots
    const patients = this.getItem<Patient[]>(STORAGE_KEYS.PATIENTS, []);
    const queue = this.getItem<QueueItem[]>(STORAGE_KEYS.QUEUE, []);
    const medicalRecords = this.getItem<MedicalRecord[]>(STORAGE_KEYS.MEDICAL_RECORDS, []);
    const transactions = this.getItem<FinancialTransaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    const inventory = this.getItem<InventoryItem[]>(STORAGE_KEYS.INVENTORY, []);
    const patientOrders = this.getItem<PatientOrder[]>(STORAGE_KEYS.PATIENT_ORDERS, []);
    const shiftHistories = this.getItem<ShiftAssignmentHistory[]>(STORAGE_KEYS.SHIFT_HISTORIES, []);
    const shiftHandovers = this.getItem<ShiftHandoverRecord[]>(STORAGE_KEYS.SHIFT_HANDOVERS, []);
    const shiftAuditLogs = this.getItem<ShiftAuditLog[]>(STORAGE_KEYS.SHIFT_AUDIT_LOGS, []);
    const auditLogs = this.getItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
    const authActivityLogs = this.getItem<AuthActivityLog[]>(STORAGE_KEYS.AUTH_ACTIVITY_LOGS, []);
    const roleAuditLogs = this.getItem<RoleAuditLog[]>(STORAGE_KEYS.ROLE_AUDIT_LOGS, []);
    const userManagementLogs = this.getItem<UserManagementLog[]>(STORAGE_KEYS.USER_MANAGEMENT_LOGS, []);
    const staff = this.getStaff();
    const catalogItems = this.getItem<CatalogItem[]>(STORAGE_KEYS.CATALOG_ITEMS, []);
    const shiftConfigs = this.getItem<ShiftConfig[]>(STORAGE_KEYS.SHIFT_CONFIGS, []);

    // 2. Count deleted items
    const deletedPatients = patients.length;
    const deletedMedicalRecords = medicalRecords.length;
    const deletedVisits = medicalRecords.length;
    const deletedOrders = patientOrders.length;
    const deletedTransactions = transactions.length;
    const deletedInventory = inventory.length;
    const deletedQueue = queue.length;
    const deletedHandovers = shiftHandovers.length;
    const deletedShiftHistories = shiftHistories.length;
    const deletedLogs = auditLogs.length + authActivityLogs.length + roleAuditLogs.length + userManagementLogs.length + shiftAuditLogs.length;

    // 3. Create & Save Backup Record BEFORE clearing any data
    const backupSnapshot = {
      patients,
      queue,
      medicalRecords,
      transactions,
      inventory,
      patientOrders,
      shiftHistories,
      shiftHandovers,
      shiftAuditLogs,
      auditLogs,
      authActivityLogs,
      roleAuditLogs,
      userManagementLogs,
      staff,
      catalogItems,
      shiftConfigs,
    };

    const totalRecordCount =
      deletedPatients +
      deletedMedicalRecords +
      deletedOrders +
      deletedTransactions +
      deletedInventory +
      deletedQueue +
      deletedHandovers +
      deletedShiftHistories +
      deletedLogs;

    const backupRecord: SystemBackupRecord = {
      id: 'bkp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      createdAt: `${dateFa} - ${timeFa}`,
      createdBy: adminUser.fullName,
      clinicId: activeClinicId,
      dataSnapshot: backupSnapshot,
      recordCount: totalRecordCount,
    };

    const backups = this.getSystemBackups();
    this.setItem(STORAGE_KEYS.SYSTEM_BACKUPS, [backupRecord, ...backups]);

    // 4. Delete Operational Data
    this.setItem(STORAGE_KEYS.PATIENTS, []);
    this.setItem(STORAGE_KEYS.QUEUE, []);
    this.setItem(STORAGE_KEYS.MEDICAL_RECORDS, []);
    this.setItem(STORAGE_KEYS.TRANSACTIONS, []);
    this.setItem(STORAGE_KEYS.INVENTORY, []);
    this.setItem(STORAGE_KEYS.PATIENT_ORDERS, []);
    this.setItem(STORAGE_KEYS.SHIFT_HISTORIES, []);
    this.setItem(STORAGE_KEYS.SHIFT_HANDOVERS, []);
    this.setItem(STORAGE_KEYS.SHIFT_AUDIT_LOGS, []);
    this.setItem(STORAGE_KEYS.AUDIT_LOGS, []);
    this.setItem(STORAGE_KEYS.AUTH_ACTIVITY_LOGS, []);
    this.setItem(STORAGE_KEYS.ROLE_AUDIT_LOGS, []);
    this.setItem(STORAGE_KEYS.USER_MANAGEMENT_LOGS, []);

    // 5. Process Optional Reset Requests
    let deletedUsersCount = 0;
    let deletedMedicinesCount = 0;
    let deletedServicesCount = 0;

    let remainingStaff = [...staff];
    if (options.deleteUsers) {
      // Keep administrators only
      const admins = staff.filter((s) => s.role === 'ADMINISTRATOR');
      deletedUsersCount = staff.length - admins.length;
      remainingStaff = admins.length > 0 ? admins : staff.slice(0, 1);
      this.saveStaff(remainingStaff);
    }

    let remainingCatalog = [...catalogItems];
    if (options.deleteMedicines) {
      const initialCatCount = remainingCatalog.length;
      remainingCatalog = remainingCatalog.filter((c) => c.type !== 'MEDICINE' && c.type !== 'CONSUMABLE');
      deletedMedicinesCount = initialCatCount - remainingCatalog.length;
    }

    if (options.deleteServices) {
      const initialCatCount = remainingCatalog.length;
      remainingCatalog = remainingCatalog.filter((c) => c.type === 'MEDICINE' || c.type === 'CONSUMABLE');
      deletedServicesCount = initialCatCount - remainingCatalog.length;
    }

    if (options.deleteMedicines || options.deleteServices) {
      this.setItem(STORAGE_KEYS.CATALOG_ITEMS, remainingCatalog);
    }

    // 6. Build Final SystemResetReport
    const resetReport: SystemResetReport = {
      id: 'resetrep-' + Date.now(),
      date: dateFa,
      time: timeFa,
      administratorName: adminUser.fullName,
      administratorRole: adminUser.role,
      deletedCounts: {
        patients: deletedPatients,
        visits: deletedVisits,
        medicalRecords: deletedMedicalRecords,
        patientOrders: deletedOrders,
        transactions: deletedTransactions,
        inventory: deletedInventory,
        appointments: deletedQueue,
        queue: deletedQueue,
        shiftHandovers: deletedHandovers,
        shiftHistories: deletedShiftHistories,
        notifications: 0,
        activityLogs: deletedLogs,
        users: deletedUsersCount,
        medicines: deletedMedicinesCount,
        services: deletedServicesCount,
      },
      remainingCounts: {
        users: remainingStaff.length,
        catalogItems: remainingCatalog.length,
        roles: DEFAULT_SYSTEM_ROLES.length,
        shiftConfigs: shiftConfigs.length,
      },
      backupRefId: backupRecord.id,
      backupTimestamp: backupRecord.createdAt,
    };

    const reports = this.getSystemResetReports();
    this.setItem(STORAGE_KEYS.SYSTEM_RESET_REPORTS, [resetReport, ...reports]);

    return resetReport;
  }

  public static validateResetSafetyChecks(activeClinicId: string): SystemSafetyCheckResult {
    const failureReasons: string[] = [];

    // 1. Check Session & Auth
    const authSession = this.getItem<AuthSession | null>(STORAGE_KEYS.AUTH_SESSION, null);
    const isSessionSafe = !!authSession;
    if (!isSessionSafe) {
      failureReasons.push('نشست کاربری فعال یافت نشد یا احراز هویت نامعتبر است.');
    }

    // 2. Check Cashbox & Shift Handovers
    const shiftHandovers = this.getItem<ShiftHandoverRecord[]>(STORAGE_KEYS.SHIFT_HANDOVERS, []);
    const hasUnclosedShift = shiftHandovers.some((s) => s.status === 'PENDING');
    const isCashboxClosed = !hasUnclosedShift;
    if (!isCashboxClosed) {
      failureReasons.push('صندوق/شیفت باز یا تحویل‌نشده وجود دارد. ابتدا شیفت و صندوق را نهایی و ببندید.');
    }

    // 3. Check No Active Backup Running
    const isNoBackupRunning = true; // No background job running

    // 4. Check Database Integrity
    let isDatabaseHealthy = true;
    try {
      const clinics = this.getClinics();
      const patients = this.getItem<Patient[]>(STORAGE_KEYS.PATIENTS, []);
      if (!Array.isArray(clinics) || !Array.isArray(patients)) {
        isDatabaseHealthy = false;
      }
    } catch {
      isDatabaseHealthy = false;
    }
    if (!isDatabaseHealthy) {
      failureReasons.push('ساختار پایگاه داده محلی آسیب دیده یا غیرقابل خواندن است.');
    }

    // 5. Check Storage Availability
    let isStorageAvailable = true;
    try {
      const testKey = '__vikimedic_storage_test__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
    } catch {
      isStorageAvailable = false;
    }
    if (!isStorageAvailable) {
      failureReasons.push('فضای ذخیره‌سازی مرورگر محدود شده یا در حالت خصوصی قرار دارد.');
    }

    const isPassed =
      isSessionSafe && isCashboxClosed && isNoBackupRunning && isDatabaseHealthy && isStorageAvailable;

    return {
      isSessionSafe,
      isCashboxClosed,
      isNoBackupRunning,
      isDatabaseHealthy,
      isStorageAvailable,
      isPassed,
      failureReasons,
    };
  }

  public static restoreSystemBackup(backupId: string): boolean {
    const backups = this.getSystemBackups();
    const target = backups.find((b) => b.id === backupId);
    if (!target || !target.dataSnapshot) return false;

    const snap = target.dataSnapshot;

    if (snap.patients) this.setItem(STORAGE_KEYS.PATIENTS, snap.patients);
    if (snap.queue) this.setItem(STORAGE_KEYS.QUEUE, snap.queue);
    if (snap.medicalRecords) this.setItem(STORAGE_KEYS.MEDICAL_RECORDS, snap.medicalRecords);
    if (snap.transactions) this.setItem(STORAGE_KEYS.TRANSACTIONS, snap.transactions);
    if (snap.inventory) this.setItem(STORAGE_KEYS.INVENTORY, snap.inventory);
    if (snap.patientOrders) this.setItem(STORAGE_KEYS.PATIENT_ORDERS, snap.patientOrders);
    if (snap.shiftHistories) this.setItem(STORAGE_KEYS.SHIFT_HISTORIES, snap.shiftHistories);
    if (snap.shiftHandovers) this.setItem(STORAGE_KEYS.SHIFT_HANDOVERS, snap.shiftHandovers);
    if (snap.staff) this.saveStaff(snap.staff);
    if (snap.catalogItems) this.setItem(STORAGE_KEYS.CATALOG_ITEMS, snap.catalogItems);
    if (snap.shiftConfigs) this.setItem(STORAGE_KEYS.SHIFT_CONFIGS, snap.shiftConfigs);

    return true;
  }

  public static performSystemHealthCheck(): SystemHealthReport {
    const details: string[] = [];

    // Database Integrity
    let databaseIntegrity = true;
    try {
      const patients = this.getItem<Patient[]>(STORAGE_KEYS.PATIENTS, []);
      const staff = this.getStaff();
      const clinics = this.getClinics();
      if (!Array.isArray(patients) || !Array.isArray(staff) || !Array.isArray(clinics)) {
        databaseIntegrity = false;
        details.push('خطا در خواندن کالکشن‌های اصلی پایگاه داده');
      } else {
        details.push(`یکپارچگی دیتابیس تایید شد (${patients.length} بیمار، ${staff.length} پرسنل)`);
      }
    } catch (e: any) {
      databaseIntegrity = false;
      details.push('استثنا در برقراری ارتباط با پایگاه داده: ' + e?.message);
    }

    // Relationship Validation
    let relationshipValidation = true;
    try {
      const medicalRecords = this.getItem<MedicalRecord[]>(STORAGE_KEYS.MEDICAL_RECORDS, []);
      const patients = this.getItem<Patient[]>(STORAGE_KEYS.PATIENTS, []);
      const patientIds = new Set(patients.map((p) => p.id));
      const orphanedRecords = medicalRecords.filter((m) => m.patientId && !patientIds.has(m.patientId));
      if (orphanedRecords.length > 0) {
        relationshipValidation = false;
        details.push(`تعداد ${orphanedRecords.length} پرونده بدون ارجاع بیمار معتبر یافت شد.`);
      } else {
        details.push('روابط پرونده‌ها و بیماران کاملاً معتبر است.');
      }
    } catch {
      relationshipValidation = false;
    }

    // Missing Settings Check
    let missingSettingsCheck = true;
    try {
      const activeClinicId = this.getItem<string>(STORAGE_KEYS.ACTIVE_CLINIC_ID, '');
      const clinics = this.getClinics();
      const activeClinic = clinics.find((c) => c.id === activeClinicId) || clinics[0];

      if (!activeClinic || !activeClinic.name || !activeClinic.phone) {
        missingSettingsCheck = false;
        details.push('اطلاعات پایه کلینیک فعال (نام یا تلفن) ناقص است.');
      } else {
        details.push(`تنظیمات کلینیک "${activeClinic.name}" کامل است.`);
      }
    } catch {
      missingSettingsCheck = false;
    }

    // Storage Validation
    let storageValidation = true;
    try {
      const testKey = '__vikimedic_health_test__';
      localStorage.setItem(testKey, 'OK');
      const val = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      if (val !== 'OK') storageValidation = false;
      else details.push('تست خواندن و نوشتن حافظه مرورگر با موفقیت انجام شد.');
    } catch {
      storageValidation = false;
      details.push('حافظه مرورگر دردسترس نیست یا پر شده است.');
    }

    // Backup Validation
    let backupValidation = true;
    try {
      const backups = this.getSystemBackups();
      details.push(`تعداد ${backups.length} نسخه پشتیبان / اسنپ‌شات معتبر در سیستم ذخیره شده است.`);
    } catch {
      backupValidation = false;
      details.push('ارزیابی نسخه‌های پشتیبان با خطا مواجه شد.');
    }

    const passed =
      databaseIntegrity && relationshipValidation && missingSettingsCheck && storageValidation && backupValidation;

    return {
      databaseIntegrity,
      relationshipValidation,
      missingSettingsCheck,
      storageValidation,
      backupValidation,
      passed,
      timestamp: new Date().toLocaleString('fa-IR'),
      details,
    };
  }

  public static isFirstRunOrFreshReset(): boolean {
    const patients = this.getItem<Patient[]>(STORAGE_KEYS.PATIENTS, []);
    const transactions = this.getItem<FinancialTransaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    const orders = this.getItem<PatientOrder[]>(STORAGE_KEYS.PATIENT_ORDERS, []);
    return patients.length === 0 && transactions.length === 0 && orders.length === 0;
  }

  public static getAISettings(): AISettingsConfig {
    const saved = this.getItem<AISettingsConfig | null>(STORAGE_KEYS.AI_SETTINGS, null);
    if (!saved) return DEFAULT_AI_SETTINGS;
    return { ...DEFAULT_AI_SETTINGS, ...saved };
  }

  public static saveAISettings(settings: AISettingsConfig): void {
    this.setItem(STORAGE_KEYS.AI_SETTINGS, settings);
  }

  public static getVikiChatHistory(): ChatMessage[] {
    return this.getItem<ChatMessage[]>(STORAGE_KEYS.VIKI_CHAT_HISTORY, []);
  }

  public static saveVikiChatHistory(messages: ChatMessage[]): void {
    this.setItem(STORAGE_KEYS.VIKI_CHAT_HISTORY, messages);
  }

  public static clearVikiChatHistory(): void {
    this.removeItem(STORAGE_KEYS.VIKI_CHAT_HISTORY);
  }

  public static loadDemoData(): { patientsCount: number; visitsCount: number; transactionsCount: number } {
    const now = new Date();
    const dateFa = now.toLocaleDateString('fa-IR');
    const timeFa = now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

    const demoPatients: Patient[] = [
      {
        id: 'p-demo-01',
        clinicId: 'c1',
        fileNumber: 'P-1001',
        nationalId: '0012345678',
        firstName: 'علیرضا',
        lastName: 'رضایی',
        gender: 'MALE',
        phone: '09121112233',
        birthDate: '1365/04/12',
        bloodType: 'O+',
        insuranceType: 'TAMIN_INJTIMAI',
        address: 'تهران، خیابان شریعتی، کوچه سوم',
        emergencyPhone: '09121112234',
        createdAt: `${dateFa} - ${timeFa}`,
      },
      {
        id: 'p-demo-02',
        clinicId: 'c1',
        fileNumber: 'P-1002',
        nationalId: '0023456789',
        firstName: 'سارا',
        lastName: 'محمدی',
        gender: 'FEMALE',
        phone: '09123334455',
        birthDate: '1372/08/25',
        bloodType: 'A+',
        insuranceType: 'SALAMAT',
        address: 'تهران، سعادت‌آباد، خیابان سرو',
        emergencyPhone: '09123334456',
        createdAt: `${dateFa} - ${timeFa}`,
      },
      {
        id: 'p-demo-03',
        clinicId: 'c1',
        fileNumber: 'P-1003',
        nationalId: '0034567890',
        firstName: 'مریم',
        lastName: 'کاظمی',
        gender: 'FEMALE',
        phone: '09125556677',
        birthDate: '1358/11/05',
        bloodType: 'B+',
        insuranceType: 'NIZAM_LASHKARI',
        address: 'تهران، میدان ونک، برج نگار',
        emergencyPhone: '09125556678',
        createdAt: `${dateFa} - ${timeFa}`,
      },
    ];

    const demoVisits: MedicalRecord[] = [
      {
        id: 'mr-demo-01',
        patientId: 'p-demo-01',
        doctorId: 'staff-doc-1',
        doctorName: 'دکتر علیرضا حیدری',
        medicalCouncilNumber: '۱۲۳۴۵',
        clinicId: 'c1',
        visitDate: `${dateFa} - ${timeFa}`,
        chiefComplaint: 'سردرد مداوم و سرگیجه خفیف به مدت ۳ روز',
        diagnosis: 'میگرن حاد و افزایش فشار خون خفیف',
        treatmentNotes: 'بیمار نیازمند پایش فشار خون روزانه و کاهش استرس کاری است.',
        systolicBP: 130,
        diastolicBP: 85,
        pulseRate: 78,
        temperature: 36.8,
        weight: 76,
        prescriptions: [
          { id: 'rx-demo-01', drugName: 'قرص پروپرانولول ۲۰ میلی‌گرم', dosage: 'روزی ۲ عدد', quantity: 30, instructions: 'بعد از غذا' },
        ],
      },
      {
        id: 'mr-demo-02',
        patientId: 'p-demo-02',
        doctorId: 'staff-doc-1',
        doctorName: 'دکتر علیرضا حیدری',
        medicalCouncilNumber: '۱۲۳۴۵',
        clinicId: 'c1',
        visitDate: `${dateFa} - ${timeFa}`,
        chiefComplaint: 'گلودرد شدید و تب همراه با لرز',
        diagnosis: 'فارنژیت حاد استرپتوکوکی',
        treatmentNotes: 'توصیه به استراحت مطلق به مدت ۴۸ ساعت و مصرف مایعات فراوان.',
        systolicBP: 115,
        diastolicBP: 75,
        pulseRate: 84,
        temperature: 38.2,
        weight: 62,
        prescriptions: [
          { id: 'rx-demo-02', drugName: 'کپسول آموکسی‌سیلین ۵۰۰ میلی‌گرم', dosage: 'هر ۸ ساعت ۱ عدد', quantity: 20 },
        ],
      },
    ];

    const demoTransactions: FinancialTransaction[] = [
      {
        id: 'tx-demo-01',
        clinicId: 'c1',
        invoiceNumber: 'INV-10001',
        patientId: 'p-demo-01',
        patientName: 'علیرضا رضایی',
        amountGross: 450000,
        discountAmount: 50000,
        insuranceCoverage: 0,
        amountNet: 400000,
        paymentMethod: 'POS',
        paymentStatus: 'PAID',
        description: 'حق ویزیت پزشک عمومی و ثبت نسخه',
        createdAt: `${dateFa} - ${timeFa}`,
        cashierName: 'مدیر سیستم',
      },
      {
        id: 'tx-demo-02',
        clinicId: 'c1',
        invoiceNumber: 'INV-10002',
        patientId: 'p-demo-02',
        patientName: 'سارا محمدی',
        amountGross: 300000,
        discountAmount: 0,
        insuranceCoverage: 0,
        amountNet: 300000,
        paymentMethod: 'CASH',
        paymentStatus: 'PAID',
        description: 'حق ویزیت و درمان تخصصی سرپایی',
        createdAt: `${dateFa} - ${timeFa}`,
        cashierName: 'پذیرش اول',
      },
    ];

    this.setItem(STORAGE_KEYS.PATIENTS, demoPatients);
    this.setItem(STORAGE_KEYS.MEDICAL_RECORDS, demoVisits);
    this.setItem(STORAGE_KEYS.TRANSACTIONS, demoTransactions);

    return {
      patientsCount: demoPatients.length,
      visitsCount: demoVisits.length,
      transactionsCount: demoTransactions.length,
    };
  }
}

export { LocalStorageManager as StorageService };


