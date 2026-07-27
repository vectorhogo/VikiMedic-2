# VikiMedic v2 - Development Environment & Engineering Guidelines

## Executive Overview
This document specifies the permanent Development Environment configuration, coding standards, error handling policies, logging strategies, asset pipelines, and pre-build validation rules for VikiMedic v2.

---

## 1. Core Technology Stack
- **Frontend Core**: React 18+ with TypeScript in `strict` mode.
- **Build Tooling & Dev Server**: Vite with Fast Refresh & Hot Module Replacement (HMR).
- **Desktop Runtime**: Tauri (Windows Win32 Executable & MSI Bundler).
- **Backend & Persistence**: Supabase (PostgreSQL with `pgvector` & Row Level Security).
- **Styling Pipeline**: Tailwind CSS v3/v4 with PostCSS & central CSS variables.
- **Iconography & Typography**: Lucide React + IRANYekanX (Primary Persian Variable) & Vazirmatn.

---

## 2. Project Path Aliases (`tsconfig.json`)
To maintain clean architecture and prevent deep relative path mess (e.g., `../../../components`), the following central aliases are registered:

| Alias | Target Path | Purpose |
| :--- | :--- | :--- |
| `@/*` | `./*` | Root workspace reference |
| `@components/*` | `./src/presentation/components/*` | Reusable React UI components |
| `@modules/*` | `./src/presentation/modules/*` | Functional application modules |
| `@services/*` | `./src/infrastructure/services/*` | Infrastructure & API repositories |
| `@shared/*` | `./src/packages/shared/*` | Shared domain logic & entities |
| `@types/*` | `./src/packages/types/*` | TypeScript interfaces & type definitions |
| `@utils/*` | `./src/packages/utils/*` | Helper functions (Jalali dates, Rial currency) |
| `@config/*` | `./src/config/*` | Central app config & build profiles |
| `@assets/*` | `./src/assets/*` | Static images, logos, fonts, templates |

---

## 3. Strict Code Style & TypeScript Rules
1. **Strict Type Safety**: `noImplicitAny`, `strictNullChecks`, `noUnusedLocals`, `noUnusedParameters` enforced.
2. **Import Cleanliness**: Named imports only, top-level placement, zero circular dependencies.
3. **No Secret Leaks**: All credentials accessed strictly via `import.meta.env` or `process.env`. Zero hardcoded API keys.
4. **Format & Lint Standard**: Prettier formatting with 2-space indents and ESLint typescript-eslint rules.

---

## 4. Error Reporting & Logging Policy
Logging levels are configured via `VITE_LOG_LEVEL` or central `AppConfig`:

- **Development Mode**:
  - `DEBUG` / `VERBOSE`: Outputs full component lifecycle events, SQL query traces, and HMR re-renders.
  - Raw error stack traces rendered in dev error boundaries.
- **Production Mode**:
  - `WARN`, `ERROR`, `CRITICAL` only.
  - Stack traces stripped; user receives friendly Persian messages (e.g. *"خطا در برقراری ارتباط با سرور درمانگاه. لطفا اتصال شبکه را بررسی کنید."*).

---

## 5. Font & Theme Pipeline
- **Registered Fonts**:
  1. `IRANYekanX`: Primary variable font for all Persian UI text and medical records.
  2. `IRANSansX`: Secondary Persian font for financial reports and invoices.
  3. `Noto Sans Arabic`: Fallback typeface for special medical characters.
- **Tri-Theme Central Manager**:
  1. **Medical White**: High-contrast daylight theme for clinic reception and consultation rooms.
  2. **Dark Eyesafe**: Low-luminance theme for night shifts and radiologist darkrooms.
  3. **Rose Luxe**: Premium luxury theme designed for dermatology & aesthetics clinics.

---

## 6. Pre-Build Validation Pipeline
Before any production build is generated, the pipeline automatically executes:
1. `tsc --noEmit`: Full TypeScript type check.
2. `npm run lint`: Linting rules verification.
3. **Missing Env Validation**: Ensures Supabase URL, anon key, and app mode exist.
4. **Asset Integrity Check**: Verifies presence of core fonts, brand logos, and print templates.

---

## 7. Future Extensibility Safeguards
The environment architecture supports future additions without requiring project restructuring:
- **Android / PWA Support**: Mobile responsive viewport and PWA manifest configurations ready.
- **Enterprise Multi-Branch**: Supabase multi-tenant schema isolation architecture.
- **Plugin System**: Modular `AppModule` dynamic routing system.
