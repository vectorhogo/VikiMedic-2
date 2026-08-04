/**
 * VikiMedic v2 - Update Notification & Single Instance Notification Manager
 * Clean Architecture Layer: Presentation
 */

import React, { useEffect, useState } from 'react';
import { DownloadCloud, X, Clock, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useClinic } from '../../../application/ClinicContext';
import { UpdateService } from '../../../infrastructure/updateService';
import { VersionManifest } from '../../../domain/updateTypes';
import { MandatoryUpdateModal } from '../modals/MandatoryUpdateModal';
import { UpdateDialogModal } from '../modals/UpdateDialogModal';
import { ReleaseNotesModal } from '../modals/ReleaseNotesModal';
import { RemindLaterModal } from '../modals/RemindLaterModal';

export const UpdateNotificationManager: React.FC = () => {
  const { addNotification } = useClinic();

  const [mandatoryManifest, setMandatoryManifest] = useState<VersionManifest | null>(null);
  const [optionalManifest, setOptionalManifest] = useState<VersionManifest | null>(null);

  // Single-instance floating banner flag
  const [showNotificationBanner, setShowNotificationBanner] = useState<boolean>(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState<boolean>(false);
  const [isRemindLaterOpen, setIsRemindLaterOpen] = useState<boolean>(false);

  const [showReleaseNotes, setShowReleaseNotes] = useState<boolean>(false);
  const [latestInstalledVersion, setLatestInstalledVersion] = useState<string>('');

  useEffect(() => {
    const currentVer = UpdateService.getCurrentVersion();
    setLatestInstalledVersion(currentVer);

    // Check if release notes should be shown for newly installed version
    if (!UpdateService.hasSeenReleaseNotes(currentVer)) {
      setShowReleaseNotes(true);
      const settings = UpdateService.getSettings();
      if (settings.notifySuccess) {
        addNotification(`نرم‌افزار با موفقیت به نسخه v${currentVer} ارتقا یافت.`, 'success');
      }
    }

    // Single Startup update check
    const settings = UpdateService.getSettings();
    if (settings.autoCheckOnStartup) {
      UpdateService.checkForUpdates(false)
        .then((res) => {
          if (res.status === 'MANDATORY_BLOCKED' && res.manifest) {
            setMandatoryManifest(res.manifest);
          } else if (res.status === 'UPDATE_AVAILABLE' && res.manifest) {
            setOptionalManifest(res.manifest);

            // ONLY show notification if allowed and not previously dismissed/ignored
            if (UpdateService.shouldNotifyForVersion(res.manifest.version)) {
              setShowNotificationBanner(true);
            }
          }
        })
        .catch((err) => {
          // Offline mode - skip silently, no endless loops
          console.log('Update check skipped (offline mode):', err);
        });
    }
  }, [addNotification]);

  const handleUpdateNowClick = () => {
    setShowNotificationBanner(false);
    setIsUpdateDialogOpen(true);
  };

  const handleLaterClick = () => {
    setIsRemindLaterOpen(true);
  };

  const handleIgnoreClick = () => {
    if (optionalManifest) {
      UpdateService.dismissNotification(optionalManifest.version, 'IGNORE');
      setShowNotificationBanner(false);
      addNotification(`نسخه ${optionalManifest.version} نادیده گرفته شد.`, 'info');
    }
  };

  const handleCloseBanner = () => {
    if (optionalManifest) {
      UpdateService.dismissNotification(optionalManifest.version, 'CLOSE');
    }
    setShowNotificationBanner(false);
  };

  const handleRemindLaterConfirm = (
    option: '30_MIN' | '2_HOURS' | 'TOMORROW' | 'NEXT_STARTUP' | 'CUSTOM',
    customMinutes?: number
  ) => {
    if (optionalManifest) {
      UpdateService.setReminder(optionalManifest.version, option, customMinutes);
      setShowNotificationBanner(false);
      addNotification('یادآور به روزرسانی با موفقیت تنظیم شد.', 'info');
    }
  };

  return (
    <>
      {/* Mandatory Update Modal Overlay */}
      {mandatoryManifest && (
        <MandatoryUpdateModal
          isOpen={!!mandatoryManifest}
          manifest={mandatoryManifest}
          onUpdateCompleted={() => {
            setMandatoryManifest(null);
            addNotification('به‌روزرسانی اجباری با موفقیت اعمال شد.', 'success');
          }}
        />
      )}

      {/* Single-Instance Floating Update Notification Banner */}
      {showNotificationBanner && optionalManifest && !isUpdateDialogOpen && (
        <div className="fixed bottom-6 left-6 z-50 max-w-md w-full dir-rtl animate-slideUp">
          <div className="bg-[var(--bg-surface)] border-2 border-sky-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-md space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0">
                  <DownloadCloud className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">نسخه جدید v{optionalManifest.version}</h4>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-full">
                      جدید
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-snug">
                    به‌روزرسانی جدید آماده دریافت می‌باشد.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseBanner}
                className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-surface-hover)] transition"
                title="بستن"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-1.5 pt-1 border-t border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={handleUpdateNowClick}
                className="flex-1 py-1.5 px-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-xs transition flex items-center justify-center gap-1 shadow-md shadow-sky-900/20"
              >
                <span>به‌روزرسانی</span>
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              </button>

              <button
                type="button"
                onClick={handleLaterClick}
                className="py-1.5 px-2.5 bg-[var(--bg-base)] hover:bg-[var(--bg-surface-hover)] text-amber-400 border border-amber-500/30 rounded-lg text-xs font-medium transition flex items-center gap-1"
              >
                <Clock className="w-3 h-3" />
                <span>بعداً</span>
              </button>

              <button
                type="button"
                onClick={handleIgnoreClick}
                className="py-1.5 px-2.5 bg-[var(--bg-base)] hover:bg-[var(--bg-surface-hover)] text-rose-400 border border-rose-500/20 rounded-lg text-[11px] font-medium transition"
              >
                نادیده گرفتن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Optional Update Dialog Modal */}
      {isUpdateDialogOpen && optionalManifest && (
        <UpdateDialogModal
          isOpen={isUpdateDialogOpen}
          onClose={() => setIsUpdateDialogOpen(false)}
          manifest={optionalManifest}
          onUpdateSuccess={(manifest) => {
            setIsUpdateDialogOpen(false);
            setShowNotificationBanner(false);
            const settings = UpdateService.getSettings();
            if (settings.notifySuccess) {
              addNotification(`ارتقا به نسخه v${manifest.version} با موفقیت انجام گردید.`, 'success');
            }
          }}
          onIgnoreVersion={(ver) => {
            setShowNotificationBanner(false);
            addNotification(`نسخه ${ver} نادیده گرفته شد.`, 'info');
          }}
        />
      )}

      {/* Remind Later Modal */}
      {isRemindLaterOpen && optionalManifest && (
        <RemindLaterModal
          isOpen={isRemindLaterOpen}
          onClose={() => setIsRemindLaterOpen(false)}
          onConfirm={handleRemindLaterConfirm}
          version={optionalManifest.version}
        />
      )}

      {/* Post-update Release Notes Modal */}
      {showReleaseNotes && (
        <ReleaseNotesModal
          isOpen={showReleaseNotes}
          onClose={() => setShowReleaseNotes(false)}
          manifest={null}
          customVersion={latestInstalledVersion}
        />
      )}
    </>
  );
};
