/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ThemeProvider } from './presentation/ThemeContext';
import { PerformanceProvider } from './presentation/PerformanceContext';
import { AuthProvider } from './application/AuthContext';
import { ClinicProvider } from './application/ClinicContext';
import { PermissionProvider } from './application/PermissionContext';
import { DesktopLayout } from './presentation/components/layout/DesktopLayout';

export default function App() {
  return (
    <ThemeProvider>
      <PerformanceProvider>
        <AuthProvider>
          <ClinicProvider>
            <PermissionProvider>
              <DesktopLayout />
            </PermissionProvider>
          </ClinicProvider>
        </AuthProvider>
      </PerformanceProvider>
    </ThemeProvider>
  );
}
