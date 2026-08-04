/**
 * VikiMedic v2 - Update Available & Download Dialog Modal
 * Clean Architecture Layer: Presentation
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  DownloadCloud,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  FileCode,
  HardDrive,
  Calendar,
  Layers,
  Pause,
  Play,
  X,
  Lock,
  Clock,
  Sparkles,
  Bug,
  ShieldAlert,
} from 'lucide-react';
import { VersionManifest, UpdateProgress } from '../../../domain/updateTypes';
import { UpdateService } from '../../../infrastructure/updateService';
import { APP_CONFIG } from '../../../config/appConfig';
import { RemindLaterModal } from './RemindLaterModal';

interface UpdateDialogModalProps {
  isOpen: boolean;
  onClose: () => void;
  manifest: VersionManifest | null;
  onUpdateSuccess: (manifest: VersionManifest) => void;
  onIgnoreVersion?: (version: string) => void;
  onViewChangelog?: () => void;
}

export const UpdateDialogModal: React.FC<UpdateDialogModalProps> = ({
  isOpen,
  onClose,
  manifest,
  onUpdateSuccess,
  onIgnoreVersion,
  onViewChangelog,
}) => {
  const [downloadState, setDownloadState] = useState<
    'IDLE' | 'DOWNLOADING' | 'PAUSED' | 'VERIFYING' | 'READY' | 'FAILED'
  >('IDLE');

  const [progress, setProgress] = useState<UpdateProgress>({
    stage: 'idle',
    percent: 0,
    downloadedMb: 0,
    totalMb: 48.5,
    speedMbPerSec: 4.8,
    remainingSeconds: 10,
  });

  const [isRemindLaterOpen, setIsRemindLaterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CHANGELOG'>('OVERVIEW');

  const timerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!isOpen || !manifest) return null;

  const currentVersion = UpdateService.getCurrentVersion();
  const isMandatory = manifest.isMandatory;
  const totalSize = parseFloat(manifest.sizeMb?.replace(/[^0-9.]/g, '') || '48.5');

  // Start Download Simulation
  const startDownload = () => {
    setDownloadState('DOWNLOADING');
    UpdateService.recordLog('Download Started', `دانلود نسخه ${manifest.version} آغاز گردید.`);

    let currentPercent = progress.percent || 5;

    timerRef.current = setInterval(() => {
      currentPercent += Math.floor(Math.random() * 12) + 8;

      if (currentPercent < 85) {
        const currentMb = parseFloat(((currentPercent / 100) * totalSize).toFixed(1));
        const remSec = Math.max(1, Math.ceil(((100 - currentPercent) / 100) * 10));

        setProgress({
          stage: 'downloading',
          percent: currentPercent,
          downloadedMb: currentMb,
          totalMb: totalSize,
          speedMbPerSec: parseFloat((4.2 + Math.random() * 1.5).toFixed(1)),
          remainingSeconds: remSec,
        });
      } else if (currentPercent >= 85 && currentPercent < 100) {
        setDownloadState('VERIFYING');
        setProgress({
          stage: 'verifying',
          percent: 92,
          downloadedMb: totalSize,
          totalMb: totalSize,
          speedMbPerSec: 0,
          remainingSeconds: 0,
        });
      } else {
        clearInterval(timerRef.current);
        const isChecksumValid = UpdateService.verifyChecksum(manifest.checksum);

        if (isChecksumValid) {
          setDownloadState('READY');
          setProgress({
            stage: 'ready',
            percent: 100,
            downloadedMb: totalSize,
            totalMb: totalSize,
            speedMbPerSec: 0,
            remainingSeconds: 0,
          });
          UpdateService.recordLog('Download Completed', `دانلود و اعتبارسنجی نسخه ${manifest.version} با موفقیت انجام شد.`);
        } else {
          setDownloadState('FAILED');
          setProgress({
            stage: 'failed',
            percent: 0,
            downloadedMb: 0,
            totalMb: totalSize,
            speedMbPerSec: 0,
            remainingSeconds: 0,
            errorMessage: 'اعتبارسنجی کد کنترلی فایل (Checksum SHA-256) ناموفق بود.',
          });
        }
      }
    }, 450);
  };

  const handlePauseDownload = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setDownloadState('PAUSED');
  };

  const handleResumeDownload = () => {
    startDownload();
  };

  const handleCancelDownload = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setDownloadState('IDLE');
    setProgress({
      stage: 'idle',
      percent: 0,
      downloadedMb: 0,
      totalMb: totalSize,
      speedMbPerSec: 0,
      remainingSeconds: 0,
    });
  };

  const handleInstallNow = () => {
    const isDesktop = APP_CONFIG.targetPlatform === 'WINDOWS_DESKTOP';
    UpdateService.applyUpdate(manifest, isDesktop ? 'WINDOWS_DESKTOP' : 'VERCEL_WEB');
    onUpdateSuccess(manifest);
    onClose();

    if (!isDesktop) {
      window.location.reload();
    }
  };

  const handleInstallLater = () => {
    UpdateService.recordLog('Installation Started', `به‌روزرسانی نسخه ${manifest.version} برای راه‌اندازی مجدد بعدی زمان‌بندی شد.`);
    onClose();
  };

  const handleIgnore = () => {
    UpdateService.dismissNotification(manifest.version, 'IGNORE');
    if (onIgnoreVersion) onIgnoreVersion(manifest.version);
    onClose();
  };

  const handleRemindLaterConfirm = (
    option: '30_MIN' | '2_HOURS' | 'TOMORROW' | 'NEXT_STARTUP' | 'CUSTOM',
    customMinutes?: number
  ) => {
    UpdateService.setReminder(manifest.version, option, customMinutes);
    onClose();
  };

  const handleClose = () => {
    UpdateService.dismissNotification(manifest.version, 'CLOSE');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 dir-rtl animate-fadeIn">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-sky-600/20 via-blue-600/10 to-transparent border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0">
              <DownloadCloud className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">نسخه جدید نرم‌افزار آماده است</h3>
                {isMandatory ? (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>اجباری</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-full">
                    اختیاری
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                کانال انتشار: <span className="font-bold text-sky-400">{manifest.channel}</span> • انتشار از طریق GitHub Releases / Vercel
              </p>
            </div>
          </div>

          {!isMandatory && downloadState === 'IDLE' && (
            <button
              onClick={handleClose}
              className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-surface-hover)] transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center border-b border-[var(--border-subtle)] px-6 bg-[var(--bg-base)]">
          <button
            type="button"
            onClick={() => setActiveTab('OVERVIEW')}
            className={`py-2.5 px-4 text-xs font-bold border-b-2 transition ${
              activeTab === 'OVERVIEW'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
            }`}
          >
            مشخصات به‌روزرسانی
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CHANGELOG')}
            className={`py-2.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'CHANGELOG'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>لیست تغییرات (Changelog)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm">
          {activeTab === 'OVERVIEW' ? (
            <>
              {/* Version Comparison Card */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-xl">
                <div className="space-y-1">
                  <span className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" />
                    <span>نسخه فعلی شما:</span>
                  </span>
                  <p className="font-mono font-bold text-base text-[var(--text-secondary)]">v{currentVersion}</p>
                </div>

                <div className="space-y-1 border-r border-[var(--border-subtle)] pr-4">
                  <span className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
                    <DownloadCloud className="w-3.5 h-3.5 text-sky-400" />
                    <span>آخرین نسخه ارائه شده:</span>
                  </span>
                  <p className="font-mono font-bold text-base text-sky-400">v{manifest.version}</p>
                </div>
              </div>

              {/* Meta Details Grid */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] rounded-lg flex flex-col gap-0.5">
                  <span className="text-[10px] text-[var(--text-tertiary)] flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>تاریخ انتشار</span>
                  </span>
                  <span className="font-semibold text-[var(--text-primary)]">{manifest.releaseDate}</span>
                </div>

                <div className="p-2.5 bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] rounded-lg flex flex-col gap-0.5">
                  <span className="text-[10px] text-[var(--text-tertiary)] flex items-center gap-1">
                    <HardDrive className="w-3 h-3" />
                    <span>حجم بسته</span>
                  </span>
                  <span className="font-semibold text-[var(--text-primary)]">{manifest.sizeMb || '48.5 MB'}</span>
                </div>

                <div className="p-2.5 bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] rounded-lg flex flex-col gap-0.5">
                  <span className="text-[10px] text-[var(--text-tertiary)] flex items-center gap-1">
                    <FileCode className="w-3 h-3" />
                    <span>شماره بیلد</span>
                  </span>
                  <span className="font-mono font-semibold text-[var(--text-primary)]">#{manifest.buildNumber}</span>
                </div>
              </div>

              {/* Summary Notes */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>خلاصه خصوصیات نسخه:</span>
                </h4>
                <div className="p-3 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-line max-h-28 overflow-y-auto">
                  {manifest.releaseNotes}
                </div>
              </div>
            </>
          ) : (
            /* Changelog View */
            <div className="space-y-3 animate-fadeIn">
              {/* New Features */}
              <div className="p-3.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-xl space-y-2">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>ویژگی‌های جدید (New Features)</span>
                </span>
                <ul className="space-y-1 text-xs text-[var(--text-secondary)] list-disc list-inside">
                  {(manifest.changelog?.newFeatures || [
                    'سیستم جدید مدیریت پیشرفته به‌روزرسانی‌ها و دانلود در پس‌زمینه',
                    'تنظیمات هوشمند یادآوری به‌روزرسانی و مدیریت نسخه',
                  ]).map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Bug Fixes */}
              <div className="p-3.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-xl space-y-2">
                <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                  <Bug className="w-4 h-4" />
                  <span>رفع باگ‌ها (Bug Fixes)</span>
                </span>
                <ul className="space-y-1 text-xs text-[var(--text-secondary)] list-disc list-inside">
                  {(manifest.changelog?.bugFixes || [
                    'برطرف‌سازی کامل اعلان‌های تکراری به‌روزرسانی',
                    'بهینه‌سازی کارکرد آفلاین و عدم نمایش خطاهای متوالی',
                  ]).map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Security Improvements */}
              <div className="p-3.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-xl space-y-2">
                <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  <span>ارتقای امنیت (Security Improvements)</span>
                </span>
                <ul className="space-y-1 text-xs text-[var(--text-secondary)] list-disc list-inside">
                  {(manifest.changelog?.securityImprovements || [
                    'اعتبارسنجی Checksum SHA-256 قبل از اجرای نصب',
                    'تأیید سطوح دسترسی اختصاصی مدیران کلینیک',
                  ]).map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Known Issues Section if present */}
              {manifest.changelog?.knownIssues && manifest.changelog.knownIssues.length > 0 && (
                <div className="p-3.5 bg-[var(--bg-base)] border border-amber-500/30 rounded-xl space-y-2">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>مشکلات شناخته شده (Known Issues)</span>
                  </span>
                  <ul className="space-y-1 text-xs text-amber-300/90 list-disc list-inside">
                    {manifest.changelog.knownIssues.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* SHA-256 Checksum & Digital Signature Display */}
          <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl space-y-2 text-[10px] font-mono">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>SHA-256 Checksum:</span>
              </span>
              <span className="truncate max-w-[280px] font-mono text-emerald-400">{manifest.checksum}</span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800 pt-2 text-slate-300">
              <span className="text-slate-400">Digital Signature:</span>
              {manifest.signatureAvailable || manifest.signatureVerified ? (
                <span className="px-2 py-0.5 rounded font-sans font-bold text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Signature Verified (معتبر)
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded font-sans font-medium text-[9px] bg-slate-800 text-slate-400 border border-slate-700">
                  Signature Not Available (عدم وجود امضا)
                </span>
              )}
            </div>
          </div>

          {/* Downloading & Progress Panel */}
          {downloadState !== 'IDLE' && (
            <div className="p-4 bg-[var(--bg-base)] border border-sky-500/30 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                  {downloadState === 'DOWNLOADING' && (
                    <>
                      <RefreshCw className="w-4 h-4 text-sky-400 animate-spin" />
                      <span>در حال دانلود بسته v{manifest.version}...</span>
                    </>
                  )}
                  {downloadState === 'PAUSED' && (
                    <>
                      <Pause className="w-4 h-4 text-amber-400" />
                      <span>دانلود متوقف شد (Paused)</span>
                    </>
                  )}
                  {downloadState === 'VERIFYING' && (
                    <>
                      <ShieldCheck className="w-4 h-4 text-amber-400 animate-pulse" />
                      <span>اعتبارسنجی و بررسی چک‌سام SHA-256...</span>
                    </>
                  )}
                  {downloadState === 'READY' && (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>دانلود و اعتبارسنجی کامل شد. آماده نصب!</span>
                    </>
                  )}
                  {downloadState === 'FAILED' && (
                    <>
                      <XCircle className="w-4 h-4 text-rose-400" />
                      <span>خطا در دانلود یا اعتبارسنجی فایل!</span>
                    </>
                  )}
                </span>
                <span className="font-mono font-bold text-sky-400">{progress.percent}%</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    downloadState === 'FAILED'
                      ? 'bg-rose-500'
                      : downloadState === 'READY'
                      ? 'bg-emerald-500'
                      : downloadState === 'PAUSED'
                      ? 'bg-amber-500'
                      : downloadState === 'VERIFYING'
                      ? 'bg-purple-500'
                      : 'bg-gradient-to-r from-sky-500 to-blue-600'
                  }`}
                  style={{ width: `${progress.percent}%` }}
                />
              </div>

              {/* Speed & Remaining Time info */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[11px] text-[var(--text-tertiary)] pt-1 border-t border-[var(--border-subtle)]">
                <div>
                  حجم: <span className="font-mono text-[var(--text-secondary)]">{progress.downloadedMb}MB</span> از {progress.totalMb}MB
                </div>
                <div>
                  سرعت: <span className="font-mono text-sky-400">{progress.speedMbPerSec} MB/s</span>
                </div>
                <div>
                  زمان باقی‌مانده: <span className="font-mono text-amber-400">{progress.remainingSeconds} ثانیه</span>
                </div>
              </div>

              {/* Download Controls */}
              {(downloadState === 'DOWNLOADING' || downloadState === 'PAUSED') && (
                <div className="flex items-center gap-2 pt-2 justify-end">
                  {downloadState === 'DOWNLOADING' ? (
                    <button
                      type="button"
                      onClick={handlePauseDownload}
                      className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-amber-500/30 transition"
                    >
                      <Pause className="w-3.5 h-3.5" />
                      <span>توقف موقت</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResumeDownload}
                      className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-emerald-500/30 transition"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>ادامه دانلود</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleCancelDownload}
                    className="px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-medium hover:bg-rose-500/20 transition"
                  >
                    لغو دانلود
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-[var(--bg-base)] border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
          {downloadState === 'IDLE' && (
            <>
              {!isMandatory ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleIgnore}
                    className="px-3.5 py-2 hover:bg-rose-500/10 text-rose-400 rounded-xl font-medium text-xs border border-rose-500/20 transition"
                  >
                    نادیده گرفتن این نسخه
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsRemindLaterOpen(true)}
                    className="px-3.5 py-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-amber-400 border border-amber-500/30 rounded-xl font-medium text-xs flex items-center gap-1.5 transition"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>یادآوری بعدی (Later)</span>
                  </button>
                </div>
              ) : (
                <div className="text-xs text-rose-400 font-semibold flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>این به‌روزرسانی اجباری است</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                {!isMandatory && (
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] border border-[var(--border-subtle)] rounded-xl font-medium text-xs transition"
                  >
                    بستن
                  </button>
                )}

                <button
                  type="button"
                  onClick={startDownload}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-sky-900/30 flex items-center gap-2 active:scale-95 transition"
                >
                  <DownloadCloud className="w-4 h-4" />
                  <span>دریافت و نصب الآن</span>
                </button>
              </div>
            </>
          )}

          {downloadState === 'READY' && (
            <div className="w-full flex items-center justify-between">
              <button
                type="button"
                onClick={handleInstallLater}
                className="px-4 py-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] border border-[var(--border-subtle)] rounded-xl font-medium text-xs transition"
              >
                نصب هنگام شروع بعدی
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleInstallNow}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-900/30 flex items-center gap-2 active:scale-95 transition"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>راه‌اندازی مجدد و نصب الآن</span>
                </button>
              </div>
            </div>
          )}

          {downloadState === 'FAILED' && (
            <div className="w-full flex items-center justify-between">
              <span className="text-xs text-rose-400 font-medium">خطا در فرآیند دریافت. دوباره تلاش کنید.</span>
              <button
                type="button"
                onClick={startDownload}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs transition"
              >
                تلاش مجدد
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Remind Later Sub-modal */}
      <RemindLaterModal
        isOpen={isRemindLaterOpen}
        onClose={() => setIsRemindLaterOpen(false)}
        onConfirm={handleRemindLaterConfirm}
        version={manifest.version}
      />
    </div>
  );
};
