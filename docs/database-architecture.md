# VikiMedic v2 - Database Principles & Core Entities Architecture

## Executive Overview
This document specifies the permanent PostgreSQL / Supabase database architecture for VikiMedic v2. It is designed to be 3NF normalized, multi-clinic ready (`clinic_id`), audit-traceable, and compatible with Windows Desktop, Web, and Android without requiring future structural redesigns.

---

## 1. Primary Engine & Standards
- **Engine**: PostgreSQL 15+ (Hosted on Supabase)
- **Character Encoding**: UTF-8 (Full Persian & Arabic glyph support)
- **Timezone**: UTC (`TIMESTAMPTZ` for all date-time columns)
- **Primary Keys**: UUID v4 (`gen_random_uuid()`) on 100% of tables
- **Multi-Tenant / Multi-Clinic**: `clinic_id` foreign key on all business entities

---

## 2. Mandatory Audit & Soft-Delete Columns
Every single table in VikiMedic v2 must contain these 6 audit columns:

```sql
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
deleted_at TIMESTAMPTZ NULL, -- Soft Delete (NULL = Active, Timestamp = Soft Deleted)
created_by UUID NULL REFERENCES users(id),
updated_by UUID NULL REFERENCES users(id),
deleted_by UUID NULL REFERENCES users(id)
```

**Rule**: Business records are NEVER hard deleted with `DELETE FROM table`. Instead, soft delete is performed via `UPDATE table SET deleted_at = NOW(), deleted_by = current_user_id WHERE id = target_id`.

---

## 3. Core Entities Catalog (42 Tables & Materialized Aggregates)

### System & Multi-Clinic
1. `clinics`: Clinic master registry (Name, Code, Phone, Address, Working Hours, Status).
2. `users`: User authentication & profile registry.
3. `roles`: Role definitions (Doctor, Receptionist, Accountant, Clinic Admin).
4. `permissions`: Granular permission flags.
5. `user_roles`: Many-to-many junction table binding users to roles.
6. `activity_logs`: Immutable audit trail for create, update, delete, restore, and login events.
7. `settings`: Central clinic, print, theme, and system settings with versioning support.
8. `notifications`: System & user alert notifications.

### Clinical & Patient Domain
9. `patients`: Patient master record (National ID, First/Last Name, Insurance Type, Blood Group, Medical Alerts, Emergency Contact).
10. `doctors`: Medical staff profile (Medical Council No, Specialty, Consultation Fee).
11. `employees`: Clinic staff registry (Staff Code, Department, Role).
12. `rooms`: Consultation rooms, surgery suites, and clinic departments.
13. `shifts`: Doctor and staff roster schedules.

### Workflow & Financial Domain
14. `receptions`: Patient reception & intake visits (Reception No, Queue No, Patient ID, Doctor ID, Insurance ID, Status).
15. `appointments`: Reservation schedule & booking slots.
16. `insurances`: Insurance providers (Social Security, Health Insurance, Armed Forces, Private/Export).
17. `services`: Medical service catalog (Service Code, Service Name, Base Price, Category, Duration).
18. `pricings`: Versioned price lists for medical services and insurance coverage tariffs (Effective Date, Expiration Date, Private/Insurance Prices).
19. `invoices`: Reception financial invoices (Invoice No, Total Amount, Discount, Net Amount, Status).
20. `invoice_items`: Granular invoice line items (Quantity, Unit Price, Taxes, Discounts, Insurance Share, Patient Share).
21. `payments`: Cash, POS, and online payment transactions (Cash, Card, Transfer, Insurance, Mixed Payment).
22. `receipts`: Printable smart receipts (Receipt No, Payment Method, Timestamp, Cashier).
23. `financial_ledgers`: Single source of truth for financial reports (Debit/Credit, Account Category, Amount, Date).
24. `cashboxes`: Cash drawer sessions (Opening Balance, Closing Balance, Actual Cash, Discrepancy).
25. `refunds`: Full & partial refunds with reason and supervisor approval.
26. `medical_records`: Patient EMR clinical notes, diagnoses, ICD-10 codes, and vitals.
27. `prescriptions`: Electronic prescription items, medications, and dosage instructions.

### Operational & Security Domain
28. `staff_attendances`: Clock-in/out roster attendances (Doctors, Receptionists, Employees).
29. `room_assignments`: Doctor, Receptionist, Room, and Time-Slot allocation.
30. `role_permissions`: Permission Matrix binding roles to independent permission items.
31. `user_permissions`: Direct user permission overrides (Grant/Revoke without changing roles).
32. `backups_metadata`: Automatic and manual backup metadata, file size, checksum, and restore logs.

### Reporting, Analytics & System Optimization Domain
33. `daily_clinic_stats`: Pre-aggregated daily clinic statistics for rapid dashboard rendering.
34. `doctor_workload_stats`: Doctor performance, appointment capacity, and revenue generation stats.
35. `service_analytics`: Utilization rates and tariff revenue breakdown per medical service.
36. `archived_receptions`: Long-term historical reception storage for records older than retention threshold.
37. `archived_invoices`: Long-term financial invoice archive maintaining full JSON payloads.
38. `data_retention_policies`: Configurable entity purge and archival policies (Days, Auto-archive, Auto-purge).
39. `export_jobs_queue`: Asynchronous job queue for background PDF, Excel, and CSV report generation.
40. `database_performance_metrics`: Storage size, memory, connection pool, and error rate monitoring snapshots.
41. `slow_query_logs`: Automated logging of queries exceeding 500ms execution thresholds.
42. `backup_verification_logs`: Checksum validation, integrity verification, and test-restore logs.

---

## 4. Global Search, Trigram Indexes & Archive Strategy
- **Fuzzy Search Strategy**: PostgreSQL `pg_trgm` GIN indexes on `(first_name || ' ' || last_name)`, `national_id`, `reception_number`, and `invoice_number` ensure instant sub-10ms fuzzy searching across millions of records.
- **Archival Partitioning**: Old receptions and invoices are migrated to `archived_receptions` and `archived_invoices` after the retention period defined in `data_retention_policies`. Primary operational queries remain lightning fast while historical data remains fully searchable when needed.
- **Async Export Pipeline**: PDF, Excel, and CSV generation runs through `export_jobs_queue` to protect API endpoints from blocking under heavy load.
- **System Health & Query Optimization**: `database_performance_metrics` and `slow_query_logs` give administrators full visibility into database growth and query latency.


---

## 5. Security & Immutable Audit Principles
1. **Financial Ledger Single Source of Truth**: All payments, invoices, discounts, and refunds trigger an entry in `financial_ledgers`. Financial reports query this ledger exclusively.
2. **Permission Matrix Flexibility**: Users can be assigned roles, but direct permissions (`user_permissions`) can grant or revoke specific actions (e.g. `Refund Payments`, `Manage Users`) without inventing new roles.
3. **Immutable Audit Trail**: `activity_logs` and `financial_ledgers` are append-only. Financial and security audit records are NEVER modified or updated.
4. **Row Level Security (RLS)**: All tables enforce Row Level Security (`ALTER TABLE x ENABLE ROW LEVEL SECURITY;`). Multi-clinic isolation is guaranteed by matching `clinic_id = current_setting('app.current_clinic_id')::uuid`.
