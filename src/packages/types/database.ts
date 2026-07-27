/**
 * VikiMedic v2 - Database Principles & Core Entities TypeScript Specifications
 * Clean Architecture Layer: Packages / Types
 *
 * Defines TypeScript interfaces matching the Supabase PostgreSQL 3NF Schema.
 */

// Base Audit Columns Interface
export interface BaseEntity {
  id: string; // UUID v4
  created_at: string; // ISO 8601 UTC
  updated_at: string; // ISO 8601 UTC
  deleted_at: string | null; // Soft Delete timestamp
  created_by: string | null; // UUID v4
  updated_by: string | null; // UUID v4
  deleted_by: string | null; // UUID v4
}

// 1. Clinic Entity
export interface ClinicEntity extends BaseEntity {
  clinic_name: string;
  clinic_code: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  status: 'ACTIVE' | 'SUSPENDED' | 'MAINTENANCE';
  working_hours: Record<string, { start: string; end: string }> | null;
  timezone: string;
}

// 2. User Entity
export interface UserEntity extends BaseEntity {
  clinic_id: string;
  email: string;
  full_name_fa: string;
  mobile: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  last_login_at: string | null;
  security_settings: { twoFactorEnabled?: boolean; allowedIps?: string[] };
}

// 3. Role Entity
export interface RoleEntity extends BaseEntity {
  clinic_id: string;
  role_name: string;
  role_code: string;
  description_fa: string | null;
  is_system: boolean;
}

// 4. Permission Entity
export interface PermissionEntity extends BaseEntity {
  permission_code: string;
  module_name: string;
  description_fa: string | null;
}

// 5. Insurance Entity
export interface InsuranceEntity extends BaseEntity {
  clinic_id: string;
  insurance_name_fa: string;
  insurance_code: string;
  insurance_type: 'SOCIAL_SECURITY' | 'HEALTH_INSURANCE' | 'ARMED_FORCES' | 'EXPORT_INSURANCE' | 'SUPPLEMENTARY';
  discount_percentage: number;
  status: 'ACTIVE' | 'INACTIVE';
}

// 6. Patient Entity
export interface PatientEntity extends BaseEntity {
  clinic_id: string;
  national_id: string;
  first_name_fa: string;
  last_name_fa: string;
  father_name_fa: string | null;
  insurance_id: string | null;
  insurance_number: string | null;
  birth_date_jalali: string | null;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | null;
  phone: string | null;
  mobile: string;
  email: string | null;
  address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  blood_group: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | null;
  photo_url: string | null;
  medical_alerts: string[]; // List of allergies / chronic conditions
  notes: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
}

// 7. Doctor Entity
export interface DoctorEntity extends BaseEntity {
  clinic_id: string;
  user_id: string | null;
  medical_council_code: string; // نظام پزشکی
  first_name_fa: string;
  last_name_fa: string;
  specialty_fa: string;
  consultation_fee_rial: number;
  mobile: string | null;
  status: 'ACTIVE' | 'INACTIVE';
}

// 8. Employee Entity
export interface EmployeeEntity extends BaseEntity {
  clinic_id: string;
  user_id: string | null;
  employee_code: string;
  first_name_fa: string;
  last_name_fa: string;
  department: string;
  job_title: string;
  status: 'ACTIVE' | 'INACTIVE';
}

// 9. Room Entity
export interface RoomEntity extends BaseEntity {
  clinic_id: string;
  room_number: string;
  room_name_fa: string;
  room_type: 'CONSULTATION' | 'SURGERY' | 'RADIOLOGY' | 'LAB' | 'EMERGENCY';
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
}

// 10. Shift Entity
export interface ShiftEntity extends BaseEntity {
  clinic_id: string;
  doctor_id: string | null;
  room_id: string | null;
  shift_name_fa: string;
  start_time_utc: string;
  end_time_utc: string;
  max_capacity: number;
}

