-- ============================================================
-- VikiMedic v2 - Production PostgreSQL / Supabase Migration
-- File: 003_reporting_analytics_archival.sql
-- Description: Phase 02 Part 05 & Part 06
--              Reporting & Dashboard Analytics (Daily/Weekly/Monthly Stats)
--              Filter Engine & Export System Queue
--              Global Search Trigram Indexes
--              Archival Engine & Data Retention Policies
--              Database Performance Monitoring & Slow Query Logs
-- ============================================================

-- Enable pg_trgm extension for high-performance fuzzy search across patient & reception records
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- 1. DAILY CLINIC STATS (Aggregated Real-time & Scheduled Dashboard Cache)
-- ============================================================
CREATE TABLE IF NOT EXISTS daily_clinic_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    stat_date_jalali VARCHAR(10) NOT NULL,
    stat_date_gregorian DATE NOT NULL,
    total_receptions INT NOT NULL DEFAULT 0,
    total_income_rial NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    pending_payments_rial NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    completed_payments_count INT NOT NULL DEFAULT 0,
    cancelled_appointments_count INT NOT NULL DEFAULT 0,
    new_patients_count INT NOT NULL DEFAULT 0,
    insurance_claims_total_rial NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(clinic_id, stat_date_jalali)
);

-- ============================================================
-- 2. DOCTOR WORKLOAD STATS (Periodic Aggregation for Doctors)
-- ============================================================
CREATE TABLE IF NOT EXISTS doctor_workload_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    stat_period_type VARCHAR(20) NOT NULL CHECK (stat_period_type IN ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY')),
    period_identifier_jalali VARCHAR(20) NOT NULL, -- e.g., '1405-05-01' or '1405-05'
    total_appointments INT NOT NULL DEFAULT 0,
    completed_receptions INT NOT NULL DEFAULT 0,
    total_revenue_generated_rial NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    doctor_share_estimate_rial NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    average_visit_duration_minutes NUMERIC(5, 2) DEFAULT 0.00,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(clinic_id, doctor_id, stat_period_type, period_identifier_jalali)
);

-- ============================================================
-- 3. SERVICE ANALYTICS (Medical Service Utilization Statistics)
-- ============================================================
CREATE TABLE IF NOT EXISTS service_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    period_identifier_jalali VARCHAR(20) NOT NULL,
    usage_count INT NOT NULL DEFAULT 0,
    total_gross_income_rial NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_insurance_share_rial NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_patient_share_rial NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(clinic_id, service_id, period_identifier_jalali)
);

-- ============================================================
-- 4. ARCHIVED RECEPTIONS (High-Volume Historical Reception Storage)
-- ============================================================
CREATE TABLE IF NOT EXISTS archived_receptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    original_reception_id UUID NOT NULL,
    reception_number VARCHAR(50) NOT NULL,
    queue_number INT NOT NULL,
    patient_id UUID NOT NULL,
    doctor_id UUID NOT NULL,
    insurance_id UUID,
    reception_date_jalali VARCHAR(10) NOT NULL,
    status VARCHAR(20) NOT NULL,
    total_amount_rial NUMERIC(15, 2) NOT NULL,
    reception_payload_json JSONB NOT NULL, -- Complete historical state snapshot
    archived_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    archived_by_user_id UUID REFERENCES users(id)
);

-- ============================================================
-- 5. ARCHIVED INVOICES (High-Volume Historical Financial Storage)
-- ============================================================
CREATE TABLE IF NOT EXISTS archived_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    original_invoice_id UUID NOT NULL,
    invoice_number VARCHAR(50) NOT NULL,
    reception_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    total_amount_rial NUMERIC(15, 2) NOT NULL,
    discount_amount_rial NUMERIC(15, 2) DEFAULT 0.00,
    net_amount_rial NUMERIC(15, 2) NOT NULL,
    invoice_payload_json JSONB NOT NULL,
    archived_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    archived_by_user_id UUID REFERENCES users(id)
);

