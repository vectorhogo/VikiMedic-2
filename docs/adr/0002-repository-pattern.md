# ADR 0002: Repository Pattern & Service Abstraction

## Status
Accepted

## Context
Data access logic (CRUD, local caching, query filtering, and offline queuing) must be centralized to prevent direct data queries inside UI handlers.

## Decision
Implement the Repository Pattern via `IRepository<T>` and `BaseRepository<T>`:
- `PatientRepository`
- `AppointmentRepository`
- `FinancialRepository`
- `PharmacyRepository`

## Consequences
- Single point of access for domain entities.
- Transparent offline cache fallback.
- Standardized validation hooks prior to persistence.
