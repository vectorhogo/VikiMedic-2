import React, { useState } from 'react';
import {
  Database,
  Table,
  ShieldCheck,
  Search,
  Key,
  Clock,
  Trash2,
  FileCode,
  CheckCircle2,
  Copy,
  Check,
  Layers,
  Sparkles,
  Zap,
  Building2,
  User,
  Stethoscope,
  Receipt,
  FileText,
  Lock,
  History,
  Terminal
} from 'lucide-react';

interface ColumnMeta {
  name: string;
  type: string;
  nullable: boolean;
  isPk?: boolean;
  isFk?: boolean;
  fkRef?: string;
  descriptionFA: string;
}

interface EntitySchema {
  id: string;
  tableName: string;
  nameFA: string;
  category: 'CORE' | 'STAFF' | 'RECEPTION_EMR' | 'FINANCIAL' | 'SYSTEM';
  descriptionFA: string;
  columns: ColumnMeta[];
  indexes: string[];
  sampleRow: Record<string, unknown>;
}

const CORE_ENTITIES: EntitySchema[] = [
  {
    id: 'clinics',
    tableName: 'clinics',
    nameFA: 'کلینیک‌ها (Clinics)',
    category: 'CORE',
    descriptionFA: 'جدول اصلی اطلاعات کلینیک‌ها و شعب با پشتیبانی از معماری چندکلینیکی (Multi-Clinic Ready)',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPk: true, descriptionFA: 'شناسه یکتا (UUID v4)' },
      { name: 'clinic_name', type: 'VARCHAR(255)', nullable: false, descriptionFA: 'نام کلینیک/مطب' },
      { name: 'clinic_code', type: 'VARCHAR(50)', nullable: false, descriptionFA: 'کد یکتای شناسایی کلینیک' },
      { name: 'address', type: 'TEXT', nullable: true, descriptionFA: 'آدرس فیزیکی' },
      { name: 'phone', type: 'VARCHAR(50)', nullable: true, descriptionFA: 'شماره تلفن ثابت' },
      { name: 'status', type: 'VARCHAR(20)', nullable: false, descriptionFA: 'وضعیت فعال بودن کلینیک' },
      { name: 'working_hours', type: 'JSONB', nullable: true, descriptionFA: 'ساعات کاری روزهای هفته' },
      { name: 'timezone', type: 'VARCHAR(50)', nullable: false, descriptionFA: 'منطقه زمانی (پیش‌فرض UTC)' },
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, descriptionFA: 'زمان ایجاد (UTC)' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', nullable: false, descriptionFA: 'زمان آخرین به‌روزرسانی (UTC)' },
      { name: 'deleted_at', type: 'TIMESTAMPTZ', nullable: true, descriptionFA: 'زمان حذف منطقی (Soft Delete)' },
      { name: 'created_by', type: 'UUID', nullable: true, isFk: true, fkRef: 'users.id', descriptionFA: 'ایجادکننده' },
      { name: 'updated_by', type: 'UUID', nullable: true, isFk: true, fkRef: 'users.id', descriptionFA: 'ویرایش‌کننده' },
      { name: 'deleted_by', type: 'UUID', nullable: true, isFk: true, fkRef: 'users.id', descriptionFA: 'حذف‌کننده' },
    ],
    indexes: ['UNIQUE (clinic_code)'],
    sampleRow: {
      id: 'c1f8a2b3-0000-4000-8000-000000000001',
      clinic_name: 'کلینیک تخصصی نوین',
      clinic_code: 'CLN-101',
      phone: '02188888888',
      status: 'ACTIVE',
      timezone: 'UTC',
      created_at: '2026-07-22T10:00:00Z',
      deleted_at: null,
    },
  },
  {
    id: 'patients',
    tableName: 'patients',
    nameFA: 'بیماران (Patients)',
    category: 'CORE',
    descriptionFA: 'پروفایل جامع پرونده بیمار شامل کدملی، بیمه، سوابق پزشکی و هشدارهای حساس',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPk: true, descriptionFA: 'شناسه یکتا بیمار (UUID)' },
      { name: 'clinic_id', type: 'UUID', nullable: false, isFk: true, fkRef: 'clinics.id', descriptionFA: 'شناسه کلینیک' },
      { name: 'national_id', type: 'VARCHAR(10)', nullable: false, descriptionFA: 'کد ملی ۱۰ رقمی' },
      { name: 'first_name_fa', type: 'VARCHAR(100)', nullable: false, descriptionFA: 'نام بیمار' },
      { name: 'last_name_fa', type: 'VARCHAR(100)', nullable: false, descriptionFA: 'نام خانوادگی بیمار' },
      { name: 'father_name_fa', type: 'VARCHAR(100)', nullable: true, descriptionFA: 'نام پدر' },
      { name: 'insurance_id', type: 'UUID', nullable: true, isFk: true, fkRef: 'insurances.id', descriptionFA: 'شناسه سازمان بیمه‌گر' },
      { name: 'insurance_number', type: 'VARCHAR(100)', nullable: true, descriptionFA: 'شماره دفترچه/بیمه' },
      { name: 'birth_date_jalali', type: 'VARCHAR(10)', nullable: true, descriptionFA: 'تاریخ تولد شمسی' },
      { name: 'mobile', type: 'VARCHAR(20)', nullable: false, descriptionFA: 'شماره موبایل جهت پیامک' },
      { name: 'blood_group', type: 'VARCHAR(10)', nullable: true, descriptionFA: 'گروه خونی' },
      { name: 'medical_alerts', type: 'JSONB', nullable: true, descriptionFA: 'لیست آلرژی‌ها و بیماری‌های حساس' },
      { name: 'status', type: 'VARCHAR(20)', nullable: false, descriptionFA: 'وضعیت پرونده' },
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, descriptionFA: 'زمان ثبت' },
      { name: 'deleted_at', type: 'TIMESTAMPTZ', nullable: true, descriptionFA: 'حذف منطقی' },
    ],
    indexes: ['INDEX idx_patients_national_id ON (national_id)', 'INDEX idx_patients_mobile ON (mobile)', 'INDEX idx_patients_names ON (last_name_fa, first_name_fa)'],
    sampleRow: {
      id: 'p9001a1b-1234-4000-8000-000000000002',
      clinic_id: 'c1f8a2b3-0000-4000-8000-000000000001',
      national_id: '0012345678',
      first_name_fa: 'علی',
      last_name_fa: 'محمدی',
      mobile: '09121112233',
      insurance_id: 'ins-001',
      blood_group: 'O+',
      medical_alerts: ['حساسیت به پنی‌سیلین', 'دیابت نوع ۲'],
      created_at: '2026-07-22T10:15:00Z',
    },
  },
  {
    id: 'doctors',
    tableName: 'doctors',
    nameFA: 'پزشکان (Doctors)',
    category: 'STAFF',
    descriptionFA: 'اطلاعات تخصصی پزشکان، شماره نظام پزشکی و تعرفه ویزیت',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPk: true, descriptionFA: 'شناسه یکتا پزشک' },
      { name: 'clinic_id', type: 'UUID', nullable: false, isFk: true, fkRef: 'clinics.id', descriptionFA: 'شناسه کلینیک' },
      { name: 'user_id', type: 'UUID', nullable: true, isFk: true, fkRef: 'users.id', descriptionFA: 'اکانت کاربری ورودی سیستم' },
      { name: 'medical_council_code', type: 'VARCHAR(50)', nullable: false, descriptionFA: 'کد نظام پزشکی' },
      { name: 'first_name_fa', type: 'VARCHAR(100)', nullable: false, descriptionFA: 'نام پزشک' },
      { name: 'last_name_fa', type: 'VARCHAR(100)', nullable: false, descriptionFA: 'نام خانوادگی پزشک' },
      { name: 'specialty_fa', type: 'VARCHAR(150)', nullable: false, descriptionFA: 'تخصص پزشکی' },
      { name: 'consultation_fee_rial', type: 'NUMERIC(15,2)', nullable: false, descriptionFA: 'حق ویزیت پایه (ریال)' },
      { name: 'status', type: 'VARCHAR(20)', nullable: false, descriptionFA: 'وضعیت فعالیت' },
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, descriptionFA: 'زمان ثبت' },
      { name: 'deleted_at', type: 'TIMESTAMPTZ', nullable: true, descriptionFA: 'حذف منطقی' },
    ],
    indexes: ['UNIQUE (medical_council_code)'],
    sampleRow: {
      id: 'd1001a1b-1234-4000-8000-000000000003',
      clinic_id: 'c1f8a2b3-0000-4000-8000-000000000001',
      medical_council_code: '123456',
      first_name_fa: 'دکتر مریم',
      last_name_fa: 'حسینی',
      specialty_fa: 'متخصص داخلی و قلب',
      consultation_fee_rial: 2500000,
      status: 'ACTIVE',
    },
  },
  {
    id: 'receptions',
    tableName: 'receptions',
    nameFA: 'پذیرش‌ها (Receptions)',
    category: 'RECEPTION_EMR',
    descriptionFA: 'گردش کار نوبت‌دهی و نوبت ویزیت بیماران در کلینیک',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPk: true, descriptionFA: 'شناسه پذیرش' },
      { name: 'clinic_id', type: 'UUID', nullable: false, isFk: true, fkRef: 'clinics.id', descriptionFA: 'شناسه کلینیک' },
      { name: 'reception_number', type: 'VARCHAR(50)', nullable: false, descriptionFA: 'شماره یکتای پذیرش (REC-1405-XXXX)' },
      { name: 'queue_number', type: 'INT', nullable: false, descriptionFA: 'شماره نوبت صف در روز' },
      { name: 'patient_id', type: 'UUID', nullable: false, isFk: true, fkRef: 'patients.id', descriptionFA: 'شناسه بیمار' },
      { name: 'doctor_id', type: 'UUID', nullable: false, isFk: true, fkRef: 'doctors.id', descriptionFA: 'شناسه پزشک معالج' },
      { name: 'insurance_id', type: 'UUID', nullable: true, isFk: true, fkRef: 'insurances.id', descriptionFA: 'شناسه بیمه استفاده شده' },
      { name: 'reception_date_jalali', type: 'VARCHAR(10)', nullable: false, descriptionFA: 'تاریخ پذیرش شمسی' },
      { name: 'status', type: 'VARCHAR(20)', nullable: false, descriptionFA: 'وضعیت پذیرش (در انتظار / اتاق پزشک / تکمیل شده)' },
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, descriptionFA: 'زمان دقیق ایجاد' },
      { name: 'deleted_at', type: 'TIMESTAMPTZ', nullable: true, descriptionFA: 'حذف منطقی' },
    ],
    indexes: ['UNIQUE (reception_number)', 'INDEX idx_receptions_patient ON (patient_id)', 'INDEX idx_receptions_clinic_status ON (clinic_id, status, created_at)'],
    sampleRow: {
      id: 'r3001a1b-1234-4000-8000-000000000004',
      reception_number: 'REC-1405-00891',
      queue_number: 14,
      patient_id: 'p9001a1b-1234-4000-8000-000000000002',
      doctor_id: 'd1001a1b-1234-4000-8000-000000000003',
      reception_date_jalali: '1405/05/01',
      status: 'WAITING',
      created_at: '2026-07-22T10:30:00Z',
    },
  },
  {
    id: 'invoices',
    tableName: 'invoices',
    nameFA: 'فاکتورها (Invoices)',
    category: 'FINANCIAL',
    descriptionFA: 'محاسبه مالی دقیق سهم بیمار، سهم بیمه و تخفیف‌های صادره',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPk: true, descriptionFA: 'شناسه فاکتور' },
      { name: 'clinic_id', type: 'UUID', nullable: false, isFk: true, fkRef: 'clinics.id', descriptionFA: 'شناسه کلینیک' },
      { name: 'reception_id', type: 'UUID', nullable: false, isFk: true, fkRef: 'receptions.id', descriptionFA: 'شناسه پذیرش مربوطه' },
      { name: 'invoice_number', type: 'VARCHAR(50)', nullable: false, descriptionFA: 'شماره یکتای فاکتور' },
      { name: 'total_amount_rial', type: 'NUMERIC(15,2)', nullable: false, descriptionFA: 'مبلغ کل خدمات (ریال)' },
      { name: 'insurance_share_rial', type: 'NUMERIC(15,2)', nullable: false, descriptionFA: 'سهم پرداختی بیمه' },
      { name: 'patient_share_rial', type: 'NUMERIC(15,2)', nullable: false, descriptionFA: 'سهم پرداختی بیمار' },
      { name: 'discount_amount_rial', type: 'NUMERIC(15,2)', nullable: false, descriptionFA: 'مبلغ تخفیف' },
      { name: 'net_payable_rial', type: 'NUMERIC(15,2)', nullable: false, descriptionFA: 'مبلغ قابل پرداخت بیمار' },
      { name: 'status', type: 'VARCHAR(20)', nullable: false, descriptionFA: 'وضعیت تسویه (تسویه شده / پرداخت نشده)' },
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, descriptionFA: 'زمان صادر شدن' },
      { name: 'deleted_at', type: 'TIMESTAMPTZ', nullable: true, descriptionFA: 'حذف منطقی' },
    ],
    indexes: ['UNIQUE (invoice_number)', 'INDEX idx_invoices_number ON (invoice_number)'],
    sampleRow: {
      id: 'inv-1001a1b-1234-4000-8000-000000000005',
      invoice_number: 'INV-1405-9988',
      total_amount_rial: 3500000,
      insurance_share_rial: 1000000,
      patient_share_rial: 2500000,
      discount_amount_rial: 200000,
      net_payable_rial: 2300000,
      status: 'PAID',
    },
  },
  {
    id: 'medical_records',
    tableName: 'medical_records',
    nameFA: 'پرونده‌های پزشکی و EMR (Medical Records)',
    category: 'RECEPTION_EMR',
    descriptionFA: 'ثبت شکایات بیمار، علائم حیاتی، تشخیص‌های ICD-10 و یادداشت‌های بالینی پزشک',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPk: true, descriptionFA: 'شناسه سابقه پزشکی' },
      { name: 'clinic_id', type: 'UUID', nullable: false, isFk: true, fkRef: 'clinics.id', descriptionFA: 'شناسه کلینیک' },
      { name: 'reception_id', type: 'UUID', nullable: false, isFk: true, fkRef: 'receptions.id', descriptionFA: 'شناسه پذیرش' },
      { name: 'patient_id', type: 'UUID', nullable: false, isFk: true, fkRef: 'patients.id', descriptionFA: 'شناسه بیمار' },
      { name: 'doctor_id', type: 'UUID', nullable: false, isFk: true, fkRef: 'doctors.id', descriptionFA: 'شناسه پزشک معالج' },
      { name: 'chief_complaint', type: 'TEXT', nullable: true, descriptionFA: 'علت اصلی مراجعه' },
      { name: 'diagnosis_icd10', type: 'VARCHAR(50)', nullable: true, descriptionFA: 'کد استاندارد بین‌المللی ICD-10' },
      { name: 'clinical_notes', type: 'TEXT', nullable: true, descriptionFA: 'یادداشت‌های معاینه بالینی' },
      { name: 'vitals', type: 'JSONB', nullable: true, descriptionFA: 'علائم حیاتی (فشارخون، تب، ضربان قلب، SpO2)' },
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, descriptionFA: 'زمان ثبت' },
      { name: 'deleted_at', type: 'TIMESTAMPTZ', nullable: true, descriptionFA: 'حذف منطقی' },
    ],
    indexes: ['INDEX idx_medical_records_patient ON (patient_id)'],
    sampleRow: {
      id: 'emr-1001a1b-1234-4000-8000-000000000006',
      chief_complaint: 'تنگی نفس و سردرد شدید از شب گذشته',
      diagnosis_icd10: 'I10',
      diagnosis_title_fa: 'فشار خون بالا (Primary Hypertension)',
      vitals: { bp_systolic: 150, bp_diastolic: 95, pulse_rate: 88, temperature_c: 36.8, spo2_percent: 97 },
      created_at: '2026-07-22T10:45:00Z',
    },
  },
  {
    id: 'activity_logs',
    tableName: 'activity_logs',
    nameFA: 'لاگ فعالیت‌ها و ردیابی سیستم (Activity Logs)',
    category: 'SYSTEM',
    descriptionFA: 'ثبت تغییرات غیرقابل‌تغییر (Immutable Audit) برای ردیابی کامل تمام عملیات کاربران',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPk: true, descriptionFA: 'شناسه یکتای لاگ' },
      { name: 'clinic_id', type: 'UUID', nullable: true, isFk: true, fkRef: 'clinics.id', descriptionFA: 'شناسه کلینیک' },
      { name: 'user_id', type: 'UUID', nullable: true, isFk: true, fkRef: 'users.id', descriptionFA: 'شناسه کاربر انجام‌دهنده' },
      { name: 'action_type', type: 'VARCHAR(50)', nullable: false, descriptionFA: 'نوع عملیات (CREATE/UPDATE/DELETE/RESTORE/LOGIN)' },
      { name: 'entity_name', type: 'VARCHAR(100)', nullable: false, descriptionFA: 'نام جدول/موجودیت دستکاری شده' },
      { name: 'entity_id', type: 'UUID', nullable: false, descriptionFA: 'شناسه رکورد دستکاری شده' },
      { name: 'details_json', type: 'JSONB', nullable: true, descriptionFA: 'جزئیات تغییرات قبل و بعد' },
      { name: 'ip_address', type: 'VARCHAR(50)', nullable: true, descriptionFA: 'آدرس IP کاربر' },
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, descriptionFA: 'زمان ثبت غیرقابل تغییر (UTC)' },
    ],
    indexes: ['INDEX idx_activity_logs_entity ON (entity_name, entity_id)'],
    sampleRow: {
      id: 'log-1001a1b-1234-4000-8000-000000000007',
      action_type: 'UPDATE',
      entity_name: 'patients',
      entity_id: 'p9001a1b-1234-4000-8000-000000000002',
      details_json: { updated_field: 'mobile', old_val: '09120000000', new_val: '09121112233' },
      created_at: '2026-07-22T11:00:00Z',
    },
  },
  {
    id: 'financial_ledgers',
    tableName: 'financial_ledgers',
    nameFA: 'دفتر کل مالی و حسابداری (Financial Ledgers)',
    category: 'FINANCIAL',
    descriptionFA: 'منبع واحد حقیقت (Single Source of Truth) برای گزارشات مالی کلینیک، تراز کل، بدهکار/بستانکار و گردش حساب‌ها',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPk: true, descriptionFA: 'شناسه یکتا سند مالی' },
      { name: 'clinic_id', type: 'UUID', nullable: false, isFk: true, fkRef: 'clinics.id', descriptionFA: 'شناسه کلینیک' },
      { name: 'invoice_id', type: 'UUID', nullable: true, isFk: true, fkRef: 'invoices.id', descriptionFA: 'شناسه فاکتور متناظر' },
      { name: 'payment_id', type: 'UUID', nullable: true, isFk: true, fkRef: 'payments.id', descriptionFA: 'شناسه تراکنش پرداخت' },
      { name: 'entry_type', type: 'VARCHAR(20)', nullable: false, descriptionFA: 'نوع ماهیت سند (DEBIT / CREDIT)' },
      { name: 'account_category', type: 'VARCHAR(50)', nullable: false, descriptionFA: 'سرفصل حسابداری (درآمد، مطالبات بیمه، استرداد، تخفیف)' },
      { name: 'amount_rial', type: 'NUMERIC(15,2)', nullable: false, descriptionFA: 'مبلغ سند مالی به ریال' },
      { name: 'description_fa', type: 'TEXT', nullable: false, descriptionFA: 'شرح حسابداری سند' },
      { name: 'transaction_date', type: 'TIMESTAMPTZ', nullable: false, descriptionFA: 'تاریخ وقوع تراکنش (UTC)' },
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, descriptionFA: 'زمان ثبت سند (غیرقابل ویرایش)' },
    ],
    indexes: ['INDEX idx_financial_ledgers_clinic_date ON (clinic_id, transaction_date)'],
    sampleRow: {
      id: 'ledger-001',
      clinic_id: 'c1f8a2b3-0000-4000-8000-000000000001',
      entry_type: 'CREDIT',
      account_category: 'REVENUE',
      amount_rial: 2500000,
      description_fa: 'دریافت وجه بابت ویزیت بیمار علی محمدی (فاکتور INV-1405-9988)',
      transaction_date: '2026-07-22T11:15:00Z',
    },
  },
  {
    id: 'cashboxes',
    tableName: 'cashboxes',
    nameFA: 'صندوق‌های کشوی پول (Cashboxes)',
    category: 'FINANCIAL',
    descriptionFA: 'مدیریت شیفت‌های صندوق، تحویل صندوق، موجودی اولیه و کسری/اضافی صندوقدار',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPk: true, descriptionFA: 'شناسه شیفت صندوق' },
      { name: 'clinic_id', type: 'UUID', nullable: false, isFk: true, fkRef: 'clinics.id', descriptionFA: 'شناسه کلینیک' },
      { name: 'cashier_user_id', type: 'UUID', nullable: false, isFk: true, fkRef: 'users.id', descriptionFA: 'کاربر صندوقدار' },
      { name: 'opening_balance_rial', type: 'NUMERIC(15,2)', nullable: false, descriptionFA: 'موجودی اولیه کشو (ریال)' },
      { name: 'closing_balance_rial', type: 'NUMERIC(15,2)', nullable: true, descriptionFA: 'موجودی محاسباتی پایان شیفت' },
      { name: 'actual_cash_rial', type: 'NUMERIC(15,2)', nullable: true, descriptionFA: 'موجودی واقعی شمارش شده' },
      { name: 'discrepancy_rial', type: 'NUMERIC(15,2)', nullable: true, descriptionFA: 'مبلغ مغایرت صندوق (کسری یا اضافی)' },
      { name: 'status', type: 'VARCHAR(20)', nullable: false, descriptionFA: 'وضعیت صندوق (باز / بسته / حسابرسی شده)' },
      { name: 'opened_at', type: 'TIMESTAMPTZ', nullable: false, descriptionFA: 'زمان بازشدن صندوق' },
      { name: 'closed_at', type: 'TIMESTAMPTZ', nullable: true, descriptionFA: 'زمان بسته شدن صندوق' },
    ],
    indexes: ['INDEX idx_cashboxes_cashier ON (cashier_user_id, status)'],
    sampleRow: {
      id: 'cb-101',
      cashier_user_id: 'u-99',
      opening_balance_rial: 5000000,
      closing_balance_rial: 42000000,
      actual_cash_rial: 42000000,
      discrepancy_rial: 0,
      status: 'CLOSED',
      opened_at: '2026-07-22T08:00:00Z',
      closed_at: '2026-07-22T16:00:00Z',
    },
  },
  {
    id: 'refunds',
    tableName: 'refunds',
    nameFA: 'استرداد وجه و مرجوعی (Refunds)',
    category: 'FINANCIAL',
    descriptionFA: 'ثبت استرداد کامل یا جزیی وجه با دلیل و تایید مدیر/سوپروایزر مربوطه',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPk: true, descriptionFA: 'شناسه استرداد' },
      { name: 'clinic_id', type: 'UUID', nullable: false, isFk: true, fkRef: 'clinics.id', descriptionFA: 'شناسه کلینیک' },
      { name: 'invoice_id', type: 'UUID', nullable: false, isFk: true, fkRef: 'invoices.id', descriptionFA: 'شناسه فاکتور مرجوعی' },
      { name: 'payment_id', type: 'UUID', nullable: true, isFk: true, fkRef: 'payments.id', descriptionFA: 'شناسه پرداخت اصلی' },
      { name: 'refund_amount_rial', type: 'NUMERIC(15,2)', nullable: false, descriptionFA: 'مبلغ استردادی به بیمار (ریال)' },
      { name: 'refund_type', type: 'VARCHAR(20)', nullable: false, descriptionFA: 'نوع استرداد (FULL / PARTIAL)' },
      { name: 'reason_fa', type: 'TEXT', nullable: false, descriptionFA: 'علت مرجوعی یا عدم انجام خدمت' },
      { name: 'approved_by_user_id', type: 'UUID', nullable: false, isFk: true, fkRef: 'users.id', descriptionFA: 'کاربر تاییدکننده استرداد' },
      { name: 'refunded_at', type: 'TIMESTAMPTZ', nullable: false, descriptionFA: 'زمان پرداخت مرجوعی' },
    ],
    indexes: ['INDEX idx_refunds_invoice ON (invoice_id)'],
    sampleRow: {
      id: 'ref-01',
      refund_amount_rial: 1200000,
      refund_type: 'PARTIAL',
      reason_fa: 'انصراف بیمار از انجام نوار قلب',
      approved_by_user_id: 'usr-admin-01',
      refunded_at: '2026-07-22T11:30:00Z',
    },
  },
  {
    id: 'staff_attendances',
    tableName: 'staff_attendances',
    nameFA: 'حضور و غیاب پرسنل (Staff Attendances)',
    category: 'STAFF',
    descriptionFA: 'ثبت تردد، ورود و خروج، مرخصی و اضافه‌کاری پرسنل و پزشکان کلینیک',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPk: true, descriptionFA: 'شناسه حضور/غیاب' },
      { name: 'clinic_id', type: 'UUID', nullable: false, isFk: true, fkRef: 'clinics.id', descriptionFA: 'شناسه کلینیک' },
      { name: 'user_id', type: 'UUID', nullable: false, isFk: true, fkRef: 'users.id', descriptionFA: 'شناسه کاربر' },
      { name: 'check_in_time', type: 'TIMESTAMPTZ', nullable: false, descriptionFA: 'زمان ورود (UTC)' },
      { name: 'check_out_time', type: 'TIMESTAMPTZ', nullable: true, descriptionFA: 'زمان خروج (UTC)' },
      { name: 'attendance_status', type: 'VARCHAR(20)', nullable: false, descriptionFA: 'وضعیت (حاضر / تاخیر / غایب / اضافه‌کار)' },
      { name: 'notes', type: 'TEXT', nullable: true, descriptionFA: 'توضیحات' },
    ],
    indexes: ['INDEX idx_staff_attendances_user ON (user_id, check_in_time)'],
    sampleRow: {
      id: 'att-101',
      user_id: 'usr-doctor-01',
      check_in_time: '2026-07-22T07:55:00Z',
      check_out_time: '2026-07-22T14:00:00Z',
      attendance_status: 'PRESENT',
    },
  },
  {
    id: 'user_permissions',
    tableName: 'user_permissions',
    nameFA: 'دسترسی‌های مستقیم کاربر (Direct User Permissions)',
    category: 'SYSTEM',
    descriptionFA: 'ماتریس اعطا یا سلب دسترسی مستقل به کاربران بدون نیاز به ایجاد نقش‌های جدید (Role-Independent Permissions)',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPk: true, descriptionFA: 'شناسه مجزا' },
      { name: 'user_id', type: 'UUID', nullable: false, isFk: true, fkRef: 'users.id', descriptionFA: 'شناسه کاربر' },
      { name: 'permission_id', type: 'UUID', nullable: false, isFk: true, fkRef: 'permissions.id', descriptionFA: 'شناسه مجوز' },
      { name: 'grant_type', type: 'VARCHAR(10)', nullable: false, descriptionFA: 'نوع تغییر (GRANT / REVOKE)' },
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, descriptionFA: 'زمان ثبت' },
    ],
    indexes: ['UNIQUE (user_id, permission_id)'],
    sampleRow: {
      id: 'up-001',
      user_id: 'usr-receptionist-02',
      permission_id: 'perm-refund-01',
      grant_type: 'GRANT',
      created_at: '2026-07-22T09:00:00Z',
    },
  },
  {
    id: 'backups_metadata',
    tableName: 'backups_metadata',
    nameFA: 'متادیتا و تاریخچه پشتیبان‌گیری (Backups Metadata)',
    category: 'SYSTEM',
    descriptionFA: 'ردیابی فایل‌های پشتیبان خودکار و دستی، حجم فایل، چک‌سام امنیتی SHA256 و تاریخچه ریستور',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPk: true, descriptionFA: 'شناسه فایل پشتیبان' },
      { name: 'clinic_id', type: 'UUID', nullable: false, isFk: true, fkRef: 'clinics.id', descriptionFA: 'شناسه کلینیک' },
      { name: 'backup_type', type: 'VARCHAR(20)', nullable: false, descriptionFA: 'نوع فایل (AUTO / MANUAL)' },
      { name: 'file_name', type: 'VARCHAR(255)', nullable: false, descriptionFA: 'نام فایل پشتیبان' },
      { name: 'file_size_bytes', type: 'BIGINT', nullable: false, descriptionFA: 'حجم فایل به بایت' },
      { name: 'checksum_sha256', type: 'VARCHAR(64)', nullable: false, descriptionFA: 'هش امنیتی SHA256 برای صحت سنجی' },
      { name: 'status', type: 'VARCHAR(20)', nullable: false, descriptionFA: 'وضعیت (موفق / ناموفق / بازیابی شده)' },
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, descriptionFA: 'زمان تولید فایل' },
    ],
    indexes: ['INDEX idx_backups_created ON (clinic_id, created_at)'],
    sampleRow: {
      id: 'bak-20260722',
      backup_type: 'AUTO',
      file_name: 'vikimedic_backup_20260722_0000.enc.sql',
      file_size_bytes: 4829104,
      checksum_sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      status: 'SUCCESS',
      created_at: '2026-07-22T00:00:00Z',
    },
  },
  {
    id: 'daily_clinic_stats',
    tableName: 'daily_clinic_stats',
    nameFA: 'آمار تجمیعی روزانه کلینیک (Daily Clinic Stats)',
    category: 'SYSTEM',
    descriptionFA: 'جدول انباشت روزانه برای رندر آنی داشبورد کلینیک، درآمد، پذیرش‌ها و ادعاهای بیمه',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPk: true, descriptionFA: 'شناسه یکتا آمار' },
      { name: 'clinic_id', type: 'UUID', nullable: false, isFk: true, fkRef: 'clinics.id', descriptionFA: 'شناسه کلینیک' },
      { name: 'stat_date_jalali', type: 'VARCHAR(10)', nullable: false, descriptionFA: 'تاریخ شمسی آمار (مثلا 1405-05-01)' },
      { name: 'total_receptions', type: 'INT', nullable: false, descriptionFA: 'تعداد کل پذیرش‌های روز' },
      { name: 'total_income_rial', type: 'NUMERIC(15,2)', nullable: false, descriptionFA: 'مجموع درآمد مکتسبه به ریال' },
      { name: 'pending_payments_rial', type: 'NUMERIC(15,2)', nullable: false, descriptionFA: 'مجموع مبالغ معوق/بدهکار' },
      { name: 'new_patients_count', type: 'INT', nullable: false, descriptionFA: 'تعداد بیماران جدید پرونده‌شده' },
    ],
    indexes: ['UNIQUE (clinic_id, stat_date_jalali)'],
    sampleRow: {
      id: 'stat-20260722',
      stat_date_jalali: '1405-05-01',
      total_receptions: 48,
      total_income_rial: 185000000,
      pending_payments_rial: 12000000,
      new_patients_count: 7,
    },
  },
  {
    id: 'data_retention_policies',
    tableName: 'data_retention_policies',
    nameFA: 'سیاست‌های نگهداری و آرشیو داده‌ها (Data Retention Policies)',
    category: 'SYSTEM',
    descriptionFA: 'تنظیمات زمان‌بندی آرشیو و پاکسازی داده‌های قدیمی (لوگ‌های سیستم، پذیرش‌ها، لاگ کارکرد)',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPk: true, descriptionFA: 'شناسه قانون' },
      { name: 'clinic_id', type: 'UUID', nullable: false, isFk: true, fkRef: 'clinics.id', descriptionFA: 'شناسه کلینیک' },
      { name: 'target_entity', type: 'VARCHAR(50)', nullable: false, descriptionFA: 'موجودیت هدف (RECEPTIONS / LOGS)' },
      { name: 'retention_days', type: 'INT', nullable: false, descriptionFA: 'مدت نگهداری به روز (مثلا 365 روز)' },
      { name: 'auto_archive_enabled', type: 'BOOLEAN', nullable: false, descriptionFA: 'انتقال خودکار به جدول آرشیو' },
    ],
    indexes: ['UNIQUE (clinic_id, target_entity)'],
    sampleRow: {
      id: 'ret-01',
      target_entity: 'RECEPTIONS',
      retention_days: 730,
      auto_archive_enabled: true,
    },
  },
  {
    id: 'export_jobs_queue',
    tableName: 'export_jobs_queue',
    nameFA: 'صف خروجی‌گیری گزارشات (Export Jobs Queue)',
    category: 'SYSTEM',
    descriptionFA: 'مدیریت و تولید غیرهمزمان فایل‌های خروجی سنگین PDF، Excel و CSV بدون کُندی سیستم',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPk: true, descriptionFA: 'شناسه درخواست خروجی' },
      { name: 'clinic_id', type: 'UUID', nullable: false, isFk: true, fkRef: 'clinics.id', descriptionFA: 'شناسه کلینیک' },
      { name: 'report_type', type: 'VARCHAR(50)', nullable: false, descriptionFA: 'نوع گزارش (مالی / کارکرد پزشک / بیمه)' },
      { name: 'export_format', type: 'VARCHAR(20)', nullable: false, descriptionFA: 'فرمت (PDF / EXCEL / CSV)' },
      { name: 'status', type: 'VARCHAR(20)', nullable: false, descriptionFA: 'وضعیت صف (PENDING / COMPLETED)' },
      { name: 'download_url', type: 'TEXT', nullable: true, descriptionFA: 'لینک دانلود مستقیم فایل تولیدشده' },
    ],
    indexes: ['INDEX idx_export_jobs_user ON (user_id, status)'],
    sampleRow: {
      id: 'exp-881',
      report_type: 'FINANCIAL_LEDGER',
      export_format: 'EXCEL',
      status: 'COMPLETED',
      download_url: 'https://storage.vikimedic.ir/exports/ledger_140505.xlsx',
    },
  },
  {
    id: 'database_performance_metrics',
    tableName: 'database_performance_metrics',
    nameFA: 'مانیتورینگ کارایی و لود پایگاه‌داده (Database Performance Metrics)',
    category: 'SYSTEM',
    descriptionFA: 'پایش مستمر حجم پایگاه‌داده، تعداد کانکشن‌های فعال، کوئری‌های کند و نرخ خطا',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPk: true, descriptionFA: 'شناسه پایش' },
      { name: 'clinic_id', type: 'UUID', nullable: false, isFk: true, fkRef: 'clinics.id', descriptionFA: 'شناسه کلینیک' },
      { name: 'total_db_size_mb', type: 'NUMERIC(10,2)', nullable: false, descriptionFA: 'حجم اشغالی دیتابیس (مگابایت)' },
      { name: 'active_connections', type: 'INT', nullable: false, descriptionFA: 'تعداد اتصال‌های فعال' },
      { name: 'slow_queries_count', type: 'INT', nullable: false, descriptionFA: 'تعداد کوئری‌های بالای ۵۰۰ میلی‌ثانیه' },
      { name: 'cpu_usage_pct', type: 'NUMERIC(5,2)', nullable: false, descriptionFA: 'درصد اشغال پردازنده دیتابیس' },
    ],
    indexes: ['INDEX idx_perf_recorded ON (clinic_id, recorded_at)'],
    sampleRow: {
      id: 'perf-99',
      total_db_size_mb: 485.20,
      active_connections: 14,
      slow_queries_count: 0,
      cpu_usage_pct: 4.20,
    },
  },
];

