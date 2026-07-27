# ADR 0004: Offline-First Foundation & Synchronization Queue

## Status
Accepted

## Context
Medical clinics frequently experience network glitches. VikiMedic v2 must remain fully functional during internet disruptions without data loss.

## Decision
Incorporate an offline transaction queue contract into `BaseRepository<T>`. All CRUD mutations are saved locally first and enqueued into an offline sync queue (`OfflineSyncQueueItem`) to sync automatically when connection restores.

## Consequences
- Uninterrupted clinic reception & doctor consultation during offline state.
- Zero data loss for patient prescriptions and invoices.
