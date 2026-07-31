/**
 * VikiMedic v2 - Visual Identity & Design System Showcase Module
 * Clean Architecture Layer: Presentation
 */

import React, { useState } from 'react';
import {
  Palette,
  Type,
  Layers,
  MousePointerClick,
  Table as TableIcon,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Sparkles,
  Lock,
  RotateCcw,
  Save,
  LayoutGrid,
  Shield,
  Stethoscope,
  ChevronDown,
  Download,
  Calendar,
  User,
  Activity,
  Loader2,
} from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { useClinic } from '../../application/ClinicContext';

export const DesignSystemModule: React.FC = () => {
  const { theme, setTheme, themeTitleFA, isRoseUnlocked, setIsPinModalOpen } = useTheme();
  const { addNotification, setActiveModule } = useClinic();

  // Active Showcase Tab
  const [activeTab, setActiveTab] = useState<'buttons' | 'inputs' | 'cards' | 'tables' | 'colors' | 'typography' | 'workspace'>('buttons');

  // Input State Demos
  const [sampleTextInput, setSampleTextInput] = useState('دکتر علیرضا محمدی');
  const [sampleSearch, setSampleSearch] = useState('');
  const [sampleSelect, setSampleSelect] = useState('SPECIALIST');
  const [sampleDate, setSampleDate] = useState('۱۴۰۳/۰۵/۱۵');
  const [sampleTime, setSampleTime] = useState('۱۰:۳۰');
  const [sampleTextarea, setSampleTextarea] = useState('بیمار با شکایت علائم سرفه خشک و تب خفیف مراجعه کرده است.');

  // Table State Demos
  const [selectedRows, setSelectedRows] = useState<string[]>(['1']);
  const [buttonLoading, setButtonLoading] = useState(false);

  // Workspace Profile State
  const [currentProfile, setCurrentProfile] = useState('میز کار جامع پزشکی');

  const triggerLoading = () => {
    setButtonLoading(true);
    setTimeout(() => {
      setButtonLoading(false);
      addNotification('عملیات نمونه سیستم طراحی با موفقیت انجام شد.', 'success');
    }, 1500);
  };

  const handleSaveProfile = (profileName: string) => {
    setCurrentProfile(profileName);
    localStorage.setItem('vikimedic_v2_workspace_profile', profileName);
    addNotification(`پروفایل محیط کار "${profileName}" ذخیره شد.`, 'success');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900/90 via-slate-900 to-purple-900/80 border border-blue-500/30 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold tracking-wide uppercase">
              Phase 01 - Part 02
            </span>
            <span className="bg-purple-500/20 text-purple-300 border border-purple-400/30 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold">
              Permanent Design System
            </span>
          </div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Palette className="w-6 h-6 text-blue-400" />
            <span>سیستم طراحی و هویت بصری ویکی‌مدیک (VikiMedic Design System)</span>
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            مجموعه مؤلفه‌های استاندارد، پالت رنگی سه‌گانه، تایپوگرافی فارسی، سیستم دکمه‌ها، کارت‌ها، فرم‌ها و جدول‌های استاندارد دستکتاپ.
          </p>
        </div>

        {/* Quick Theme Switcher Badge */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 p-3 rounded-xl z-10 shrink-0 text-right space-y-2">
          <div className="text-[10px] text-slate-400 font-bold uppercase">تم فعال کنونی:</div>
          <div className="text-xs font-bold text-blue-300">{themeTitleFA}</div>
          <div className="flex items-center gap-1.5 pt-1">
            <button
              onClick={() => setTheme('theme-default')}
              className={`px-2 py-1 text-[10px] rounded-lg border transition ${
                theme === 'theme-default' ? 'bg-blue-600 text-white font-bold border-blue-400' : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              Medical White
            </button>
            <button
              onClick={() => setTheme('clinic-olive')}
              className={`px-2 py-1 text-[10px] rounded-lg border transition ${
                theme === 'clinic-olive' ? 'bg-[#6F7952] text-white font-bold border-[#A7AE8A]' : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              Minimal Olive
            </button>
            <button
              onClick={() => setTheme('theme-dark')}
              className={`px-2 py-1 text-[10px] rounded-lg border transition ${
                theme === 'theme-dark' ? 'bg-purple-600 text-white font-bold border-purple-400' : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              Dark Theme
            </button>
            <button
              onClick={() => {
                if (isRoseUnlocked) {
                  setTheme('theme-rose');
                } else {
                  setIsPinModalOpen(true);
                }
              }}
              className={`px-2 py-1 text-[10px] rounded-lg border transition flex items-center gap-1 ${
                theme === 'theme-rose' ? 'bg-rose-600 text-white font-bold border-rose-400' : 'bg-slate-800 text-rose-300 border-slate-700'
              }`}
            >
              <Sparkles className="w-2.5 h-2.5" />
              <span>Rose Luxe</span>
            </button>
          </div>
        </div>
      </div>

      {/* Design System Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('buttons')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'buttons' ? 'bg-[var(--accent-primary)] text-white shadow-md' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <MousePointerClick className="w-4 h-4" />
          <span>سیستم دکمه‌ها (Buttons)</span>
        </button>

        <button
          onClick={() => setActiveTab('inputs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'inputs' ? 'bg-[var(--accent-primary)] text-white shadow-md' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>فرم‌ها و ورودی‌ها (Inputs & Form)</span>
        </button>

        <button
          onClick={() => setActiveTab('cards')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'cards' ? 'bg-[var(--accent-primary)] text-white shadow-md' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>کارت‌ها و پانل‌ها (Cards & Glass)</span>
        </button>

        <button
          onClick={() => setActiveTab('tables')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'tables' ? 'bg-[var(--accent-primary)] text-white shadow-md' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <TableIcon className="w-4 h-4" />
          <span>جدول‌ها و لیست‌ها (Data Tables)</span>
        </button>

        <button
          onClick={() => setActiveTab('colors')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'colors' ? 'bg-[var(--accent-primary)] text-white shadow-md' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>پالت رنگ‌ها و تم‌ها (Color Tokens)</span>
        </button>

        <button
          onClick={() => setActiveTab('typography')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'typography' ? 'bg-[var(--accent-primary)] text-white shadow-md' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <Type className="w-4 h-4" />
          <span>تایپوگرافی و اعداد (Typography)</span>
        </button>

        <button
          onClick={() => setActiveTab('workspace')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'workspace' ? 'bg-[var(--accent-primary)] text-white shadow-md' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>مدیریت محیط کار (Workspace Manager)</span>
        </button>
      </div>

      {/* Tab 1: Button System */}
      {activeTab === 'buttons' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="font-bold text-base mb-1">سیستم جامع دکمه‌های کاربردی (Button System)</h3>
            <p className="text-xs text-[var(--text-muted)]">
              شعاع گوشه‌های ۱۴ تا ۱۶ پیکسل، انیمیشن‌های نرم ۱۵۰ تا ۲۲۰ میلی‌ثانیه و فیدبک بصری هاور/فوکوس/فشردن.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Primary Button */}
            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-2">
              <span className="text-[11px] font-bold text-[var(--text-muted)] block uppercase">Primary Action</span>
              <button
                onClick={triggerLoading}
                className="w-full bg-[var(--accent-primary)] hover:opacity-90 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition duration-150 flex items-center justify-center gap-2 active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>ثبت اطلاعات کلینیک</span>
              </button>
            </div>

            {/* Secondary Button */}
            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-2">
              <span className="text-[11px] font-bold text-[var(--text-muted)] block uppercase">Secondary Action</span>
              <button
                onClick={() => addNotification('دکمه ثانویه بازخوانی شد.', 'info')}
                className="w-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-[var(--text-main)] font-bold py-2.5 px-4 rounded-xl transition duration-150 flex items-center justify-center gap-2 active:scale-95"
              >
                <RotateCcw className="w-4 h-4 text-[var(--text-muted)]" />
                <span>بازخوانی مجدد</span>
              </button>
            </div>

            {/* Outlined Button */}
            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-2">
              <span className="text-[11px] font-bold text-[var(--text-muted)] block uppercase">Outlined Style</span>
              <button className="w-full border-2 border-[var(--border-subtle)] hover:border-[var(--accent-primary)] text-[var(--text-main)] hover:text-[var(--accent-primary)] font-bold py-2.5 px-4 rounded-xl transition duration-150 flex items-center justify-center gap-2">
                <Sliders className="w-4 h-4" />
                <span>تنظیمات پیشرفته</span>
              </button>
            </div>

            {/* Ghost Button */}
            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-2">
              <span className="text-[11px] font-bold text-[var(--text-muted)] block uppercase">Ghost Style</span>
              <button className="w-full hover:bg-[var(--accent-light)] text-[var(--text-main)] font-bold py-2.5 px-4 rounded-xl transition duration-150 flex items-center justify-center gap-2">
                <Search className="w-4 h-4 text-[var(--text-muted)]" />
                <span>جستجو بدون حاشیه</span>
              </button>
            </div>

            {/* Success Button */}
            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-2">
              <span className="text-[11px] font-bold text-[var(--text-muted)] block uppercase">Success Action</span>
              <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition duration-150 flex items-center justify-center gap-2 active:scale-95">
                <CheckCircle2 className="w-4 h-4" />
                <span>تأیید و صدور فاکتور</span>
              </button>
            </div>

            {/* Danger Button */}
            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-2">
              <span className="text-[11px] font-bold text-[var(--text-muted)] block uppercase">Danger Action</span>
              <button className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition duration-150 flex items-center justify-center gap-2 active:scale-95">
                <AlertCircle className="w-4 h-4" />
                <span>لغو نوبت بیمار</span>
              </button>
            </div>

            {/* Loading State Button */}
            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-2">
              <span className="text-[11px] font-bold text-[var(--text-muted)] block uppercase">Loading State</span>
              <button
                disabled={buttonLoading}
                onClick={triggerLoading}
                className="w-full bg-[var(--accent-primary)] text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition duration-150 flex items-center justify-center gap-2 opacity-90 cursor-wait"
              >
                {buttonLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>در حال پردازش...</span>
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4" />
                    <span>امتحان حالت بارگذاری</span>
                  </>
                )}
              </button>
            </div>

            {/* Disabled State Button */}
            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-2">
              <span className="text-[11px] font-bold text-[var(--text-muted)] block uppercase">Disabled State</span>
              <button disabled className="w-full bg-slate-300 dark:bg-slate-800 text-slate-500 font-bold py-2.5 px-4 rounded-xl cursor-not-allowed opacity-60 flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" />
                <span>غیرفعال (محدودیت دسترسی)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Inputs & Form Controls */}
      {activeTab === 'inputs' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="font-bold text-base mb-1">سیستم ورودی‌ها و فرم‌های دسکتاپ (Input Controls)</h3>
            <p className="text-xs text-[var(--text-muted)]">
              پشتیبانی کامل از تایپ فارسی، کیبورد راست‌به‌چپ (RTL)، اعتبارسنجی زنده و استایل یکپارچه.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Standard Text Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[var(--text-main)]">نام و نام خانوادگی بیمار / پزشک:</label>
              <div className="relative">
                <User className="w-4 h-4 absolute right-3 top-3 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={sampleTextInput}
                  onChange={(e) => setSampleTextInput(e.target.value)}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl pr-9 pl-3 py-2 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-light)] transition"
                />
              </div>
            </div>

            {/* Search Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[var(--text-main)]">جستجوی هوشمند پرونده (کد ملی / نام):</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute right-3 top-3 text-blue-500" />
                <input
                  type="text"
                  placeholder="مثلا: ۰۰۱۲۳۴۵۶۷۸ یا احمدی..."
                  value={sampleSearch}
                  onChange={(e) => setSampleSearch(e.target.value)}
                  className="w-full bg-[var(--bg-surface)] border border-blue-500/40 rounded-xl pr-9 pl-3 py-2 text-xs text-[var(--text-main)] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                />
              </div>
            </div>

            {/* Select Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[var(--text-main)]">نوع و تخصص پزشکی:</label>
              <div className="relative">
                <select
                  value={sampleSelect}
                  onChange={(e) => setSampleSelect(e.target.value)}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-primary)] transition appearance-none"
                >
                  <option value="GENERAL">پزشک عمومی و معاینه اولیه</option>
                  <option value="SPECIALIST">متخصص داخلی و غدد</option>
                  <option value="CARDIOLOGY">متخصص قلب و عروق</option>
                  <option value="DENTAL">دندانپزشک و جراح فک</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute left-3 top-2.5 text-[var(--text-muted)] pointer-events-none" />
              </div>
            </div>

            {/* Persian Date Picker Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[var(--text-main)]">تاریخ و نوبت ویزیت (شمسی):</label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute right-3 top-3 text-emerald-500" />
                <input
                  type="text"
                  value={sampleDate}
                  onChange={(e) => setSampleDate(e.target.value)}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl pr-9 pl-3 py-2 text-xs text-[var(--text-main)] font-mono focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            {/* Time Picker Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[var(--text-main)]">ساعت حضور و نوبت‌دهی:</label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute right-3 top-3 text-amber-500" />
                <input
                  type="text"
                  value={sampleTime}
                  onChange={(e) => setSampleTime(e.target.value)}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl pr-9 pl-3 py-2 text-xs text-[var(--text-main)] font-mono focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            {/* Textarea */}
            <div className="space-y-1.5 col-span-1 md:col-span-2 lg:col-span-3">
              <label className="block text-xs font-bold text-[var(--text-main)]">شرح حال بیماری و ملاحظات پزشکی (Textarea):</label>
              <textarea
                rows={3}
                value={sampleTextarea}
                onChange={(e) => setSampleTextarea(e.target.value)}
                className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-primary)] transition resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Cards & Glass Panels */}
      {activeTab === 'cards' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="glass-panel p-5 rounded-2xl border border-[var(--border-subtle)] shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--text-muted)]">کارت آماری اول</span>
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold">
                  <User className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-[var(--text-main)]">۱۴۸ نفر</div>
              <p className="text-[11px] text-emerald-500 font-bold flex items-center gap-1">
                <span>↑ ۱۲٪ افزایش نسبت به روز گذشته</span>
              </p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-[var(--border-subtle)] shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--text-muted)]">میزان کارکرد صندوق</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-[var(--text-main)] font-mono">۴۵,۸۰۰,۰۰۰ تومان</div>
              <p className="text-[11px] text-[var(--text-muted)]">تسویه‌شده با دستگاه پوز و نقد</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-[var(--border-subtle)] shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--text-muted)]">وضعیت پزشکان فعال</span>
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-500 flex items-center justify-center font-bold">
                  <Stethoscope className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-[var(--text-main)]">۸ پزشک حاضر</div>
              <p className="text-[11px] text-blue-400 font-bold">۳ مطب در حال معاینه همزمان</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Desktop Data Tables */}
      {activeTab === 'tables' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base mb-0.5">جدول پیشرفته داده‌های دسکتاپ (Sticky Header Table)</h3>
              <p className="text-xs text-[var(--text-muted)]">پشتیبانی از هدر چسبان، فیلتر، مرتب‌سازی و خروجی Excel.</p>
            </div>
            <button className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm transition">
              <Download className="w-3.5 h-3.5" />
              <span>خروجی Excel</span>
            </button>
          </div>

          <div className="border border-[var(--border-subtle)] rounded-xl overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] text-[var(--text-muted)] font-bold sticky top-0">
                <tr>
                  <th className="p-3 w-10 text-center">#</th>
                  <th className="p-3">نام بیمار</th>
                  <th className="p-3">کد ملی</th>
                  <th className="p-3">شماره پرونده</th>
                  <th className="p-3">پزشک معالج</th>
                  <th className="p-3">ساعت نوبت</th>
                  <th className="p-3">وضعیت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                <tr className="hover:bg-[var(--accent-light)] transition">
                  <td className="p-3 text-center font-bold">۱</td>
                  <td className="p-3 font-bold text-[var(--text-main)]">رضا محمدی</td>
                  <td className="p-3 font-mono">۰۰۱۲۳۴۵۶۷۸</td>
                  <td className="p-3 font-mono text-blue-500 font-bold">P-1001</td>
                  <td className="p-3">دکتر علیرضا افشار</td>
                  <td className="p-3 font-mono">۱۰:۱۵</td>
                  <td className="p-3">
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                      پذیرش‌شده
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-[var(--accent-light)] transition">
                  <td className="p-3 text-center font-bold">۲</td>
                  <td className="p-3 font-bold text-[var(--text-main)]">مریم کاظمی</td>
                  <td className="p-3 font-mono">۰۰۹۸۷۶۵۴۳۲</td>
                  <td className="p-3 font-mono text-blue-500 font-bold">P-1002</td>
                  <td className="p-3">دکتر سارا شریفی</td>
                  <td className="p-3 font-mono">۱۰:۳۰</td>
                  <td className="p-3">
                    <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                      در حال معاینه
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Color Tokens */}
      {activeTab === 'colors' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-6 shadow-sm">
          <h3 className="font-bold text-base mb-1">پالت متغیرهای رنگی تم (CSS Variables Matrix)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] space-y-2">
              <span className="text-[11px] font-bold text-[var(--text-muted)] block">--bg-app</span>
              <div className="text-xs font-mono font-bold text-[var(--text-main)]">پس‌زمینه اصلی نرم‌افزار</div>
            </div>
            <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-2">
              <span className="text-[11px] font-bold text-[var(--text-muted)] block">--bg-surface</span>
              <div className="text-xs font-mono font-bold text-[var(--text-main)]">سطح کارت‌ها و فرم‌ها</div>
            </div>
            <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--accent-primary)] text-white space-y-2">
              <span className="text-[11px] font-bold block opacity-80">--accent-primary</span>
              <div className="text-xs font-mono font-bold">رنگ اصلی اکشن‌ها</div>
            </div>
            <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-sidebar)] text-white space-y-2">
              <span className="text-[11px] font-bold block opacity-80">--bg-sidebar</span>
              <div className="text-xs font-mono font-bold">منوی کناری دسکتاپ</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Typography */}
      {activeTab === 'typography' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-6 shadow-sm">
          <h3 className="font-bold text-base mb-1">تایپوگرافی و فونت فارسی (IRANYekanX & Vazirmatn)</h3>
          <div className="space-y-4">
            <div className="p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)]">
              <div className="text-xs font-bold text-[var(--text-muted)] mb-1">Display Title (24px / Extrabold):</div>
              <div className="text-2xl font-black text-[var(--text-main)]">سامانه یکپارچه درمانگاه و کلینیک تخصصی VikiMedic</div>
            </div>
            <div className="p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)]">
              <div className="text-xs font-bold text-[var(--text-muted)] mb-1">Section Heading (18px / Bold):</div>
              <div className="text-lg font-bold text-[var(--text-main)]">فهرست بیماران و نوبت‌های امروز - ۱۴۰۳/۰۵/۱۵</div>
            </div>
            <div className="p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)]">
              <div className="text-xs font-bold text-[var(--text-muted)] mb-1">Body Text & Persian Numbers:</div>
              <div className="text-xs text-[var(--text-main)] leading-relaxed">
                مبلغ کل صورتحساب: <span className="font-bold text-emerald-500 font-mono">۱۲,۵۰۰,۰۰۰ تومان</span> • کد پرونده: <span className="font-bold text-blue-500 font-mono">P-8092</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Workspace Layout Manager */}
      {activeTab === 'workspace' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="font-bold text-base mb-1">مدیریت لایه‌بندی و پروفایل‌های محیط کار (Workspace Layout Manager)</h3>
            <p className="text-xs text-[var(--text-muted)]">
              امکان ذخیره، بازگردانی و سوئیچ سریع بین چیدمان‌های تخصصی درمانگاه.
            </p>
          </div>

          <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[var(--text-main)]">پروفایل فعال کنونی:</div>
                <div className="text-sm font-extrabold text-blue-400">{currentProfile}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSaveProfile('میز کار پزشک و درمانگاه')}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1"
              >
                <Save className="w-3.5 h-3.5" />
                <span>ذخیره چیدمان فعلی</span>
              </button>
              <button
                onClick={() => {
                  setCurrentProfile('میز کار پیش‌فرض کلینیک');
                  addNotification('چیدمان به حالت پیش‌فرض ریست شد.', 'info');
                }}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 hover:text-white text-xs font-medium rounded-xl transition flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>بازنشانی پیش‌فرض</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => handleSaveProfile('میز کار جامع پزشکی')}
              className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-blue-500 rounded-xl text-right space-y-2 transition group"
            >
              <div className="font-bold text-xs text-[var(--text-main)] group-hover:text-blue-400">۱. میز کار جامع پزشکی</div>
              <p className="text-[11px] text-[var(--text-muted)]">ترکیب پرونده بیماران + EMR نسخه الکترونیک</p>
            </button>

            <button
              onClick={() => handleSaveProfile('میز پذیرش و صندوق')}
              className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-emerald-500 rounded-xl text-right space-y-2 transition group"
            >
              <div className="font-bold text-xs text-[var(--text-main)] group-hover:text-emerald-400">۲. میز پذیرش و صندوق</div>
              <p className="text-[11px] text-[var(--text-muted)]">ترکیب صف انتظار + ثبت فاکتور سریع</p>
            </button>

            <button
              onClick={() => handleSaveProfile('میز مدیریت ارشد')}
              className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-purple-500 rounded-xl text-right space-y-2 transition group"
            >
              <div className="font-bold text-xs text-[var(--text-main)] group-hover:text-purple-400">۳. میز مدیریت و آمار</div>
              <p className="text-[11px] text-[var(--text-muted)]">نمودارهای مالی + گزارشات و پرسنل</p>
            </button>

            <button
              onClick={() => handleSaveProfile('میز کار داروخانه')}
              className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-amber-500 rounded-xl text-right space-y-2 transition group"
            >
              <div className="font-bold text-xs text-[var(--text-main)] group-hover:text-amber-400">۴. انبار و داروخانه</div>
              <p className="text-[11px] text-[var(--text-muted)]">مدیریت موجودی + تحویل نسخه دارویی</p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
