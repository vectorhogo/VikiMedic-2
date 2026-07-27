# ADR 0005: Universal Component Registry

## Status
Accepted

## Context
Prevent component duplication across developer teams and ensure every UI control adheres to accessibility, Persian RTL layout, and theme compliance.

## Decision
Maintain `UNIVERSAL_COMPONENT_REGISTRY` in `src/domain/componentRegistry.ts` registering name, category, purpose, props, usage rules, accessibility rules, and supported themes.

## Consequences
- Single inventory of all reusable controls.
- Eliminates duplicate component creation.
- Enforces accessibility and theme compatibility standards.
