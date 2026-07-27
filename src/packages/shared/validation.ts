/**
 * VikiMedic v2 - Shared Validation Framework
 * Clean Architecture Layer: Packages / Shared
 *
 * Reusable validation utilities for Persian National ID, Mobile Numbers,
 * Jalali Dates, and numeric bounds.
 */

export interface ValidationResult {
  isValid: boolean;
  errorMessageFA?: string;
}

/**
 * Validates Persian National ID (کد ملی) using official 10-digit checksum algorithm
 */
export function validatePersianNationalId(nationalId: string): ValidationResult {
  const cleaned = nationalId.trim().replace(/[0-9]/g, (w) => String.fromCharCode(w.charCodeAt(0)));
  
  if (!/^\d{10}$/.test(cleaned)) {
    return { isValid: false, errorMessageFA: 'کد ملی باید دقیقاً ۱۰ رقم عددی باشد.' };
  }

  // Check for repeated digits like 1111111111, 0000000000
  if (/^(\d)\1{9}$/.test(cleaned)) {
    return { isValid: false, errorMessageFA: 'کد ملی وارد شده معتبر نیست (ارقام تکراری).' };
  }

  const check = parseInt(cleaned.charAt(9), 10);
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i), 10) * (10 - i);
  }

  const remainder = sum % 11;
  const isValid = (remainder < 2 && check === remainder) || (remainder >= 2 && check === 11 - remainder);

  return {
    isValid,
    errorMessageFA: isValid ? undefined : 'کد ملی وارد شده با فرمول شناسه ملی الگوریتم ثبت احوال مطابقت ندارد.',
  };
}

/**
 * Validates Persian Mobile Phone Number (شماره موبایل ایران)
 */
export function validatePersianMobile(mobile: string): ValidationResult {
  const cleaned = mobile.trim();
  const mobileRegex = /^09\d{9}$/;

  if (!mobileRegex.test(cleaned)) {
    return { isValid: false, errorMessageFA: 'شماره موبایل معتبر نیست (مثال صحیح: ۰۹۱۲۳۴۵۶۷۸۹).' };
  }

  return { isValid: true };
}

/**
 * Validates Jalali Date String (YYYY/MM/DD)
 */
export function validateJalaliDate(dateStr: string): ValidationResult {
  const parts = dateStr.trim().split('/');
  if (parts.length !== 3) {
    return { isValid: false, errorMessageFA: 'فرمت تاریخ معتبر نیست (فرمت صحیح: ۱۴۰۳/۰۵/۱۵).' };
  }

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return { isValid: false, errorMessageFA: 'ارقام تاریخ نامعتبر می‌باشند.' };
  }

  if (year < 1300 || year > 1450) {
    return { isValid: false, errorMessageFA: 'سال وارد شده خارج از محدوده مجاز (۱۳۰۰ تا ۱۴۵۰) است.' };
  }

  if (month < 1 || month > 12) {
    return { isValid: false, errorMessageFA: 'ماه وارد شده باید بین ۱ تا ۱۲ باشد.' };
  }

  const maxDaysInMonth = month <= 6 ? 31 : month <= 11 ? 30 : 29; // Approximate leap check
  if (day < 1 || day > maxDaysInMonth) {
    return { isValid: false, errorMessageFA: `روز وارد شده برای ماه ${month} غیرمجاز است (حداکثر ${maxDaysInMonth} روز).` };
  }

  return { isValid: true };
}

/**
 * Validates Required String
 */
export function validateRequired(value: string | undefined | null, fieldNameFA: string): ValidationResult {
  if (!value || value.trim().length === 0) {
    return { isValid: false, errorMessageFA: `تکمیل فیلد «${fieldNameFA}» الزامی است.` };
  }
  return { isValid: true };
}

/**
 * Validates Numeric Value Bounds
 */
export function validateNumberRange(val: number, min: number, max: number, fieldNameFA: string): ValidationResult {
  if (isNaN(val) || val < min || val > max) {
    return { isValid: false, errorMessageFA: `مقدار «${fieldNameFA}» باید بین ${min} و ${max} باشد.` };
  }
  return { isValid: true };
}
