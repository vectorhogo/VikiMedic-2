/**
 * VikiMedic v2 - Smart Notification Settings Modal
 * Clean Architecture Layer: Presentation
 */

import React, { useState } from 'react';
import { Volume2, VolumeX, Moon, Clock, Shield, X, Save, Check } from 'lucide-react';
import { notificationEngine } from '../../../infrastructure/notificationEngine';
import { NotificationSettings } from '../../../domain/notifications';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SmartNotificationSettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<NotificationSettings>(notificationEngine.getSettings());
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    notificationEngine.saveSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-[var(--header-bg)] border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#283F24]/10 text-[#283F24] border border-[#283F24]/20">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[var(--text-main)]">تنظیمات صدا و ساعات سکوت مرکز اعلان‌ها</h3>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">مدیریت هشدار صوتی وQuiet Hours سیستم</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-app)] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 text-xs">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between bg-[var(--bg-app)] p-3.5 rounded-xl border border-[var(--border-subtle)]">
            <div className="flex items-center gap-3">
              {settings.soundEnabled && !settings.muted ? (
                <Volume2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <VolumeX className="w-5 h-5 text-rose-500 shrink-0" />
              )}
              <div>
                <div className="font-bold text-[var(--text-main)]">هشدار صوتی (Sound Tone)</div>
                <div className="text-[10px] text-[var(--text-muted)]">پخش افکت صوتی هنگام دریافت اعلان جدید</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => setSettings({ ...settings, soundEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#283F24]" />
            </label>
          </div>

          {/* Mute Toggle */}
          <div className="flex items-center justify-between bg-[var(--bg-app)] p-3.5 rounded-xl border border-[var(--border-subtle)]">
            <div className="flex items-center gap-3">
              <VolumeX className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <div className="font-bold text-[var(--text-main)]">حالت بی‌صدا (Mute All)</div>
                <div className="text-[10px] text-[var(--text-muted)]">قطع تمام صداهای سیستم بصورت موقت</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.muted}
                onChange={(e) => setSettings({ ...settings, muted: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600" />
            </label>
          </div>

          {/* Volume Slider */}
          <div className="bg-[var(--bg-app)] p-3.5 rounded-xl border border-[var(--border-subtle)] space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-[var(--text-main)]">شدت صدای هشدار (Volume):</span>
              <span className="font-mono font-bold text-[#283F24] text-xs">{settings.volume}٪</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              disabled={!settings.soundEnabled || settings.muted}
              value={settings.volume}
              onChange={(e) => setSettings({ ...settings, volume: Number(e.target.value) })}
              className="w-full accent-[#283F24] cursor-pointer"
            />
          </div>

          {/* Quiet Hours Section */}
          <div className="bg-[var(--bg-app)] p-3.5 rounded-xl border border-[var(--border-subtle)] space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-indigo-500" />
                <span className="font-bold text-[var(--text-main)]">ساعات سکوت (Quiet Hours)</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.quietHoursEnabled}
                  onChange={(e) => setSettings({ ...settings, quietHoursEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
              </label>
            </div>

            {settings.quietHoursEnabled && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-muted)] mb-1">
                    شروع سکوت (شب):
                  </label>
                  <input
                    type="time"
                    value={settings.quietHoursStart}
                    onChange={(e) => setSettings({ ...settings, quietHoursStart: e.target.value })}
                    className="w-full p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] font-mono text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-muted)] mb-1">
                    پایان سکوت (صبح):
                  </label>
                  <input
                    type="time"
                    value={settings.quietHoursEnd}
                    onChange={(e) => setSettings({ ...settings, quietHoursEnd: e.target.value })}
                    className="w-full p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] font-mono text-center font-bold"
                  />
                </div>
              </div>
            )}
            <p className="text-[10px] text-[var(--text-muted)] leading-normal">
              در ساعات سکوت، صدا پخش نمی‌شود و اعلان‌ها بصورت بی‌صدا ذخیره می‌گردند.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-[var(--header-bg)] border-t border-[var(--border-subtle)] flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--text-muted)] hover:bg-[var(--bg-app)] transition"
          >
            انصراف
          </button>
          <button
            onClick={handleSave}
            className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition flex items-center gap-1.5 ${
              savedSuccess ? 'bg-emerald-600' : 'bg-[#283F24] hover:bg-[#35542F]'
            }`}
          >
            {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{savedSuccess ? 'ذخیره شد' : 'ذخیره تنظیمات'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
