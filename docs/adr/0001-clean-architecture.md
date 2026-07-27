# ADR 0001: Clean Architecture Layering Strategy

## Status
Accepted

## Context
VikiMedic v2 requires an enterprise-grade, maintainable architecture for long-term scalability across multi-clinic Persian medical management systems. Business logic must be protected from tight coupling to UI components or specific database drivers.

## Decision
Adopt Clean Architecture with strict 4-layer boundaries:
1. **Presentation Layer**: React UI, Components, Pages, Theme Contexts, Command Palette.
2. **Application Layer**: Use Cases, ClinicContext state managers, Application Orchestrators.
3. **Domain Layer**: Core Business Entities, Interfaces, Role Rules, Permissions, Design Tokens.
4. **Infrastructure Layer**: Storage, Repositories, Supabase Client, Structured Logger, Error Handler.

## Rules
- Business logic MUST NOT reside directly inside JSX UI components.
- UI MUST NOT call database or Supabase directly; calls must pass through Repositories/Services.
- Dependencies flow inward towards the Domain layer.

## Consequences
- Clean separation of concerns.
- Independent testability of core business logic.
- Seamless future backend transitions.
