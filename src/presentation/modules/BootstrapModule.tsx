/**
 * VikiMedic v2 - Workspace Bootstrap & Infrastructure Foundation Explorer
 * Clean Architecture Layer: Presentation
 *
 * Interactive module displaying Workspace Directory Topology, Central App Configuration,
 * Environment Switcher, Feature Flags Toggle, Asset Manager Registry, Design Tokens,
 * and Build Profiles Inspector.
 */

import React, { useState } from 'react';
import {
  FolderTree,
  Sliders,
  Settings2,
  Package,
  Layers,
  Palette,
  Terminal,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  Monitor,
  Globe,
  ToggleLeft,
  ToggleRight,
  Printer,
  FileCode,
  Sparkles,
} from 'lucide-react';
import { useClinic } from '../../application/ClinicContext';
import {
  APP_CONFIG,
  setEnvironmentMode,
  setTargetPlatform,
  toggleFeatureFlag,
} from '../../config/appConfig';
import { BUILD_PROFILES } from '../../config/buildProfiles';
import { DESIGN_TOKENS_BOOTSTRAP } from '../../config/designTokensBootstrap';
import { ASSET_REGISTRY } from '../../assets/assetRegistry';
import { EnvironmentMode, TargetPlatform } from '../../packages/types/bootstrap';

