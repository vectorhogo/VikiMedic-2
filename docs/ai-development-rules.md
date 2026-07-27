# AI Development Rules & Engineering Standards

## Core Principle
AI is solely a development assistant and code generator during build-time. **AI MUST NEVER CREATE RUNTIME DEPENDENCIES OR CLOUD AI REQUIREMENTS FOR CORE APP FUNCTIONS.**

VikiMedic v2 MUST operate 100% offline with full speed, zero latency, and zero internet connection for:
- Reception & Queue Management
- Patient File Records & EMR
- Doctor Consultations & Prescriptions
- Payments, Invoices & Receipt Printing
- Financial Reports & Pharmacy Inventory
- Clinic & Staff Role Settings

---

## 1. AI Development Workflow & Impact Analysis

Before implementing any code change, the AI developer agent follows an 8-step execution loop:

1. **Analyze**: Understand user intent and scope boundaries.
2. **Review Architecture**: Check Clean Architecture layer isolation (Presentation -> Application -> Domain -> Infrastructure).
3. **Check Dependencies**: Verify if an existing component, helper, or repository can be reused.
4. **Evaluate Impact**: Assess UI, database, performance, and security risks.
5. **Implement**: Code surgical, highly modular TypeScript/React changes.
6. **Self-Review**: Verify RTL support, Persian localization, and theme compatibility.
7. **QA Verification**: Run build and linter checks (`compile_applet`, `lint_applet`).
8. **Document**: Update changelogs, ADRs, or component registry metadata.

---

## 2. Refactoring Guards & Protection Rules

### Design System Protection Guard
The AI agent is STRICTLY FORBIDDEN from altering:
- CSS variables / Design Token values
- Typography scales or font families (IRANYekanX / Vazirmatn)
- Core spacing units or border radii
- Default theme color tokens (Medical White, Dark Theme, Rose Luxe)
unless explicitly instructed by the user.

### Database & Schema Protection Guard
The AI agent is STRICTLY FORBIDDEN from:
- Dropping or deleting database tables
- Renaming existing schema columns destructively
- Breaking backward compatibility of stored entities
without explicit developer approval.

### Module Protection Guard
- No duplicate modules, duplicate components, or duplicate business logic.
- Always search `UNIVERSAL_COMPONENT_REGISTRY` and existing repositories before writing new code.

---

## 3. Definition of Done (DoD) for AI Code Generation

An AI-generated code change is complete ONLY IF:
1. Clean Architecture layer boundaries are strictly maintained.
2. All UI controls consume `DESIGN_TOKENS`.
3. Persian RTL layout and IRANYekanX typography render without text overflow or truncation.
4. Offline-first local cache fallback operates seamlessly without network errors.
5. Zero runtime AI SDK calls are introduced into core medical operations.
6. Linter and TypeScript compiler pass with 0 errors.
