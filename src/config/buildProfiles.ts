/**
 * VikiMedic v2 - Build Profiles Configuration
 * Clean Architecture Layer: Configuration
 *
 * Defines build targets for Desktop Development, Desktop Production,
 * Web Development, and Web Production.
 */

import { BuildProfile } from '../packages/types/bootstrap';

export const BUILD_PROFILES: BuildProfile[] = [
  {
    id: 'desktop_dev',
    name: 'Desktop Development (Tauri + Vite)',
    nameFA: 'توسعه دسکتاپ (Tauri + Vite)',
    platform: 'WINDOWS_DESKTOP',
    environment: 'DEVELOPMENT',
    enableSourceMaps: true,
    minify: false,
    bundleTarget: 'es2022',
    tauriIntegration: true,
    port: 3000,
  },
  {
    id: 'desktop_prod',
    name: 'Desktop Production (Executable / Native Installer)',
    nameFA: 'تولید نهایی دسکتاپ (فایل اجرایی Win32 / MSI)',
    platform: 'WINDOWS_DESKTOP',
    environment: 'PRODUCTION',
    enableSourceMaps: false,
    minify: true,
    bundleTarget: 'es2022',
    tauriIntegration: true,
    port: 3000,
  },
  {
    id: 'web_dev',
    name: 'Web SPA Development Server',
    nameFA: 'سرور توسعه وب (Vite Dev Server)',
    platform: 'WEB_SPA',
    environment: 'DEVELOPMENT',
    enableSourceMaps: true,
    minify: false,
    bundleTarget: 'esnext',
    tauriIntegration: false,
    port: 3000,
  },
  {
    id: 'web_prod',
    name: 'Web SPA Production Build (/dist)',
    nameFA: 'نسخه انتشار وب (Static Distribution)',
    platform: 'WEB_SPA',
    environment: 'PRODUCTION',
    enableSourceMaps: false,
    minify: true,
    bundleTarget: 'es2020',
    tauriIntegration: false,
    port: 3000,
  },
];
