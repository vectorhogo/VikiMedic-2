/**
 * VikiMedic v2 - Release Notes Modal ("What's New")
 * Clean Architecture Layer: Presentation
 */

import React from 'react';
import { Sparkles, Check, FileText, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { VersionManifest } from '../../../domain/updateTypes';
import { UpdateService } from '../../../infrastructure/updateService';

interface ReleaseNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  manifest: VersionManifest | null;
  customVersion?: string;
  customNotes?: string;
}

export const ReleaseNotesModal: React.FC<ReleaseNotesModalProps> = ({
  isOpen,
  onClose,
  manifest,
  customVersion,
  customNotes,
}) => {
  if (!isOpen) return null;

  const version = customVersion || manifest?.version || UpdateService.getCurrentVersion();
  const notes = customNotes || manifest?.releaseNotes || '• بهبودهای کلی عملکرد و پایداری سیستم';
  const releaseDate = manifest?.releaseDate || '۱۴۰۵/۰۵/۱۵';

  const handleConfirm = () => {
    UpdateService.markReleaseNotesSeen(version);
    onClose();
  };

  const formattedNotesList = notes
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 dir-rtl animate-fadeIn">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-600/20 via-teal-600/10 to-transparent border-b border-emerald-500/20 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">تغییرات و قابلیت‌های جدید</h3>
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                v{version}
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              سیستم به‌روزرسانی و مدیریت انتشار VikiMedic v2 • تاریخ انتشار: {releaseDate}
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-[var(--text-secondary)]">
          <div className="p-3 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-xl flex items-center gap-2 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>نرم‌افزار با موفقیت به نسخه جدید ارتقا یافت. لیست بهبودها و ویژگی‌های جدید:</span>
          </div>

          <div className="space-y-2.5">
            {formattedNotesList.map((line, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] flex items-start gap-3 hover:border-emerald-500/30 transition"
              >
                <div className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="leading-relaxed text-[var(--text-primary)] font-medium">
                  {line.replace(/^•\s*/, '')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[var(--bg-base)] border-t border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
            <Tag className="w-3.5 h-3.5 text-emerald-500" />
            <span>کانال انتشار: Stable (رسمی)</span>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-900/20 flex items-center gap-2 active:scale-95 transition"
          >
            <span>متوجه شدم</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
};
