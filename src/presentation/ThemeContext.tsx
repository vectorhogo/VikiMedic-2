/**
 * VikiMedic v2 - Theme Provider & Context
 * Clean Architecture Layer: Presentation
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeType } from '../domain/types';

interface ThemeContextProps {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
  themeTitleFA: string;
  isRoseUnlocked: boolean;
  verifyAndUnlockRose: (pin: string) => boolean;
  isPinModalOpen: boolean;
  setIsPinModalOpen: (open: boolean) => void;
}

const THEME_STORAGE_KEY = 'vikimedic_v2_active_theme';
const ROSE_UNLOCKED_STORAGE_KEY = 'vikimedic_v2_rose_unlocked';

const ThemeContext = createContext<ThemeContextProps>({
  theme: 'theme-dark',
  setTheme: () => {},
  toggleTheme: () => {},
  themeTitleFA: 'تم تاریک پیشرفته (Sophisticated Dark)',
  isRoseUnlocked: false,
  verifyAndUnlockRose: () => false,
  isPinModalOpen: false,
  setIsPinModalOpen: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return (saved as ThemeType) || 'theme-dark';
  });

  const [isRoseUnlocked, setIsRoseUnlocked] = useState<boolean>(() => {
    return localStorage.getItem(ROSE_UNLOCKED_STORAGE_KEY) === 'true';
  });

  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  useEffect(() => {
    // Remove existing theme classes
    document.documentElement.classList.remove('theme-default', 'clinic-olive', 'theme-dark', 'theme-rose');
    // Apply new theme class
    document.documentElement.classList.add(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    if (theme === 'theme-default') {
      setThemeState('clinic-olive');
    } else if (theme === 'clinic-olive') {
      setThemeState('theme-dark');
    } else if (theme === 'theme-dark') {
      if (isRoseUnlocked) {
        setThemeState('theme-rose');
      } else {
        setThemeState('theme-default');
      }
    } else {
      setThemeState('theme-default');
    }
  };

  const verifyAndUnlockRose = (pin: string): boolean => {
    if (pin.trim() === '8585') {
      setIsRoseUnlocked(true);
      localStorage.setItem(ROSE_UNLOCKED_STORAGE_KEY, 'true');
      setThemeState('theme-rose');
      return true;
    }
    return false;
  };

  const getThemeTitleFA = (t: ThemeType): string => {
    switch (t) {
      case 'theme-default':
        return 'تم سفید پزشکی (Medical White)';
      case 'clinic-olive':
        return 'تم سبز پاستلی و مات کلینیک (Minimal Olive - سبز)';
      case 'theme-dark':
        return 'تم دارک و شب (Dark Theme)';
      case 'theme-rose':
        return 'تم رز لوکس (Hidden Rose Luxe)';
      default:
        return 'تم سفید پزشکی';
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: setThemeState,
        toggleTheme,
        themeTitleFA: getThemeTitleFA(theme),
        isRoseUnlocked,
        verifyAndUnlockRose,
        isPinModalOpen,
        setIsPinModalOpen,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

