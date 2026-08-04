/**
 * VikiMedic v2 - Update & Release Management Panel
 * Clean Architecture Layer: Presentation (Settings Component)
 */

import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  DownloadCloud,
  ShieldCheck,
  Settings2,
  GitBranch,
  History,
  Info,
  Clock,
  HardDrive,
  Calendar,
  Layers,
  Lock,
  ExternalLink,
  Github,
  Radio,
  FileCode,
  RotateCcw,
  ListFilter,
  Activity,
  Bell,
  CheckSquare,
} from 'lucide-react';
import {
  UpdateChannel,
  UpdateSettings,
  VersionManifest,
  UpdateHistoryItem,
  UpdateLogItem,
} from '../../../domain/updateTypes';
import {
  UpdateService,
  GITHUB_REPOSITORY,
  CURRENT_BUILD_NUMBER,
  CURRENT_RELEASE_DATE,
} from '../../../infrastructure/updateService';
import { useAuth } from '../../../application/AuthContext';
import { useClinic } from '../../../application/ClinicContext';
import { UpdateDialogModal } from '../modals/UpdateDialogModal';
import { ReleaseNotesModal } from '../modals/ReleaseNotesModal';
import { APP_CONFIG } from '../../../config/appConfig';

export const UpdateCenterPanel: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useClinic();
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'CLINIC_ADMIN' || user?.role === 'SYSTEM_ADMIN';

  const [settings, setSettings] = useState<UpdateSettings>(() => UpdateService.getSettings());
  const [history, setHistory] = useState<UpdateHistoryItem[]>(() => UpdateService.getHistory());
  const [logs, setLogs] = useState<UpdateLogItem[]>(() => UpdateService.getLogs());
  const [currentVersion, setCurrentVersion] = useState<string>(() => UpdateService.getCurrentVersion());

  const [activeTab, setActiveTab] = useState<'SETTINGS' | 'HISTORY' | 'LOGS'>('SETTINGS');

  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<{
    status: string;
    message: string;
    manifest: VersionManifest | null;
  } | null>(null);

  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [activeManifest, setActiveManifest] = useState<VersionManifest | null>(null);

  const [isReleaseNotesOpen, setIsReleaseNotesOpen] = useState(false);
  const [notesModalData, setNotesModalData] = useState<{ version: string; notes: string } | null>(null);

  // Rollback state notice
  const [rollbackNotice, setRollbackNotice] = useState<string | null>(null);

  // Update Settings change handlers
  const handleChannelChange = (channel: UpdateChannel) => {
    if (!isAdmin) return;
    const updated = { ...settings, channel };
    setSettings(updated);
    UpdateService.saveSettings(updated);
    UpdateService.recordLog('Checked for Updates', `کانال دریافت به روزرسانی به ${channel} تغییر یافت.`);
    setLogs(UpdateService.getLogs());
  };

  const handleToggleSetting = (key: keyof UpdateSettings) => {
    if (!isAdmin) return;
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    UpdateService.saveSettings(updated);
    UpdateService.recordLog('Checked for Updates', `تنظیمات به‌روزرسانی (${key}) به ${!settings[key]} تغییر کرد.`);
    setLogs(UpdateService.getLogs());
  };

  // Perform Manual Check for Updates
  const handleCheckForUpdates = async () => {
    setIsChecking(true);
    setCheckResult(null);

    try {
      const res = await UpdateService.checkForUpdates(true);
      setIsChecking(false);
      setLogs(UpdateService.getLogs());
      setCheckResult({
        status: res.status,
        message: res.message,
        manifest: res.manifest,
      });

      if (res.status === 'UPDATE_AVAILABLE' || res.status === 'MANDATORY_BLOCKED') {
        setActiveManifest(res.manifest);
        setIsUpdateDialogOpen(true);
      }
    } catch (e: any) {
      setIsChecking(false);
      setCheckResult({
        status: 'OFFLINE',
        message: 'امکان بررسی به‌روزرسانی وجود ندارد. لطفا بعدا تلاش کنید.',
        manifest: null,
      });
    }
  };

  const handleUpdateSuccess = (manifest: VersionManifest) => {
    setCurrentVersion(manifest.version);
    setHistory(UpdateService.getHistory());
    setLogs(UpdateService.getLogs());
    setNotesModalData({ version: manifest.version, notes: manifest.releaseNotes });
    setIsReleaseNotesOpen(true);
  };

  const handleViewHistoryNotes = (item: UpdateHistoryItem) => {
    setNotesModalData({ version: item.version, notes: item.notes || 'تغییرات ثبت شده در این نسخه' });
    setIsReleaseNotesOpen(true);
  };

  const handlePrepareRollback = () => {
    if (!isAdmin) return;
    const res = UpdateService.prepareRollback();
    setLogs(UpdateService.getLogs());
    setRollbackNotice(res.message);
    if (res.success) {
      addNotification(res.message, 'info');
    } else {
      addNotification(res.message, 'warning');
    }
  };

  return (
    <div className="space-y-6 dir-rtl animate-fadeIn">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-sky-950/40 via-blue-900/20 to-[var(--bg-surface)] border border-sky-500/20 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0 shadow-inner">
            <RefreshCw className={`w-7 h-7 ${isChecking ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">مرکز به روزرسانی و انتشار نرم‌افزار</h2>
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-full">
                Phase 00.7
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
              مدیریت زیرساخت انتشار نسخه دسکتاپ (GitHub Releases) و نسخه وب (Vercel Deployments) • VikiMedic v2
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={GITHUB_REPOSITORY}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)] rounded-xl text-xs font-semibold flex items-center gap-2 transition"
          >
            <Github className="w-4 h-4 text-sky-400" />
            <span>مخزن ریپازیتوری</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={handleCheckForUpdates}
            disabled={isChecking}
            className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-sky-900/30 flex items-center gap-2 active:scale-95 disabled:opacity-50 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'در حال بررسی...' : 'بررسی به‌روزرسانی'}</span>
          </button>
        </div>
      </div>

      {/* Permissions Policy Notice for Non-Admins */}
      {!isAdmin && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center gap-2">
          <Lock className="w-4 h-4 shrink-0" />
          <span>بر اساس سیاست‌های سازمانی، پیکربندی و تغییر کانال‌های به‌روزرسانی محدود به مدیران سیستم می‌باشد.</span>
        </div>
      )}

      {/* Status Alert Bar if Check completed */}
      {checkResult && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs animate-fadeIn ${
            checkResult.status === 'LATEST_VERSION'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : checkResult.status === 'UPDATE_AVAILABLE' || checkResult.status === 'MANDATORY_BLOCKED'
              ? 'bg-sky-500/10 border-sky-500/30 text-sky-300'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            {checkResult.status === 'LATEST_VERSION' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {(checkResult.status === 'UPDATE_AVAILABLE' || checkResult.status === 'MANDATORY_BLOCKED') && (
              <DownloadCloud className="w-4 h-4 text-sky-400 shrink-0" />
            )}
            {checkResult.status === 'OFFLINE' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
            <span>{checkResult.message}</span>
          </div>

          {checkResult.status === 'UPDATE_AVAILABLE' && (
            <button
              onClick={() => {
                setActiveManifest(checkResult.manifest);
                setIsUpdateDialogOpen(true);
              }}
              className="px-3 py-1 bg-sky-600 text-white font-bold rounded-lg hover:bg-sky-500 transition"
            >
              مشاهده جزئیات به‌روزرسانی
            </button>
          )}
        </div>
      )}

      {/* Tab Selector */}
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('SETTINGS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'SETTINGS'
              ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
              : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]'
          }`}
        >
          <Settings2 className="w-4 h-4" />
          <span>تنظیمات و پیکربندی</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('HISTORY');
            setHistory(UpdateService.getHistory());
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'HISTORY'
              ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
              : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>تاریخچه به‌روزرسانی‌ها</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('LOGS');
            setLogs(UpdateService.getLogs());
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'LOGS'
              ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
              : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]'
          }`}
        >
          <Activity className="w-4 h-4 text-purple-400" />
          <span>لوگ فعالیت‌ها (Activity Log)</span>
        </button>
      </div>

      {/* TAB CONTENT 1: SETTINGS */}
      {activeTab === 'SETTINGS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          {/* Left 2 Columns: System & Channel Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current System Overview Table */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
                <Info className="w-4 h-4 text-sky-400" />
                <span>مشخصات نسخه و پلتفرم فعلی سیستم</span>
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-xl space-y-1">
                  <span className="text-[11px] text-[var(--text-tertiary)] flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-sky-400" />
                    <span>نسخه فعلی نصب شده</span>
                  </span>
                  <p className="font-mono font-bold text-sm text-[var(--text-primary)]">v{currentVersion}</p>
                </div>

                <div className="p-3 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-xl space-y-1">
                  <span className="text-[11px] text-[var(--text-tertiary)] flex items-center gap-1">
                    <FileCode className="w-3.5 h-3.5 text-amber-400" />
                    <span>شماره بیلد</span>
                  </span>
                  <p className="font-mono font-bold text-sm text-[var(--text-primary)]">#{CURRENT_BUILD_NUMBER}</p>
                </div>

                <div className="p-3 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-xl space-y-1">
                  <span className="text-[11px] text-[var(--text-tertiary)] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>تاریخ آخرین بیلد</span>
                  </span>
                  <p className="font-semibold text-xs text-[var(--text-primary)]">{CURRENT_RELEASE_DATE}</p>
                </div>

                <div className="p-3 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-xl space-y-1">
                  <span className="text-[11px] text-[var(--text-tertiary)] flex items-center gap-1">
                    <GitBranch className="w-3.5 h-3.5 text-purple-400" />
                    <span>کانال فعال انتشار</span>
                  </span>
                  <p className="font-bold text-xs text-sky-400">{settings.channel}</p>
                </div>

                <div className="p-3 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-xl space-y-1">
                  <span className="text-[11px] text-[var(--text-tertiary)] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>آخرین بررسی آنلاین</span>
                  </span>
                  <p className="font-semibold text-[11px] text-[var(--text-secondary)]">
                    {settings.lastCheckTime || 'هنوز انجام نشده'}
                  </p>
                </div>

                <div className="p-3 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-xl space-y-1">
                  <span className="text-[11px] text-[var(--text-tertiary)] flex items-center gap-1">
                    <HardDrive className="w-3.5 h-3.5 text-rose-400" />
                    <span>پلتفرم اجرایی</span>
                  </span>
                  <p className="font-bold text-xs text-[var(--text-primary)]">
                    {APP_CONFIG.targetPlatform === 'WINDOWS_DESKTOP' ? 'Windows Desktop (Tauri)' : 'Web App (Vercel)'}
                  </p>
                </div>
              </div>
            </div>

            {/* Update Channel Selection */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Radio className="w-4 h-4 text-sky-400" />
                  <span>کانال دریافت به‌روزرسانی (Update Channel)</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Stable Channel */}
                <button
                  type="button"
                  disabled={!isAdmin}
                  onClick={() => handleChannelChange('Stable')}
                  className={`p-4 rounded-xl border text-right transition flex flex-col justify-between ${
                    settings.channel === 'Stable'
                      ? 'bg-sky-500/10 border-sky-500 text-[var(--text-primary)] ring-1 ring-sky-500'
                      : 'bg-[var(--bg-base)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-sky-500/40'
                  } ${!isAdmin ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-sky-400">Stable (پایدار)</span>
                    {settings.channel === 'Stable' && <CheckCircle2 className="w-4 h-4 text-sky-400" />}
                  </div>
                  <p className="text-[11px] text-[var(--text-tertiary)] leading-relaxed">
                    نسخه‌های نهایی آزموده شده و رسمی. پیشنهاد شده برای تمام کلینیک‌ها و مراکز درمانی.
                  </p>
                </button>

                {/* Beta Channel */}
                <button
                  type="button"
                  disabled={!isAdmin}
                  onClick={() => handleChannelChange('Beta')}
                  className={`p-4 rounded-xl border text-right transition flex flex-col justify-between ${
                    settings.channel === 'Beta'
                      ? 'bg-amber-500/10 border-amber-500 text-[var(--text-primary)] ring-1 ring-amber-500'
                      : 'bg-[var(--bg-base)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-amber-500/40'
                  } ${!isAdmin ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-amber-400">Beta (آزمایشی)</span>
                    {settings.channel === 'Beta' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                  </div>
                  <p className="text-[11px] text-[var(--text-tertiary)] leading-relaxed">
                    دسترسی زودهنگام به قابلیتهای جدید پیش از انتشار عمومی. ممکن است همراه با باگ‌های جزئی باشد.
                  </p>
                </button>

                {/* Developer Channel */}
                <button
                  type="button"
                  disabled={!isAdmin}
                  onClick={() => handleChannelChange('Developer')}
                  className={`p-4 rounded-xl border text-right transition flex flex-col justify-between ${
                    settings.channel === 'Developer'
                      ? 'bg-purple-500/10 border-purple-500 text-[var(--text-primary)] ring-1 ring-purple-500'
                      : 'bg-[var(--bg-base)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-purple-500/40'
                  } ${!isAdmin ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-purple-400">Developer (توسعه)</span>
                    {settings.channel === 'Developer' && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
                  </div>
                  <p className="text-[11px] text-[var(--text-tertiary)] leading-relaxed">
                    بیلدهای روزانه مخصوص تیم توسعه و تست ارزیابی عملکردی.
                  </p>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Update Settings Toggles */}
          <div className="space-y-6">
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
                <Settings2 className="w-4 h-4 text-sky-400" />
                <span>تنظیمات دقیق به‌روزرسانی (Update Settings)</span>
              </h3>

              {/* GitHub Repository Provider Inputs */}
              <div className="p-4 bg-[var(--bg-base)] border border-sky-500/20 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
                  <Github className="w-4 h-4 text-sky-400" />
                  <span>پیکربندی مخزن GitHub Releases</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[11px] text-[var(--text-tertiary)] block">مالک مخزن (Owner)</label>
                    <input
                      type="text"
                      disabled={!isAdmin}
                      value={settings.repoOwner || 'vectorhogo'}
                      onChange={(e) => {
                        const updated = { ...settings, repoOwner: e.target.value };
                        setSettings(updated);
                        UpdateService.saveSettings(updated);
                      }}
                      className="w-full px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-sky-500 disabled:opacity-60"
                      placeholder="e.g. vectorhogo"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-[var(--text-tertiary)] block">نام مخزن (Repo)</label>
                    <input
                      type="text"
                      disabled={!isAdmin}
                      value={settings.repoName || 'VikiMedic-2'}
                      onChange={(e) => {
                        const updated = { ...settings, repoName: e.target.value };
                        setSettings(updated);
                        UpdateService.saveSettings(updated);
                      }}
                      className="w-full px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-sky-500 disabled:opacity-60"
                      placeholder="e.g. VikiMedic-2"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3.5">
                {/* 1. Check on startup */}
                <label className="flex items-center justify-between p-3 bg-[var(--bg-base)] rounded-xl border border-[var(--border-subtle)] cursor-pointer hover:border-sky-500/30 transition">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-[var(--text-primary)] block">☑ بررسی خودکار به‌روزرسانی‌ها</span>
                    <span className="text-[10px] text-[var(--text-tertiary)] block">
                      Automatically check for updates on startup
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    disabled={!isAdmin}
                    checked={settings.autoCheckOnStartup}
                    onChange={() => handleToggleSetting('autoCheckOnStartup')}
                    className="w-4 h-4 text-sky-600 rounded border-[var(--border-subtle)] focus:ring-sky-500 cursor-pointer disabled:cursor-not-allowed"
                  />
                </label>

                {/* 2. Automatic download */}
                <label className="flex items-center justify-between p-3 bg-[var(--bg-base)] rounded-xl border border-[var(--border-subtle)] cursor-pointer hover:border-sky-500/30 transition">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-[var(--text-primary)] block">☑ دانلود خودکار به‌روزرسانی‌ها</span>
                    <span className="text-[10px] text-[var(--text-tertiary)] block">
                      Automatically download updates when available
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    disabled={!isAdmin}
                    checked={settings.autoDownload}
                    onChange={() => handleToggleSetting('autoDownload')}
                    className="w-4 h-4 text-sky-600 rounded border-[var(--border-subtle)] focus:ring-sky-500 cursor-pointer disabled:cursor-not-allowed"
                  />
                </label>

                {/* 3. Background download */}
                <label className="flex items-center justify-between p-3 bg-[var(--bg-base)] rounded-xl border border-[var(--border-subtle)] cursor-pointer hover:border-sky-500/30 transition">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-[var(--text-primary)] block">☑ دانلود در پس‌زمینه</span>
                    <span className="text-[10px] text-[var(--text-tertiary)] block">
                      Download updates in background silently
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    disabled={!isAdmin}
                    checked={settings.backgroundDownload}
                    onChange={() => handleToggleSetting('backgroundDownload')}
                    className="w-4 h-4 text-sky-600 rounded border-[var(--border-subtle)] focus:ring-sky-500 cursor-pointer disabled:cursor-not-allowed"
                  />
                </label>

                {/* 4. Notify when available */}
                <label className="flex items-center justify-between p-3 bg-[var(--bg-base)] rounded-xl border border-[var(--border-subtle)] cursor-pointer hover:border-sky-500/30 transition">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-[var(--text-primary)] block">☑ اعلان هنگام ارائه نسخه جدید</span>
                    <span className="text-[10px] text-[var(--text-tertiary)] block">
                      Notify me when a new version is available
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    disabled={!isAdmin}
                    checked={settings.notifyAvailable}
                    onChange={() => handleToggleSetting('notifyAvailable')}
                    className="w-4 h-4 text-sky-600 rounded border-[var(--border-subtle)] focus:ring-sky-500 cursor-pointer disabled:cursor-not-allowed"
                  />
                </label>

                {/* 5. Notify after successful update */}
                <label className="flex items-center justify-between p-3 bg-[var(--bg-base)] rounded-xl border border-[var(--border-subtle)] cursor-pointer hover:border-sky-500/30 transition">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-[var(--text-primary)] block">☑ اعلان پس از ارتقای موفق</span>
                    <span className="text-[10px] text-[var(--text-tertiary)] block">
                      Notify after successful update
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    disabled={!isAdmin}
                    checked={settings.notifySuccess}
                    onChange={() => handleToggleSetting('notifySuccess')}
                    className="w-4 h-4 text-sky-600 rounded border-[var(--border-subtle)] focus:ring-sky-500 cursor-pointer disabled:cursor-not-allowed"
                  />
                </label>

                {/* 6. Install after restart */}
                <label className="flex items-center justify-between p-3 bg-[var(--bg-base)] rounded-xl border border-[var(--border-subtle)] cursor-pointer hover:border-sky-500/30 transition">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-[var(--text-primary)] block">☑ نصب خودکار پس از راه‌اندازی مجدد</span>
                    <span className="text-[10px] text-[var(--text-tertiary)] block">
                      Install update after application restart
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    disabled={!isAdmin}
                    checked={settings.installAfterRestart}
                    onChange={() => handleToggleSetting('installAfterRestart')}
                    className="w-4 h-4 text-sky-600 rounded border-[var(--border-subtle)] focus:ring-sky-500 cursor-pointer disabled:cursor-not-allowed"
                  />
                </label>

                {/* 7. Remind later */}
                <label className="flex items-center justify-between p-3 bg-[var(--bg-base)] rounded-xl border border-[var(--border-subtle)] cursor-pointer hover:border-sky-500/30 transition">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-[var(--text-primary)] block">☑ فعال‌سازی یادآوری بعدی</span>
                    <span className="text-[10px] text-[var(--text-tertiary)] block">
                      Remind me later
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    disabled={!isAdmin}
                    checked={settings.remindLater}
                    onChange={() => handleToggleSetting('remindLater')}
                    className="w-4 h-4 text-sky-600 rounded border-[var(--border-subtle)] focus:ring-sky-500 cursor-pointer disabled:cursor-not-allowed"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: HISTORY */}
      {activeTab === 'HISTORY' && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <History className="w-4 h-4 text-sky-400" />
              <span>تاریخچه به‌روزرسانی‌های نصب شده (Update History)</span>
            </h3>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!isAdmin || !UpdateService.canRollback()}
                onClick={handlePrepareRollback}
                className="px-3 py-1.5 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>آماده‌سازی بازگشت به نسخه قبلی (Prepare Rollback)</span>
              </button>

              <span className="text-xs text-[var(--text-tertiary)] font-mono">{history.length} نسخه ثبت شده</span>
            </div>
          </div>

          {rollbackNotice && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 shrink-0" />
              <span>{rollbackNotice}</span>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[var(--text-tertiary)]">
                  <th className="py-2.5 px-3">نسخه</th>
                  <th className="py-2.5 px-3">شماره بیلد</th>
                  <th className="py-2.5 px-3">کانال</th>
                  <th className="py-2.5 px-3">تاریخ و زمان نصب</th>
                  <th className="py-2.5 px-3">پلتفرم</th>
                  <th className="py-2.5 px-3">وضعیت</th>
                  <th className="py-2.5 px-3">قابلیت بازگشت</th>
                  <th className="py-2.5 px-3 text-center">جزئیات تغییرات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {history.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-[var(--bg-surface-hover)] transition">
                    <td className="py-3 px-3 font-mono font-bold text-sky-400">
                      v{item.version}
                      {idx === 0 && (
                        <span className="mr-2 px-1.5 py-0.5 text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded">
                          فعلی
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-[var(--text-secondary)]">#{item.buildNumber}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        {item.channel}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[var(--text-secondary)]">{item.installedAt}</td>
                    <td className="py-3 px-3 text-[var(--text-tertiary)]">
                      {item.platform === 'WINDOWS_DESKTOP' ? 'Desktop' : 'Web'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-fit">
                        <ShieldCheck className="w-3 h-3" />
                        <span>موفق</span>
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {idx > 0 ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1 w-fit">
                          <RotateCcw className="w-3 h-3" />
                          <span>آماده Rollback</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-[var(--text-tertiary)]">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleViewHistoryNotes(item)}
                        className="px-2.5 py-1 text-sky-400 hover:bg-sky-500/10 border border-sky-500/20 rounded-lg text-[11px] font-medium transition"
                      >
                        مشاهده Release Notes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: LOGS */}
      {activeTab === 'LOGS' && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <span>لوگ فعالیت‌ها و وقایع سیستم به‌روزرسانی (Activity Logs)</span>
            </h3>
            <span className="text-xs text-[var(--text-tertiary)] font-mono">{logs.length} رویداد ثبت شده</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[var(--text-tertiary)]">
                  <th className="py-2.5 px-3">زمان و تاریخ</th>
                  <th className="py-2.5 px-3">نوع عملیات (Action)</th>
                  <th className="py-2.5 px-3">توضیحات تکمیلی</th>
                  <th className="py-2.5 px-3">کاربر ثبت‌کننده</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-[var(--text-tertiary)]">
                      هنوز هیچ رویدادی ثبت نشده است.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-[var(--bg-surface-hover)] transition">
                      <td className="py-2.5 px-3 font-mono text-[var(--text-secondary)]">{log.timestamp}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[var(--text-primary)]">{log.details}</td>
                      <td className="py-2.5 px-3 text-[var(--text-tertiary)]">{log.user || 'سیستم'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <UpdateDialogModal
        isOpen={isUpdateDialogOpen}
        onClose={() => setIsUpdateDialogOpen(false)}
        manifest={activeManifest}
        onUpdateSuccess={handleUpdateSuccess}
      />

      <ReleaseNotesModal
        isOpen={isReleaseNotesOpen}
        onClose={() => setIsReleaseNotesOpen(false)}
        manifest={null}
        customVersion={notesModalData?.version}
        customNotes={notesModalData?.notes}
      />
    </div>
  );
};
