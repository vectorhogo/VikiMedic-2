/**
 * VikiMedic v2 - Staff & RBAC Permissions Module
 * Clean Architecture Layer: Presentation
 */

import React, { useState } from 'react';
import { ShieldCheck, Users, Key, ShieldAlert } from 'lucide-react';
import { useClinic } from '../../application/ClinicContext';
import { ROLE_TITLES_FA } from '../../domain/permissions';
import { RoleManagementPanel } from '../components/roles/RoleManagementPanel';
import { PermissionGuard } from '../components/common/PermissionGuard';

export const StaffAccessModule: React.FC = () => {
  const { staffList, switchUserRole, auditLogs } = useClinic();
  const [viewMode, setViewMode] = useState<'engine' | 'staff_list'>('engine');

  return (
    <div className="p-4 sm:p-6 space-y-6 text-[var(--text-main)] max-w-7xl mx-auto animate-in fade-in duration-150">
      {/* Top Module Sub-Navigation */}
      <div className="bg-[var(--bg-surface)] p-3 rounded-2xl border border-[var(--border-subtle)] shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('engine')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition ${
              viewMode === 'engine'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>موتور مدیریت نقش‌ها و دسترسی‌های RBAC (Phase 03 - Part 02)</span>
          </button>

          <button
            onClick={() => setViewMode('staff_list')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition ${
              viewMode === 'staff_list'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>فهرست پرسنل و شبیه‌سازی ورود ({staffList.length})</span>
          </button>
        </div>
      </div>

      {viewMode === 'engine' ? (
        <PermissionGuard
          module="USERS"
          action="VIEW"
          fallback={
            <div className="p-12 text-center bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-bold text-sm">
              شما مجوز لازم جهت دسترسی به تنظیمات امنیتی و مدیریت نقش‌های سیستم را ندارید.
            </div>
          }
        >
          <RoleManagementPanel />
        </PermissionGuard>
      ) : (
        <div className="space-y-6">
          {/* Staff Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staffList.map((staff) => (
              <div
                key={staff.id}
                className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                      {staff.fullName[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">{staff.fullName}</h3>
                      <p className="text-[11px] text-[var(--text-muted)]">{staff.title}</p>
                    </div>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" title="کاربر آنلاین" />
                </div>

                <div className="p-3 bg-[var(--bg-app)] rounded-xl border border-[var(--border-subtle)] text-xs space-y-1">
                  <div>
                    <strong>نقش امنیتی: </strong>
                    {ROLE_TITLES_FA[staff.role] || staff.role}
                  </div>
                  <div>
                    <strong>شماره تماس: </strong>
                    <span className="font-mono">{staff.phone}</span>
                  </div>
                  {staff.medicalCouncilNumber && (
                    <div>
                      <strong>نظام پزشکی: </strong>
                      <span className="font-mono">{staff.medicalCouncilNumber}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => switchUserRole(staff.role)}
                  className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-xs font-bold transition"
                >
                  شبیه‌سازی ورود با این نقش
                </button>
              </div>
            ))}
          </div>

          {/* Audit Logs Table */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-sm flex items-center gap-2 text-amber-600">
              <ShieldAlert className="w-4 h-4" />
              <span>ثبت رویدادها و لاگ‌های امنیتی عمومی (Audit Logs)</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/60 border-b border-[var(--border-subtle)] text-[var(--text-muted)]">
                    <th className="p-2.5 font-bold">زمان رویداد</th>
                    <th className="p-2.5 font-bold">کاربر انجام‌دهنده</th>
                    <th className="p-2.5 font-bold">نقش</th>
                    <th className="p-2.5 font-bold">عملیات</th>
                    <th className="p-2.5 font-bold">جزئیات رویداد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-2.5 font-mono text-[var(--text-muted)]">{log.timestamp}</td>
                      <td className="p-2.5 font-bold">{log.userName}</td>
                      <td className="p-2.5">
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] font-bold">
                          {log.userRole}
                        </span>
                      </td>
                      <td className="p-2.5 font-bold text-blue-600">{log.action}</td>
                      <td className="p-2.5 text-[var(--text-muted)]">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

