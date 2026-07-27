-- ============================================================
-- VikiMedic v2 - Production PostgreSQL / Supabase Migration
-- File: 002_financial_operational_security.sql
-- Description: Phase 02 Part 03 & Part 04
--              Financial Model (Ledger, Cashbox, Refunds, Invoice Items)
--              Operational Model (Shift Management, Attendances, Room Assignments)
--              Security & Access Control (User-Roles, Role-Permissions, Direct User Permissions, Immutable Audit, Backups Metadata)
-- ============================================================

-- ============================================================
-- 1. FINANCIAL LEDGERS (Single Source of Truth for Financial Reports)
-- ============================================================
CREATE TABLE IF NOT EXISTS financial_ledgers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES invoices(id),
    payment_id UUID REFERENCES payments(id),
    entry_type VARCHAR(20) NOT NULL CHECK (entry_type IN ('DEBIT', 'CREDIT')),
    account_category VARCHAR(50) NOT NULL CHECK (account_category IN ('REVENUE', 'PATIENT_RECEIVABLE', 'INSURANCE_CLAIM', 'REFUND', 'DISCOUNT', 'TAX_PAYABLE', 'CASH_DRAWER')),
    amount_rial NUMERIC(15, 2) NOT NULL,
    description_fa TEXT NOT NULL,
    transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NULL REFERENCES users(id)
);

-- ============================================================
-- 2. CASHBOXES (Cash Drawer Sessions & Balances)
-- ============================================================
CREATE TABLE IF NOT EXISTS cashboxes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    cashier_user_id UUID NOT NULL REFERENCES users(id),
    opening_balance_rial NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    closing_balance_rial NUMERIC(15, 2) DEFAULT 0.00,
    actual_cash_rial NUMERIC(15, 2) DEFAULT 0.00,
    discrepancy_rial NUMERIC(15, 2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED', 'AUDITED')),
    opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMPTZ NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL,
    created_by UUID NULL REFERENCES users(id),
    updated_by UUID NULL REFERENCES users(id),
    deleted_by UUID NULL REFERENCES users(id)
);

-- ============================================================
-- 3. INVOICE_ITEMS (Granular Line Items & Services)
-- ============================================================
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id),
    quantity INT NOT NULL DEFAULT 1,
    unit_price_rial NUMERIC(15, 2) NOT NULL,
    tax_amount_rial NUMERIC(15, 2) DEFAULT 0.00,
    discount_amount_rial NUMERIC(15, 2) DEFAULT 0.00,
    insurance_share_rial NUMERIC(15, 2) DEFAULT 0.00,
    patient_share_rial NUMERIC(15, 2) NOT NULL,
    total_amount_rial NUMERIC(15, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. REFUNDS (Full & Partial Refund Audit)
-- ============================================================
CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    payment_id UUID REFERENCES payments(id),
    refund_amount_rial NUMERIC(15, 2) NOT NULL,
    refund_type VARCHAR(20) NOT NULL CHECK (refund_type IN ('FULL', 'PARTIAL')),
    reason_fa TEXT NOT NULL,
    approved_by_user_id UUID NOT NULL REFERENCES users(id),
    refunded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NULL REFERENCES users(id)
);

-- ============================================================
-- 5. STAFF_ATTENDANCES (Clock-in / Clock-out Rosters)
-- ============================================================
CREATE TABLE IF NOT EXISTS staff_attendances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    employee_id UUID REFERENCES employees(id),
    doctor_id UUID REFERENCES doctors(id),
    shift_id UUID REFERENCES shifts(id),
    check_in_time TIMESTAMPTZ NOT NULL,
    check_out_time TIMESTAMPTZ NULL,
    attendance_status VARCHAR(20) DEFAULT 'PRESENT' CHECK (attendance_status IN ('PRESENT', 'LATE', 'ABSENT', 'OVERTIME')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL
);

-- ============================================================
-- 6. ROOM_ASSIGNMENTS (Doctor & Reception Room Scheduling)
-- ============================================================
CREATE TABLE IF NOT EXISTS room_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES rooms(id),
    doctor_id UUID REFERENCES doctors(id),
    receptionist_user_id UUID REFERENCES users(id),
    assignment_date_jalali VARCHAR(10) NOT NULL,
    time_slot_start VARCHAR(5) NOT NULL,
    time_slot_end VARCHAR(5) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL
);

-- ============================================================
-- 7. USER_ROLES (Junction User to Role)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, role_id, clinic_id)
);

-- ============================================================
-- 8. ROLE_PERMISSIONS (Permission Matrix by Role)
-- ============================================================
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(role_id, permission_id)
);

-- ============================================================
-- 9. USER_PERMISSIONS (Direct User Permission Overrides without Modifying Roles)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    grant_type VARCHAR(10) NOT NULL CHECK (grant_type IN ('GRANT', 'REVOKE')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NULL REFERENCES users(id),
    UNIQUE(user_id, permission_id)
);

-- ============================================================
-- 10. BACKUPS_METADATA (System Backup & Restore History)
-- ============================================================
CREATE TABLE IF NOT EXISTS backups_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    backup_type VARCHAR(20) NOT NULL CHECK (backup_type IN ('AUTO', 'MANUAL')),
    file_name VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    storage_path TEXT NOT NULL,
    checksum_sha256 VARCHAR(64) NOT NULL,
    status VARCHAR(20) DEFAULT 'SUCCESS' CHECK (status IN ('SUCCESS', 'FAILED', 'RESTORED')),
    restored_at TIMESTAMPTZ NULL,
    restored_by_user_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES & PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_financial_ledgers_clinic_date ON financial_ledgers(clinic_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_cashboxes_cashier ON cashboxes(cashier_user_id, status);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_refunds_invoice ON refunds(invoice_id);
CREATE INDEX IF NOT EXISTS idx_staff_attendances_user ON staff_attendances(user_id, check_in_time);
CREATE INDEX IF NOT EXISTS idx_room_assignments_date ON room_assignments(clinic_id, assignment_date_jalali);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE financial_ledgers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cashboxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE backups_metadata ENABLE ROW LEVEL SECURITY;
