/**
 * VikiMedic v2 - Hidden Theme Security PIN Modal (PIN: 8585)
 * Clean Architecture Layer: Presentation
 */

import React, { useState } from 'react';
import { ShieldAlert, Sparkles, KeyRound, X, CheckCircle, Lock } from 'lucide-react';
import { useTheme } from '../../ThemeContext';
import { useClinic } from '../../../application/ClinicContext';

export const RoseThemePinModal: React.FC = () => {
  const { isPinModalOpen, setIsPinModalOpen, verifyAndUnlockRose } = useTheme();
  const { addNotification } = useClinic();

  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isPinModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (verifyAndUnlockRose(pin)) {
      setIsSuccess(true);
      addNotification('تم لوکس رز (Rose Luxe Theme) با موفقیت فعال و ذخیره گردید.', 'success');
      setTimeout(() => {
        setIsSuccess(false);
        setPin('');
        setIsPinModalOpen(false);
      }, 1200);
    } else {
      setErrorMsg('کد امنیتی وارد شده نادرست است! (کد صحیح: 8585)');
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-2xl shadow-2xl overflow-hidden relative text-slate-100">
        {/* Glow Header */}
        <div className="bg-gradient-to-r from-rose-900/60 via-purple-900/40 to-slate-900 p-5 border-b border-rose-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-rose-200">فعال‌سازی تم امنیتی پنهان</h3>
              <p className="text-[11px] text-rose-300/80 font-medium">Rose Luxe Security Protocol</p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsPinModalOpen(false);
              setPin('');
              setErrorMsg('');
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {isSuccess ? (
            <div className="py-6 text-center space-y-3 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-base text-emerald-300">تم لوکس رز فعال گردید!</h4>
              <p className="text-xs text-slate-300">در حال اعمال تغییرات ظاهری و رنگ‌بندی ویژه کلینیک...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-300 block mb-0.5">مکانیسم امنیتی ۵ ثانیه‌ای:</span>
                  جهت دسترسی به تم لوکس رز (Hidden Theme)، کد امنیتی اختصاصی ۴ رقمی زیر را وارد کنید.
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2 text-right">
                  کد PIN امنیتی (PIN: 8585):
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute right-3.5 top-3.5 text-rose-400" />
                  <input
                    type="password"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="8585"
                    autoFocus
                    className="w-full bg-slate-950 border border-rose-500/30 rounded-xl pr-10 pl-4 py-2.5 text-center text-lg font-mono tracking-[0.5em] text-rose-200 placeholder-slate-600 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-2 font-medium">
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-rose-900/30 transition flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>تأیید و فعال‌سازی تم رز</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPinModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition"
                >
                  انصراف
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
