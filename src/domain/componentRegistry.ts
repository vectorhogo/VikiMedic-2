/**
 * VikiMedic v2 - Universal Component Registry
 * Clean Architecture Layer: Domain / Component Standards
 *
 * Single Registry defining all reusable UI components, their purpose,
 * properties, usage guidelines, accessibility rules, and theme support.
 */

export interface ComponentMetadata {
  id: string;
  name: string;
  category: 'layout' | 'window' | 'modals' | 'inputs' | 'feedback' | 'data';
  purposeFA: string;
  acceptedProps: string[];
  usageRulesFA: string[];
  accessibilityRulesFA: string[];
  supportedThemes: ('Medical White' | 'Dark Theme' | 'Rose Luxe')[];
  version: string;
}

export const UNIVERSAL_COMPONENT_REGISTRY: ComponentMetadata[] = [
  {
    id: 'desktop-titlebar',
    name: 'DesktopTitleBar',
    category: 'window',
    purposeFA: 'نوار عنوان شبیه‌ساز دسکتاپ ویندوز با انتخاب کلینیک، جستجوی سریع، تغییر تم و ۵ ثانیه تریگر تم رز.',
    acceptedProps: ['None (Consumes ClinicContext & ThemeContext)'],
    usageRulesFA: [
      'فقط در بالای کلیه صفحات اصلی برنامه قرار می‌گیرد.',
      'نگه‌داشتن ۵ ثانیه‌ای لوگوی VikiMedic جهت باز شدن مودال امنیتی PIN تم لوکس رز.',
      'عدم شکستگی عنوان‌ها و ارتفاع ثابت ۳۶ پیکسل.',
    ],
    accessibilityRulesFA: ['تکیه‌گاه کلیدهای Alt+F4', 'کنتراست بالا با آیکون‌های ویندوزی'],
    supportedThemes: ['Medical White', 'Dark Theme', 'Rose Luxe'],
    version: '2.0.0',
  },
  {
    id: 'desktop-sidebar',
    name: 'DesktopSidebar',
    category: 'layout',
    purposeFA: 'منوی کناری تاشو با آیکون‌های استاندارد، عناوین فارسی، نشانگرهای تعداد صف و دکمه‌های اقدام سریع.',
    acceptedProps: ['None (Consumes ClinicContext)'],
    usageRulesFA: [
      'حالت جمع‌شده (collapsed) را در localStorage ذخیره و بازگردانی می‌کند.',
      'دسترسی کاربر بر اساس نقش (RBAC) کنترل می‌شود.',
      'نمایش کارت کلینیک فعال و وضعیت پرسنل جاری.',
    ],
    accessibilityRulesFA: ['پشتیبانی کامل از ناوبری کیبورد (Tab/Enter)', 'توضیحات Tooltip در حالت تاشو'],
    supportedThemes: ['Medical White', 'Dark Theme', 'Rose Luxe'],
    version: '2.0.0',
  },
  {
    id: 'global-command-palette',
    name: 'GlobalCommandPalette',
    category: 'window',
    purposeFA: 'پالت دستورات هوشمند و جستجوی سراسری بیمار، پزشک، داروها و کلیدهای میانبر (Ctrl+Shift+P / Ctrl+K).',
    acceptedProps: ['isOpen: boolean', 'onClose: () => void'],
    usageRulesFA: [
      'جستجوی زنده با میانبر Ctrl+Shift+P یا Ctrl+K.',
      'نمایش نتایج فوری دسته بندی شده پرونده‌ها و ماژول‌ها.',
      'امکان خروج سریع با کلید Escape.',
    ],
    accessibilityRulesFA: ['فوکوس خودکار اتوماتیک روی فیلد ورودی', 'پیمایش بالا/پایین با کلیدهای جهت‌نما'],
    supportedThemes: ['Medical White', 'Dark Theme', 'Rose Luxe'],
    version: '2.0.0',
  },
  {
    id: 'notification-toasts',
    name: 'NotificationToasts',
    category: 'feedback',
    purposeFA: 'سیستم مرکز اعلانات و پیام‌های موفقیت، هشدار، خطا و اطلاع‌رسانی دسکتاپ با انیمیشن.',
    acceptedProps: ['notifications: NotificationItem[]', 'onDismiss: (id: string) => void'],
    usageRulesFA: [
      'بستن خودکار پیام‌ها پس از ۴ ثانیه.',
      'استفاده از رنگ‌های استاندارد status-success, status-warning, status-danger.',
      'پشتیبانی کامل از متن‌های راست‌به‌چپ (RTL).',
    ],
    accessibilityRulesFA: ['خواندن خودکار توسط اسکرین‌ریدرها (aria-live)', 'دکمه بستن با کلیک آسان'],
    supportedThemes: ['Medical White', 'Dark Theme', 'Rose Luxe'],
    version: '2.0.0',
  },
  {
    id: 'rose-theme-pin-modal',
    name: 'RoseThemePinModal',
    category: 'modals',
    purposeFA: 'مودال امنیتی دریافت PIN جهت فعال‌سازی تم رز لوکس (PIN: 8585).',
    acceptedProps: ['isOpen: boolean', 'onClose: () => void'],
    usageRulesFA: [
      'ورود PIN ۴ رقمی با هشدارهای فارسی و افکت‌های بصری رز.',
      'اعتبارشناسی اختصاصی کد ۸۵۸۵ و ذخیره‌سازی ماندگار.',
    ],
    accessibilityRulesFA: ['قفل فوکوس روی ورودی رمز', 'امکان بستن با کلید Escape'],
    supportedThemes: ['Medical White', 'Dark Theme', 'Rose Luxe'],
    version: '2.0.0',
  },
];
