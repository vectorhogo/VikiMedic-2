# VikiMedic v2 - Quality Assurance Foundation & Engineering Standards

## Executive Summary
This document defines the permanent Quality Assurance (QA) standards for VikiMedic v2. Every future feature, module, or release MUST satisfy 100% of these QA checkpoints prior to deployment. Quality, stability, and Persian user experience take precedence over implementation speed.

---

## 1. Pixel-Perfect & Visual Hierarchy Rules
- **Spacing Rhythms**: All layouts MUST strictly adhere to the 4px baseline grid (`DESIGN_TOKENS.spacing`).
- **Card Alignment**: Cards sitting in the same row MUST maintain equal heights and aligned padding.
- **Nested Border Radii**: Inner radii MUST satisfy `Inner Radius = Outer Radius - Padding`.
- **Contrast Ratios**: Body text MUST achieve at least WCAG AA 4.5:1 contrast against container backgrounds.
- **Zero Layout Glitches**: Controls MUST NOT wrap awkwardly or truncate Persian text labels.

---

## 2. RTL & Persian Localization Quality (Persian Quality Score)
- **100% RTL Directionality**: Layout flex/grid flows, icons, sidebar drawers, tables, and modal dialogs MUST be strictly Right-To-Left.
- **Localization**: All visible user interface text MUST be in Persian. English developer terms stay in code only.
- **Persian Numbers & Currency**: Financial amounts (Rials/Tomans), dates (Jalali 1403/05/15), file numbers, and phone numbers MUST format with Persian numerals or standard Jalali formats.
- **Typography**: Primary typeface is IRANYekanX / Vazirmatn with balanced line heights (1.5 - 1.7) for maximum legibility.

---

## 3. Desktop Native Quality (Windows Clinic Experience)
- **Keyboard Shortcuts**:
  - `Ctrl + K` or `Ctrl + Shift + P`: Global Command Palette & Patient Search.
  - `Ctrl + N`: New Patient Registration modal.
  - `F2` / Quick Action: Instant Appointment Booking.
  - `Escape`: Close active modal or overlay.
- **Desktop Window Scaling**: Tested and responsive across HD (1366x768), Full HD (1920x1080), 2K, 4K, Ultra Wide, and high-DPI displays.
- **Thermal Receipt & Laser Printing**: Dedicated print layouts for prescription slips and A4/A5 invoice receipts (`PrintInvoiceModal`, `PrintPrescriptionModal`) with clean `@media print` rules.

---

## 4. Stability Score & Release Gatekeeper Framework

Every feature module is evaluated against a 5-dimension Stability Score (0 - 100%):
1. **UI Stability (20%)**: Zero layout reflows, pixel-perfect RTL alignment, tri-theme visual fidelity.
2. **Database & Storage Stability (20%)**: Validated CRUD mutations, zero data corruption, offline cache fallback in `BaseRepository`.
3. **Performance Stability (20%)**: Fast initial paint, low memory footprint, memoized component renders.
4. **Security & Role Stability (20%)**: Role-based access control (RBAC) enforced via `hasPermission()`.
5. **Architecture & Code Quality (20%)**: Clean 4-layer isolation, zero direct DB calls from UI, `DESIGN_TOKENS` usage.

**Release Rule**: A module MUST score ≥ 95% total Stability Score to be merged or released.

---

## 5. Final QA Release Checklist
- [x] Architecture & Layer Isolation Verified
- [x] Tri-Theme Compatibility Tested (Medical White, Dark Theme, Rose Luxe)
- [x] RTL & Persian Typography Validated
- [x] Offline-First Local Cache Functionality Verified
- [x] Keyboard Shortcuts & Desktop Window Behavior Tested
- [x] Linter & TypeScript Compilation Passed (0 Errors)