// 11. Reception Entity
export interface ReceptionEntity extends BaseEntity {
  clinic_id: string;
  reception_number: string;
  queue_number: number;
  patient_id: string;
  doctor_id: string;
  insurance_id: string | null;
  reception_date_jalali: string;
  status: 'WAITING' | 'IN_ROOM' | 'COMPLETED' | 'CANCELLED';
  notes: string | null;
}

// 12. Service Entity
export interface ServiceEntity extends BaseEntity {
  clinic_id: string;
  service_code: string;
  service_name_fa: string;
  category: string;
  base_price_rial: number;
  status: 'ACTIVE' | 'INACTIVE';
}

// 13. Pricing Entity
export interface PricingEntity extends BaseEntity {
  clinic_id: string;
  service_id: string;
  insurance_id: string | null;
  tariff_price_rial: number;
  patient_share_rial: number;
  insurance_share_rial: number;
  effective_from: string;
  effective_to: string | null;
  version: number;
}

// 14. Invoice Entity
export interface InvoiceEntity extends BaseEntity {
  clinic_id: string;
  reception_id: string;
  invoice_number: string;
  total_amount_rial: number;
  insurance_share_rial: number;
  patient_share_rial: number;
  discount_amount_rial: number;
  net_payable_rial: number;
  status: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'REFUNDED' | 'CANCELLED';
}

// 15. Payment Entity
export interface PaymentEntity extends BaseEntity {
  clinic_id: string;
  invoice_id: string;
  amount_rial: number;
  payment_method: 'CASH' | 'POS_TERMINAL' | 'ONLINE' | 'BANK_TRANSFER' | 'INSURANCE_CREDIT';
  transaction_reference: string | null;
  pos_terminal_id: string | null;
}

// 16. Receipt Entity
export interface ReceiptEntity extends BaseEntity {
  clinic_id: string;
  payment_id: string;
  receipt_number: string;
  printed_count: number;
}

// 17. Appointment Entity
export interface AppointmentEntity extends BaseEntity {
  clinic_id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date_jalali: string;
  start_time: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
}

// 18. MedicalRecord Entity (EMR)
export interface MedicalRecordEntity extends BaseEntity {
  clinic_id: string;
  reception_id: string;
  patient_id: string;
  doctor_id: string;
  chief_complaint: string | null;
  diagnosis_icd10: string | null;
  diagnosis_title_fa: string | null;
  clinical_notes: string | null;
  vitals: {
    bp_systolic?: number;
    bp_diastolic?: number;
    pulse_rate?: number;
    temperature_c?: number;
    spo2_percent?: number;
  };
}

