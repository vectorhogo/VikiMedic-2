/**
 * VikiMedic v2 - Centralized Structured Logger Service
 * Clean Architecture Layer: Infrastructure
 *
 * Implements structured logging with levels: INFO, WARN, ERROR, CRITICAL.
 * Captures timestamp, user, module, action, result, and payload context.
 */

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  module: string;
  action: string;
  userId?: string;
  result: 'SUCCESS' | 'FAILURE' | 'PENDING';
  messageFA: string;
  details?: Record<string, any>;
}

class LoggerService {
  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 200;
  private listeners: ((logs: LogEntry[]) => void)[] = [];

  constructor() {
    // Load existing logs from local persistence if available
    try {
      const saved = localStorage.getItem('vikimedic_v2_system_logs');
      if (saved) {
        this.logs = JSON.parse(saved);
      }
    } catch {
      this.logs = [];
    }
  }

  public log(
    level: LogLevel,
    module: string,
    action: string,
    messageFA: string,
    result: 'SUCCESS' | 'FAILURE' | 'PENDING' = 'SUCCESS',
    userId?: string,
    details?: Record<string, any>
  ): LogEntry {
    const entry: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      level,
      module,
      action,
      userId: userId || 'SYSTEM',
      result,
      messageFA,
      details,
    };

    this.logs.unshift(entry);

    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(0, this.MAX_LOGS);
    }

    try {
      localStorage.setItem('vikimedic_v2_system_logs', JSON.stringify(this.logs));
    } catch (err) {
      console.warn('Unable to persist logs to localStorage', err);
    }

    // Console output with styled levels
    const color =
      level === 'CRITICAL' ? '#ef4444' : level === 'ERROR' ? '#f87171' : level === 'WARN' ? '#f59e0b' : '#3b82f6';
    console.log(`%c[${level}] [${module}] ${action}: ${messageFA}`, `color: ${color}; font-weight: bold;`, details || '');

    this.notifyListeners();
    return entry;
  }

  public info(module: string, action: string, messageFA: string, userId?: string, details?: Record<string, any>) {
    return this.log('INFO', module, action, messageFA, 'SUCCESS', userId, details);
  }

  public warn(module: string, action: string, messageFA: string, userId?: string, details?: Record<string, any>) {
    return this.log('WARN', module, action, messageFA, 'SUCCESS', userId, details);
  }

  public error(module: string, action: string, messageFA: string, userId?: string, details?: Record<string, any>) {
    return this.log('ERROR', module, action, messageFA, 'FAILURE', userId, details);
  }

  public critical(module: string, action: string, messageFA: string, userId?: string, details?: Record<string, any>) {
    return this.log('CRITICAL', module, action, messageFA, 'FAILURE', userId, details);
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public clearLogs() {
    this.logs = [];
    localStorage.removeItem('vikimedic_v2_system_logs');
    this.notifyListeners();
  }

  public subscribe(listener: (logs: LogEntry[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((l) => l([...this.logs]));
  }
}

export const logger = new LoggerService();