export const DatabaseArchitectureModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'EXPLORER' | 'SQL_SCRIPT' | 'PRINCIPLES' | 'BENCHMARK'>('EXPLORER');
  const [selectedEntityId, setSelectedEntityId] = useState<string>('patients');
  const [copiedSql, setCopiedSql] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [simulatedQueryResult, setSimulatedQueryResult] = useState<string | null>(null);

  const selectedEntity = CORE_ENTITIES.find((e) => e.id === selectedEntityId) || CORE_ENTITIES[0];

  const handleCopySql = () => {
    const fullSql = `-- VikiMedic v2 Supabase PostgreSQL Core Schema Migration
-- Generated for Phase 02 Part 01
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: ${selectedEntity.tableName}
CREATE TABLE IF NOT EXISTS ${selectedEntity.tableName} (
${selectedEntity.columns.map((col) => `    ${col.name} ${col.type}${col.nullable ? '' : ' NOT NULL'}${col.isPk ? ' PRIMARY KEY DEFAULT gen_random_uuid()' : ''}`).join(',\n')}
);
`;
    navigator.clipboard.writeText(fullSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleRunQueryBenchmark = () => {
    setSimulatedQueryResult('در حال اجرای تست نمایه (Index Scan) روی PostgreSQL Supabase...');
    setTimeout(() => {
      setSimulatedQueryResult(
        `EXPLAIN ANALYZE SELECT * FROM patients WHERE national_id = '${searchQuery || '0012345678'}';\n\n` +
          `-> Index Scan using idx_patients_national_id on patients (cost=0.28..8.30 rows=1 width=312) (actual time=0.042ms..0.045ms)\n` +
          `   Index Cond: (national_id = '${searchQuery || '0012345678'}'::text)\n` +
          `   Filter: (deleted_at IS NULL)\n\n` +
          `Execution Time: 0.084 ms | Status: PASSED (3NF & Soft Delete Compliant)`
      );
    }, 600);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 overflow-hidden font-sans dir-rtl">
      {/* Top Banner Header */}
      <div className="p-4 bg-slate-800/90 border-b border-slate-700/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-xl">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white">معماری دیتابیس و موجودیت‌های اصلی (Database Schema)</h1>
              <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                PostgreSQL 15+ / Supabase
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Phase 02 Part 05 & Part 06 — مدل جامع گزارش‌گیری، آنالیتیکس، صف خروجی‌ها، آرشیو، مانیتورینگ کارایی و نمایه‌های جستجو
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-3 text-xs">
          <div className="bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-1.5 flex items-center gap-2">
            <Table className="w-4 h-4 text-sky-400" />
            <span className="text-slate-400">کل موجودیت‌ها:</span>
            <span className="font-bold text-sky-300">۴۲ جدول</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-1.5 flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">نوع Primary Key:</span>
            <span className="font-bold text-amber-300">UUID v4</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-1.5 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span className="text-slate-400">امنیت RLS:</span>
            <span className="font-bold text-purple-300">فعال (Active)</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center bg-slate-950 px-4 border-b border-slate-800 gap-1 overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setActiveTab('EXPLORER')}
          className={`px-4 py-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'EXPLORER'
              ? 'border-purple-500 text-purple-300 bg-purple-500/10 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Table className="w-4 h-4" />
          <span>کاوشگر جداول و فیلدها (Schema Explorer)</span>
        </button>

        <button
          onClick={() => setActiveTab('SQL_SCRIPT')}
          className={`px-4 py-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'SQL_SCRIPT'
              ? 'border-purple-500 text-purple-300 bg-purple-500/10 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>اسکریپت مایگریشن کامل (Supabase SQL Script)</span>
        </button>

        <button
          onClick={() => setActiveTab('PRINCIPLES')}
          className={`px-4 py-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'PRINCIPLES'
              ? 'border-purple-500 text-purple-300 bg-purple-500/10 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>اصول طـراحی و استانداردهای 3NF</span>
        </button>

        <button
          onClick={() => setActiveTab('BENCHMARK')}
          className={`px-4 py-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'BENCHMARK'
              ? 'border-purple-500 text-purple-300 bg-purple-500/10 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>شبیه‌ساز کوئری و نمایه سریع (Search Benchmark)</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TAB 1: SCHEMA EXPLORER */}
        {activeTab === 'EXPLORER' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Sidebar List of Entities */}
            <div className="lg:col-span-1 bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 flex flex-col gap-2">
              <h2 className="text-xs font-bold text-slate-300 flex items-center gap-2 pb-2 border-b border-slate-700">
                <Table className="w-4 h-4 text-purple-400" />
                <span>لیست ۴۲ موجودیت پایگاه‌داده</span>
              </h2>

              <div className="space-y-1 overflow-y-auto max-h-[600px] pr-1">
                {CORE_ENTITIES.map((entity) => {
                  const isSelected = entity.id === selectedEntityId;
                  return (
                    <button
                      key={entity.id}
                      onClick={() => setSelectedEntityId(entity.id)}
                      className={`w-full text-right p-2.5 rounded-lg text-xs transition-all flex items-center justify-between border ${
                        isSelected
                          ? 'bg-purple-600/30 border-purple-500/50 text-purple-200 font-bold'
                          : 'bg-slate-900/50 border-slate-800 hover:bg-slate-700/50 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {entity.category === 'CORE' && <Building2 className="w-3.5 h-3.5 text-sky-400" />}
                        {entity.category === 'STAFF' && <Stethoscope className="w-3.5 h-3.5 text-amber-400" />}
                        {entity.category === 'RECEPTION_EMR' && <FileText className="w-3.5 h-3.5 text-emerald-400" />}
                        {entity.category === 'FINANCIAL' && <Receipt className="w-3.5 h-3.5 text-emerald-400" />}
                        {entity.category === 'SYSTEM' && <Lock className="w-3.5 h-3.5 text-purple-400" />}
                        <span>{entity.nameFA}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-1.5 py-0.5 rounded">
                        {entity.columns.length} فیلد
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Entity Details */}
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-purple-300 font-mono">{selectedEntity.tableName}</h2>
                      <span className="px-2 py-0.5 text-[10px] bg-slate-900 text-slate-300 border border-slate-700 rounded-md">
                        {selectedEntity.nameFA}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{selectedEntity.descriptionFA}</p>
                  </div>
                  <button
                    onClick={handleCopySql}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-700 border border-slate-700 text-xs rounded-lg flex items-center gap-1.5 transition-colors text-slate-200"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSql ? 'کپی شد!' : 'کپی DDL این جدول'}</span>
                  </button>
                </div>

                {/* Columns Table */}
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-700">
                        <th className="p-2 font-semibold">نام فیلد (Column)</th>
                        <th className="p-2 font-semibold">نوع داده (Data Type)</th>
                        <th className="p-2 font-semibold">کلید / ارجاع</th>
                        <th className="p-2 font-semibold">توضیح عملکردی</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {selectedEntity.columns.map((col, idx) => (
                        <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                          <td className="p-2 font-mono font-bold text-purple-200 flex items-center gap-1.5">
                            {col.isPk && <Key className="w-3 h-3 text-amber-400" />}
                            {col.name}
                          </td>
                          <td className="p-2 font-mono text-emerald-400">{col.type}</td>
                          <td className="p-2 text-[11px]">
                            {col.isPk && <span className="text-amber-300 font-bold">Primary Key (UUID)</span>}
                            {col.isFk && (
                              <span className="text-sky-300 font-mono">FK → {col.fkRef}</span>
                            )}
                            {!col.isPk && !col.isFk && (
                              <span className="text-slate-500">{col.nullable ? 'NULL' : 'NOT NULL'}</span>
                            )}
                          </td>
                          <td className="p-2 text-slate-300">{col.descriptionFA}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Indexes & Constraints */}
                <div className="mt-4 pt-3 border-t border-slate-700/80 flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" />
                    نمایه‌ها و محدودیت‌های یکتایی (Indexes & Constraints):
                  </span>
                  <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                    {selectedEntity.indexes.map((idx, i) => (
                      <span key={i} className="bg-slate-900 border border-slate-700 text-sky-300 px-2.5 py-1 rounded-md">
                        {idx}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sample JSON Row Payload */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <h3 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  نمونه رکورد متناظر در دیتابیس (JSON Data Payload):
                </h3>
                <pre className="bg-slate-950 p-3 rounded-lg text-emerald-400 text-xs font-mono overflow-x-auto border border-slate-800/80 dir-ltr">
                  {JSON.stringify(selectedEntity.sampleRow, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SQL MIGRATION SCRIPT */}
        {activeTab === 'SQL_SCRIPT' && (
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-purple-400" />
                <h2 className="text-sm font-bold text-white">کد کامل DDL اسکریپت مایگریشن Supabase PostgreSQL</h2>
              </div>
              <span className="text-xs text-slate-400">مسیر فایل: `/supabase/migrations/001_core_schema.sql`</span>
            </div>

            <pre className="bg-slate-950 p-4 rounded-xl text-slate-200 text-xs font-mono overflow-x-auto border border-slate-800 h-[500px] dir-ltr leading-relaxed">
{`-- ============================================================
-- VikiMedic v2 - Production PostgreSQL / Supabase Migration
-- File: 001_core_entities_schema.sql
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CLINICS
CREATE TABLE IF NOT EXISTS clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_name VARCHAR(255) NOT NULL,
    clinic_code VARCHAR(50) UNIQUE NOT NULL,
    phone VARCHAR(50),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL,
    created_by UUID NULL,
    updated_by UUID NULL,
    deleted_by UUID NULL
);

-- 2. PATIENTS
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    national_id VARCHAR(10) NOT NULL,
    first_name_fa VARCHAR(100) NOT NULL,
    last_name_fa VARCHAR(100) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    blood_group VARCHAR(10),
    medical_alerts JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL
);

-- 3. RECEPTIONS
CREATE TABLE IF NOT EXISTS receptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    reception_number VARCHAR(50) UNIQUE NOT NULL,
    queue_number INT NOT NULL,
    patient_id UUID NOT NULL REFERENCES patients(id),
    doctor_id UUID NOT NULL REFERENCES doctors(id),
    status VARCHAR(20) DEFAULT 'WAITING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL
);

-- 4. INVOICES
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    reception_id UUID NOT NULL REFERENCES receptions(id),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount_rial NUMERIC(15, 2) NOT NULL,
    net_payable_rial NUMERIC(15, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'UNPAID',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL
);

-- SEARCH INDEXES
CREATE INDEX IF NOT EXISTS idx_patients_national_id ON patients(national_id);
CREATE INDEX IF NOT EXISTS idx_receptions_number ON receptions(reception_number);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
`}
            </pre>
          </div>
        )}

        {/* TAB 3: ARCHITECTURAL PRINCIPLES */}
        {activeTab === 'PRINCIPLES' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-2">
              <div className="p-2 bg-purple-500/20 text-purple-300 w-fit rounded-lg">
                <Key className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">استراتژی UUID برای کلیدهای اصلی</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                تمام ۲۲ جدول بدون استثنا از UUID v4 تولیدشده توسط تابع <code className="font-mono text-amber-300">gen_random_uuid()</code> استفاده می‌کنند.
                این امر مانع از حدس زدن شناسه رکوردهای مالی/پزشکی توسط متجاوزین می‌شود و سنکرون متقابل نسخه دسکتاپ و اندروید با ابر را تسهیل می‌کند.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-2">
              <div className="p-2 bg-amber-500/20 text-amber-300 w-fit rounded-lg">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">مکانیسم حذف منطقی (Soft Delete)</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                در VikiMedic هیچ رکورد بالینی یا مالی به صورت دائمی از پایگاه‌داده حذف نمی‌شود (<code className="font-mono text-red-400">DELETE FROM</code> ممنوع است).
                فیلد <code className="font-mono text-amber-300">deleted_at</code> زمان دقیق و کاربر حذف کننده را ذخیره کرده و قابلیت بازیابی کامل (Restore) فراهم می‌کند.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-2">
              <div className="p-2 bg-sky-500/20 text-sky-300 w-fit rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">مهر زمانی جهانی UTC (TIMESTAMPTZ)</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                تمام ستون‌های زمانی دیتابیس با نوع <code className="font-mono text-sky-300">TIMESTAMPTZ</code> در منطقه زمانی UTC ثبت می‌شوند.
                تبدیل به تقویم هجری شمسی و زمان محلی ایران در لایه UI (Presentation) صورت می‌گیرد تا از ناهماهنگی‌های ساعتی سرور جلوگیری شود.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-2">
              <div className="p-2 bg-emerald-500/20 text-emerald-300 w-fit rounded-lg">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">کنترل دسترسی در سطح سطر (RLS)</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                با فعال‌سازی Row Level Security بر روی تمام جداول، دسترسی هر کلینیک به داده‌های همان مرکز محدود می‌شود.
                شناسه <code className="font-mono text-emerald-300">clinic_id</code> شرط جداسازی ایزوله در لایه دیتابیس Supabase است.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-2">
              <div className="p-2 bg-indigo-500/20 text-indigo-300 w-fit rounded-lg">
                <History className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">نسخه‌بندی قیمت‌ها و تنظیمات (Versioning)</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                جداول <code className="font-mono text-indigo-300">pricings</code> و <code className="font-mono text-indigo-300">settings</code> دارای فیلد <code className="font-mono text-amber-300">version</code> هستند.
                این ساختار امکان حفظ تاریخچه کامل تغییرات تعرفه بیمه‌ها و تنظیمات مطب را بدون دستکاری در فاکتورهای گذشته تضمین می‌کند.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-2">
              <div className="p-2 bg-rose-500/20 text-rose-300 w-fit rounded-lg">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">آمادگی کامل برای Multi-Clinic</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                اگرچه نسخه فعلی برای یک کلینیک راه‌اندازی می‌شود، اما رابطه <code className="font-mono text-rose-300">clinic_id</code> روی تمامی ۲۲ موجودیت گنجانده شده است تا توسعه آتی به صورت چندمرکزی بدون نیازمندی به بازطراحی دیتابیس انجام شود.
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: INDEX BENCHMARK & SIMULATOR */}
        {activeTab === 'BENCHMARK' && (
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-700">
              <Zap className="w-5 h-5 text-amber-400" />
              <h2 className="text-sm font-bold text-white">تست سرعت کوئری و بهینه‌سازی نمایه‌ها (PostgreSQL EXPLAIN ANALYZE)</h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="ورود کد ملی بیمار (مثلا 0012345678) یا شماره پذیرش جهت تست نمایه..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>
              <button
                onClick={handleRunQueryBenchmark}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg flex items-center gap-2 transition-colors"
              >
                <Zap className="w-4 h-4" />
                <span>اجرای بنچمارک نمایه B-Tree</span>
              </button>
            </div>

            {simulatedQueryResult && (
              <pre className="bg-slate-950 p-4 rounded-xl text-emerald-400 text-xs font-mono overflow-x-auto border border-slate-800 dir-ltr leading-relaxed">
                {simulatedQueryResult}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
