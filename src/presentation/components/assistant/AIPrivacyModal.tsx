/**
 * VikiMedic v2 - AI Online Mode Privacy Notice Modal
 * Clean Architecture Layer: Presentation
 * AI Patch 01 - Viki Assistant Online Mode
 */

import React from 'react';
import { ShieldCheck, Lock, AlertTriangle, EyeOff, Check, X } from 'lucide-react';

interface AIPrivacyModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const AIPrivacyModal: React.FC<AIPrivacyModalProps> = ({ isOpen, onAccept, onDecline }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[var(--bg-surface)] border border-blue-500/30 rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-5 text-[var(--text-main)] dir-rtl">
        {/* Header Badge */}
        <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] pb-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-400/40 flex items-center justify-center text-blue-400 shrink-0">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[var(--text-main)]">اطلاعیه و حریم خصوصی هوش مصنوعی ابری</h3>
            <p className="text-xs text-[var(--text-muted)]">راهنمای حفاظت از داده‌های کلینیک VikiMedic</p>
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-3 text-xs leading-relaxed">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p>
              با فعال‌سازی <strong>حالت آنلاین (Online AI Mode)</strong>، پرسش‌های مطرح‌شده در چت جهت دریافت پاسخ هوشمند به سرویس‌دهنده ابری منتخب ارسال می‌شوند.
            </p>
          </div>

          <div className="space-y-2 text-[var(--text-muted)]">
            <div className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong>محرمانه بودن پرونده‌ها:</strong> داده‌های پرونده‌های پزشکی بیماران، تراکنش‌های مالی، کدهای ملی، رمزهای عبور و توکن‌های امنیتی هرگز به ارائه دهندگان ابری ارسال نمی‌شوند.
              </span>
            </div>

            <div className="flex items-start gap-2">
              <EyeOff className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <span>
                <strong>سوییچ خودکار آفلاین:</strong> در صورت قطع اینترنت یا بروز هرگونه خطا در API، سیستم بدون فوت وقت به دستیار آفلاین بازمی‌گردد.
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-subtle)] font-bold text-xs">
          <button
            onClick={onAccept}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/20"
          >
            <Check className="w-4 h-4" />
            <span>تایید و فعال‌سازی حالت آنلاین</span>
          </button>
          <button
            onClick={onDecline}
            className="bg-[var(--bg-app)] hover:bg-slate-800 text-[var(--text-muted)] hover:text-white py-2.5 px-3 rounded-xl transition border border-[var(--border-subtle)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
