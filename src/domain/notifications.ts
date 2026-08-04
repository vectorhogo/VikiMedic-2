/**
 * VikiMedic v2 - Smart Notification Center Domain Types
 * Clean Architecture Layer: Domain
 */

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';

export type NotificationCategory =
  | 'SYSTEM'
  | 'SOFTWARE_UPDATE'
  | 'PATIENT_ALERT'
  | 'FINANCIAL'
  | 'SHIFT'
  | 'APPOINTMENT'
  | 'BACKUP'
  | 'SECURITY'
  | 'INFO'
  | 'RECEPTION'
  | 'MEDICAL';

export type NotificationStatus = 'UNREAD' | 'READ' | 'ARCHIVED';

export type NotificationRoleTarget = 'ALL' | 'RECEPTION' | 'DOCTOR' | 'ACCOUNTANT' | 'ADMIN';

export type ActionType =
  | 'NAVIGATE'
  | 'OPEN_PATIENT'
  | 'FINALIZE_INVOICE'
  | 'CREATE_BACKUP'
  | 'UPDATE_SOFTWARE'
  | 'OPEN_SETTINGS'
  | 'GO_TO_SHIFT'
  | 'CUSTOM';

export interface NotificationAction {
  label: string;
  actionType: ActionType;
  payload?: any;
}

export interface SmartNotification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  status: NotificationStatus;
  isPinned?: boolean;
  isToastShown?: boolean;
  createdAt: string; // Persian formatted date or ISO
  createdTimestamp: number; // UNIX epoch ms for sorting
  readAt?: string | null;
  resolvedAt?: string | null;
  resolvedBy?: string | null;
  actionTaken?: string | null;
  targetRole?: NotificationRoleTarget;
  actions?: NotificationAction[];
  snoozedUntil?: number | null; // epoch timestamp
  sourceModule?: string;
  dedupKey?: string; // key to prevent duplicate toasts
}

export interface NotificationSettings {
  soundEnabled: boolean;
  muted: boolean;
  volume: number; // 0 to 100
  quietHoursEnabled: boolean;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string; // "07:00"
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  soundEnabled: true,
  muted: false,
  volume: 70,
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00'
};
