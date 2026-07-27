/**
 * VikiMedic v2 - Windows Desktop Context Menu
 * Clean Architecture Layer: Presentation
 */

import React, { useEffect, useRef } from 'react';
import {
  FileText,
  Phone,
  Printer,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  Receipt,
  Stethoscope,
} from 'lucide-react';
import { useClinic } from '../../../application/ClinicContext';

export const ContextMenu: React.FC = () => {
  const {
    contextMenu,
    hideContextMenu,
    setActiveModule,
    updateQueueStatus,
    setActivePrintInvoice,
    addNotification,
  } = useClinic();

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        hideContextMenu();
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [hideContextMenu]);

  if (!contextMenu.visible) return null;

  const { x, y, targetType, data } = contextMenu;

  return (
    <div
      ref={menuRef}
      style={{ top: `${y}px`, left: `${x}px` }}
      className="fixed z-50 w-56 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xl py-1 text-[var(--text-main)] text-xs animate-in fade-in zoom-in-95 duration-100 select-none"
    >
      {targetType === 'patient' && (
        <>
          <div className="px-3 py-1.5 text-[10px] font-bold text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
            عملیات پرونده: {data.firstName} {data.lastName}
          </div>
          <button
            onClick={() => {
              setActiveModule('patients');
              hideContextMenu();
            }}
            className="w-full text-right px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center gap-2"
          >
            <FileText className="w-3.5 h-3.5 text-blue-500" />
            <span>مشاهده پرونده پزشکی کامل</span>
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(data.phone);
              addNotification(`شماره همراه ${data.phone} کپی شد.`, 'info');
              hideContextMenu();
            }}
            className="w-full text-right px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center gap-2"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-500" />
            <span>کپی شماره تماس ({data.phone})</span>
          </button>
          <button
            onClick={() => {
              setActiveModule('doctor_emr');
              hideContextMenu();
            }}
            className="w-full text-right px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center gap-2"
          >
            <Stethoscope className="w-3.5 h-3.5 text-purple-500" />
            <span>شروع معاینه و ثبت نسخه</span>
          </button>
        </>
      )}

      {targetType === 'queue' && (
        <>
          <div className="px-3 py-1.5 text-[10px] font-bold text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
            نوبت شماره {data.queueNumber} - {data.patientName}
          </div>
          <button
            onClick={() => {
              updateQueueStatus(data.id, 'IN_CONSULTATION');
              hideContextMenu();
            }}
            className="w-full text-right px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center gap-2"
          >
            <Stethoscope className="w-3.5 h-3.5 text-blue-500" />
            <span>فراخوان به اتاق پزشک (در حال معاینه)</span>
          </button>
          <button
            onClick={() => {
              updateQueueStatus(data.id, 'COMPLETED');
              hideContextMenu();
            }}
            className="w-full text-right px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center gap-2"
          >
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>علامت‌گذاری به‌عنوان پایان ویزیت</span>
          </button>
          <button
            onClick={() => {
              updateQueueStatus(data.id, 'CANCELLED');
              hideContextMenu();
            }}
            className="w-full text-right px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center gap-2 text-rose-500"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>لغو و انصراف نوبت</span>
          </button>
        </>
      )}

      {targetType === 'transaction' && (
        <>
          <div className="px-3 py-1.5 text-[10px] font-bold text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
            فاکتور {data.invoiceNumber}
          </div>
          <button
            onClick={() => {
              setActivePrintInvoice(data);
              hideContextMenu();
            }}
            className="w-full text-right px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center gap-2"
          >
            <Printer className="w-3.5 h-3.5 text-blue-500" />
            <span>چاپ رسمی فاکتور بیمار</span>
          </button>
        </>
      )}
    </div>
  );
};
