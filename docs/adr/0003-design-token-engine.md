# ADR 0003: Centralized Design Token Engine

## Status
Accepted

## Context
Visual consistency must be preserved across all themes (Medical White, Dark Theme, Rose Luxe) and future modules without hardcoding hex values or inline font measurements in components.

## Decision
Create a centralized `DESIGN_TOKENS` engine defining:
- Color semantics (primary, secondary, accent, neutrals)
- Mathematical typography scale & IRANYekanX rules
- Spacing baseline grid (4px unit)
- Border Radii & Nested Corner rules (`Inner = Outer - Padding`)
- Standardized Shadows and Animations

## Consequences
- No hardcoded visual constants in UI code.
- Instant theme updates across the system.
- Guaranteed mathematical visual harmony.
