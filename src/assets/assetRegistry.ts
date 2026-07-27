/**
 * VikiMedic v2 - Central Asset Registry & Manager
 * Clean Architecture Layer: Assets / Infrastructure
 *
 * Organizes Fonts, Icons, Images, Illustrations, Logos, Themes, and Print Templates.
 */

export const ASSET_REGISTRY = {
  fonts: [
    { name: 'IRANYekanX', file: '/assets/fonts/IRANYekanX-VF.woff2', type: 'Primary Persian Variable' },
    { name: 'Vazirmatn', file: '/assets/fonts/Vazirmatn-Regular.woff2', type: 'Secondary Persian Standard' },
  ],
  logos: [
    { name: 'VikiMedic Brand Logo (LTR)', path: '/assets/logo-vikimedic.svg' },
    { name: 'VikiMedic Brand Logo (RTL Persian)', path: '/assets/logo-vikimedic-fa.svg' },
    { name: 'Clinic Seal & Signature Watermark', path: '/assets/clinic-watermark.svg' },
  ],
  themes: [
    { id: 'medical_white', nameFA: 'سفید پزشکی (Medical White)', cssVariables: 'theme-medical-white' },
    { id: 'dark_eyesafe', nameFA: 'تاریک ضدخستگی (Dark Eyesafe)', cssVariables: 'theme-dark-eyesafe' },
    { id: 'rose_luxe', nameFA: 'رز لوکس کلینیک زیبایی (Rose Luxe)', cssVariables: 'theme-rose-luxe' },
  ],
  printTemplates: [
    { id: 'thermal_80mm', nameFA: 'فیش رسید حرارتی ۸۰ میلی‌متری (Receipt Printer)' },
    { id: 'laser_prescription_a5', nameFA: 'نسخه پزشک A5 (A5 Prescription Slip)' },
    { id: 'invoice_a4', nameFA: 'صورتحساب رسمی درمانگاه A4 (Official A4 Invoice)' },
  ],
  iconsCatalog: [
    'User',
    'Calendar',
    'Receipt',
    'Stethoscope',
    'Pill',
    'ShieldCheck',
    'Printer',
    'Bot',
    'Boxes',
    'Layers',
    'FolderTree',
  ],
};