-- ============================================================
-- 6. DATA RETENTION POLICIES (Configurable System Purge & Archive Controls)
-- ============================================================
CREATE TABLE IF NOT EXISTS data_retention_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    target_entity VARCHAR(50) NOT NULL CHECK (target_entity IN ('ACTIVITY_LOGS', 'NOTIFICATIONS', 'TEMP_FILES', 'RECEPTIONS', 'AUDIT_HISTORY', 'BACKUPS')),
    retention_days INT NOT NULL DEFAULT 365,
    auto_archive_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    auto_purge_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by_user_id UUID REFERENCES users(id),
    UNIQUE(clinic_id, target_entity)
);

-- ============================================================
-- 7. EXPORT JOBS QUEUE (Asynchronous Async PDF / Excel / CSV Reports)
-- ============================================================
CREATE TABLE IF NOT EXISTS export_jobs_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('PATIENT_REPORT', 'FINANCIAL_LEDGER', 'DOCTOR_WORKLOAD', 'INSURANCE_CLAIM', 'RECEPTION_LOGS', 'DAILY_SUMMARY')),
    export_format VARCHAR(20) NOT NULL CHECK (export_format IN ('PDF', 'EXCEL', 'CSV', 'PRINT_TEMPLATE')),
    filter_params_json JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
    download_url TEXT,
    file_size_bytes BIGINT DEFAULT 0,
    error_message TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 8. DATABASE PERFORMANCE METRICS (Monitoring Database Health & Growth)
-- ============================================================
CREATE TABLE IF NOT EXISTS database_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    total_db_size_mb NUMERIC(10, 2) NOT NULL,
    active_connections INT NOT NULL,
    slow_queries_count INT NOT NULL DEFAULT 0,
    error_rate_pct NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    cpu_usage_pct NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    memory_usage_pct NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 9. SLOW QUERY LOGS (Query Optimization & Execution Time Tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS slow_query_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    query_hash VARCHAR(64) NOT NULL,
    query_text TEXT NOT NULL,
    execution_time_ms INT NOT NULL,
    called_by_module VARCHAR(100) NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 10. BACKUP VERIFICATION LOGS (Automated Checksum & Restore Testing)
-- ============================================================
CREATE TABLE IF NOT EXISTS backup_verification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    backup_id UUID NOT NULL REFERENCES backups_metadata(id) ON DELETE CASCADE,
    verification_status VARCHAR(30) NOT NULL CHECK (verification_status IN ('PASSED', 'CHECKSUM_MISMATCH', 'CORRUPTED', 'RESTORE_TEST_FAILED')),
    integrity_details_fa TEXT NOT NULL,
    verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ULTRA-FAST GLOBAL SEARCH INDEXES (TRIGRAM & COMPOSITE)
-- ============================================================

-- Trigram Indexes for Instant Fuzzy Search
CREATE INDEX IF NOT EXISTS idx_patients_name_trgm ON patients USING gin ((first_name || ' ' || last_name) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_patients_national_id_trgm ON patients USING gin (national_id gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_receptions_number_trgm ON receptions USING gin (reception_number gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_invoices_number_trgm ON invoices USING gin (invoice_number gin_trgm_ops);

-- Performance Composite Indexes for High-Traffic Filtering
CREATE INDEX IF NOT EXISTS idx_daily_clinic_stats_date ON daily_clinic_stats(clinic_id, stat_date_jalali);
CREATE INDEX IF NOT EXISTS idx_doctor_workload_period ON doctor_workload_stats(clinic_id, doctor_id, period_identifier_jalali);
CREATE INDEX IF NOT EXISTS idx_export_jobs_user ON export_jobs_queue(user_id, status);
CREATE INDEX IF NOT EXISTS idx_archived_receptions_clinic_no ON archived_receptions(clinic_id, reception_number);
CREATE INDEX IF NOT EXISTS idx_slow_query_execution ON slow_query_logs(clinic_id, execution_time_ms DESC);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE daily_clinic_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_workload_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE archived_receptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE archived_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_retention_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_jobs_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE database_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE slow_query_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_verification_logs ENABLE ROW LEVEL SECURITY;
