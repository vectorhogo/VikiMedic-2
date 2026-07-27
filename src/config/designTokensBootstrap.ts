/**
 * VikiMedic v2 - Centralized Design Tokens Bootstrap
 * Clean Architecture Layer: Configuration / Design System
 *
 * Enforces 4px baseline grid, radii rule, color palette variables,
 * typography scales, border widths, shadows, opacities, and animations.
 */

export const DESIGN_TOKENS_BOOTSTRAP = {
  spacing: {
    unit: 4,
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  typography: {
    fontFamilyPrimary: 'IRANYekanX, Vazirmatn, sans-serif',
    fontFamilyDisplay: 'Playfair Display, serif',
    scale: {
      caption: '11px',
      bodySm: '12px',
      bodyMd: '14px',
      bodyLg: '16px',
      headingSm: '18px',
      headingMd: '20px',
      headingLg: '24px',
      display: '32px',
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.7,
    },
  },
  radii: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    pill: '9999px',
    nestedInnerRadius: (outerRadiusPx: number, paddingPx: number) => `${Math.max(0, outerRadiusPx - paddingPx)}px`,
  },
  borders: {
    hairline: '1px solid var(--border-subtle)',
    focus: '2px solid var(--accent-primary)',
    error: '1.5px solid #ef4444',
  },
  shadows: {
    subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
    card: '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
    elevated: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  animations: {
    fastDuration: '150ms',
    normalDuration: '250ms',
    slowDuration: '400ms',
    cubicEase: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  opacities: {
    disabled: 0.5,
    hoverBg: 0.08,
    activeBg: 0.16,
    backdrop: 0.6,
  },
};
