/**
 * VikiMedic v2 - Centralized Design Token Engine
 * Clean Architecture Layer: Domain / Shared Standards
 *
 * Single Source of Truth for visual design tokens: Colors, Typography,
 * Spacing, Border Radii, Shadows, Animations, Opacities, and Icons.
 */

export const DESIGN_TOKENS = {
  version: '2.0.0',
  systemName: 'VikiMedic Design Tokens',

  colors: {
    primary: {
      medicalWhite: 'var(--bg-surface)',
      softBlue: 'var(--accent-light)',
      medicalGreen: 'var(--status-success)',
      royalBlue: 'var(--accent-primary)',
    },
    secondary: {
      lightGray: '#f8fafc',
      softSilver: '#e2e8f0',
      darkSlate: '#0f172a',
    },
    accent: {
      royalBlue: 'var(--accent-primary)',
      successGreen: 'var(--status-success)',
      warningOrange: 'var(--status-warning)',
      dangerRed: 'var(--status-danger)',
      infoCyan: '#06b6d4',
      roseLuxe: '#e11d48',
    },
    neutrals: {
      appBg: 'var(--bg-app)',
      cardBg: 'var(--bg-card)',
      sidebarBg: 'var(--bg-sidebar)',
      textMain: 'var(--text-main)',
      textMuted: 'var(--text-muted)',
      borderSubtle: 'var(--border-subtle)',
    },
  },

  typography: {
    primaryFont: 'IRANYekanX, Vazirmatn, "Noto Sans Arabic", Tahoma, sans-serif',
    displayFont: 'IRANYekanX, Vazirmatn, sans-serif',
    monoFont: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    scale: {
      xs: { size: '11px', lineHeight: '1.4', weight: '500' },
      sm: { size: '12px', lineHeight: '1.5', weight: '500' },
      base: { size: '14px', lineHeight: '1.6', weight: '400' },
      lg: { size: '16px', lineHeight: '1.6', weight: '600' },
      xl: { size: '18px', lineHeight: '1.5', weight: '700' },
      xxl: { size: '24px', lineHeight: '1.3', weight: '900' },
    },
    rules: [
      'Strict RTL layout orientation',
      'Balanced Persian line-height (1.5 - 1.7)',
      'Persian numbers for prices and dates',
      'Never truncate or cut Persian words awkwardly',
    ],
  },

  spacing: {
    unit: 4, // 4px baseline grid
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },

  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    full: '9999px',
    nestedRule: 'Inner Radius = Outer Radius - Padding',
  },

  shadows: {
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
    roseGlow: '0 0 20px 0 rgba(225, 29, 72, 0.2)',
  },

  animations: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '220ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '350ms cubic-bezier(0.4, 0, 0.2, 1)',
    effects: ['Fade In', 'Scale Up', 'Ripple Effect', 'Slide Over'],
  },

  accessibility: {
    touchTargetMin: '44px',
    contrastRatioMin: '4.5:1 (WCAG AA)',
    keyboardFocusRing: '2px solid var(--accent-primary)',
  },
} as const;

export type DesignTokenSystem = typeof DESIGN_TOKENS;
