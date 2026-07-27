/**
 * VikiMedic v2 - Viki Assistant (Floating Smart Medical Assistant with Online AI Mode)
 * Clean Architecture Layer: Presentation
 * AI Patch 01 - Viki Assistant Online Mode
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
  UserPlus,
  BarChart3,
  Database,
  Send,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Clock,
  AlertTriangle,
  Smile,
  Compass,
  Globe,
  WifiOff,
  Copy,
  Check,
  Trash2,
  Download,
  Cpu,
  Key,
  Sliders,
  Loader2,
  RefreshCw,
  Info,
  Mic,
  Terminal,
} from 'lucide-react';
import { useClinic, AppModule } from '../../../application/ClinicContext';
import { useAuth } from '../../../application/AuthContext';
import { StorageService } from '../../../infrastructure/storage';
import { AIProviderService } from '../../../infrastructure/ai/AIProviderService';
import { AICommandService, ParsedCommandResult } from '../../../infrastructure/ai/AICommandService';
import { CommandHistoryItem, CommandExecutionStatus } from '../../../domain/commandTypes';
import {
  AISettingsConfig,
  AIMode,
  AIProviderType,
  ChatMessage,
  DEFAULT_AI_SETTINGS,
  PROVIDER_DEFAULT_BASE_URLS,
  PROVIDER_DEFAULT_MODELS,
} from '../../../domain/aiTypes';
import { MarkdownRenderer } from './MarkdownRenderer';
import { AIPrivacyModal } from './AIPrivacyModal';

type TabType = 'home' | 'commands' | 'chat' | 'help' | 'tips' | 'search' | 'settings';

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
    patients,
    queue,
    setIsNewPatientModalOpen,
    setIsSearchOpen,
    addNotification,
  } = useClinic();

  // Assistant Visibility & Panel Open State
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isMaximized, setIsMaximized] = useState(false);

  // Settings State
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [assistantVisible] = useState(true);

  // AI Configuration State
  const [aiSettings, setAiSettings] = useState<AISettingsConfig>(() => StorageService.getAISettings());
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  // Settings Form Inputs
  const [editProvider, setEditProvider] = useState<AIProviderType>(aiSettings.provider);
  const [editApiKey, setEditApiKey] = useState<string>(aiSettings.apiKey);
  const [editBaseUrl, setEditBaseUrl] = useState<string>(aiSettings.baseUrl);
  const [editModelName, setEditModelName] = useState<string>(aiSettings.modelName);
  const [editTimeoutSec, setEditTimeoutSec] = useState<number>(Math.round(aiSettings.requestTimeoutMs / 1000));
  const [editMaxTokens, setEditMaxTokens] = useState<number>(aiSettings.maxTokens);
  const [editTemperature, setEditTemperature] = useState<number>(aiSettings.temperature);
  const [editHistoryLength, setEditHistoryLength] = useState<number>(aiSettings.historyLength);
  const [editAutoSave, setEditAutoSave] = useState<boolean>(aiSettings.autoSaveChat);
  const [editOfflineFallback, setEditOfflineFallback] = useState<boolean>(aiSettings.offlineFallback);
  const [editGlobalEnabled, setEditGlobalEnabled] = useState<boolean>(aiSettings.enabled);
  const [showApiKey, setShowApiKey] = useState(false);

  // Connection Test State
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);

  // Floating Widget Position (Bottom Left default)
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 24, y: 36 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({ startX: 0, startY: 0, posX: 24, posY: 36 });

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const history = StorageService.getVikiChatHistory();
    if (history && history.length > 0) return history;
    return [
      {
        id: 'msg-init-1',
        sender: 'viki',
        text: `سلام **${activeUser.fullName}** عزیز! من **Viki** ( دستیار هوشمند کلینیک VikiMedic ) هستم. چطور می‌تونم در مدیریت امور کلینیک کمکتون کنم؟`,
        time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        modeUsed: 'OFFLINE',
      },
    ];
  });
  const [inputChatText, setInputChatText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Search queries inside Assistant
  const [assistantSearchQuery, setAssistantSearchQuery] = useState('');
  const [helpSearchQuery, setHelpSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Command Mode State (Enterprise Patch 01)
  const [commandInputText, setCommandInputText] = useState('');
  const [commandHistory, setCommandHistory] = useState<CommandHistoryItem[]>(() => AICommandService.getHistory());
  const [pendingCommandModal, setPendingCommandModal] = useState<{ parsed: ParsedCommandResult; rawText: string } | null>(null);
  const [isListeningVoice, setIsListeningVoice] = useState(false);

  // Command Execution Handler
  const handleProcessCommand = (textToProcess?: string) => {
    const raw = textToProcess || commandInputText;
    if (!raw.trim()) return;

    const parsed = AICommandService.parseCommand(raw);
    if (!parsed) {
      AICommandService.logCommandExecution({
        commandText: raw,
        parsedIntent: 'UNKNOWN',
        user: activeUser,
        status: 'UNKNOWN_COMMAND',
        actionSummaryFa: 'دستور شناخته نشد.',
        requiresConfirmation: false,
      });
      setCommandHistory(AICommandService.getHistory());
      addNotification(`دستور صوتی/متنی "${raw}" شناخته نشد.`, 'warning');
      setCommandInputText('');
      return;
    }

    if (parsed.requiresConfirmation) {
      setPendingCommandModal({ parsed, rawText: raw });
      setCommandInputText('');
      return;
    }

    // Execute safe command directly
    runCommandAction(parsed, raw, 'SUCCESS');
    setCommandInputText('');
  };

  const runCommandAction = (parsed: ParsedCommandResult, rawText: string, status: CommandExecutionStatus) => {
    if (status === 'SUCCESS') {
      if (parsed.targetModule) {
        setActiveModule(parsed.targetModule as AppModule);
      }
      if (parsed.intentKey === 'ACTION_NEW_PATIENT') {
        setIsNewPatientModalOpen(true);
      }
      if (parsed.intentKey === 'ACTION_SEARCH') {
        setIsSearchOpen(true);
      }
    }

    AICommandService.logCommandExecution({
      commandText: rawText,
      parsedIntent: parsed.intentKey,
      user: activeUser,
      status,
      actionSummaryFa: parsed.actionSummaryFa,
      requiresConfirmation: parsed.requiresConfirmation,
    });

    setCommandHistory(AICommandService.getHistory());
    addNotification(
      status === 'SUCCESS' ? `دستور اجرا شد: ${parsed.actionSummaryFa}` : 'اجرای دستور لغو گردید.',
      status === 'SUCCESS' ? 'success' : 'info'
    );
  };

  // Toggle Simulated Voice Command Test
  const handleToggleVoiceListen = () => {
    if (isListeningVoice) {
      setIsListeningVoice(false);
      return;
    }

    setIsListeningVoice(true);
    // Simulate speech transcript capture
    setTimeout(() => {
      setIsListeningVoice(false);
      const sampleVoiceCommands = [
        'باز کردن پذیرش',
        'لیست بیماران',
        'ارزیابی سیستم',
        'گزارشات',
        'ثبت بیمار جدید',
        'پروفایل‌های پیکربندی',
      ];
      const randomVoice = sampleVoiceCommands[Math.floor(Math.random() * sampleVoiceCommands.length)];
      setCommandInputText(randomVoice);
      addNotification(`فرمان صوتی دریافت شد: "${randomVoice}"`, 'info');
    }, 2000);
  };

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

  // Sync settings when provider changes in settings tab
  const handleProviderChange = (newProvider: AIProviderType) => {
    setEditProvider(newProvider);
    setEditBaseUrl(PROVIDER_DEFAULT_BASE_URLS[newProvider] || '');
    setEditModelName(PROVIDER_DEFAULT_MODELS[newProvider] || '');
  };

  // Save position to localStorage
  const handleSavePosition = (newPos: { x: number; y: number }) => {
    setPosition(newPos);
    localStorage.setItem('viki_assistant_pos', JSON.stringify(newPos));
  };

  // Auto save chat history when messages change
  useEffect(() => {
    if (aiSettings.autoSaveChat && chatMessages.length > 0) {
      StorageService.saveVikiChatHistory(chatMessages);
    }
  }, [chatMessages, aiSettings.autoSaveChat]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isGenerating, isOpen, activeTab]);

  // Dragging handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isOpen) return;
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
      const deltaY = dragRef.current.startY - e.clientY;

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

  // Toggle Mode (Offline / Online) with Privacy Check
  const handleToggleMode = (targetMode: AIMode) => {
    if (targetMode === 'ONLINE') {
      if (!aiSettings.privacyNoticeAccepted) {
        setShowPrivacyModal(true);
        return;
      }
    }
    const updatedSettings: AISettingsConfig = {
      ...aiSettings,
      mode: targetMode,
    };
    setAiSettings(updatedSettings);
    StorageService.saveAISettings(updatedSettings);
    addNotification(
      targetMode === 'ONLINE' ? 'حالت هوش مصنوعی آنلاین فعال شد' : 'حالت دستیار آفلاین فعال شد',
      'info'
    );
  };

  const handleAcceptPrivacy = () => {
    setShowPrivacyModal(false);
    const updatedSettings: AISettingsConfig = {
      ...aiSettings,
      mode: 'ONLINE',
      privacyNoticeAccepted: true,
    };
    setAiSettings(updatedSettings);
    StorageService.saveAISettings(updatedSettings);
    addNotification('شروط حریم خصوصی تایید شد. حالت آنلاین فعال گردید.', 'success');
  };

  // Test AI Connection
  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setTestResult(null);

    const testConfig: AISettingsConfig = {
      ...aiSettings,
      provider: editProvider,
      apiKey: editApiKey,
      baseUrl: editBaseUrl,
      modelName: editModelName,
      requestTimeoutMs: editTimeoutSec * 1000,
      maxTokens: editMaxTokens,
      temperature: editTemperature,
    };

    const res = await AIProviderService.testConnection(testConfig);
    setIsTestingConnection(false);

    if (res.success) {
      setTestResult({
        success: true,
        message: `اتصال با موفقیت برقرار شد! (زمان پاسخ: ${res.latencyMs || 0} میلی‌ثانیه)`,
        latencyMs: res.latencyMs,
      });
    } else {
      setTestResult({
        success: false,
        message: res.error || 'ارتباط با سرویس آنلاین برقرار نشد.',
      });
    }
  };

  // Save Settings Form
  const handleSaveSettings = () => {
    const updatedSettings: AISettingsConfig = {
      ...aiSettings,
      enabled: editGlobalEnabled,
      provider: editProvider,
      apiKey: editApiKey,
      baseUrl: editBaseUrl,
      modelName: editModelName,
      requestTimeoutMs: Math.max(2000, editTimeoutSec * 1000),
      maxTokens: editMaxTokens,
      temperature: editTemperature,
      historyLength: editHistoryLength,
      autoSaveChat: editAutoSave,
      offlineFallback: editOfflineFallback,
    };

    setAiSettings(updatedSettings);
    StorageService.saveAISettings(updatedSettings);
    addNotification('تنظیمات سرویس هوش مصنوعی با موفقیت ذخیره گردید', 'success');
  };

  // Generate Intelligent Offline Reply
  const generateOfflineReply = (userText: string): string => {
    const textLower = userText.toLowerCase();

    if (textLower.includes('سلام') || textLower.includes('درود')) {
      return `سلام! خسته نباشید **${activeUser.fullName}** گرامی. امروز کلینیک **${activeClinic.name}** تا الان **${patients.length}** پرونده بیمار ثبت‌شده دارد.`;
    }
    if (textLower.includes('بیمار') || textLower.includes('پرونده')) {
      return `برای ثبت بیمار جدید می‌توانید کلید **F2** را فشار دهید یا از بخش منوی اصلی گزینه **"پرونده جدید"** را انتخاب کنید.`;
    }
    if (textLower.includes('نوبت') || textLower.includes('صف') || textLower.includes('پذیرش')) {
      return `هم‌اکنون **${queue.filter((q) => q.status === 'WAITING').length}** نفر در سالن انتظار کلینیک منتظر ویزیت پزشک هستند.`;
    }
    if (textLower.includes('گزارش') || textLower.includes('درآمد') || textLower.includes('مالی')) {
      return `می‌توانید به ماژول **"گزارشات و تحلیل‌ها"** مراجعه کنید تا نمودارهای درآمد و کارکرد پزشکان را به صورت Excel و PDF خروجی بگیرید.`;
    }
    if (textLower.includes('پشتیبان') || textLower.includes('بکاپ')) {
      return `سیستم به صورت خودکار داده‌های شما را روی دیتابیس محلی پشتیبان‌گیری می‌کند. همچنین می‌توانید از منوی تنظیمات سیستم نسخه خروجی پشتیبان دریافت کنید.`;
    }
    return `من دستیار آفلاین شما **Viki** هستم. درخواست شما (*"${userText}"*) ثبت شد. می‌توانید از برگه **"راهنما"** دستورالعمل کامل تمام بخش‌های کلینیک را مطالعه فرمایید.`;
  };

  // Main Chat Send Handler
  const handleSendMessage = async () => {
    if (!inputChatText.trim() || isGenerating) return;

    const userText = inputChatText.trim();
    const currentTime = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    const userMsgId = `msg-user-${Date.now()}`;

    const newUserMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: userText,
      time: currentTime,
    };

    setChatMessages((prev) => [...prev, newUserMsg]);
    setInputChatText('');
    setFallbackNotice(null);

    // If Offline Mode or Globally Disabled
    if (aiSettings.mode === 'OFFLINE' || !aiSettings.enabled) {
      setTimeout(() => {
        const replyText = generateOfflineReply(userText);
        const vikiMsg: ChatMessage = {
          id: `msg-viki-${Date.now()}`,
          sender: 'viki',
          text: replyText,
          time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
          modeUsed: 'OFFLINE',
        };
        setChatMessages((prev) => [...prev, vikiMsg]);
      }, 300);
      return;
    }

    // Online Mode Logic via Abstraction Layer
    setIsGenerating(true);

    const systemContext = `شما Viki، دستیار هوشمند نرم‌افزار کلینیک VikiMedic هستید. کاربر جاری: ${activeUser.fullName} (نقش: ${activeUser.roleCode}). نام کلینیک: ${activeClinic.name}. تعداد بیماران امروز: ${patients.length}. پاسخ‌ها را با فرمت شکیل، خوانا و با استانداردهای پزشکی و مدیریتی ارائه دهید.`;

    const response = await AIProviderService.sendMessage({
      prompt: userText,
      history: chatMessages,
      config: aiSettings,
      systemContext,
    });

    setIsGenerating(false);

    if (response.success && response.text) {
      const vikiMsg: ChatMessage = {
        id: `msg-viki-${Date.now()}`,
        sender: 'viki',
        text: response.text,
        time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        modeUsed: 'ONLINE',
        providerUsed: aiSettings.provider,
      };
      setChatMessages((prev) => [...prev, vikiMsg]);
    } else {
      // Offline Fallback Handling
      const fallbackMsg = 'Online AI unavailable. Switched to Offline Assistant.';
      const fallbackMsgFa = `هوش مصنوعی آنلاین در دسترس نیست (${response.error || 'خطای اتصال'}). به دستیار آفلاین سوییچ شد.`;

      setFallbackNotice(fallbackMsgFa);

      const offlineReply = generateOfflineReply(userText);
      const vikiMsg: ChatMessage = {
        id: `msg-viki-${Date.now()}`,
        sender: 'viki',
        text: `*(سوییچ خودکار به حالت آفلاین: ${response.error || 'خطا در API'})\n\n${offlineReply}`,
        time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        modeUsed: 'OFFLINE',
        error: true,
      };
      setChatMessages((prev) => [...prev, vikiMsg]);
    }
  };

  // Copy Message Handler
  const handleCopyMessage = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // Clear Conversation History
  const handleClearChat = () => {
    if (window.confirm('آیا از پاک کردن تمامی تاریخچه گفتگوی این نشست اطمینان دارید؟')) {
      const initialMsg: ChatMessage = {
        id: `msg-init-${Date.now()}`,
        sender: 'viki',
        text: `تاریخچه گفتگو پاک شد. چطور می‌تونم کمکتون کنم؟`,
        time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        modeUsed: aiSettings.mode,
      };
      setChatMessages([initialMsg]);
      StorageService.clearVikiChatHistory();
      addNotification('تاریخچه گفتگوی دستیار پاک شد', 'info');
    }
  };

  // Export Conversation as File
  const handleExportChat = () => {
    if (chatMessages.length === 0) return;

    let content = `# VikiMedic v2 - Viki Assistant Chat Export\n`;
    content += `تاریخ خروجی: ${new Date().toLocaleString('fa-IR')}\n`;
    content += `کاربر: ${activeUser.fullName} (${activeUser.roleCode})\n`;
    content += `کلینیک: ${activeClinic.name}\n`;
    content += `--------------------------------------------------\n\n`;

    chatMessages.forEach((m) => {
      const senderName = m.sender === 'user' ? activeUser.fullName : 'Viki Assistant';
      const modeTag = m.modeUsed ? ` [${m.modeUsed}]` : '';
      content += `### ${senderName} (${m.time})${modeTag}\n${m.text}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `VikiMedic_Chat_Export_${Date.now()}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addNotification('تاریخچه گفتگو به صورت فایل Markdown دانلود شد', 'success');
  };

  // Knowledge Base Data
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
        'فایل بکاپ با پسوند .json روی سیستم شما ذخیره می‌شود.',
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
      {/* Privacy Notice Modal */}
      <AIPrivacyModal
        isOpen={showPrivacyModal}
        onAccept={handleAcceptPrivacy}
        onDecline={() => setShowPrivacyModal(false)}
      />

      {/* 1. FLOATING CIRCULAR BUTTON (DRAGGABLE) */}
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
          {/* Outer Glow Ring */}
          <div
            className={`absolute -inset-2 rounded-full blur-md opacity-40 group-hover:opacity-80 transition duration-500 animate-pulse ${
              aiSettings.mode === 'ONLINE'
                ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500'
                : 'bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500'
            }`}
          />

          {/* Main Floating Badge */}
          <div className="relative w-13 h-13 rounded-2xl bg-slate-900/90 text-white border border-blue-400/40 shadow-2xl flex items-center justify-center p-3 backdrop-blur-xl group-hover:scale-105 active:scale-95 transition">
            <Bot
              className={`w-7 h-7 transition ${
                aiSettings.mode === 'ONLINE' ? 'text-emerald-400' : 'text-blue-400'
              }`}
            />

            {/* Online / Offline status badge */}
            <span
              className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 flex items-center justify-center ${
                aiSettings.mode === 'ONLINE' ? 'bg-emerald-500' : 'bg-blue-500'
              }`}
            >
              {aiSettings.mode === 'ONLINE' ? (
                <Globe className="w-2 h-2 text-white animate-spin" />
              ) : (
                <Sparkles className="w-2 h-2 text-white" />
              )}
            </span>
          </div>

          {/* Quick Hover Label */}
          <div className="absolute right-full mr-3 bg-slate-900/95 text-white text-xs px-3 py-1.5 rounded-xl border border-slate-700 shadow-xl opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none whitespace-nowrap flex items-center gap-2 font-bold">
            <Bot className="w-3.5 h-3.5 text-blue-400" />
            <span>دستیار Viki ({aiSettings.mode === 'ONLINE' ? 'AI آنلاین' : 'آفلاین'})</span>
          </div>
        </div>
      )}

      {/* 2. OPEN ASSISTANT GLASS PANEL */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-200 ${
            isMaximized
              ? 'inset-4 md:inset-8'
              : 'bottom-6 left-6 w-[92vw] sm:w-[500px] h-[600px] max-h-[88vh]'
          } bg-[var(--bg-surface)]/95 backdrop-blur-2xl border border-blue-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[var(--text-main)] animate-in fade-in zoom-in-95 duration-150 dir-rtl`}
        >
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white p-3.5 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-inner ${
                  aiSettings.mode === 'ONLINE'
                    ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-400'
                    : 'bg-blue-600/30 border-blue-400/40 text-blue-400'
                }`}
              >
                <Bot className="w-6 h-6" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-black text-sm tracking-tight text-white">دستیار هوشمند ویکی</h2>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-bold font-mono border flex items-center gap-1 ${
                      aiSettings.mode === 'ONLINE'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                    }`}
                  >
                    {aiSettings.mode === 'ONLINE' ? (
                      <>
                        <Globe className="w-2.5 h-2.5 text-emerald-400" />
                        <span>AI Online ({aiSettings.provider})</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-2.5 h-2.5 text-blue-400" />
                        <span>Offline Engine</span>
                      </>
                    )}
                  </span>
                </div>
                <p className="text-[10px] text-slate-300">مشاور، راهنما و پلتفرم هوش مصنوعی کلینیک VikiMedic</p>
              </div>
            </div>

            {/* Mode Switcher Pill in Header */}
            <div className="flex items-center gap-2">
              <div className="bg-slate-900 border border-slate-800 p-0.5 rounded-xl flex items-center text-[11px] font-bold">
                <button
                  onClick={() => handleToggleMode('OFFLINE')}
                  className={`px-2 py-1 rounded-lg transition flex items-center gap-1 ${
                    aiSettings.mode === 'OFFLINE'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="سوییچ به حالت آفلاین"
                >
                  <WifiOff className="w-3 h-3" />
                  <span>آفلاین</span>
                </button>
                <button
                  onClick={() => handleToggleMode('ONLINE')}
                  className={`px-2 py-1 rounded-lg transition flex items-center gap-1 ${
                    aiSettings.mode === 'ONLINE'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="سوییچ به حالت آنلاین ابری"
                >
                  <Globe className="w-3 h-3" />
                  <span>آنلاین</span>
                </button>
              </div>

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
                title="بستن"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
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
              onClick={() => setActiveTab('commands')}
              className={`flex-1 py-1.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition ${
                activeTab === 'commands'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-purple-300" />
              <span>دستورات AI</span>
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
              title="تنظیمات هوش مصنوعی"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {/* TAB CONTENTS */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {/* TAB 0.5: AI COMMAND MODE (Enterprise Patch 01) */}
            {activeTab === 'commands' && (
              <div className="space-y-4 text-xs animate-in fade-in duration-150">
                {/* Command Mode Header Banner */}
                <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 p-4 rounded-2xl border border-purple-500/30 text-white space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-5 h-5 text-purple-400" />
                      <h3 className="font-bold text-sm text-purple-200">حالت دستورات صوتی و متنی (AI Command Mode)</h3>
                    </div>
                    <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                      Voice Ready
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    دستورات مدیریتی صوتی یا متنی را وارد کنید (مثال: "باز کردن پذیرش"، "ارزیابی سیستم"، "پروفایل‌های پیکربندی"، "ثبت بیمار جدید").
                  </p>
                </div>

                {/* Command Input Box with Mic */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleProcessCommand();
                  }}
                  className="space-y-2"
                >
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={commandInputText}
                      onChange={(e) => setCommandInputText(e.target.value)}
                      placeholder="دستور صوتی یا متنی خود را تایپ کنید..."
                      className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl py-3 pl-20 pr-4 text-xs text-[var(--text-main)] focus:outline-none focus:border-purple-500 font-medium"
                    />

                    <div className="absolute left-2 flex items-center gap-1">
                      {/* Voice Listen Button */}
                      <button
                        type="button"
                        onClick={handleToggleVoiceListen}
                        title="فرمان صوتی (میکروفون)"
                        className={`p-2 rounded-lg transition ${
                          isListeningVoice
                            ? 'bg-rose-500 text-white animate-pulse'
                            : 'bg-slate-700/30 hover:bg-slate-700/50 text-purple-400'
                        }`}
                      >
                        <Mic className="w-4 h-4" />
                      </button>

                      {/* Execute Button */}
                      <button
                        type="submit"
                        disabled={!commandInputText.trim()}
                        className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold p-2 rounded-lg transition"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {isListeningVoice && (
                    <div className="text-[11px] text-rose-400 font-bold animate-pulse flex items-center gap-1.5 px-2">
                      <div className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>در حال شنیدن و پردازش فرمان صوتی...</span>
                    </div>
                  )}
                </form>

                {/* Quick Interactive Command Pills */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-[var(--text-muted)] block">میانبرهای صوتی/دستوری پیشنهادی:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'باز کردن پذیرش',
                      'لیست بیماران',
                      'ارزیابی سیستم',
                      'پروفایل‌های پیکربندی',
                      'گزارشات مالی',
                      'پنل شیفت',
                      'ثبت بیمار جدید',
                      'جستجوی بیمار',
                    ].map((cmd) => (
                      <button
                        key={cmd}
                        type="button"
                        onClick={() => handleProcessCommand(cmd)}
                        className="bg-[var(--bg-app)] border border-[var(--border-subtle)] hover:border-purple-500/40 text-[var(--text-main)] px-2.5 py-1 rounded-lg text-[11px] font-medium transition active:scale-95"
                      >
                        {cmd}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Command History Log */}
                <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[var(--text-muted)]">تاریخچه لاگ اجرای دستورات ({commandHistory.length})</span>
                    {commandHistory.length > 0 && (
                      <button
                        onClick={() => {
                          AICommandService.clearHistory();
                          setCommandHistory([]);
                        }}
                        className="text-[10px] text-rose-400 hover:underline"
                      >
                        پاکسازی لاگ
                      </button>
                    )}
                  </div>

                  {commandHistory.length === 0 ? (
                    <div className="text-center py-6 text-[11px] text-[var(--text-muted)] border border-dashed border-[var(--border-subtle)] rounded-xl">
                      هنوز هیچ دستوری صادر نشده است.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {commandHistory.map((log) => (
                        <div
                          key={log.id}
                          className="p-2.5 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] text-[11px] space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[var(--text-main)]">"{log.commandText}"</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                log.status === 'SUCCESS'
                                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                  : log.status === 'REJECTED_BY_USER'
                                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                  : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                              }`}
                            >
                              {log.status === 'SUCCESS' ? '✓ موفق' : log.status === 'REJECTED_BY_USER' ? 'لغو شده' : 'ناشناخته'}
                            </span>
                          </div>
                          <p className="text-[var(--text-muted)] text-[10px]">{log.actionSummaryFa}</p>
                          <div className="text-[9px] text-[var(--text-muted)] font-mono text-left opacity-75">
                            {log.userFullName} • {log.time}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* TAB 1: HOME */}
            {activeTab === 'home' && (
              <div className="space-y-4 text-xs animate-in fade-in duration-150">
                <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900/50 p-4 rounded-2xl border border-blue-500/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <Smile className="w-5 h-5 text-amber-400" />
                    <h3 className="font-bold text-sm text-blue-300">خوش آمدید، {activeUser.fullName}</h3>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    دستیار Viki آماده پاسخگویی است. حالت فعال فعلی:{' '}
                    <span className="font-bold text-amber-300">
                      {aiSettings.mode === 'ONLINE' ? `آنلاین ابری (${aiSettings.provider})` : 'موتور محلی آفلاین'}
                    </span>
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>راهنمای هوشمند ماژول جاری ({contextTip.title})</span>
                  </div>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300/90 leading-relaxed pl-6">
                    {contextTip.text}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-[var(--text-muted)]">عملیات سریع دستیار (Quick Actions)</h4>
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

            {/* TAB 2: CHAT MODE (ONLINE / OFFLINE) */}
            {activeTab === 'chat' && (
              <div className="flex flex-col h-full space-y-3 animate-in fade-in duration-150">
                {/* Chat Header Actions Toolbar */}
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)] text-[11px]">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        aiSettings.mode === 'ONLINE' ? 'bg-emerald-500 animate-ping' : 'bg-blue-500'
                      }`}
                    />
                    <span className="font-bold text-[var(--text-muted)]">
                      {aiSettings.mode === 'ONLINE' ? `حالت آنلاین: ${aiSettings.provider}` : 'حالت آفلاین'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleExportChat}
                      className="p-1.5 rounded-lg bg-[var(--bg-app)] border border-[var(--border-subtle)] hover:text-blue-400 transition flex items-center gap-1 font-bold text-[10px]"
                      title="دانلود فایل خروجی تاریخچه گفتگو"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>خروجی</span>
                    </button>

                    <button
                      onClick={handleClearChat}
                      className="p-1.5 rounded-lg bg-[var(--bg-app)] border border-[var(--border-subtle)] hover:text-rose-400 transition flex items-center gap-1 font-bold text-[10px]"
                      title="پاک کردن تاریخچه چت"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>پاکسازی</span>
                    </button>
                  </div>
                </div>

                {/* Offline Fallback Notice Banner */}
                {fallbackNotice && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-[11px] flex items-center justify-between animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{fallbackNotice}</span>
                    </div>
                    <button
                      onClick={() => setFallbackNotice(null)}
                      className="text-amber-500 hover:text-amber-700 text-xs font-bold"
                    >
                      ×
                    </button>
                  </div>
                )}

                {/* Chat Message Stream */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[300px]">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-start' : 'items-end'}`}
                    >
                      <div
                        className={`max-w-[88%] p-3.5 rounded-2xl text-xs space-y-1.5 relative group ${
                          msg.sender === 'user'
                            ? 'bg-blue-600 text-white rounded-br-none shadow-md'
                            : 'bg-[var(--bg-app)] border border-[var(--border-subtle)] text-[var(--text-main)] rounded-bl-none shadow-sm'
                        }`}
                      >
                        {/* Render Markdown formatting */}
                        {msg.sender === 'viki' ? (
                          <MarkdownRenderer content={msg.text} />
                        ) : (
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        )}

                        {/* Footer metadata for message */}
                        <div className="flex items-center justify-between text-[9px] opacity-70 pt-1 border-t border-slate-700/20 font-mono">
                          <span>{msg.time}</span>

                          {msg.sender === 'viki' && (
                            <div className="flex items-center gap-2">
                              {msg.modeUsed && (
                                <span className="font-bold text-[9px] opacity-80">
                                  {msg.modeUsed === 'ONLINE' ? `[AI ${msg.providerUsed || ''}]` : '[Offline]'}
                                </span>
                              )}

                              <button
                                onClick={() => handleCopyMessage(msg.id, msg.text)}
                                className="hover:text-amber-300 transition"
                                title="کپی متن پاسخ"
                              >
                                {copiedMsgId === msg.id ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Typing / Generating Indicator */}
                  {isGenerating && (
                    <div className="flex flex-col items-end animate-in fade-in duration-150">
                      <div className="bg-[var(--bg-app)] border border-blue-500/30 p-3 rounded-2xl rounded-bl-none flex items-center gap-2 text-xs text-blue-400 font-bold shadow-sm">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                        <span>در حال تحلیل و تولید پاسخ هوشمند...</span>
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Input Controls */}
                <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-subtle)]">
                  <input
                    type="text"
                    value={inputChatText}
                    onChange={(e) => setInputChatText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={
                      aiSettings.mode === 'ONLINE'
                        ? 'پرسش خود را مطرح کنید (پاسخ آنلاین از طریق AI)...'
                        : 'سوال خود را بنویسید (پاسخ آفلاین)...'
                    }
                    className="flex-1 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-blue-500"
                    disabled={isGenerating}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isGenerating || !inputChatText.trim()}
                    className={`p-2.5 rounded-xl transition font-bold text-white flex items-center justify-center ${
                      isGenerating || !inputChatText.trim()
                        ? 'bg-slate-700 cursor-not-allowed opacity-50'
                        : aiSettings.mode === 'ONLINE'
                        ? 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20'
                        : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20'
                    }`}
                    title="ارسال پیام"
                  >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: HELP CENTER */}
            {activeTab === 'help' && (
              <div className="space-y-3 text-xs animate-in fade-in duration-150">
                <div className="relative">
                  <input
                    type="text"
                    value={helpSearchQuery}
                    onChange={(e) => setHelpSearchQuery(e.target.value)}
                    placeholder="جستجو در پایگاه دانش کلینیک..."
                    className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl pr-9 pl-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                </div>

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

            {/* TAB 4: TIPS */}
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
                      روی تمام جدول‌ها کلیک راست کنید تا گزینه‌های سریع باز شوند.
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
                    placeholder="جستجو در بخش‌ها، منوها و بیماران..."
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

            {/* TAB 6: AI SETTINGS PANEL */}
            {activeTab === 'settings' && (
              <div className="space-y-4 text-xs animate-in fade-in duration-150 pb-2">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
                  <h3 className="font-bold text-xs text-[var(--text-main)] flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-blue-500" />
                    <span>پیکربندی هوش مصنوعی Viki Assistant (AI Settings)</span>
                  </h3>
                </div>

                {/* Global Enable / Mode Settings */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)]">
                    <div>
                      <span className="font-bold block text-[var(--text-main)]">فعال‌سازی سرویس ابری توسط مدیر</span>
                      <span className="text-[10px] text-[var(--text-muted)]">مجوز استفاده از مدل‌های هوش مصنوعی آنلاین</span>
                    </div>
                    <button
                      onClick={() => setEditGlobalEnabled(!editGlobalEnabled)}
                      className={`w-10 h-5 rounded-full transition p-0.5 ${
                        editGlobalEnabled ? 'bg-emerald-600' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition transform ${
                          editGlobalEnabled ? 'translate-x-[-20px]' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Provider Selection */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-[11px] text-[var(--text-muted)] block">ارائه‌دهنده مدل (AI Provider):</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['gemini', 'openrouter', 'openai', 'ollama', 'custom'] as AIProviderType[]).map((prov) => (
                        <button
                          key={prov}
                          type="button"
                          onClick={() => handleProviderChange(prov)}
                          className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-between transition ${
                            editProvider === prov
                              ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                              : 'bg-[var(--bg-app)] border-[var(--border-subtle)] text-[var(--text-muted)]'
                          }`}
                        >
                          <span className="capitalize">{prov}</span>
                          {editProvider === prov && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* API Key */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-[11px] text-[var(--text-muted)] flex items-center justify-between">
                      <span>کلید ارتباطی (API Key):</span>
                      <span className="text-[10px] text-amber-500 font-mono">* محرمانه</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={editApiKey}
                        onChange={(e) => setEditApiKey(e.target.value)}
                        placeholder={editProvider === 'ollama' ? 'برای Ollama اختیاری است' : 'کلید API را وارد کنید...'}
                        className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl pl-9 pr-3 py-2 text-xs font-mono focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-200"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Base URL */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-[11px] text-[var(--text-muted)] block">آدرس پایه API (Base URL):</label>
                    <input
                      type="text"
                      value={editBaseUrl}
                      onChange={(e) => setEditBaseUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-blue-500 dir-ltr"
                    />
                  </div>

                  {/* Model Name */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-[11px] text-[var(--text-muted)] block">نام مدل (Model Name):</label>
                    <input
                      type="text"
                      value={editModelName}
                      onChange={(e) => setEditModelName(e.target.value)}
                      placeholder="مثلا gemini-2.5-flash یا gpt-4o-mini"
                      className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-blue-500 dir-ltr"
                    />
                  </div>

                  {/* Parameters Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="space-y-1">
                      <label className="font-bold text-[10px] text-[var(--text-muted)] block">مهلت پاسخ (ثانیه):</label>
                      <input
                        type="number"
                        min={3}
                        max={60}
                        value={editTimeoutSec}
                        onChange={(e) => setEditTimeoutSec(Number(e.target.value))}
                        className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl px-3 py-1.5 text-xs font-mono text-center"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-[10px] text-[var(--text-muted)] block">حداکثر توکن (Max Tokens):</label>
                      <input
                        type="number"
                        min={100}
                        max={4000}
                        step={100}
                        value={editMaxTokens}
                        onChange={(e) => setEditMaxTokens(Number(e.target.value))}
                        className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl px-3 py-1.5 text-xs font-mono text-center"
                      />
                    </div>
                  </div>

                  {/* Temperature Slider */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between font-bold text-[10px] text-[var(--text-muted)]">
                      <span>درجه خلاقیت (Temperature):</span>
                      <span className="font-mono text-blue-400">{editTemperature}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.1}
                      value={editTemperature}
                      onChange={(e) => setEditTemperature(Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>

                  {/* History & Fallback Toggles */}
                  <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)]">
                      <span className="font-bold text-[11px]">ذخیره‌سازی خودکار گفتگو در مرورگر</span>
                      <button
                        onClick={() => setEditAutoSave(!editAutoSave)}
                        className={`w-9 h-4.5 rounded-full transition p-0.5 ${
                          editAutoSave ? 'bg-blue-600' : 'bg-slate-700'
                        }`}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded-full bg-white transition transform ${
                            editAutoSave ? 'translate-x-[-18px]' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)]">
                      <div>
                        <span className="font-bold text-[11px] block">سوییچ خودکار به آفلاین در زمان خطا</span>
                        <span className="text-[9px] text-[var(--text-muted)]">تضمین عدم قطع عملکرد کاربر</span>
                      </div>
                      <button
                        onClick={() => setEditOfflineFallback(!editOfflineFallback)}
                        className={`w-9 h-4.5 rounded-full transition p-0.5 ${
                          editOfflineFallback ? 'bg-blue-600' : 'bg-slate-700'
                        }`}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded-full bg-white transition transform ${
                            editOfflineFallback ? 'translate-x-[-18px]' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Test Connection Output */}
                  {testResult && (
                    <div
                      className={`p-3 rounded-xl border text-xs leading-relaxed animate-in fade-in ${
                        testResult.success
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold mb-1">
                        {testResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                        <span>{testResult.success ? 'تست اتصال موفق' : 'خطا در تست اتصال'}</span>
                      </div>
                      <p className="text-[11px]">{testResult.message}</p>
                    </div>
                  )}

                  {/* Submit / Test Buttons */}
                  <div className="flex items-center gap-2 pt-3 border-t border-[var(--border-subtle)] font-bold text-xs">
                    <button
                      type="button"
                      onClick={handleSaveSettings}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl transition shadow-md flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>ذخیره تنظیمات</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={isTestingConnection}
                      className="bg-[var(--bg-app)] hover:bg-slate-800 text-[var(--text-main)] border border-[var(--border-subtle)] py-2.5 px-4 rounded-xl transition flex items-center gap-1.5"
                      title="ارسال پیام آزمایشی جهت اطمینان از سلامت API"
                    >
                      {isTestingConnection ? (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                      ) : (
                        <RefreshCw className="w-4 h-4 text-blue-400" />
                      )}
                      <span>تست اتصال</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Footer Status Bar */}
          <div className="bg-[var(--bg-app)] p-2.5 border-t border-[var(--border-subtle)] text-[10px] text-[var(--text-muted)] flex items-center justify-between shrink-0 font-mono">
            <span>Viki Assistant v2.5 - Enterprise Patch 01</span>
            <span
              className={`font-bold ${
                aiSettings.mode === 'ONLINE' ? 'text-emerald-400' : 'text-blue-400'
              }`}
            >
              {aiSettings.mode === 'ONLINE' ? `ONLINE (${aiSettings.provider})` : 'OFFLINE MODE'}
            </span>
          </div>
        </div>
      )}

      {/* Restricted Command Confirmation Modal Overlay */}
      {pendingCommandModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 dir-rtl animate-in fade-in duration-150">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center gap-3 text-amber-500">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[var(--text-main)]">تایید اجرای دستور حساس مدیر</h3>
                <span className="text-[10px] text-[var(--text-muted)]">AI Command Confirmation Required</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 space-y-1.5 leading-relaxed">
              <p className="font-bold text-xs">درخواست اجرای دستور: "{pendingCommandModal.rawText}"</p>
              <p className="text-[11px] opacity-90">
                {pendingCommandModal.parsed.confirmationPromptFa || pendingCommandModal.parsed.actionSummaryFa}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  runCommandAction(pendingCommandModal.parsed, pendingCommandModal.rawText, 'REJECTED_BY_USER');
                  setPendingCommandModal(null);
                }}
                className="px-4 py-2 rounded-xl border border-[var(--border-subtle)] text-[var(--text-muted)] font-bold hover:bg-slate-800"
              >
                لغو دستور
              </button>
              <button
                type="button"
                onClick={() => {
                  runCommandAction(pendingCommandModal.parsed, pendingCommandModal.rawText, 'SUCCESS');
                  setPendingCommandModal(null);
                }}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-md shadow-amber-600/30"
              >
                تایید و اجرای دستور
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
