# VikiMedic v2 - Definition of Done (DoD) Checklist

A feature or module in VikiMedic v2 is officially considered **DONE** only when it satisfies all of the following criteria:

1. **Architecture Compliance**:
   - Clean Architecture layers respected (Presentation -> Application -> Domain -> Infrastructure).
   - No direct database/Supabase calls in UI components; all data operations pass through Repositories.

2. **Component Reuse & Registry**:
   - Registered in `UNIVERSAL_COMPONENT_REGISTRY`.
   - No duplicated UI controls created when an existing registry component exists.

3. **Design Token Usage**:
   - Consumes `DESIGN_TOKENS` (colors, typography, spacing, radius, shadows, animations).
   - No hardcoded hex color strings or random inline pixel values.

4. **RTL & Localization**:
   - Perfect RTL layout alignment.
   - Correct line height for Persian typography (IRANYekanX / Vazirmatn).
   - Persian numbers used for financial amounts and dates.

5. **Accessibility**:
   - Minimum touch target size 44px.
   - WCAG AA contrast ratio (4.5:1).
   - Keyboard navigable (Tab, Enter, Escape).

6. **Error Handling & Structured Logging**:
   - Technical exceptions wrapped by `ErrorHandlerService` with user-friendly Persian error messages.
   - Operations logged to `loggerService` with level, module, action, result, and context payload.

7. **Theme Compatibility**:
   - Verified across Medical White, Dark Theme, and Rose Luxe.
