/**
 * VikiMedic v2 - AI Command Mode Domain Types
 * Clean Architecture Layer: Domain
 * Enterprise Patch 01
 */

export type CommandExecutionStatus = 'SUCCESS' | 'REJECTED_BY_USER' | 'UNKNOWN_COMMAND' | 'FAILED' | 'PENDING_CONFIRMATION';

export interface CommandHistoryItem {
  id: string;
  commandText: string;
  parsedIntent: string;
  userFullName: string;
  userRole: string;
  time: string;
  status: CommandExecutionStatus;
  actionSummaryFa: string;
  requiresConfirmation: boolean;
}

export interface CommandDefinition {
  id: string;
  intentKey: string;
  keywordsFa: string[];
  keywordsEn: string[];
  descriptionFa: string;
  category: 'NAVIGATION' | 'SEARCH' | 'MODAL' | 'SYSTEM' | 'RESTRICTED';
  requiresConfirmation: boolean;
  confirmationMessageFa?: string;
  actionHandler: (params?: Record<string, any>) => void | Promise<void>;
}

export interface CommandModeSettings {
  enabled: boolean;
  allowedRoles: string[]; // e.g. ['ADMIN', 'SYS_ADMIN', 'DOCTOR', 'RECEPTIONIST']
  autoConfirmSafeCommands: boolean;
  voiceReady: boolean;
}
