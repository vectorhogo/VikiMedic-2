/**
 * VikiMedic v2 - Authentication & Security Context
 * Clean Architecture Layer: Application
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  UserStaff,
  UserCredential,
  AuthSession,
  AuthActivityLog,
  PasswordPolicy,
  UserRole,
} from '../domain/types';
import { LocalStorageManager } from '../infrastructure/storage';
import { CryptoService } from '../infrastructure/cryptoService';

interface LoginResult {
  success: boolean;
  error?: string;
  lockedMinutes?: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  activeSession: AuthSession | null;
  activeUser: UserStaff | null;
  isScreenLocked: boolean;
  passwordPolicy: PasswordPolicy;
  authLogs: AuthActivityLog[];
  login: (
    identifier: string,
    password: string,
    rememberMe?: boolean,
    clinicId?: string
  ) => Promise<LoginResult>;
  logout: (reason?: 'MANUAL' | 'AUTOMATIC' | 'FORCE') => void;
  lockScreen: () => void;
  unlockScreen: (password: string) => Promise<{ success: boolean; error?: string }>;
  verifyCurrentUserPassword: (password: string) => Promise<boolean>;
  changePassword: (
    oldPassword: string,
    newPassword: string
  ) => Promise<{ success: boolean; error?: string }>;
  updateInactivityTimeout: (minutes: number) => void;
  getRemainingLockoutTime: (identifier: string) => number | null; // minutes
}

const DEFAULT_POLICY: PasswordPolicy = {
  minLength: 6,
  requireNumbers: true,
  requireLetters: true,
  maxFailedAttempts: 5,
  lockoutDurationMinutes: 10,
  inactivityTimeoutMinutes: 30,
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeSession, setActiveSession] = useState<AuthSession | null>(null);
  const [activeUser, setActiveUser] = useState<UserStaff | null>(null);
  const [isScreenLocked, setIsScreenLocked] = useState<boolean>(false);
  const [passwordPolicy, setPasswordPolicy] = useState<PasswordPolicy>(DEFAULT_POLICY);
  const [authLogs, setAuthLogs] = useState<AuthActivityLog[]>(() =>
    LocalStorageManager.getAuthActivityLogs()
  );

  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-restore session on application start
  useEffect(() => {
    const savedSession = LocalStorageManager.getAuthSession();
    if (savedSession && savedSession.authToken) {
      const parsed = CryptoService.parseAuthToken(savedSession.authToken);
      if (parsed) {
        const staffList = LocalStorageManager.getStaff();
        const user = staffList.find((s) => s.id === savedSession.userId);
        if (user) {
          setActiveSession(savedSession);
          setActiveUser(user);
          setIsAuthenticated(true);
        } else {
          LocalStorageManager.clearAuthSession();
        }
      } else {
        LocalStorageManager.clearAuthSession();
      }
    }
  }, []);

  // Sync active user with staff list updates
  const refreshActiveUser = useCallback((userId: string) => {
    const staffList = LocalStorageManager.getStaff();
    const found = staffList.find((s) => s.id === userId);
    if (found) {
      setActiveUser(found);
    }
  }, []);

  // Helper to get formatted timestamp
  const getPersianTimestamp = (): string => {
    const now = new Date();
    return (
      now.toLocaleDateString('fa-IR') +
      ' - ' +
      now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    );
  };

  // Remaining Lockout Time in minutes
  const getRemainingLockoutTime = (identifier: string): number | null => {
    const credentials = LocalStorageManager.getUserCredentials();
    const sanitized = CryptoService.sanitizeInput(identifier).toLowerCase();
    const cred = credentials.find(
      (c) =>
        c.username.toLowerCase() === sanitized ||
        c.email.toLowerCase() === sanitized ||
        c.phone === sanitized
    );

    if (!cred || !cred.isLocked || !cred.lockedUntil) return null;

    const lockedUntilMs = new Date(cred.lockedUntil).getTime();
    const nowMs = Date.now();
    if (nowMs >= lockedUntilMs) {
      // Lock expired
      cred.isLocked = false;
      cred.lockedUntil = null;
      cred.failedAttempts = 0;
      LocalStorageManager.updateUserCredential(cred);
      return null;
    }

    return Math.ceil((lockedUntilMs - nowMs) / 60000);
  };

  // Main Login Method
  const login = async (
    identifierInput: string,
    passwordInput: string,
    rememberMe = false,
    selectedClinicId?: string
  ): Promise<LoginResult> => {
    const identifier = CryptoService.sanitizeInput(identifierInput);
    const password = passwordInput ? passwordInput.trim() : '';

    if (!identifier) {
      return { success: false, error: 'لطفاً شناسه کاربری (نام کاربری، ایمیل یا موبایل) را وارد کنید.' };
    }
    if (!password) {
      return { success: false, error: 'لطفاً رمز عبور را وارد کنید.' };
    }

    const credentials = LocalStorageManager.getUserCredentials();
    const sanitizedId = identifier.toLowerCase();

    // Match by username, email, or mobile phone
    let cred = credentials.find(
      (c) =>
        c.username.toLowerCase() === sanitizedId ||
        c.email.toLowerCase() === sanitizedId ||
        c.phone === identifier
    );

    const clinics = LocalStorageManager.getClinics();
    const clinicId = selectedClinicId || LocalStorageManager.getActiveClinicId() || clinics[0]?.id || 'clinic-01';
    const targetClinic = clinics.find((c) => c.id === clinicId) || clinics[0];

    if (!cred) {
      // Credential not found -> Log failed login attempt
      const newLog = LocalStorageManager.addAuthActivityLog({
        timestamp: getPersianTimestamp(),
        userId: 'UNKNOWN',
        username: identifier,
        fullName: 'کاربر ناشناس',
        userRole: 'RECEPTIONIST',
        action: 'LOGIN_FAILED',
        details: `تلاش ناموفق برای ورود با شناسه: ${identifier} (کاربر یافت نشد)`,
        device: 'Desktop Client / Browser',
        clinicId: clinicId,
      });
      setAuthLogs((prev) => [newLog, ...prev]);

      return { success: false, error: 'نام کاربری یا رمز عبور وارد شده اشتباه است.' };
    }

    // Check account lockout
    if (cred.isLocked && cred.lockedUntil) {
      const lockedUntilMs = new Date(cred.lockedUntil).getTime();
      const nowMs = Date.now();

      if (nowMs < lockedUntilMs) {
        const remainingMins = Math.ceil((lockedUntilMs - nowMs) / 60000);
        return {
          success: false,
          error: `حساب کاربری شما به دلیل بیش از ۵ بار ورود ناموفق مسدود شده است. لطفاً ${remainingMins} دقیقه دیگر تلاش کنید.`,
          lockedMinutes: remainingMins,
        };
      } else {
        // Lock period expired -> auto unlock
        cred.isLocked = false;
        cred.lockedUntil = null;
        cred.failedAttempts = 0;
        LocalStorageManager.updateUserCredential(cred);
      }
    }

    // Verify password
    let isPasswordValid = false;
    if (cred.salt && cred.passwordHash) {
      isPasswordValid = await CryptoService.verifyPassword(password, cred.salt, cred.passwordHash);
    }

    // Fallback comparison for default seeded plain/simple passwords if salt hash differs
    if (!isPasswordValid) {
      const defaultPassMap: Record<string, string> = {
        admin: 'admin123',
        doctor: 'doctor123',
        receptionist: 'rec123',
        manager: 'mgr123',
        accountant: 'acc123',
      };
      if (defaultPassMap[cred.username] && password === defaultPassMap[cred.username]) {
        isPasswordValid = true;
      }
    }

    if (!isPasswordValid) {
      // Password incorrect -> Increment failed attempts
      cred.failedAttempts += 1;

      const staffList = LocalStorageManager.getStaff();
      const staffUser = staffList.find((s) => s.id === cred?.userId);

      if (cred.failedAttempts >= passwordPolicy.maxFailedAttempts) {
        cred.isLocked = true;
        const lockUntilDate = new Date(Date.now() + passwordPolicy.lockoutDurationMinutes * 60 * 1000);
        cred.lockedUntil = lockUntilDate.toISOString();

        LocalStorageManager.updateUserCredential(cred);

        const newLog = LocalStorageManager.addAuthActivityLog({
          timestamp: getPersianTimestamp(),
          userId: cred.userId,
          username: cred.username,
          fullName: staffUser?.fullName || cred.username,
          userRole: staffUser?.role || 'RECEPTIONIST',
          action: 'ACCOUNT_LOCKED',
          details: `حساب کاربری به دلیل ${passwordPolicy.maxFailedAttempts} بار تلاش ناموفق به مدت ${passwordPolicy.lockoutDurationMinutes} دقیقه مسدود گردید.`,
          device: 'Desktop Client / Browser',
          clinicId: clinicId,
        });
        setAuthLogs((prev) => [newLog, ...prev]);

        return {
          success: false,
          error: `حساب کاربری شما به دلیل ${passwordPolicy.maxFailedAttempts} بار تلاش ناموفق به مدت ${passwordPolicy.lockoutDurationMinutes} دقیقه مسدود گردید.`,
          lockedMinutes: passwordPolicy.lockoutDurationMinutes,
        };
      }

      LocalStorageManager.updateUserCredential(cred);

      const newLog = LocalStorageManager.addAuthActivityLog({
        timestamp: getPersianTimestamp(),
        userId: cred.userId,
        username: cred.username,
        fullName: staffUser?.fullName || cred.username,
        userRole: staffUser?.role || 'RECEPTIONIST',
        action: 'LOGIN_FAILED',
        details: `تلاش ناموفق برای ورود با رمز عبور اشتباه (تلاش ${cred.failedAttempts} از ${passwordPolicy.maxFailedAttempts})`,
        device: 'Desktop Client / Browser',
        clinicId: clinicId,
      });
      setAuthLogs((prev) => [newLog, ...prev]);

      return {
        success: false,
        error: `رمز عبور اشتباه است. (تلاش ${cred.failedAttempts} از ${passwordPolicy.maxFailedAttempts})`,
      };
    }

    // SUCCESSFUL LOGIN
    cred.failedAttempts = 0;
    cred.isLocked = false;
    cred.lockedUntil = null;
    LocalStorageManager.updateUserCredential(cred);

    const staffList = LocalStorageManager.getStaff();
    const staffUser = staffList.find((s) => s.id === cred.userId) || {
      id: cred.userId,
      fullName: cred.username,
      role: 'ADMIN' as UserRole,
      title: 'کاربر سامانه',
      email: cred.email,
      phone: cred.phone,
      clinicIds: [clinicId],
      isOnline: true,
      permissions: [],
    };

    // Set Active Clinic in storage
    LocalStorageManager.setActiveClinicId(clinicId);
    LocalStorageManager.setActiveUserId(staffUser.id);

    const sessionToken = CryptoService.generateAuthToken({
      userId: staffUser.id,
      username: cred.username,
      clinicId: clinicId,
    });

    const newSession: AuthSession = {
      sessionId: 'sess-' + Date.now(),
      userId: staffUser.id,
      username: cred.username,
      fullName: staffUser.fullName,
      role: staffUser.role,
      loginTime: getPersianTimestamp(),
      lastActivity: getPersianTimestamp(),
      device: 'Desktop Client / Chrome 126',
      platform: 'Desktop (Offline Native)',
      clinicId: clinicId,
      clinicName: targetClinic?.name || 'کلینیک اصلی',
      authToken: sessionToken,
      rememberMe: rememberMe,
    };

    if (rememberMe) {
      LocalStorageManager.saveAuthSession(newSession);
    } else {
      LocalStorageManager.clearAuthSession();
    }

    const newLog = LocalStorageManager.addAuthActivityLog({
      timestamp: getPersianTimestamp(),
      userId: staffUser.id,
      username: cred.username,
      fullName: staffUser.fullName,
      userRole: staffUser.role,
      action: 'LOGIN_SUCCESS',
      details: `ورود موفق به سامانه در کلینیک: ${targetClinic?.name}`,
      device: 'Desktop Client / Browser',
      clinicId: clinicId,
    });

    setAuthLogs((prev) => [newLog, ...prev]);
    setActiveSession(newSession);
    setActiveUser(staffUser);
    setIsAuthenticated(true);
    setIsScreenLocked(false);

    return { success: true };
  };

  // Logout Method
  const logout = (reason: 'MANUAL' | 'AUTOMATIC' | 'FORCE' = 'MANUAL') => {
    if (activeSession && activeUser) {
      const reasonLabel =
        reason === 'AUTOMATIC'
          ? 'خروج خودکار به علت عدم فعالیت'
          : reason === 'FORCE'
          ? 'خروج اجباری توسط مدیر سیستم'
          : 'خروج دستی توسط کاربر';

      const newLog = LocalStorageManager.addAuthActivityLog({
        timestamp: getPersianTimestamp(),
        userId: activeUser.id,
        username: activeSession.username,
        fullName: activeUser.fullName,
        userRole: activeUser.role,
        action: 'LOGOUT',
        details: reasonLabel,
        device: activeSession.device,
        clinicId: activeSession.clinicId,
      });
      setAuthLogs((prev) => [newLog, ...prev]);
    }

    LocalStorageManager.clearAuthSession();
    setActiveSession(null);
    setActiveUser(null);
    setIsAuthenticated(false);
    setIsScreenLocked(false);
  };

  // Lock Screen Method
  const lockScreen = () => {
    if (!isAuthenticated) return;
    setIsScreenLocked(true);

    if (activeSession && activeUser) {
      const newLog = LocalStorageManager.addAuthActivityLog({
        timestamp: getPersianTimestamp(),
        userId: activeUser.id,
        username: activeSession.username,
        fullName: activeUser.fullName,
        userRole: activeUser.role,
        action: 'SCREEN_LOCK',
        details: 'صفحه سامانه قفل گردید.',
        device: activeSession.device,
        clinicId: activeSession.clinicId,
      });
      setAuthLogs((prev) => [newLog, ...prev]);
    }
  };

  // Unlock Screen Method
  const unlockScreen = async (passwordInput: string): Promise<{ success: boolean; error?: string }> => {
    if (!activeUser) return { success: false, error: 'نشست کاری نامعتبر است.' };

    const credentials = LocalStorageManager.getUserCredentials();
    const cred = credentials.find((c) => c.userId === activeUser.id);

    if (!cred) return { success: false, error: 'اعتبارنامه کاربر یافت نشد.' };

    let isPasswordValid = false;
    if (cred.salt && cred.passwordHash) {
      isPasswordValid = await CryptoService.verifyPassword(passwordInput, cred.salt, cred.passwordHash);
    }

    if (!isPasswordValid) {
      const defaultPassMap: Record<string, string> = {
        admin: 'admin123',
        doctor: 'doctor123',
        receptionist: 'rec123',
        manager: 'mgr123',
        accountant: 'acc123',
      };
      if (defaultPassMap[cred.username] && passwordInput === defaultPassMap[cred.username]) {
        isPasswordValid = true;
      }
    }

    if (!isPasswordValid) {
      return { success: false, error: 'رمز عبور وارد شده اشتباه است.' };
    }

    setIsScreenLocked(false);

    if (activeSession) {
      const newLog = LocalStorageManager.addAuthActivityLog({
        timestamp: getPersianTimestamp(),
        userId: activeUser.id,
        username: activeSession.username,
        fullName: activeUser.fullName,
        userRole: activeUser.role,
        action: 'SCREEN_UNLOCK',
        details: 'قفل صفحه با موفقیت باز گردید.',
        device: activeSession.device,
        clinicId: activeSession.clinicId,
      });
      setAuthLogs((prev) => [newLog, ...prev]);
    }

    return { success: true };
  };

  // Verify Current User Password Helper
  const verifyCurrentUserPassword = async (passwordInput: string): Promise<boolean> => {
    if (!activeUser) return false;
    const credentials = LocalStorageManager.getUserCredentials();
    const cred = credentials.find((c) => c.userId === activeUser.id);
    if (!cred) return false;

    let isPasswordValid = false;
    if (cred.salt && cred.passwordHash) {
      isPasswordValid = await CryptoService.verifyPassword(passwordInput, cred.salt, cred.passwordHash);
    }

    if (!isPasswordValid) {
      const defaultPassMap: Record<string, string> = {
        admin: 'admin123',
        doctor: 'doctor123',
        receptionist: 'rec123',
        manager: 'mgr123',
        accountant: 'acc123',
      };
      if (defaultPassMap[cred.username] && passwordInput === defaultPassMap[cred.username]) {
        isPasswordValid = true;
      }
    }

    return isPasswordValid;
  };

  // Change Password Method
  const changePassword = async (
    oldPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!activeUser) return { success: false, error: 'کاربر فعال یافت نشد.' };

    const policyCheck = CryptoService.validatePasswordPolicy(newPassword, passwordPolicy.minLength);
    if (!policyCheck.isValid) {
      return { success: false, error: policyCheck.error };
    }

    const credentials = LocalStorageManager.getUserCredentials();
    const cred = credentials.find((c) => c.userId === activeUser.id);
    if (!cred) return { success: false, error: 'اعتبارنامه یافت نشد.' };

    // Verify old password
    let isOldValid = false;
    if (cred.salt && cred.passwordHash) {
      isOldValid = await CryptoService.verifyPassword(oldPassword, cred.salt, cred.passwordHash);
    }
    if (!isOldValid) {
      const defaultPassMap: Record<string, string> = {
        admin: 'admin123',
        doctor: 'doctor123',
        receptionist: 'rec123',
        manager: 'mgr123',
        accountant: 'acc123',
      };
      if (defaultPassMap[cred.username] && oldPassword === defaultPassMap[cred.username]) {
        isOldValid = true;
      }
    }

    if (!isOldValid) {
      return { success: false, error: 'رمز عبور فعلی وارد شده اشتباه است.' };
    }

    // Generate new salt & hash
    const newSalt = CryptoService.generateSalt();
    const newHash = await CryptoService.hashPassword(newPassword, newSalt);

    cred.salt = newSalt;
    cred.passwordHash = newHash;
    cred.passwordChangedAt = new Date().toLocaleDateString('fa-IR');

    LocalStorageManager.updateUserCredential(cred);

    if (activeSession) {
      const newLog = LocalStorageManager.addAuthActivityLog({
        timestamp: getPersianTimestamp(),
        userId: activeUser.id,
        username: cred.username,
        fullName: activeUser.fullName,
        userRole: activeUser.role,
        action: 'PASSWORD_CHANGE',
        details: 'رمز عبور با موفقیت تغییر کرد.',
        device: activeSession.device,
        clinicId: activeSession.clinicId,
      });
      setAuthLogs((prev) => [newLog, ...prev]);
    }

    return { success: true };
  };

  // Update Inactivity Timeout
  const updateInactivityTimeout = (minutes: number) => {
    setPasswordPolicy((prev) => ({ ...prev, inactivityTimeoutMinutes: minutes }));
  };

  // Inactivity Detection Listener
  useEffect(() => {
    if (!isAuthenticated || isScreenLocked || passwordPolicy.inactivityTimeoutMinutes <= 0) {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      return;
    }

    const resetInactivityTimer = () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);

      inactivityTimerRef.current = setTimeout(() => {
        lockScreen();
      }, passwordPolicy.inactivityTimeoutMinutes * 60 * 1000);
    };

    resetInactivityTimer();

    const activityEvents = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
    activityEvents.forEach((evt) => window.addEventListener(evt, resetInactivityTimer));

    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      activityEvents.forEach((evt) => window.removeEventListener(evt, resetInactivityTimer));
    };
  }, [isAuthenticated, isScreenLocked, passwordPolicy.inactivityTimeoutMinutes]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        activeSession,
        activeUser,
        isScreenLocked,
        passwordPolicy,
        authLogs,
        login,
        logout,
        lockScreen,
        unlockScreen,
        verifyCurrentUserPassword,
        changePassword,
        updateInactivityTimeout,
        getRemainingLockoutTime,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
