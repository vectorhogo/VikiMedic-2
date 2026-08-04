/**
 * VikiMedic v2 - Mandatory Update Screen / Lock Modal
 * Clean Architecture Layer: Presentation
 */

import React, { useState } from 'react';
import { ShieldAlert, DownloadCloud, AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { VersionManifest } from '../../../domain/updateTypes';
import { UpdateService } from '../../../infrastructure/updateService';
import { APP_CONFIG } from '../../../config/appConfig';

interface MandatoryUpdateModalProps {
  isOpen: boolean;
  manifest: VersionManifest;
  onUpdateCompleted: () => void;
}

export const MandatoryUpdateModal: React.FC<MandatoryUpdateModalProps> = ({
  isOpen,
  manifest,
  onUpdateCompleted,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!isOpen) return null;

  const handleStartMandatoryUpdate = () => {
    setIsUpdating(true);
    let current = 0;
    const interval = setInterval(() => {
      current += 15;
      if (current >= 100) {
        clearInterval(interval);
        const isDesktop = APP_CONFIG.targetPlatform === 'WINDOWS_DESKTOP';
        UpdateService.applyUpdate(manifest, isDesktop ? 'WINDOWS_DESKTOP' : 'VERCEL_WEB');
        onUpdateCompleted();
        if (!isDesktop) {
          window.location.reload();
        }
      } else {
        setProgress(current);
      }
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 dir-rtl animate-fadeIn">
      <div className="bg-[var(--bg-surface)] border-2 border-rose-500/40 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden p-6 space-y-6 text-center">
        {/* Warning Badge */}
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto shadow-xl">
          <ShieldAlert className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full text-xs font-bold inline-flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>به‌روزرسانی اجباری و حیاتی (Mandatory Update)</span>
          </span>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">به‌روزرسانی نسخه v{manifest.version} الزامی است</h2>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            جهت حفظ امنیت اطلاعات، هماهنگی با زیرساخت جدید دیتابیس و جلوگیر‌ی از خطاهای محاسباتی مالی و دارویی، ادامه استفاده از نرم‌افزار منوط به نصب این به‌روزرسانی می‌باشد.
          </p>
        </div>

        {/* Reason / Notes Box */}
        <div className="p-4 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-xl text-right text-xs space-y-2">
          <span className="font-bold text-[var(--text-primary)] block">علت به‌روزرسانی اجباری:</span>
          <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">{manifest.releaseNotes}</p>
        </div>

        {/* Progress or Button */}
        {isUpdating ? (
          <div className="space-y-3 p-4 bg-slate-900/60 border border-rose-500/30 rounded-xl">
            <div className="flex items-center justify-between text-xs font-bold text-[var(--text-primary)]">
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-rose-400 animate-spin" />
                <span>در حال نصب و اعمال به‌روزرسانی اجباری...</span>
              </span>
              <span className="font-mono text-rose-400">{progress}%</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleStartMandatoryUpdate}
            className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-sm shadow-xl shadow-rose-950/40 flex items-center justify-center gap-2 active:scale-95 transition"
          >
            <DownloadCloud className="w-5 h-5" />
            <span>دریافت و ارتقای فوری نرم‌افزار</span>
          </button>
        )}
      </div>
    </div>
  );
};
