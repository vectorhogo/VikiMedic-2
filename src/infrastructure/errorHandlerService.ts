/**
 * VikiMedic v2 - Centralized Error Handler Service
 * Clean Architecture Layer: Infrastructure
 *
 * Converts technical exceptions into user-friendly Persian messages
 * and logs technical error details internally via logger.
 */

import { logger } from './loggerService';

export interface AppError {
  code: string;
  userMessageFA: string;
  technicalMessage?: string;
  module?: string;
}

export class ErrorHandlerService {
  /**
   * Handle and format any error safely
   */
  public static handle(error: unknown, module: string = 'GENERAL', action: string = 'EXECUTE'): AppError {
    let code = 'ERR_UNKNOWN';
    let userMessageFA = 'خطای غیرمنتظره‌ای رخ داده است. لطفاً مجدداً تلاش کنید.';
    let technicalMessage = String(error);

    if (error instanceof Error) {
      technicalMessage = error.message;

      if (error.message.includes('permission') || error.message.includes('unauthorized')) {
        code = 'ERR_PERMISSION_DENIED';
        userMessageFA = 'شما مجوز کافی برای انجام این عملیات را ندارید.';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        code = 'ERR_NETWORK_DISCONNECTED';
        userMessageFA = 'ارتباط شبکه یا سرور برقرار نشد. نرم‌افزار در حالت آفلاین عمل می‌کند.';
      } else if (error.message.includes('not found')) {
        code = 'ERR_RECORD_NOT_FOUND';
        userMessageFA = 'اطلاعات مورد نظر در سیستم یافت نشد.';
      } else if (error.message.includes('duplicate') || error.message.includes('unique')) {
        code = 'ERR_DUPLICATE_ENTRY';
        userMessageFA = 'این اطلاعات (مثلا کدملی یا شماره پرونده) قبلا در سیستم ثبت شده است.';
      }
    }

    // Log internally with structured logger
    logger.error(module, action, userMessageFA, undefined, {
      code,
      technicalMessage,
      originalError: error,
    });

    return {
      code,
      userMessageFA,
      technicalMessage,
      module,
    };
  }
}
