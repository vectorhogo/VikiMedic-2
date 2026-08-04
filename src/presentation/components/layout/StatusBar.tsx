/**
 * VikiMedic v2 - Desktop Bottom Status Bar
 * Clean Architecture Layer: Presentation
 */

import React, { useEffect, useState } from 'react';
import { Database, Cpu, Clock, Wifi, Save, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useClinic } from '../../../application/ClinicContext';
import { getSupabaseStatus } from '../../../infrastructure/supabaseClient';
import { UpdateService } from '../../../infrastructure/updateService';

export const StatusBar: React.FC = () => {
  const { activeClinic, patients, activeUser } = useClinic();
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const supabaseStatus = getSupabaseStatus();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateStr(now.toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="h-6 bg-[var(--titlebar-bg)] text-slate-400 border-t border-slate-800 text-[11px] flex items-center justify-between px-3 select-none no-print">
      {/* Right Side: Database Connection, Offline, Auto-Save & Backup Status */}
      <div className="flex items-center gap-3">
        {/* Database Status Badge */}
        <div className="flex items-center gap-1.5">
          <Database className={`w-3 h-3 ${supabaseStatus.isConfigured ? 'text-emerald-400' : 'text-amber-400'}`} />
          <span>
            پایگاه داده:{' '}
            <strong className={supabaseStatus.isConfigured ? 'text-emerald-400 font-bold' : 'text-amber-300 font-bold'}>
              {supabaseStatus.isConfigured ? 'PostgreSQL (Cloud Sync)' : 'محلی (IndexedDB Local)'}
            </strong>
          </span>
        </div>

        <div className="h-3 w-px bg-slate-700 mx-0.5" />

        {/* Offline Status */}
        <div className="flex items-center gap-1 text-emerald-400">
          <Wifi className="w-3 h-3" />
          <span>حالت آفلاین دسکتاپ: <strong className="font-bold">آماده به کار</strong></span>
        </div>

        <div className="h-3 w-px bg-slate-700 mx-0.5 hidden sm:block" />

        {/* Auto Save Status */}
        <div className="hidden sm:flex items-center gap-1 text-slate-300">
          <Save className="w-3 h-3 text-blue-400" />
          <span>ذخیره خودکار: <strong className="text-emerald-400 font-bold">فعال</strong></span>
        </div>

        <div className="h-3 w-px bg-slate-700 mx-0.5 hidden md:block" />

        {/* Backup Status */}
        <div className="hidden md:flex items-center gap-1 text-slate-300">
          <ShieldCheck className="w-3 h-3 text-purple-400" />
          <span>پشتیبان‌گیری: <strong className="text-slate-200">به‌روز (Up to Date)</strong></span>
        </div>
      </div>

      {/* Left Side: Active Clinic, Version & Clock */}
      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-1 text-[10px] text-slate-400">
          <span>شعبه: <strong className="text-slate-200">{activeClinic.name}</strong></span>
        </div>

        <div className="h-3 w-px bg-slate-700 hidden lg:block" />

        {/* System Version */}
        <div className="flex items-center gap-1 text-[10px] text-sky-300 font-mono bg-sky-900/40 px-1.5 py-0.2 rounded border border-sky-700/50">
          <span>v{UpdateService.getCurrentVersion()}</span>
        </div>

        <div className="h-3 w-px bg-slate-700" />

        {/* Jalali Date & Time */}
        <div className="flex items-center gap-2 font-mono text-slate-300">
          <span>{dateStr}</span>
          <span className="text-emerald-400 font-bold">{timeStr}</span>
        </div>
      </div>
    </footer>
  );
};

