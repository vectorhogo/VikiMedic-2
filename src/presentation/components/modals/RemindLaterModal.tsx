/**
 * VikiMedic v2 - Remind Later Configuration Modal
 * Clean Architecture Layer: Presentation
 */

import React, { useState } from 'react';
import { Clock, Calendar, RefreshCw, X, Check, Bell } from 'lucide-react';

interface RemindLaterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    option: '30_MIN' | '2_HOURS' | 'TOMORROW' | 'NEXT_STARTUP' | 'CUSTOM',
    customMinutes?: number
  ) => void;
  version: string;
}

export const RemindLaterModal: React.FC<RemindLaterModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  version,
}) => {
  const [selectedOption, setSelectedOption] = useState<
    '30_MIN' | '2_HOURS' | 'TOMORROW' | 'NEXT_STARTUP' | 'CUSTOM'
  >('30_MIN');
  const [customMinutes, setCustomMinutes] = useState<number>(60);

  if (!isOpen) return null;

  const handleApply = () => {
    onConfirm(selectedOption, customMinutes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 dir-rtl animate-fadeIn">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-amber-600/20 via-sky-600/10 to-transparent border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">زمان‌بندی یادآور به روزرسانی</h3>
              <p className="text-xs text-[var(--text-secondary)]">نسخه جدید: v{version}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-surface-hover)] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-3">
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-1">
            زمان مورد نظر برای یادآوری بعدی نسخه v{version} را انتخاب کنید:
          </p>

          <div className="space-y-2">
            {/* 30 minutes */}
            <button
              type="button"
              onClick={() => setSelectedOption('30_MIN')}
              className={`w-full p-3 rounded-xl border text-right text-xs font-semibold flex items-center justify-between transition ${
                selectedOption === '30_MIN'
                  ? 'bg-amber-500/15 border-amber-500 text-amber-300 ring-1 ring-amber-500/50'
                  : 'bg-[var(--bg-base)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-amber-500/40'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>۳۰ دقیقه بعد (۳۰ Minutes)</span>
              </div>
              {selectedOption === '30_MIN' && <Check className="w-4 h-4 text-amber-400" />}
            </button>

            {/* 2 hours */}
            <button
              type="button"
              onClick={() => setSelectedOption('2_HOURS')}
              className={`w-full p-3 rounded-xl border text-right text-xs font-semibold flex items-center justify-between transition ${
                selectedOption === '2_HOURS'
                  ? 'bg-amber-500/15 border-amber-500 text-amber-300 ring-1 ring-amber-500/50'
                  : 'bg-[var(--bg-base)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-amber-500/40'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>۲ ساعت بعد (۲ Hours)</span>
              </div>
              {selectedOption === '2_HOURS' && <Check className="w-4 h-4 text-amber-400" />}
            </button>

            {/* Tomorrow */}
            <button
              type="button"
              onClick={() => setSelectedOption('TOMORROW')}
              className={`w-full p-3 rounded-xl border text-right text-xs font-semibold flex items-center justify-between transition ${
                selectedOption === 'TOMORROW'
                  ? 'bg-amber-500/15 border-amber-500 text-amber-300 ring-1 ring-amber-500/50'
                  : 'bg-[var(--bg-base)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-amber-500/40'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-400" />
                <span>فردا (Tomorrow / 24 Hours)</span>
              </div>
              {selectedOption === 'TOMORROW' && <Check className="w-4 h-4 text-amber-400" />}
            </button>

            {/* Next Startup */}
            <button
              type="button"
              onClick={() => setSelectedOption('NEXT_STARTUP')}
              className={`w-full p-3 rounded-xl border text-right text-xs font-semibold flex items-center justify-between transition ${
                selectedOption === 'NEXT_STARTUP'
                  ? 'bg-amber-500/15 border-amber-500 text-amber-300 ring-1 ring-amber-500/50'
                  : 'bg-[var(--bg-base)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-amber-500/40'
              }`}
            >
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-emerald-400" />
                <span>اجرای بعدی برنامه (Next Startup)</span>
              </div>
              {selectedOption === 'NEXT_STARTUP' && <Check className="w-4 h-4 text-amber-400" />}
            </button>

            {/* Custom Interval */}
            <div
              className={`p-3 rounded-xl border transition space-y-2 ${
                selectedOption === 'CUSTOM'
                  ? 'bg-amber-500/15 border-amber-500 text-amber-300 ring-1 ring-amber-500/50'
                  : 'bg-[var(--bg-base)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
              }`}
            >
              <button
                type="button"
                onClick={() => setSelectedOption('CUSTOM')}
                className="w-full text-right text-xs font-semibold flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-purple-400" />
                  <span>بازه زمانی سفارشی (Custom Interval)</span>
                </div>
                {selectedOption === 'CUSTOM' && <Check className="w-4 h-4 text-amber-400" />}
              </button>

              {selectedOption === 'CUSTOM' && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-[var(--text-secondary)]">تعداد دقیقه:</span>
                  <input
                    type="number"
                    min="5"
                    max="1440"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(Math.max(5, parseInt(e.target.value, 10) || 60))}
                    className="w-24 px-3 py-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg font-mono text-xs font-bold text-center text-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  <span className="text-[11px] text-[var(--text-tertiary)]">دقیقه</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[var(--bg-base)] border-t border-[var(--border-subtle)] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] border border-[var(--border-subtle)] rounded-xl font-medium text-xs transition"
          >
            انصراف
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-amber-900/20 transition"
          >
            ثبت یادآور
          </button>
        </div>
      </div>
    </div>
  );
};
