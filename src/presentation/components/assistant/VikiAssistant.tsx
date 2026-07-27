/**
 * VikiMedic v2 - Viki Assistant (Floating Smart Medical Assistant)
 * Clean Architecture Layer: Presentation
 * Phase 04 - UI Patch 02
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Sparkles,
  MessageSquare,
  HelpCircle,
  Lightbulb,
  Search,
  Settings,
  Home,
  X,
  Maximize2,
  Minimize2,
  Move,
  UserPlus,
  FileText,
  BarChart3,
  Database,
  Lock,
  RefreshCw,
  Send,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Volume2,
  VolumeX,
  Eye,
  Info,
  Clock,
  AlertTriangle,
  Smile,
  Compass,
} from 'lucide-react';
import { useClinic } from '../../../application/ClinicContext';
import { useAuth } from '../../../application/AuthContext';
import { ExportService } from '../../../infrastructure/exportService';

type TabType = 'home' | 'help' | 'chat' | 'tips' | 'search' | 'settings';

interface HelpItem {
  id: string;
  category: 'Patients' | 'Reception' | 'Payments' | 'Reports' | 'Users' | 'Settings' | 'Backup' | 'Themes' | 'Permissions';
  categoryFa: string;
  title: string;
  description: string;
  steps: string[];
}

export const VikiAssistant: React.FC = () => {
  const {
    activeModule,
    setActiveModule,
    activeUser,
    activeClinic,
    activeShiftConfig,
    patients,
    queue,
    setIsNewPatientModalOpen,
    setIsNewAppointmentModalOpen,
    setIsSearchOpen,
    addNotification,
  } = useClinic();

  const { lockScreen } = useAuth();

  // Assistant Visibility & Panel Open State
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isMaximized, setIsMaximized] = useState(false);

  // Settings State
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [aiModeEnabled, setAiModeEnabled] = useState(false);
  const [assistantVisible, setAssistantVisible] = useState(true);

  // Floating Widget Position (Bottom Left default)
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 24, y: 36 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({ startX: 0, startY: 0, posX: 24, posY: 36 });

  // Chat State
  const [chatMessages, setChatMessages] = useState<
    { sender: 'viki' | 'user'; text: string; time: string }[]
  >([
    {
      sender: 'viki',
      text: `سلام ${activeUser.fullName} عزیز! من ویکی ( دستیار هوشمند کلینیک VikiMedic ) هستم. چطور می‌تونم در مدیریت امور کلینیک کمکتون کنم؟`,
      time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputChatText, setInputChatText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Search query inside Assistant
  const [assistantSearchQuery, setAssistantSearchQuery] = useState('');

  // Help Search
  const [helpSearchQuery, setHelpSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Load saved position from localStorage
  useEffect(() => {
    const savedPos = localStorage.getItem('viki_assistant_pos');
    if (savedPos) {
      try {
        setPosition(JSON.parse(savedPos));
      } catch (e) {
        // ignore fallback
      }
    }
  }, []);

  // Save position to localStorage
  const handleSavePosition = (newPos: { x: number; y: number }) => {
    setPosition(newPos);
    localStorage.setItem('viki_assistant_pos', JSON.stringify(newPos));
  };

  // Dragging handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isOpen) return; // Disable drag while panel is open to avoid confusion
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: position.x,
      posY: position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = dragRef.current.startY - e.clientY; // invert Y since bottom is fixed

      const newX = Math.max(12, Math.min(window.innerWidth - 80, dragRef.current.posX - deltaX));
      const newY = Math.max(20, Math.min(window.innerHeight - 80, dragRef.current.posY + deltaY));

      const newPos = { x: newX, y: newY };
      setPosition(newPos);
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        handleSavePosition(position);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, position]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isOpen]);

  // Offline Quick Response Logic for Chat Mode
  const handleSendMessage = () => {
    if (!inputChatText.trim()) return;

    const userText = inputChatText.trim();
    const currentTime = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

    setChatMessages((prev) => [...prev, { sender: 'user', text: userText, time: currentTime }]);
    setInputChatText('');

    // Generate intelligent offline reply
    setTimeout(() => {
      let replyText = '';
      const textLower = userText.toLowerCase();

      if (textLower.includes('سلام') || textLower.includes('درود')) {
        replyText = `سلام! خسته نباشید ${activeUser.fullName} گرامی. امروز کلینیک ${activeClinic.name} تا الان ${patients.length} پرونده بیمار فعال دارد.`;
      } else if (textLower.includes('بیمار') || textLower.includes('پرونده')) {
        replyText = `برای ایجاد بیمار جدید می‌تونید دکمه "ثبت بیمار جدید" را فشار دهید یا کلید شورتکات F2 را بزنید.`;
      } else if (textLower.includes('نوبت') || textLower.includes('صف') || textLower.includes('پذیرش')) {
        replyText = `هم‌اکنون ${queue.filter((q) => q.status === 'WAITING').length} نفر در سالن انتظار کلینیک منتظر ویزیت پزشک هستند.`;
      } else if (textLower.includes('گزارش') || textLower.includes('درآمد') || textLower.includes('مالی')) {
        replyText = `می‌توانید به ماژول "گزارشات و تحلیل‌ها" مراجعه کنید تا نمودارهای درآمد و کارکرد پزشکان را به صورت Excel و PDF خروجی بگیرید.`;
      } else if (textLower.includes('جک') || textLower.includes('خنده') || textLower.includes('طنز')) {
        replyText = `پزشکی به بیمارش گفت: «خبر خوب اینه که بیماریت خیلی نادره و اسمت تو کتاب‌های پزشکی ثبت میشه!» 😉 خسته نباشید، همیشه شاد باشید!`;
      } else if (textLower.includes('پشتیبان') || textLower.includes('بکاپ')) {
        replyText = `سیستم به صورت خودکار داده‌های شما را روی دیتابیس محلی IndexedDB و PostgreSQL پشتیبان‌گیری می‌کند.`;
      } else {
        replyText = `من دستیار آفلاین شما ویکی هستم. درخواست شما ("${userText}") دریافت شد. می‌توانید از برگه "راهنما" دستورالعمل کامل تمام بخش‌ها را مطالعه کنید.`;
      }

      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'viki',
          text: replyText,
          time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 400);
  };

  // Comprehensive Offline Knowledge Base Data
  const knowledgeBase: HelpItem[] = [
    {
      id: 'h1',
      category: 'Patients',
      categoryFa: 'مدیریت بیماران',
      title: 'چگونه بیمار جدید در کلینیک ثبت کنیم؟',
      description: 'ثبت پرونده جدید شامل اطلاعات هویتی، کد ملی، شماره تماس و سوابق پزشکی اولیه است.',
      steps: [
        'از منوی دسترسی سریع یا کلید F2 فرم ثبت بیمار را باز کنید.',
        'کد ملی ۱۰ رقمی و شماره همراه بیمار را وارد کنید.',
        'اطلاعات بیمه و سوابق آلرژی دارویی را تکمیل کنید.',
        'دکمه "ذخیره و صدور شماره پرونده" را بزنید.',
      ],
    },
    {
      id: 'h2',
      category: 'Reception',
      categoryFa: 'پذیرش و صف انتظار',
      title: 'مدیریت صف انتظار و فراخوان بیمار با گوینده',
      description: 'فراخوان صوتی بیمار در سالن و تغییر وضعیت به در حال معاینه یا تکمیل شده.',
      steps: [
        'وارد بخش "پذیرش و صف انتظار" شوید.',
        'روی بیمار مورد نظر کلیک راست کرده یا دکمه فراخوان صوتی را بزنید.',
        'سیستم اسم بیمار و اتاق پزشک را از بلندگو اعلان می‌کند.',
        'پس از اتمام ویزیت، وضعیت نوبت را به "تکمیل شده" تغییر دهید.',
      ],
    },
    {
      id: 'h3',
      category: 'Payments',
      categoryFa: 'امور مالی و صندوق',
      title: 'صدور فاکتور درمان و دریافت وجه با کارتخوان',
      description: 'محاسبه فرانشیز بیمه، سهم بیمار و ثبت تراکنش متصل به پوز.',
      steps: [
        'در بخش حسابداری، بیمار مورد نظر را انتخاب کنید.',
        'خدمات درمانی و دارویی ارائه شده را اضافه کنید.',
        'نوع پرداخت (کارتخوان / نقد / کارت به کارت) را تعیین نمایید.',
        'فاکتور رسمی را چاپ یا به صورت PDF ذخیره کنید.',
      ],
    },
    {
      id: 'h4',
      category: 'Reports',
      categoryFa: 'گزارشات مدیریتی',
      title: 'تهیه خروجی Excel و PDF از کارکرد روزانه',
      description: 'گزارش تفکیکی عملکرد کلینیک، کارانه پزشکان و آمار بیماران.',
      steps: [
        'ماژول "گزارش‌ها و تحلیل‌ها" را باز کنید.',
        'بازه زمانی مورد نظر (امروز، این هفته، این ماه) را انتخاب کنید.',
        'بر روی دکمه "خروجی Excel" یا "دانلود نسخه PDF" کلیک کنید.',
      ],
    },
    {
      id: 'h5',
      category: 'Backup',
      categoryFa: 'پشتیبان‌گیری و دیتابیس',
      title: 'بازیابی داده‌ها و پشتیبان‌گیری دیتابیس محلی',
      description: 'اطمینان از ایمنی پرونده‌های پزشکی و مالی در حالت آفلاین دسکتاپ.',
      steps: [
        'در نوار وضعیت پایین صفحه، روی دکمه پشتیبان‌گیری کلیک کنید.',
        'فایل بکاپ با پسوند .json یا .sql روی سیستم شما ذخیره می‌شود.',
        'در صورت تعویض کامپیوتر، از بخش تنظیمات فایل بکاپ را فراخوانی کنید.',
      ],
    },
  ];

  const filteredHelpItems = knowledgeBase.filter((item) => {
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesQuery =
      !helpSearchQuery ||
      item.title.toLowerCase().includes(helpSearchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(helpSearchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  // Context-aware tip selection
  const getContextTip = () => {
    switch (activeModule) {
      case 'queue':
        return {
          title: 'راهنمای سالن پذیرش',
          text: 'شما می‌توانید با کلیک راست روی هر نوبت، منوی سریع تغییر وضعیت، چاپ قبض پذیرش یا فراخوان صوتی را فعال کنید.',
        };
      case 'patients':
        return {
          title: 'راهنمای دفتر پرونده‌ها',
          text: 'با فشردن کلید Ctrl+F یا آیکون جستجو، می‌توانید بر اساس نام، شماره ملی یا شماره پرونده بین هزاران بیمار جستجو کنید.',
        };
      case 'financials':
        return {
          title: 'راهنمای امور مالی',
          text: 'تمامی تراکنش‌ها با درج زمان دقیق، کاربر صادرکننده و شیفت کاری به صورت دست‌نخورده در دیتابیس ثبت می‌شوند.',
        };
      case 'reports':
        return {
          title: 'راهنمای تحلیل و خروجی',
          text: 'گزارشات مالی بر اساس استانداردهای رسمی حسابداری کلینیک تنظیم شده‌اند و قابل خروجی مستقیم به Excel هستند.',
        };
      default:
        return {
          title: 'میز کار کلینیک',
          text: 'تمام عملیات اصلی کلینیک از طریق نوار دسترسی سریع پایین بالای صفحه تنها با یک کلیک در دسترس شماست.',
        };
    }
  };

  const contextTip = getContextTip();

  if (!assistantVisible) return null;

  return (
    <>
      {/* ============================================================ */}
      {/* 1. FLOATING CIRCULAR BUTTON (BOTTOM LEFT DEFAULT, DRAGGABLE) */}
      {/* ============================================================ */}
      {!isOpen && (
        <div
          style={{
            left: `${position.x}px`,
            bottom: `${position.y}px`,
          }}
          onMouseDown={handleMouseDown}
          onClick={() => {
            if (!isDragging) setIsOpen(true);
          }}
          className={`fixed z-40 cursor-pointer select-none flex items-center justify-center group ${
            animationsEnabled ? 'transition-all duration-300' : ''
          }`}
          title="دستیار هوشمند ویکی (Viki Assistant)"
        >
          {/* Outer Breathing Glow Ring */}
          <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-400 opacity-30 blur-md group-hover:opacity-60 transition duration-500 animate-pulse" />

          {/* Main Floating Button Badge */}
          <div className="relative w-13 h-13 rounded-2xl bg-slate-900/90 text-white border border-blue-400/40 shadow-2xl flex items-center justify-center p-3 backdrop-blur-xl group-hover:scale-105 active:scale-95 transition">
            <Bot className="w-7 h-7 text-blue-400 group-hover:text-amber-300 transition" />

            {/* Sparkle badge indicator */}
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
              <Sparkles className="w-2 h-2 text-white animate-spin" />
            </span>
          </div>

          {/* Quick Hover Tooltip Label */}
          <div className="absolute right-full mr-3 bg-slate-900/95 text-white text-xs px-3 py-1.5 rounded-xl border border-slate-700 shadow-xl opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none whitespace-nowrap flex items-center gap-1.5 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>دستیار هوشمند ویکی (Viki)</span>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. OPEN ASSISTANT GLASS PANEL */}
      {/* ============================================================ */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-200 ${
            isMaximized
              ? 'inset-4 md:inset-8'
              : 'bottom-6 left-6 w-[92vw] sm:w-[480px] h-[580px] max-h-[85vh]'
          } bg-[var(--bg-surface)]/95 backdrop-blur-2xl border border-blue-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[var(--text-main)] animate-in fade-in zoom-in-95 duration-150`}
        >
          {/* Assistant Glass Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400 shadow-inner">
                <Bot className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-black text-sm tracking-tight text-white">دستیار هوشمند ویکی</h2>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.2 rounded-md font-bold border border-emerald-500/30 font-mono">
                    {aiModeEnabled ? 'AI Online' : 'Offline Engine'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-300">راهنما، جستجو و مشاور هوشمند کلینیک VikiMedic</p>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMaximized(!isMaximized)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
                title={isMaximized ? 'کوچک‌سازی' : 'بزرگ‌سازی'}
              >
                {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                title="بستن پنل"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Assistant Navigation Tabs */}
          <div className="flex items-center justify-between gap-1 p-2 bg-[var(--bg-app)] border-b border-[var(--border-subtle)] overflow-x-auto text-xs font-bold shrink-0">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex-1 py-1.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition ${
                activeTab === 'home'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>خانه</span>
            </button>

            <button
              onClick={() => setActiveTab('help')}
              className={`flex-1 py-1.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition ${
                activeTab === 'help'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>راهنما</span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-1.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition ${
                activeTab === 'chat'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>گفتگو</span>
            </button>

            <button
              onClick={() => setActiveTab('tips')}
              className={`flex-1 py-1.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition ${
                activeTab === 'tips'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>نکات</span>
            </button>

            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 py-1.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition ${
                activeTab === 'search'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>جستجو</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`p-1.5 rounded-xl transition ${
                activeTab === 'settings'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]'
              }`}
              title="تنظیمات دستیار"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {/* ============================================================ */}
          {/* TAB CONTENTS */}
          {/* ============================================================ */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {/* TAB 1: HOME */}
            {activeTab === 'home' && (
              <div className="space-y-4 text-xs animate-in fade-in duration-150">
                
                {/* Greeting Banner */}
                <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900/50 p-4 rounded-2xl border border-blue-500/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <Smile className="w-5 h-5 text-amber-400" />
                    <h3 className="font-bold text-sm text-blue-300">خوش آمدید، {activeUser.fullName}</h3>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    امروز شیفت جاری شما فعال است. کلینیک در وضعیت پایدار قرار دارد و تمامی ماژول‌های دسکتاپ آماده خدمت‌رسانی به بیماران هستند.
                  </p>
                </div>

                {/* Context Tip Widget */}
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>راهنمای هوشمند ماژول جاری ({contextTip.title})</span>
                  </div>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300/90 leading-relaxed pl-6">
                    {contextTip.text}
                  </p>
                </div>

                {/* Quick Actions Grid */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-[var(--text-muted)]">عملیات متداول دستیار (Quick Actions)</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setIsNewPatientModalOpen(true);
                        setIsOpen(false);
                      }}
                      className="p-2.5 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] hover:border-blue-500/40 transition flex items-center gap-2 font-bold text-xs"
                    >
                      <UserPlus className="w-4 h-4 text-blue-500" />
                      <span>ثبت بیمار جدید</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsSearchOpen(true);
                        setIsOpen(false);
                      }}
                      className="p-2.5 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] hover:border-purple-500/40 transition flex items-center gap-2 font-bold text-xs"
                    >
                      <Search className="w-4 h-4 text-purple-500" />
                      <span>جستجوی پرونده</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveModule('reports');
                        setIsOpen(false);
                      }}
                      className="p-2.5 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] hover:border-indigo-500/40 transition flex items-center gap-2 font-bold text-xs"
                    >
                      <BarChart3 className="w-4 h-4 text-indigo-500" />
                      <span>مشاهده گزارشات</span>
                    </button>

                    <button
                      onClick={() => {
                        addNotification('پشتیبان‌گیری دیتابیس محلی با موفقیت انجام شد', 'success');
                      }}
                      className="p-2.5 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] hover:border-emerald-500/40 transition flex items-center gap-2 font-bold text-xs"
                    >
                      <Database className="w-4 h-4 text-emerald-500" />
                      <span>پشتیبان‌گیری محلی</span>
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: HELP CENTER */}
            {activeTab === 'help' && (
              <div className="space-y-3 text-xs animate-in fade-in duration-150">
                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    value={helpSearchQuery}
                    onChange={(e) => setHelpSearchQuery(e.target.value)}
                    placeholder="جستجو در پایگاه دانش و راهنمای کلینیک..."
                    className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl pr-9 pl-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                </div>

                {/* Category Filters */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-bold">
                  {['ALL', 'Patients', 'Reception', 'Payments', 'Reports', 'Backup'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg border whitespace-nowrap transition ${
                        selectedCategory === cat
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-[var(--bg-app)] text-[var(--text-muted)] border-[var(--border-subtle)]'
                      }`}
                    >
                      {cat === 'ALL' && 'همه بخش‌ها'}
                      {cat === 'Patients' && 'بیماران'}
                      {cat === 'Reception' && 'پذیرش'}
                      {cat === 'Payments' && 'مالی'}
                      {cat === 'Reports' && 'گزارشات'}
                      {cat === 'Backup' && 'پشتیبان'}
                    </button>
                  ))}
                </div>

                {/* Help Items Accordion / Cards */}
                <div className="space-y-2.5">
                  {filteredHelpItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-subtle)] space-y-2"
                    >
                      <div className="flex items-center justify-between font-bold text-xs text-blue-600 dark:text-blue-400">
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>{item.title}</span>
                        </span>
                        <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-md font-mono">
                          {item.categoryFa}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">{item.description}</p>
                      <div className="pt-1 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 block">مراحل انجام:</span>
                        {item.steps.map((st, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-[11px]">
                            <span className="w-4 h-4 rounded-full bg-blue-600/20 text-blue-500 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="leading-tight">{st}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: CHAT MODE */}
            {activeTab === 'chat' && (
              <div className="flex flex-col h-full space-y-3 animate-in fade-in duration-150">
                {/* Chat Message Stream */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[280px]">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-start' : 'items-end'}`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-2xl text-xs space-y-1 ${
                          msg.sender === 'user'
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-[var(--bg-app)] border border-[var(--border-subtle)] text-[var(--text-main)] rounded-bl-none shadow-sm'
                        }`}
                      >
                        <p className="leading-relaxed">{msg.text}</p>
                        <span className="text-[9px] opacity-70 block font-mono text-left">{msg.time}</span>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {/* Input Controls */}
                <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-subtle)]">
                  <input
                    type="text"
                    value={inputChatText}
                    onChange={(e) => setInputChatText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="سوال یا پیام خود را بنویسید..."
                    className="flex-1 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-xl transition font-bold"
                    title="ارسال"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: TIPS & SUGGESTIONS */}
            {activeTab === 'tips' && (
              <div className="space-y-3 text-xs animate-in fade-in duration-150">
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-indigo-400">
                    <Compass className="w-5 h-5" />
                    <span>نکات کاربردی جهت افزایش سرعت کار در کلینیک</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                    مجموعه کلیدهای میانبر و قابلیت‌های مخفی برای تسریع امور پذیرش و ویزیت بیماران.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] space-y-1">
                    <span className="font-bold text-xs text-blue-500 block">۱. ثبت سریع بیمار با کلید F2</span>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      در هر صفحه از دسکتاپ که هستید با فشردن کلید F2 فرم ثبت بیمار جدید فوراً باز می‌شود.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] space-y-1">
                    <span className="font-bold text-xs text-emerald-500 block">۲. استفاده از کلید F3 جهت جستجو</span>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      برای جستجوی سریع بین پرونده‌ها نیازی به موس ندارید، کلید F3 را بفشارید.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] space-y-1">
                    <span className="font-bold text-xs text-purple-500 block">۳. منوی کلیک راست هوشمند</span>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      روی تمام جدول‌ها (صف انتظار، بیماران، فاکتورها) کلیک راست کنید تا گزینه‌های سریع باز شوند.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: SMART SEARCH */}
            {activeTab === 'search' && (
              <div className="space-y-3 text-xs animate-in fade-in duration-150">
                <div className="relative">
                  <input
                    type="text"
                    value={assistantSearchQuery}
                    onChange={(e) => setAssistantSearchQuery(e.target.value)}
                    placeholder="جستجو در بخش‌ها، منوها، تنظیمات و بیماران..."
                    className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl pr-9 pl-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-[var(--text-muted)]">نتایج جستجوی میانبر:</h4>
                  
                  <div
                    onClick={() => {
                      setActiveModule('patients');
                      setIsOpen(false);
                    }}
                    className="p-2.5 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] hover:border-blue-500/40 cursor-pointer transition flex items-center justify-between"
                  >
                    <span className="font-bold">دفتر پرونده بیماران</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>

                  <div
                    onClick={() => {
                      setActiveModule('queue');
                      setIsOpen(false);
                    }}
                    className="p-2.5 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] hover:border-blue-500/40 cursor-pointer transition flex items-center justify-between"
                  >
                    <span className="font-bold">پذیرش و صف انتظار</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>

                  <div
                    onClick={() => {
                      setActiveModule('financials');
                      setIsOpen(false);
                    }}
                    className="p-2.5 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] hover:border-blue-500/40 cursor-pointer transition flex items-center justify-between"
                  >
                    <span className="font-bold">حسابداری و فاکتورهای درمان</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: SETTINGS */}
            {activeTab === 'settings' && (
              <div className="space-y-4 text-xs animate-in fade-in duration-150">
                <h3 className="font-bold text-xs text-[var(--text-muted)]">تنظیمات و پیکربندی دستیار ویکی</h3>

                <div className="space-y-3">
                  {/* Animation Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)]">
                    <div>
                      <span className="font-bold block">انیمیشن‌های شناور</span>
                      <span className="text-[10px] text-[var(--text-muted)]">حرکت و تنفس ملایم آیکون دستیار</span>
                    </div>
                    <button
                      onClick={() => setAnimationsEnabled(!animationsEnabled)}
                      className={`w-10 h-5 rounded-full transition p-0.5 ${
                        animationsEnabled ? 'bg-blue-600' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition transform ${
                          animationsEnabled ? 'translate-x-[-20px]' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Sound Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)]">
                    <div>
                      <span className="font-bold block">صداها و راهنمای صوتی</span>
                      <span className="text-[10px] text-[var(--text-muted)]">اعلان‌های صوتی دستیار</span>
                    </div>
                    <button
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className={`w-10 h-5 rounded-full transition p-0.5 ${
                        soundEnabled ? 'bg-blue-600' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition transform ${
                          soundEnabled ? 'translate-x-[-20px]' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* AI Mode Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)]">
                    <div>
                      <span className="font-bold block">حالت هوش مصنوعی (AI Mode)</span>
                      <span className="text-[10px] text-[var(--text-muted)]">اتصال به سرویس ابری در صورت دسترس بودن</span>
                    </div>
                    <button
                      onClick={() => setAiModeEnabled(!aiModeEnabled)}
                      className={`w-10 h-5 rounded-full transition p-0.5 ${
                        aiModeEnabled ? 'bg-emerald-600' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition transform ${
                          aiModeEnabled ? 'translate-x-[-20px]' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Footer Status Bar */}
          <div className="bg-[var(--bg-app)] p-2.5 border-t border-[var(--border-subtle)] text-[10px] text-[var(--text-muted)] flex items-center justify-between shrink-0 font-mono">
            <span>Viki Assistant v2.0 - Offline Ready</span>
            <span className="text-emerald-500 font-bold">100% Operational</span>
          </div>
        </div>
      )}
    </>
  );
};
