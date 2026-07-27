# VikiMedic v2 - Shared Infrastructure Architecture

## Executive Overview
This document defines the permanent Shared Infrastructure layer for VikiMedic v2. It provides a centralized, reusable foundation containing validation rules, a global event bus, a service container, print engine architecture, and file attachment infrastructure.

---

## 1. Central Validation Framework (`@shared/validation`)
Provides reusable Persian and medical validation functions:
- **Persian National ID (`validatePersianNationalId`)**: Enforces the 10-digit checksum formula used by Iran's National Organization for Civil Registration.
- **Persian Mobile Number (`validatePersianMobile`)**: Enforces `09xx-xxx-xxxx` format and valid mobile operator prefixes (MCI, Irancell, Rightel).
- **Jalali Date Validator (`validateJalaliDate`)**: Validates `YYYY/MM/DD` format against Jalali calendar limits (months 1-6 have 31 days, 7-11 have 30 days, 12 has 29/30 days).
- **Required Fields & Numeric Range**: Standard null/empty checks and numeric bounds verification.

---

## 2. Global Event Bus (`@shared/eventBus`)
Lightweight, internal publish-subscribe mechanism for decoupled cross-module communications:
- **Event Topics**:
  - `PATIENT_CREATED`: Triggered when a new patient record is committed.
  - `PATIENT_UPDATED`: Triggered upon patient profile modifications.
  - `APPOINTMENT_SCHEDULED`: Triggered on new queue entry.
  - `PAYMENT_COMPLETED`: Triggered upon cash/POS transaction settlement.
  - `THEME_CHANGED`: Broadcasts active theme transitions.
  - `SETTINGS_UPDATED`: Broadcasts clinic configuration shifts.
  - `SESSION_CHANGED`: Triggered on user login/logout or token refresh.

---

## 3. Central Service Container (`@shared/serviceContainer`)
Service Locator / Singleton Registry managing lifecycle for core infrastructure services:
- `SupabaseService`
- `LoggerService`
- `ConfigService`
- `ThemeService`
- `PrintService`
- `FileManagerService`
- `AuthService`

---

## 4. Print Infrastructure Architecture (`@shared/printEngine`)
Universal print framework supporting physical clinic hardware output:
- **Thermal Receipt Printer (80mm)**: Instant cash register vouchers, queue ticket slips.
- **A5 Prescription Slip Printer**: Patient prescription medications, diagnostic order forms.
- **A4 Official Invoice Printer**: Detailed financial statements, insurance claim forms.
- **Medical Certificate Printer**: Sick leave certificates and doctor referrals.

---

## 5. File & Attachment Management (`@shared/fileManager`)
Categorized file storage infrastructure for patient medical records:
- **Categories**: `MEDICAL_LAB_RESULTS`, `RADIOLOGY_DICOM_XRAY`, `ID_CARDS_INSURANCE`, `CONSENT_FORMS`, `PRESCRIPTION_SCANS`.
- **Validation**: Enforces maximum upload limits (e.g. 25MB for DICOM, 5MB for images), mime-type constraints, and calculates SHA256 checksum placeholders for data integrity.
