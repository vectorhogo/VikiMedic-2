/**
 * VikiMedic v2 - Update & Release Management System Types
 * Phase 00.7 Architecture
 */

export type UpdateChannel = 'Stable' | 'Beta' | 'Developer';

export interface ChangelogInfo {
  newFeatures: string[];
  bugFixes: string[];
  securityImprovements: string[];
  knownIssues?: string[];
}

export interface VersionManifest {
  version: string;
  buildNumber: string;
  releaseDate: string;
  releaseDateIso?: string;
  isMandatory: boolean;
  minSupportedVersion: string;
  downloadUrl: string;
  webUrl?: string;
  releaseNotes: string;
  checksum: string;
  sizeMb?: string;
  channel: UpdateChannel;
  repository: string;
  changelog?: ChangelogInfo;
  signatureAvailable?: boolean;
  signatureVerified?: boolean;
}

export interface UpdateSettings {
  channel: UpdateChannel;
  repoOwner?: string; // GitHub Repository Owner (e.g. vectorhogo)
  repoName?: string;  // GitHub Repository Name (e.g. VikiMedic-2)
  autoCheckOnStartup: boolean; // ☑ Automatically check for updates (Default: true)
  autoDownload: boolean; // ☑ Automatically download updates (Default: false)
  backgroundDownload: boolean; // ☑ Download updates in background (Default: true)
  notifyAvailable: boolean; // ☑ Notify me when a new version is available (Default: true)
  notifySuccess: boolean; // ☑ Notify after successful update (Default: true)
  installAfterRestart: boolean; // ☑ Install update after application restart (Default: true)
  remindLater: boolean; // ☑ Remind me later (Default: true)
  lastCheckTime?: string;
  ignoredVersions: string[];
  reminderTimestamp?: number;
  reminderOption?: '30_MIN' | '2_HOURS' | 'TOMORROW' | 'NEXT_STARTUP' | 'CUSTOM';
  reminderCustomMinutes?: number;
}

export interface UpdateHistoryItem {
  id: string;
  version: string;
  buildNumber: string;
  channel: UpdateChannel;
  installedAt: string;
  status: 'SUCCESS' | 'FAILED' | 'ROLLED_BACK';
  notes?: string;
  platform: 'WINDOWS_DESKTOP' | 'VERCEL_WEB';
  rollbackAvailable?: boolean;
}

export type UpdateLogAction =
  | 'Check Started'
  | 'Check Finished'
  | 'Checked for Updates'
  | 'Download Started'
  | 'Download Completed'
  | 'Install Started'
  | 'Install Completed'
  | 'Installation Started'
  | 'Installation Completed'
  | 'Restart'
  | 'Notification Dismissed'
  | 'Version Ignored'
  | 'Reminder Scheduled';

export interface UpdateLogItem {
  id: string;
  timestamp: string;
  action: UpdateLogAction;
  details: string;
  user?: string;
}

export type UpdateStatus =
  | 'IDLE'
  | 'CHECKING'
  | 'UPDATE_AVAILABLE'
  | 'DOWNLOADING'
  | 'PAUSED'
  | 'VERIFYING'
  | 'READY_TO_INSTALL'
  | 'LATEST_VERSION'
  | 'OFFLINE'
  | 'FAILED'
  | 'MANDATORY_BLOCKED';

export interface UpdateProgress {
  stage: 'idle' | 'downloading' | 'paused' | 'verifying' | 'ready' | 'failed';
  percent: number;
  downloadedMb: number;
  totalMb: number;
  speedMbPerSec: number;
  remainingSeconds: number;
  errorMessage?: string;
}

