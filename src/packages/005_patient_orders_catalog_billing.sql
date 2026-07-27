-- VikiMedic v2 - Patch 02.6: Smart Clinical Workflow, Patient Order & Billing Engine
-- Supabase PostgreSQL 3NF Schema & RLS Policies

-- 1. Centralized Catalog Table
CREATE TABLE IF NOT EXISTS public.catalog_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    barcode VARCHAR(100),
    item_name_fa VARCHAR(255) NOT NULL,
    category_name_fa VARCHAR(100) NOT NULL,
    item_type VARCHAR(50) NOT NULL CHECK (item_type IN ('VISIT', 'MEDICINE', 'SERVICE', 'LAB', 'RADIOLOGY', 'INJECTION', 'CONSUMABLE', 'EQUIPMENT', 'OTHER')),
    base_price_toman NUMERIC(12, 2) NOT NULL DEFAULT 0,
    unit_name_fa VARCHAR(50) NOT NULL DEFAULT 'عدد',
    is_insurance_covered BOOLEAN NOT NULL DEFAULT true,
    insurance_coverage_percent NUMERIC(5, 2) NOT NULL DEFAULT 70,
    max_covered_amount_toman NUMERIC(12, 2),
    tax_percent NUMERIC(5, 2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    description_fa TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    deleted_by UUID,
    CONSTRAINT uk_catalog_clinic_code UNIQUE (clinic_id, code)
);

CREATE INDEX IF NOT EXISTS idx_catalog_clinic_type ON public.catalog_items(clinic_id, item_type);
CREATE INDEX IF NOT EXISTS idx_catalog_barcode ON public.catalog_items(barcode);

-- 2. Patient Orders Single Source of Truth Table
CREATE TABLE IF NOT EXISTS public.patient_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.doctors(id),
    receptionist_user_id UUID,
    shift_name_fa VARCHAR(100),
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'UNDER_REVIEW', 'READY_FOR_BILLING', 'PAID', 'CANCELLED', 'ARCHIVED')),
    total_gross_toman NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_insurance_share_toman NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_discount_toman NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_tax_toman NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_patient_share_toman NUMERIC(12, 2) NOT NULL DEFAULT 0,
    insurance_type VARCHAR(50) NOT NULL DEFAULT 'FREE',
    insurance_number VARCHAR(100),
    payment_method VARCHAR(50),
    payment_details_json JSONB,
    shift_staff_details_json JSONB,
    transaction_id UUID,
    notes_fa TEXT,
    paid_at TIMESTAMPTZ,
    printed_count INT NOT NULL DEFAULT 0,
    print_history_json JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    deleted_by UUID
);

CREATE INDEX IF NOT EXISTS idx_patient_orders_patient ON public.patient_orders(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_orders_clinic_status ON public.patient_orders(clinic_id, status);

-- 3. Patient Order Items Table
CREATE TABLE IF NOT EXISTS public.patient_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.patient_orders(id) ON DELETE CASCADE,
    catalog_item_id UUID NOT NULL REFERENCES public.catalog_items(id),
    item_code VARCHAR(50) NOT NULL,
    item_name_fa VARCHAR(255) NOT NULL,
    item_type VARCHAR(50) NOT NULL,
    category_name_fa VARCHAR(100) NOT NULL,
    unit_price_toman NUMERIC(12, 2) NOT NULL DEFAULT 0,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
    unit_name_fa VARCHAR(50) NOT NULL,
    total_gross_toman NUMERIC(12, 2) NOT NULL DEFAULT 0,
    insurance_share_toman NUMERIC(12, 2) NOT NULL DEFAULT 0,
    patient_share_toman NUMERIC(12, 2) NOT NULL DEFAULT 0,
    discount_toman NUMERIC(12, 2) NOT NULL DEFAULT 0,
    tax_toman NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_net_toman NUMERIC(12, 2) NOT NULL DEFAULT 0,
    instructions_fa TEXT,
    added_by_role VARCHAR(50) NOT NULL,
    added_by_name VARCHAR(150) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.patient_order_items(order_id);

-- 4. Order Modification Audit Log Table
CREATE TABLE IF NOT EXISTS public.order_modification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.patient_orders(id) ON DELETE CASCADE,
    modified_by_name VARCHAR(150) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    old_value_text TEXT,
    new_value_text TEXT,
    reason_fa TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_mod_logs_order ON public.order_modification_logs(order_id);
