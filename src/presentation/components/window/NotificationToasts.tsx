/**
 * VikiMedic v2 - Notification Toast Alerts
 * Clean Architecture Layer: Presentation
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { useClinic, NotificationItem } from '../../../application/ClinicContext';

interface SingleToastProps {
  notification: NotificationItem;
  onDismiss: (id: string) => void;
}

const SingleToast: React.FC<SingleToastProps> = ({ notification, onDismiss }) => {
  const getDuration = (type: NotificationItem['type']) => {
    switch (type) {
      case 'success':
        return 2500;
      case 'info':
        return 3000;
      case 'warning':
        return 5000;
      case 'danger':
        return null; // Error remains visible until dismissed
      default:
        return 3000;
    }
  };

  const totalDuration = getDuration(notification.type);
  const [remainingTime, setRemainingTime] = useState<number | null>(totalDuration);
  const [isHovered, setIsHovered] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (totalDuration === null) return; // No countdown for errors

    const intervalTime = 50;
    const timer = setInterval(() => {
      if (isHovered || isExiting) return;

      setRemainingTime((prev) => {
        if (prev === null) return null;
        if (prev <= intervalTime) {
          clearInterval(timer);
          triggerDismiss();
          return 0;
        }
        return prev - intervalTime;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [totalDuration, isHovered, isExiting]);

  const triggerDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(notification.id);
    }, 200);
  };

  const progressPercent =
    totalDuration && remainingTime !== null
      ? Math.max(0, (remainingTime / totalDuration) * 100)
      : 100;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`pointer-events-auto relative overflow-hidden p-3.5 rounded-2xl shadow-2xl border bg-[var(--bg-surface)]/95 text-[var(--text-main)] backdrop-blur-md flex items-start gap-3 transition-all duration-300 transform ${
        isExiting
          ? 'animate-out fade-out slide-out-to-bottom-4 duration-200'
          : 'animate-in fade-in slide-in-from-bottom-4 duration-300'
      } ${
        notification.type === 'success'
          ? 'border-emerald-500/30 shadow-emerald-500/10'
          : notification.type === 'info'
          ? 'border-blue-500/30 shadow-blue-500/10'
          : notification.type === 'warning'
          ? 'border-amber-500/30 shadow-amber-500/10'
          : 'border-rose-500/40 shadow-rose-500/20'
      }`}
    >
      {notification.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />}
      {notification.type === 'info' && <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />}
      {notification.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />}
      {notification.type === 'danger' && <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />}

      <div className="flex-1 text-xs leading-relaxed font-medium">
        {notification.message}
        <div className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5">
          {notification.timestamp}
        </div>
      </div>

      <button
        onClick={triggerDismiss}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-[var(--bg-app)] transition"
        title="بستن"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress Bar */}
      {totalDuration !== null && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200/50 dark:bg-slate-700/50 overflow-hidden rounded-b-2xl">
          <div
            style={{ width: `${progressPercent}%` }}
            className={`h-full transition-all duration-75 ease-linear ${
              notification.type === 'success'
                ? 'bg-emerald-500'
                : notification.type === 'info'
                ? 'bg-blue-500'
                : notification.type === 'warning'
                ? 'bg-amber-500'
                : 'bg-rose-500'
            }`}
          />
        </div>
      )}
    </div>
  );
};

export const NotificationToasts: React.FC = () => {
  const { notifications, removeNotification } = useClinic();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-12 left-6 z-[3500] flex flex-col gap-2 max-w-sm w-full pointer-events-none no-print">
      {notifications.map((n) => (
        <SingleToast key={n.id} notification={n} onDismiss={removeNotification} />
      ))}
    </div>
  );
};