export const BootstrapModule: React.FC = () => {
  const { addNotification } = useClinic();
  const [activeTab, setActiveTab] = useState<'topology' | 'config' | 'assets' | 'tokens' | 'build_profiles'>('topology');

  const [currentConfig, setCurrentConfig] = useState({ ...APP_CONFIG });
  const [selectedProfileId, setSelectedProfileId] = useState<string>('desktop_dev');

  const handleEnvChange = (env: EnvironmentMode) => {
    const updated = setEnvironmentMode(env);
    setCurrentConfig({ ...updated });
    addNotification(`محیط کاری برنامه به ${env} تغییر یافت.`, 'info');
  };

  const handlePlatformChange = (platform: TargetPlatform) => {
    const updated = setTargetPlatform(platform);
    setCurrentConfig({ ...updated });
    addNotification(`پلتفرم هدف به ${platform} تغییر یافت.`, 'info');
  };

  const handleToggleFlag = (flagKey: keyof typeof APP_CONFIG.featureFlags) => {
    const updated = toggleFeatureFlag(flagKey);
    setCurrentConfig({ ...updated });
    addNotification(`وضعیت ویژگی ${flagKey} تغییر یافت.`, 'success');
  };

  const workspaceFolders = [
    { name: 'apps/desktop', purposeFA: 'پسته اجرایی Tauri + React (ویندوز)', status: 'ACTIVE' },
    { name: 'apps/web', purposeFA: 'پسته اجرایی وب SPA (Vite)', status: 'ACTIVE' },
    { name: 'packages/ui', purposeFA: 'کامپوننت‌های سیستم طراحی و UI', status: 'ACTIVE' },
    { name: 'packages/shared', purposeFA: 'موجودیت‌های دامنه و قوانین کسب‌وکار', status: 'ACTIVE' },
    { name: 'packages/types', purposeFA: 'اینترفیس‌ها و تایپ‌های تایپ‌اسکریپت', status: 'ACTIVE' },
    { name: 'packages/utils', purposeFA: 'توابع کمکی تاریخ شمسی و مبالغ مالی', status: 'ACTIVE' },
    { name: 'packages/services', purposeFA: 'سرویس‌های همگام‌سازی و API', status: 'ACTIVE' },
    { name: 'config/', purposeFA: 'مدیریت مرکزی تنظیمات و پروپ‌های محیطی', status: 'ACTIVE' },
    { name: 'assets/fonts', purposeFA: 'فونت‌های بومی IRANYekanX و Vazirmatn', status: 'ACTIVE' },
    { name: 'assets/themes', purposeFA: 'تم‌های سه‌گانه سفید، تاریک و رز لوکس', status: 'ACTIVE' },
    { name: 'assets/templates', purposeFA: 'قالب‌های چاپ نسخه A5 و رسید حرارتی', status: 'ACTIVE' },
    { name: 'docs/', purposeFA: 'مستندات معماری، ADRs و فرآیندهای QA', status: 'ACTIVE' },
    { name: 'supabase/', purposeFA: 'اسکریپت‌ها و مایگریشن‌های دیتابیس Supabase', status: 'ACTIVE' },
    { name: 'scripts/', purposeFA: 'اسکریپت‌های کامپایل و CI/CD نهایی', status: 'ACTIVE' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold tracking-wide uppercase">
              Phase 01.5 - Part 01
            </span>
            <span className="bg-purple-500/20 text-purple-300 border border-purple-400/30 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold">
              Project Bootstrap & Workspace Infrastructure
            </span>
          </div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <FolderTree className="w-6 h-6 text-indigo-400" />
            <span>زیرساخت و پیکربندی مرکزی فضای کاری (Project Bootstrap)</span>
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            پایگاه دائمی پروژه VikiMedic v2: مدیریت محیط، تنظیمات مرکزی، مدیریت دارایی‌ها، دیزاین توکن‌ها و پروفایل‌های کامپایل دسکتاپ و وب.
          </p>
        </div>

        <div className="z-10 flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 px-3 py-2 rounded-xl text-xs font-bold text-indigo-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>پایه دائمی و بدون نیاز به بازآرایی مجدد</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('topology')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'topology' ? 'bg-[var(--accent-primary)] text-white shadow-md' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>ساختار پوشه‌ها (Workspace Directory)</span>
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'config' ? 'bg-[var(--accent-primary)] text-white shadow-md' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>تنظیمات مرکزی & محیط‌کار</span>
        </button>

        <button
          onClick={() => setActiveTab('assets')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'assets' ? 'bg-[var(--accent-primary)] text-white shadow-md' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>مدیریت دارایی‌ها (Asset Registry)</span>
        </button>

        <button
          onClick={() => setActiveTab('tokens')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'tokens' ? 'bg-[var(--accent-primary)] text-white shadow-md' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>دیزاین توکن‌های سیستم</span>
        </button>

        <button
          onClick={() => setActiveTab('build_profiles')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'build_profiles' ? 'bg-[var(--accent-primary)] text-white shadow-md' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>پروفایل‌های ساخت (Build Profiles)</span>
        </button>
      </div>

      {/* Tab 1: Topology */}
      {activeTab === 'topology' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 rounded-2xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-[var(--text-main)]">ساختار پوشه‌ها و بسته‌های پروژه (Workspace Packages)</h3>
              <p className="text-xs text-[var(--text-muted)]">تفکیک بسته‌ها جهت بازاستفاده در دسکتاپ و وب بدون همپوشانی.</p>
            </div>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-xl font-mono font-bold">
              ۱۴ پوشه استاندارد ایجاد گردید
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {workspaceFolders.map((item, idx) => (
              <div key={idx} className="p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FolderTree className="w-4 h-4 text-indigo-400" />
                  <div>
                    <span className="font-mono font-bold text-[var(--text-main)] block">{item.name}</span>
                    <span className="text-[var(--text-muted)]">{item.purposeFA}</span>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full">
                  فعال
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Config & Environment */}
      {activeTab === 'config' && (
        <div className="space-y-6">
          {/* Environment & Platform Controls */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 rounded-2xl space-y-4 shadow-sm">
            <h3 className="font-bold text-base text-[var(--text-main)]">مدیریت محیط و پلتفرم هدف (Environment Switcher)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Environment Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-muted)] block">محیط اجرایی فعال (Environment Mode):</label>
                <div className="flex gap-2">
                  {(['DEVELOPMENT', 'STAGING', 'PRODUCTION'] as EnvironmentMode[]).map((env) => (
                    <button
                      key={env}
                      onClick={() => handleEnvChange(env)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition ${
                        currentConfig.environment === env
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                          : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-muted)]'
                      }`}
                    >
                      {env}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Platform */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-muted)] block">پلتفرم هدف (Target Platform):</label>
                <div className="flex gap-2">
                  {(['WINDOWS_DESKTOP', 'WEB_SPA', 'ANDROID_MOBILE'] as TargetPlatform[]).map((plat) => (
                    <button
                      key={plat}
                      onClick={() => handlePlatformChange(plat)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition ${
                        currentConfig.targetPlatform === plat
                          ? 'bg-purple-600 text-white border-purple-500 shadow'
                          : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-muted)]'
                      }`}
                    >
                      {plat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Central Values & Feature Flags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Central Info */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 rounded-2xl space-y-3 shadow-sm text-xs">
              <h3 className="font-bold text-sm text-[var(--text-main)] mb-2">اطلاعات ثابت پیکربندی (Central Core)</h3>
              <div className="flex justify-between p-2 bg-[var(--bg-surface)] rounded-lg">
                <span className="text-[var(--text-muted)]">نام برنامه:</span>
                <span className="font-bold text-[var(--text-main)]">{currentConfig.appNameFA}</span>
              </div>
              <div className="flex justify-between p-2 bg-[var(--bg-surface)] rounded-lg">
                <span className="text-[var(--text-muted)]">نام درمانگاه:</span>
                <span className="font-bold text-[var(--text-main)]">{currentConfig.clinicNameFA}</span>
              </div>
              <div className="flex justify-between p-2 bg-[var(--bg-surface)] rounded-lg">
                <span className="text-[var(--text-muted)]">نسخه زیرساخت:</span>
                <span className="font-mono font-bold text-indigo-400">{currentConfig.version}</span>
              </div>
              <div className="flex justify-between p-2 bg-[var(--bg-surface)] rounded-lg">
                <span className="text-[var(--text-muted)]">آدرس Supabase:</span>
                <span className="font-mono text-[10px] text-slate-400 truncate max-w-[200px]">{currentConfig.supabase.url}</span>
              </div>
            </div>

            {/* Feature Flags */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 rounded-2xl space-y-3 shadow-sm text-xs">
              <h3 className="font-bold text-sm text-[var(--text-main)] mb-2">پرچم‌های ویژگی‌ها (Feature Flags)</h3>
              <div className="space-y-2">
                {Object.entries(currentConfig.featureFlags).map(([key, val]) => (
                  <div
                    key={key}
                    onClick={() => handleToggleFlag(key as keyof typeof APP_CONFIG.featureFlags)}
                    className="p-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg flex items-center justify-between cursor-pointer hover:border-indigo-500/50 transition"
                  >
                    <span className="font-mono font-bold text-[var(--text-main)]">{key}</span>
                    <div className={`flex items-center gap-1 font-bold ${val ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {val ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                      <span>{val ? 'فعال' : 'غیرفعال'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Asset Registry */}
      {activeTab === 'assets' && (
        <div className="space-y-6">
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 rounded-2xl space-y-4 shadow-sm text-xs">
            <h3 className="font-bold text-base text-[var(--text-main)]">ثبت و مدیریت متمرکز دارایی‌ها (Asset Registry)</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Fonts */}
              <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-2">
                <span className="font-bold text-indigo-400 block">فونت‌های سیستم (Fonts):</span>
                {ASSET_REGISTRY.fonts.map((f, i) => (
                  <div key={i} className="p-2 bg-[var(--bg-card)] rounded border border-[var(--border-subtle)] flex justify-between">
                    <span className="font-bold text-[var(--text-main)]">{f.name}</span>
                    <span className="text-[10px] text-[var(--text-muted)]">{f.type}</span>
                  </div>
                ))}
              </div>

              {/* Logos */}
              <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-2">
                <span className="font-bold text-purple-400 block">لوگوها و نشان‌های رسمی:</span>
                {ASSET_REGISTRY.logos.map((l, i) => (
                  <div key={i} className="p-2 bg-[var(--bg-card)] rounded border border-[var(--border-subtle)] flex justify-between">
                    <span className="font-bold text-[var(--text-main)]">{l.name}</span>
                  </div>
                ))}
              </div>

              {/* Print Templates */}
              <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-2">
                <span className="font-bold text-emerald-400 block">قالب‌های چاپ فیزیکی:</span>
                {ASSET_REGISTRY.printTemplates.map((p, i) => (
                  <div key={i} className="p-2 bg-[var(--bg-card)] rounded border border-[var(--border-subtle)] flex items-center gap-2">
                    <Printer className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-bold text-[var(--text-main)]">{p.nameFA}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Design Tokens */}
      {activeTab === 'tokens' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 rounded-2xl space-y-4 shadow-sm text-xs">
          <h3 className="font-bold text-base text-[var(--text-main)]">دیزاین توکن‌های پروژه (Design Tokens)</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] space-y-2">
              <span className="font-bold text-blue-400 block">شبکه فواصل (4px Grid):</span>
              <p className="text-[var(--text-muted)]">xs: 4px | sm: 8px | md: 16px | lg: 24px | xl: 32px</p>
            </div>

            <div className="p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] space-y-2">
              <span className="font-bold text-emerald-400 block">فرمول شعاع گوشه‌ها (Radii Rule):</span>
              <p className="text-[var(--text-muted)]">Inner Radius = Outer Radius - Padding</p>
            </div>

            <div className="p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] space-y-2">
              <span className="font-bold text-purple-400 block">فونت اصلی:</span>
              <p className="font-mono text-[var(--text-main)]">{DESIGN_TOKENS_BOOTSTRAP.typography.fontFamilyPrimary}</p>
            </div>

            <div className="p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] space-y-2">
              <span className="font-bold text-amber-400 block">سرعت انیمیشن‌ها:</span>
              <p className="text-[var(--text-muted)]">Fast: 150ms | Normal: 250ms | Slow: 400ms</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Build Profiles */}
      {activeTab === 'build_profiles' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 rounded-2xl space-y-4 shadow-sm text-xs">
          <h3 className="font-bold text-base text-[var(--text-main)]">پروفایل‌های ساخت و کامپایل (Build Profiles)</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BUILD_PROFILES.map((prof) => (
              <div
                key={prof.id}
                onClick={() => setSelectedProfileId(prof.id)}
                className={`p-4 rounded-xl border transition cursor-pointer space-y-2 ${
                  selectedProfileId === prof.id
                    ? 'bg-indigo-500/10 border-indigo-500 shadow-md'
                    : 'bg-[var(--bg-surface)] border-[var(--border-subtle)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[var(--text-main)]">{prof.nameFA}</span>
                  <span className="font-mono text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-bold">
                    {prof.platform}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-[var(--text-muted)]">
                  <div>محیط: <span className="font-bold text-[var(--text-main)]">{prof.environment}</span></div>
                  <div>تارگت باندل: <span className="font-mono font-bold text-[var(--text-main)]">{prof.bundleTarget}</span></div>
                  <div>Tauri Native: <span className="font-bold text-emerald-400">{prof.tauriIntegration ? 'بله' : 'خیر'}</span></div>
                  <div>پورت: <span className="font-mono font-bold text-[var(--text-main)]">{prof.port}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
