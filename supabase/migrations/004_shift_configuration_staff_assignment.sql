-- ============================================================
-- VikiMedic v2 - Production PostgreSQL / Supabase Migration
-- File: 004_shift_configuration_staff_assignment.sql
-- Description: Patch 02.5 - Configurable Shift Management & Permanent Staff Assignment
--              Multi-Clinic Shift Configurations (Morning, Evening, Night, Custom)
--              Staff Position Allocations (Doctor, Nurse, Receptionist, Security, Cashier, etc.)
--              Immutable Shift Assignment Audit History
-- ============================================================

-- ============================================================
-- 1. SHIFT_CONFIGS (Clinic Shift Master Schedule Settings)
-- ============================================================
CREATE TABLE IF NOT EXISTS shift_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    shift_type VARCHAR(20) NOT NULL CHECK (shift_type IN ('MORNING', 'EVENING', 'NIGHT', 'CUSTOM')),
    shift_name_fa VARCHAR(100) NOT NULL,
    start_time VARCHAR(5) NOT NULL, -- Format 'HH:MM' (24-Hour e.g. '08:00')
    end_time VARCHAR(5) NOT NULL,   -- Format 'HH:MM' (24-Hour e.g. '14:00')
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NULL REFERENCES users(id),
    updated_by UUID NULL REFERENCES users(id),
    UNIQUE(clinic_id, shift_type)
);

-- ============================================================
-- 2. SHIFT_STAFF_ASSIGNMENTS (Default Personnel Allocations per Shift)
-- ============================================================
CREATE TABLE IF NOT EXISTS shift_staff_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    shift_config_id UUID NOT NULL REFERENCES shift_configs(id) ON DELETE CASCADE,
    position_type VARCHAR(30) NOT NULL CHECK (position_type IN (
        'DOCTOR', 'NURSE', 'RECEPTIONIST', 'SECURITY_GUARD', 'CASHIER', 
        'LAB_TECH', 'RADIOLOGY_TECH', 'CLEANER', 'OTHER'
    )),
    staff_id UUID NULL REFERENCES users(id),
    staff_name_fa VARCHAR(150) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT TRUE,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(shift_config_id, position_type)
);

-- ============================================================
-- 3. SHIFT_ASSIGNMENT_HISTORIES (Immutable Staff Shift Modification Logs)
-- ============================================================
CREATE TABLE IF NOT EXISTS shift_assignment_histories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    shift_config_id UUID NOT NULL REFERENCES shift_configs(id) ON DELETE CASCADE,
    position_type VARCHAR(30) NOT NULL,
    previous_staff_name_fa VARCHAR(150) NULL,
    new_staff_name_fa VARCHAR(150) NOT NULL,
    modified_by_user_id UUID NULL REFERENCES users(id),
    modification_reason_fa TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES & PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_shift_configs_clinic ON shift_configs(clinic_id, is_enabled);
CREATE INDEX IF NOT EXISTS idx_shift_staff_assignments_shift ON shift_staff_assignments(shift_config_id);
CREATE INDEX IF NOT EXISTS idx_shift_histories_clinic_date ON shift_assignment_histories(clinic_id, created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE shift_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_staff_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_assignment_histories ENABLE ROW LEVEL SECURITY;