// 19. Prescription Entity
export interface PrescriptionEntity extends BaseEntity {
  clinic_id: string;
  medical_record_id: string;
  patient_id: string;
  doctor_id: string;
  prescription_items: Array<{
    drug_name_fa: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  electronic_tracking_code: string | null;
}

// 20. ActivityLog Entity
export interface ActivityLogEntity {
  id: string;
  clinic_id: string | null;
  user_id: string | null;
  action_type: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'STATUS_CHANGE';
  entity_name: string;
  entity_id: string;
  details_json: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}

// 21. Notification Entity
export interface NotificationEntity extends BaseEntity {
  clinic_id: string;
  user_id: string | null;
  title_fa: string;
  message_fa: string;
  category: string;
  is_read: boolean;
}

// 22. Settings Entity
export interface SettingsEntity extends BaseEntity {
  clinic_id: string;
  setting_category: string;
  setting_key: string;
  setting_value_json: Record<string, unknown>;
  version: number;
}

// 23. FinancialLedger Entity (Single Source of Truth for Financial Reports)
export interface FinancialLedgerEntity {
  id: string;
  clinic_id: string;
  invoice_id: string | null;
  payment_id: string | null;
  entry_type: 'DEBIT' | 'CREDIT';
  account_category: 'REVENUE' | 'PATIENT_RECEIVABLE' | 'INSURANCE_CLAIM' | 'REFUND' | 'DISCOUNT' | 'TAX_PAYABLE' | 'CASH_DRAWER';
  amount_rial: number;
  description_fa: string;
  transaction_date: string;
  created_at: string;
  created_by: string | null;
}

// 24. Cashbox Entity (Cash Drawer Sessions)
export interface CashboxEntity extends BaseEntity {
  clinic_id: string;
  cashier_user_id: string;
  opening_balance_rial: number;
  closing_balance_rial: number;
  actual_cash_rial: number;
  discrepancy_rial: number;
  status: 'OPEN' | 'CLOSED' | 'AUDITED';
  opened_at: string;
  closed_at: string | null;
  notes: string | null;
}

// 25. InvoiceItem Entity
export interface InvoiceItemEntity {
  id: string;
  invoice_id: string;
  service_id: string;
  quantity: number;
  unit_price_rial: number;
  tax_amount_rial: number;
  discount_amount_rial: number;
  insurance_share_rial: number;
  patient_share_rial: number;
  total_amount_rial: number;
  created_at: string;
}

// 26. Refund Entity
export interface RefundEntity {
  id: string;
  clinic_id: string;
  invoice_id: string;
  payment_id: string | null;
  refund_amount_rial: number;
  refund_type: 'FULL' | 'PARTIAL';
  reason_fa: string;
  approved_by_user_id: string;
  refunded_at: string;
  created_at: string;
  created_by: string | null;
}

// 27. StaffAttendance Entity
export interface StaffAttendanceEntity extends BaseEntity {
  clinic_id: string;
  user_id: string;
  employee_id: string | null;
  doctor_id: string | null;
  shift_id: string | null;
  check_in_time: string;
  check_out_time: string | null;
  attendance_status: 'PRESENT' | 'LATE' | 'ABSENT' | 'OVERTIME';
  notes: string | null;
}

// 28. RoomAssignment Entity
export interface RoomAssignmentEntity extends BaseEntity {
  clinic_id: string;
  room_id: string;
  doctor_id: string | null;
  receptionist_user_id: string | null;
  assignment_date_jalali: string;
  time_slot_start: string;
  time_slot_end: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

// 29. UserRole Entity
export interface UserRoleEntity {
  id: string;
  user_id: string;
  role_id: string;
  clinic_id: string;
  created_at: string;
}

// 30. RolePermission Entity
export interface RolePermissionEntity {
  id: string;
  role_id: string;
  permission_id: string;
  created_at: string;
}

// 31. UserPermission Entity (Direct Permission Overrides)
export interface UserPermissionEntity {
  id: string;
  user_id: string;
  permission_id: string;
  grant_type: 'GRANT' | 'REVOKE';
  created_at: string;
  created_by: string | null;
}

// 32. BackupMetadata Entity
export interface BackupMetadataEntity {
  id: string;
  clinic_id: string;
  backup_type: 'AUTO' | 'MANUAL';
  file_name: string;
  file_size_bytes: number;
  storage_path: string;
  checksum_sha256: string;
  status: 'SUCCESS' | 'FAILED' | 'RESTORED';
  restored_at: string | null;
  restored_by_user_id: string | null;
  created_at: string;
}

// 33. DailyClinicStats Entity (Aggregated Dashboard Cache)
export interface DailyClinicStatsEntity {
  id: string;
  clinic_id: string;
  stat_date_jalali: string;
  stat_date_gregorian: string;
  total_receptions: number;
  total_income_rial: number;
  pending_payments_rial: number;
  completed_payments_count: number;
  cancelled_appointments_count: number;
  new_patients_count: number;
  insurance_claims_total_rial: number;
  calculated_at: string;
}

// 34. DoctorWorkloadStats Entity
export interface DoctorWorkloadStatsEntity {
  id: string;
  clinic_id: string;
  doctor_id: string;
  stat_period_type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  period_identifier_jalali: string;
  total_appointments: number;
  completed_receptions: number;
  total_revenue_generated_rial: number;
  doctor_share_estimate_rial: number;
  average_visit_duration_minutes: number;
  updated_at: string;
}

// 35. ServiceAnalytics Entity
export interface ServiceAnalyticsEntity {
  id: string;
  clinic_id: string;
  service_id: string;
  period_identifier_jalali: string;
  usage_count: number;
  total_gross_income_rial: number;
  total_insurance_share_rial: number;
  total_patient_share_rial: number;
  updated_at: string;
}

// 36. ArchivedReception Entity
export interface ArchivedReceptionEntity {
  id: string;
  clinic_id: string;
  original_reception_id: string;
  reception_number: string;
  queue_number: number;
  patient_id: string;
  doctor_id: string;
  insurance_id: string | null;
  reception_date_jalali: string;
  status: string;
  total_amount_rial: number;
  reception_payload_json: Record<string, unknown>;
  archived_at: string;
  archived_by_user_id: string | null;
}

// 37. ArchivedInvoice Entity
export interface ArchivedInvoiceEntity {
  id: string;
  clinic_id: string;
  original_invoice_id: string;
  invoice_number: string;
  reception_id: string;
  patient_id: string;
  total_amount_rial: number;
  discount_amount_rial: number;
  net_amount_rial: number;
  invoice_payload_json: Record<string, unknown>;
  archived_at: string;
  archived_by_user_id: string | null;
}

// 38. DataRetentionPolicy Entity
export interface DataRetentionPolicyEntity {
  id: string;
  clinic_id: string;
  target_entity: 'ACTIVITY_LOGS' | 'NOTIFICATIONS' | 'TEMP_FILES' | 'RECEPTIONS' | 'AUDIT_HISTORY' | 'BACKUPS';
  retention_days: number;
  auto_archive_enabled: boolean;
  auto_purge_enabled: boolean;
  updated_at: string;
  updated_by_user_id: string | null;
}

// 39. ExportJobQueue Entity
export interface ExportJobQueueEntity {
  id: string;
  clinic_id: string;
  user_id: string;
  report_type: 'PATIENT_REPORT' | 'FINANCIAL_LEDGER' | 'DOCTOR_WORKLOAD' | 'INSURANCE_CLAIM' | 'RECEPTION_LOGS' | 'DAILY_SUMMARY';
  export_format: 'PDF' | 'EXCEL' | 'CSV' | 'PRINT_TEMPLATE';
  filter_params_json: Record<string, unknown>;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  download_url: string | null;
  file_size_bytes: number;
  error_message: string | null;
  expires_at: string;
  created_at: string;
}

// 40. DatabasePerformanceMetrics Entity
export interface DatabasePerformanceMetricsEntity {
  id: string;
  clinic_id: string;
  total_db_size_mb: number;
  active_connections: number;
  slow_queries_count: number;
  error_rate_pct: number;
  cpu_usage_pct: number;
  memory_usage_pct: number;
  recorded_at: string;
}

// 41. SlowQueryLog Entity
export interface SlowQueryLogEntity {
  id: string;
  clinic_id: string;
  query_hash: string;
  query_text: string;
  execution_time_ms: number;
  called_by_module: string;
  recorded_at: string;
}

// 42. BackupVerificationLog Entity
export interface BackupVerificationLogEntity {
  id: string;
  backup_id: string;
  verification_status: 'PASSED' | 'CHECKSUM_MISMATCH' | 'CORRUPTED' | 'RESTORE_TEST_FAILED';
  integrity_details_fa: string;
  verified_at: string;
}

// 43. ShiftConfig Entity (Clinic Master Schedule Settings)
export interface ShiftConfigEntity extends BaseEntity {
  clinic_id: string;
  shift_type: 'MORNING' | 'EVENING' | 'NIGHT' | 'CUSTOM';
  shift_name_fa: string;
  start_time: string; // 'HH:MM'
  end_time: string;   // 'HH:MM'
  is_enabled: boolean;
  display_order: number;
}

// 44. ShiftStaffAssignment Entity (Default Assigned Staff per Position)
export interface ShiftStaffAssignmentEntity extends BaseEntity {
  clinic_id: string;
  shift_config_id: string;
  position_type: 'DOCTOR' | 'NURSE' | 'RECEPTIONIST' | 'SECURITY_GUARD' | 'CASHIER' | 'LAB_TECH' | 'RADIOLOGY_TECH' | 'CLEANER' | 'OTHER';
  staff_id: string | null;
  staff_name_fa: string;
  is_default: boolean;
  status: 'ACTIVE' | 'INACTIVE';
}

// 45. ShiftAssignmentHistory Entity (Immutable Modification Audit Trail)
export interface ShiftAssignmentHistoryEntity {
  id: string;
  clinic_id: string;
  shift_config_id: string;
  position_type: string;
  previous_staff_name_fa: string | null;
  new_staff_name_fa: string;
  modified_by_user_id: string | null;
  modification_reason_fa: string;
  created_at: string;
}

// 46. CatalogItemEntity (Centralized Item & Service Catalog)
export interface CatalogItemEntity extends BaseEntity {
  clinic_id: string;
  code: string;
  barcode: string | null;
  item_name_fa: string;
  category_name_fa: string;
  item_type: 'VISIT' | 'MEDICINE' | 'SERVICE' | 'LAB' | 'RADIOLOGY' | 'INJECTION' | 'CONSUMABLE' | 'EQUIPMENT' | 'OTHER';
  base_price_toman: number;
  unit_name_fa: string;
  is_insurance_covered: boolean;
  insurance_coverage_percent: number;
  max_covered_amount_toman: number | null;
  tax_percent: number;
  status: 'ACTIVE' | 'INACTIVE';
  description_fa: string | null;
}

// 47. PatientOrderEntity (Centralized Patient Clinical Order Single Source of Truth)
export interface PatientOrderEntity extends BaseEntity {
  clinic_id: string;
  order_number: string;
  patient_id: string;
  doctor_id: string;
  receptionist_user_id: string | null;
  shift_name_fa: string | null;
  status: 'DRAFT' | 'UNDER_REVIEW' | 'READY_FOR_BILLING' | 'PAID' | 'CANCELLED' | 'ARCHIVED';
  total_gross_toman: number;
  total_insurance_share_toman: number;
  total_discount_toman: number;
  total_tax_toman: number;
  total_patient_share_toman: number;
  insurance_type: string;
  insurance_number: string | null;
  payment_method: string | null;
  payment_details_json: Record<string, unknown> | null;
  shift_staff_details_json: Record<string, unknown> | null;
  transaction_id: string | null;
  notes_fa: string | null;
  paid_at: string | null;
  printed_count: number;
  print_history_json: Record<string, unknown>[] | null;
}

// 48. PatientOrderItemEntity (Individual Ordered Line Items)
export interface PatientOrderItemEntity extends BaseEntity {
  order_id: string;
  catalog_item_id: string;
  item_code: string;
  item_name_fa: string;
  item_type: string;
  category_name_fa: string;
  unit_price_toman: number;
  quantity: number;
  unit_name_fa: string;
  total_gross_toman: number;
  insurance_share_toman: number;
  patient_share_toman: number;
  discount_toman: number;
  tax_toman: number;
  total_net_toman: number;
  instructions_fa: string | null;
  added_by_role: string;
  added_by_name: string;
}

// 49. OrderModificationLogEntity (Audit Log for Order Changes)
export interface OrderModificationLogEntity {
  id: string;
  order_id: string;
  modified_by_name: string;
  user_role: string;
  action_type: string;
  old_value_text: string | null;
  new_value_text: string | null;
  reason_fa: string;
  created_at: string;
}


