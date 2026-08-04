/**
 * VikiMedic v2 - Header Notification Bell Control
 * Clean Architecture Layer: Presentation
 */

import React, { useState, useEffect } from 'react';
import { Bell, BellOff, BellRing, AlertOctagon } from 'lucide-react';
import { notificationEngine } from '../../../infrastructure/notificationEngine';
import { SmartNotificationPanel } from './SmartNotificationPanel';
import { SmartNotificationSettingsModal } from './SmartNotificationSettingsModal';
import { useClinic } from '../../../application/ClinicContext';

export const SmartNotificationBell: React.FC = () => {
  const { activeUser, patients, transactions, staffList } = useClinic();

  const [unreadCount, setUnreadCount] = useState(0);
  const [hasCritical, setHasCritical] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState(notificationEngine.getSettings());

  const refreshCounts = () => {
    const res = notificationEngine.getUnreadCount(activeUser?.role);
    setUnreadCount(res.unread);
    setHasCritical(res.hasCritical);
    setSettings(notificationEngine.getSettings());
  };

  useEffect(() => {
    refreshCounts();
    const unsubscribe = notificationEngine.subscribe(() => {
      refreshCounts();
    });

    // Run proactive smart reminder scan on mount & periodically
    notificationEngine.runSmartReminderScan({
      patients,
      orders: transactions,
      staff: staffList
    });

    return () => unsubscribe();
  }, [activeUser, patients, transactions, staffList]);

  const isMuted = settings.muted || !settings.soundEnabled;

  return (
    <>
      <div className="relative inline-flex items-center">
        <button
          onClick={() => setIsPanelOpen(!isPanelOpen)}
          className={`relative p-1.5 rounded-lg transition-all flex items-center justify-center ${
            hasCritical
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
              : unreadCount > 0
              ? 'bg-[#283F24]/20 text-[#283F24] dark:text-emerald-400 border border-[#283F24]/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
          }`}
          title={
            hasCritical
              ? 'اعلان بحرانی وجود دارد!'
              : unreadCount > 0
              ? `${unreadCount} اعلان جدید`
              : 'مرکز اعلان‌های هوشمند'
          }
        >
          {isMuted ? (
            <BellOff className="w-4 h-4 text-slate-400" />
          ) : hasCritical ? (
            <BellRing className="w-4 h-4 text-rose-500 animate-bounce" />
          ) : (
            <Bell className="w-4 h-4" />
          )}

          {/* Badge Counter */}
          {unreadCount > 0 && (
            <span
              className={`absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-black font-mono flex items-center justify-center text-white shadow-md ${
                hasCritical ? 'bg-rose-600 animate-pulse' : 'bg-[#283F24]'
              }`}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Slide-Down Panel */}
        <SmartNotificationPanel
          isOpen={isPanelOpen}
          onClose={() => setIsPanelOpen(false)}
          onOpenSettings={() => {
            setIsPanelOpen(false);
            setIsSettingsOpen(true);
          }}
          currentRole={activeUser?.role || 'ADMIN'}
          userName={activeUser?.fullName || 'کاربر سیستم'}
        />
      </div>

      {/* Settings Modal */}
      <SmartNotificationSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
};
