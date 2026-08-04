/**
 * VikiMedic v2 - Smart Notification Center Slide-down Panel
 * Clean Architecture Layer: Presentation
 */

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Search,
  Pin,
  CheckCheck,
  Clock,
  Settings,
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle2,
  X,
  Filter,
  Trash2,
  ExternalLink,
  ChevronDown,
  Volume2,
  VolumeX,
  RotateCcw,
  ShieldCheck,
  RefreshCw,
  FolderArchive
} from 'lucide-react';
import { notificationEngine } from '../../../infrastructure/notificationEngine';
import {
  SmartNotification,
  NotificationPriority,
  NotificationCategory,
  ActionType
} from '../../../domain/notifications';
import { useClinic } from '../../../application/ClinicContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  currentRole: string;
  userName: string;
}

export const SmartNotificationPanel: React.FC<Props> = ({
  isOpen,
  onClose,
  onOpenSettings,
  currentRole,
  userName
}) => {
  const { setActiveModule, setIsNewPatientModalOpen } = useClinic();

  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'UNREAD' | 'READ' | 'PINNED' | 'ARCHIVED'>('UNREAD');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [snoozeMenuOpenId, setSnoozeMenuOpenId] = useState<string | null>(null);

  const reload = () => {
    const list = notificationEngine.getNotifications({
      role: currentRole,
      statusFilter: activeTab,
      categoryFilter,
      searchQuery
    });
    setNotifications(list);
  };

  useEffect(() => {
    if (isOpen) {
      reload();
    }
    const unsubscribe = notificationEngine.subscribe(() => {
      if (isOpen) reload();
    });
    return () => unsubscribe();
  }, [isOpen, activeTab, categoryFilter, searchQuery, currentRole]);

  if (!isOpen) return null;

  const handleNotificationClick = (notif: SmartNotification) => {
    if (notif.status === 'UNREAD') {
      notificationEngine.markAsRead(notif.id);
    }
  };

  const handleActionExecute = (notif: SmartNotification, actionType: ActionType, payload?: any) => {
    notificationEngine.markAsRead(notif.id);

    switch (actionType) {
      case 'NAVIGATE':
        if (payload) setActiveModule(payload);
        break;
      case 'OPEN_PATIENT':
        setActiveModule('patients');
        break;
      case 'FINALIZE_INVOICE':
        setActiveModule('financials');
        break;
      case 'CREATE_BACKUP':
        setActiveModule('settings');
        break;
      case 'UPDATE_SOFTWARE':
        setActiveModule('dev_environment');
        break;
      case 'OPEN_SETTINGS':
        setActiveModule('settings');
        break;
      case 'GO_TO_SHIFT':
        setActiveModule('queue');
        break;
      default:
        break;
    }
    onClose();
  };

  const handleSnooze = (id: string, minutes: number) => {
    notificationEngine.snoozeNotification(id, minutes);
    setSnoozeMenuOpenId(null);
  };

  const getPriorityBadge = (prio: NotificationPriority) => {
    switch (prio) {
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 bg-rose-500/10 text-rose-700 dark:text-rose-400 font-extrabold text-[10px] rounded-full border border-rose-500/30 flex items-center gap-1 animate-pulse">
            <AlertOctagon className="w-3 h-3 text-rose-600" />
            <span>بحرانی (Critical)</span>
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold text-[10px] rounded-full border border-amber-500/30 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>مهم</span>
          </span>
        );
      case 'NORMAL':
        return (
          <span className="px-2 py-0.5 bg-blue-500/10 text-blue-700 dark:text-blue-400 font-bold text-[10px] rounded-full border border-blue-500/30">
            عادی
          </span>
        );
      case 'LOW':
        return (
          <span className="px-2 py-0.5 bg-slate-500/10 text-slate-600 dark:text-slate-400 font-medium text-[10px] rounded-full border border-slate-500/20">
            کم‌اهمیت
          </span>
        );
    }
  };

  const getCategoryLabel = (cat: NotificationCategory) => {
    const map: Record<NotificationCategory, string> = {
      SYSTEM: 'سیستمی',
      SOFTWARE_UPDATE: 'بروزرسانی',
      PATIENT_ALERT: 'بیمار',
      FINANCIAL: 'مالی',
      SHIFT: 'شیفت',
      APPOINTMENT: 'نوبت‌دهی',
      BACKUP: 'بکاپ',
      SECURITY: 'امنیتی',
      INFO: 'اطلاعات',
      RECEPTION: 'پذیرش',
      MEDICAL: 'پزشکی'
    };
    return map[cat] || cat;
  };

  return (
    <div
      className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="absolute top-9 left-2 w-[440px] max-w-[95vw] max-h-[85vh] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-top-3 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Panel Header */}
        <div className="p-4 bg-[var(--header-bg)] border-b border-[var(--border-subtle)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#283F24]/10 text-[#283F24] rounded-xl border border-[#283F24]/20">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[var(--text-main)]">مرکز اعلان‌های هوشمند VikiMedic</h3>
                <p className="text-[10px] text-[var(--text-muted)] font-mono">
                  Smart Notification Center • نقش: {currentRole}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => notificationEngine.markAllAsRead()}
                title="علامت‌گذاری همه به عنوان خوانده‌شده"
                className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-500/10 transition text-xs font-bold flex items-center gap-1"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenSettings}
                title="تنظیمات صدا و ساعات سکوت"
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-app)] transition"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-app)] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute right-3 top-2.5" />
            <input
              type="text"
              placeholder="جستجو در عنوان، متن، اولویت یا دسته‌بندی..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-9 pl-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] text-xs font-medium outline-none text-[var(--text-main)] placeholder-[var(--text-muted)] focus:border-[#283F24]"
            />
          </div>

          {/* Primary View Tabs */}
          <div className="flex items-center gap-1 bg-[var(--bg-app)] p-1 rounded-xl border border-[var(--border-subtle)] text-xs">
            {(['UNREAD', 'ALL', 'READ', 'PINNED', 'ARCHIVED'] as const).map((tab) => {
              const labels = {
                UNREAD: 'نخوانده',
                ALL: 'همه',
                READ: 'خوانده‌شده',
                PINNED: 'سنجاق‌شده',
                ARCHIVED: 'آرشیو'
              };
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition ${
                    activeTab === tab
                      ? 'bg-[var(--bg-surface)] text-[#283F24] dark:text-emerald-400 shadow-sm border border-[var(--border-subtle)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  {labels[tab]}
                </button>
              );
            })}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] no-scrollbar">
            {[
              { id: 'ALL', label: 'همه دسته‌ها' },
              { id: 'CRITICAL', label: 'بحرانی' },
              { id: 'FINANCIAL', label: 'مالی' },
              { id: 'RECEPTION', label: 'پذیرش' },
              { id: 'MEDICAL', label: 'پزشکی' },
              { id: 'UPDATES', label: 'آپدیت' },
              { id: 'SYSTEM', label: 'سیستم' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setCategoryFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition ${
                  categoryFilter === f.id
                    ? 'bg-[#283F24] text-white'
                    : 'bg-[var(--bg-app)] text-[var(--text-muted)] hover:bg-[var(--border-subtle)]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-[var(--text-muted)] space-y-2">
              <FolderArchive className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-xs font-bold">هیچ اعلانی یافت نشد</p>
              <p className="text-[10px]">اعلانات مربوطه بر اساس فیلتر انتخاب شده خالی می‌باشد.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-3.5 rounded-2xl border transition-all relative space-y-2.5 ${
                  notif.status === 'UNREAD'
                    ? 'bg-[var(--bg-surface)] border-[#283F24]/40 shadow-sm'
                    : 'bg-[var(--bg-app)]/60 border-[var(--border-subtle)] opacity-85'
                }`}
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {notif.status === 'UNREAD' && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    )}
                    <span className="font-extrabold text-xs text-[var(--text-main)]">
                      {notif.title}
                    </span>
                    {getPriorityBadge(notif.priority)}
                    <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 text-[9px] font-mono rounded text-[var(--text-muted)]">
                      {getCategoryLabel(notif.category)}
                    </span>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        notificationEngine.togglePin(notif.id);
                      }}
                      title={notif.isPinned ? 'حذف سنجاق' : 'سنجاق کردن'}
                      className={`p-1 rounded-md transition ${
                        notif.isPinned
                          ? 'text-amber-500 bg-amber-500/10'
                          : 'text-[var(--text-muted)] hover:bg-[var(--bg-app)]'
                      }`}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>

                    {/* Snooze / Remind Later Button */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSnoozeMenuOpenId(snoozeMenuOpenId === notif.id ? null : notif.id);
                        }}
                        title="یادآوری بعدی (Snooze)"
                        className="p-1 rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-app)] transition"
                      >
                        <Clock className="w-3.5 h-3.5" />
                      </button>

                      {snoozeMenuOpenId === notif.id && (
                        <div
                          className="absolute left-0 top-full mt-1 w-36 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-xl p-1 z-50 text-[11px] font-bold"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="text-[9px] text-[var(--text-muted)] px-2 py-1">یادآوری بعدی:</div>
                          <button
                            onClick={() => handleSnooze(notif.id, 60)}
                            className="w-full text-right px-2 py-1 hover:bg-[var(--bg-app)] rounded-lg"
                          >
                            ۱ ساعت بعد
                          </button>
                          <button
                            onClick={() => handleSnooze(notif.id, 1440)}
                            className="w-full text-right px-2 py-1 hover:bg-[var(--bg-app)] rounded-lg"
                          >
                            فردا (۲۴ ساعت)
                          </button>
                          <button
                            onClick={() => handleSnooze(notif.id, 10080)}
                            className="w-full text-right px-2 py-1 hover:bg-[var(--bg-app)] rounded-lg"
                          >
                            هفته آینده
                          </button>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        notificationEngine.archiveNotification(notif.id);
                      }}
                      title="آرشیو"
                      className="p-1 rounded-md text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Body Message */}
                <p className="text-xs text-[var(--text-main)] leading-relaxed font-medium">
                  {notif.message}
                </p>

                {/* Footer Actions & Metadata */}
                <div className="flex items-center justify-between pt-1 border-t border-[var(--border-subtle)]/60 text-[10px] text-[var(--text-muted)] font-mono">
                  <span>{notif.createdAt}</span>

                  {/* Interactive Action Buttons */}
                  {notif.actions && notif.actions.length > 0 && (
                    <div className="flex items-center gap-1.5 font-sans">
                      {notif.actions.map((act, i) => (
                        <button
                          key={i}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActionExecute(notif, act.actionType, act.payload);
                          }}
                          className="px-2.5 py-1 bg-[#283F24] hover:bg-[#35542F] text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 shadow-sm"
                        >
                          <span>{act.label}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  )}

                  {notif.priority === 'CRITICAL' && notif.status !== 'ARCHIVED' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        notificationEngine.resolveNotification(notif.id, userName, 'حل کامل توسط کاربر');
                      }}
                      className="px-2 py-0.5 bg-emerald-600 text-white rounded-lg font-bold text-[10px] hover:bg-emerald-700 transition"
                    >
                      تأیید و حل مشکل
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Panel Footer */}
        <div className="p-3 bg-[var(--header-bg)] border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] font-bold text-[var(--text-muted)]">
          <span>نمایش حداکثر ۱۰۰ مورد از حافظه سیستم</span>
          <button
            onClick={() => {
              notificationEngine.markAllAsRead();
              reload();
            }}
            className="text-[#283F24] hover:underline"
          >
            خوانده شدن همه
          </button>
        </div>
      </div>
    </div>
  );
};
