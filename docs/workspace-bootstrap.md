# VikiMedic v2 - Workspace Bootstrap & Infrastructure Foundation

## Overview
This document defines the permanent workspace architecture and bootstrap configuration for VikiMedic v2. It prepares a clean, scalable workspace designed for multi-platform deployment:
1. **Desktop (Windows / Tauri)**: Primary enterprise clinic target.
2. **Web (SPA / Cloud Run)**: Secondary web preview & web portal target.
3. **Android**: Future mobile extension target.

---

## 1. Workspace Directory Topology
```
/
├── apps/
│   ├── desktop/              # Tauri + React Desktop Shell (Windows Native)
│   └── web/                  # Vite + React Web SPA Shell
├── packages/
│   ├── ui/                   # Reusable Design System & UI Components
│   ├── shared/               # Cross-cutting Domain Entities & Business Rules
│   ├── types/                # Global TypeScript Interfaces & Enums
│   ├── utils/                # Date (Jalali), Currency (Rial/Toman), Helpers
│   └── services/             # API Clients, Repositories & Sync Services
├── config/                   # Central Application & Environment Configuration
├── assets/
│   ├── fonts/                # IRANYekanX, Vazirmatn
│   ├── icons/                # Lucide React & Medical SVG Registry
│   ├── themes/               # Medical White, Dark Eyesafe, Rose Luxe
│   └── templates/            # Thermal & A4 Print Templates
├── docs/                     # Architectural Decisions & Phase Specs
├── supabase/                 # Database Schemas & Migrations
└── scripts/                  # Build & CI/CD Pipelines
```

---

## 2. Environment Manager
Supported Environments:
- **Development**: Local development, mock sync services, hot reloads, debug logging.
- **Staging**: Pre-release verification, staging API endpoints, test clinic data.
- **Production**: High-availability production endpoints, encrypted local DB, strict audit logging.

Switching environments is managed centrally in `/src/config/appConfig.ts` without needing code modifications.

---

## 3. Central Configuration Layer
Centralized settings stored in `AppConfig`:
- **Application Name**: VikiMedic v2
- **Clinic Name**: کلینیک تخصصی و فوق‌تخصصی ویکی‌مدیک
- **Version**: 2.0.0
- **Environment**: Development / Staging / Production
- **Feature Flags**:
  - `enableOfflineSync`: True
  - `enableThermalPrinting`: True
  - `enableAiAssistant`: True
  - `enableBiometrics`: False
  - `enableMultiBranch`: True

---

## 4. Build Profiles
Switchable profiles configured in `/src/config/buildProfiles.ts`:
1. **Desktop Development**: Tauri dev mode, Vite HMR enabled, debug tools attached.
2. **Desktop Production**: Tauri release bundle (`.exe`/`.msi`), optimized CJS/ESM outputs, native SQLite database.
3. **Web Development**: Local Vite dev server (Port 3000).
4. **Web Production**: Bundled static asset distribution (`/dist`), service worker cache.

---

## 5. Design Token System
Defined in `/src/config/designTokensBootstrap.ts`:
- **4px Baseline Spacing**: `xs: 4px`, `sm: 8px`, `md: 16px`, `lg: 24px`, `xl: 32px`, `xxl: 48px`.
- **Typography Scale**: IRANYekanX primary typeface with low-contrast step ratio for dense UI.
- **Radii Rule**: `Inner Radius = Outer Radius - Padding`.
- **Tri-Theme Variables**: `--bg-canvas`, `--bg-card`, `--bg-surface`, `--text-main`, `--text-muted`, `--border-subtle`, `--accent-primary`.
