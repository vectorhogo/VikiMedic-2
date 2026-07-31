/**
 * VikiMedic v2 - Main Windows Desktop Layout Frame
 * Clean Architecture Layer: Presentation
 */

import React, { useState } from 'react';
import { useClinic } from '../../../application/ClinicContext';
import { useAuth } from '../../../application/AuthContext';
import { LoginPage } from '../auth/LoginPage';
import { LockScreenModal } from '../auth/LockScreenModal';
import { AuthActivityLogModal } from '../auth/AuthActivityLogModal';
import { ChangePasswordModal } from '../auth/ChangePasswordModal';

import { DesktopTitleBar } from '../window/DesktopTitleBar';
import { WindowsCommandBar } from '../window/WindowsCommandBar';
import { DesktopSidebar } from './DesktopSidebar';
import { StatusBar } from './StatusBar';
import { GlobalCommandPalette } from '../window/GlobalCommandPalette';
import { ContextMenu } from '../window/ContextMenu';
import { NotificationToasts } from '../window/NotificationToasts';
import { NewPatientModal } from '../modals/NewPatientModal';
import { NewAppointmentModal } from '../modals/NewAppointmentModal';
import { PrintInvoiceModal } from '../modals/PrintInvoiceModal';
import { PrintPrescriptionModal } from '../modals/PrintPrescriptionModal';
import { OrderReceiptPrintModal } from '../orders/OrderReceiptPrintModal';
import { RoseThemePinModal } from '../modals/RoseThemePinModal';
import { ShiftControlCenterModal } from '../shift/ShiftControlCenterModal';
import { InitialClinicSetupWizardModal } from '../system/InitialClinicSetupWizardModal';
import { VikiAssistant } from '../assistant/VikiAssistant';

import { DashboardModule } from '../../modules/DashboardModule';
import { PatientsModule } from '../../modules/PatientsModule';
import { QueueModule } from '../../modules/QueueModule';
import { DoctorEMRModule } from '../../modules/DoctorEMRModule';
import { FinancialsModule } from '../../modules/FinancialsModule';
import { PharmacyModule } from '../../modules/PharmacyModule';
import { MedicalStaffCenterModule } from '../../modules/MedicalStaffCenterModule';
import { ReportsModule } from '../../modules/ReportsModule';
import { StaffAccessModule } from '../../modules/StaffAccessModule';
import { SettingsModule } from '../../modules/SettingsModule';
import { DesignSystemModule } from '../../modules/DesignSystemModule';
import { ArchitectureModule } from '../../modules/ArchitectureModule';
import { AiRulesModule } from '../../modules/AiRulesModule';
import { QualityAssuranceModule } from '../../modules/QualityAssuranceModule';
import { BootstrapModule } from '../../modules/BootstrapModule';
import { DevEnvironmentModule } from '../../modules/DevEnvironmentModule';
import { SharedInfrastructureModule } from '../../modules/SharedInfrastructureModule';
import { DatabaseArchitectureModule } from '../../modules/DatabaseArchitectureModule';

export const DesktopLayout: React.FC = () => {
  const { activeModule } = useClinic();
  const { isAuthenticated, isScreenLocked } = useAuth();

  const [isAuthLogsOpen, setIsAuthLogsOpen] = useState<boolean>(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState<boolean>(false);

  // If not authenticated, render Login Page
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardModule />;
      case 'patients':
        return <PatientsModule />;
      case 'queue':
        return <QueueModule />;
      case 'doctor_emr':
        return <DoctorEMRModule />;
      case 'financials':
        return <FinancialsModule />;
      case 'pharmacy':
        return <PharmacyModule />;
      case 'medical_staff_center':
        return <MedicalStaffCenterModule />;
      case 'reports':
        return <ReportsModule />;
      case 'staff':
        return <StaffAccessModule />;
      case 'settings':
        return <SettingsModule />;
      case 'design_system':
        return <DesignSystemModule />;
      case 'architecture':
        return <ArchitectureModule />;
      case 'ai_rules':
        return <AiRulesModule />;
      case 'quality_assurance':
        return <QualityAssuranceModule />;
      case 'app_bootstrap':
        return <BootstrapModule />;
      case 'dev_environment':
        return <DevEnvironmentModule />;
      case 'shared_infrastructure':
        return <SharedInfrastructureModule />;
      case 'database_architecture':
        return <DatabaseArchitectureModule />;
      default:
        return <DashboardModule />;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[var(--bg-app)] text-[var(--text-main)] select-none">
      {/* 1. Windows Native TitleBar */}
      <DesktopTitleBar />

      {/* 2. Top Menu Command Bar */}
      <WindowsCommandBar
        onOpenAuthLogs={() => setIsAuthLogsOpen(true)}
        onOpenChangePassword={() => setIsChangePasswordOpen(true)}
      />

      {/* 3. Main Desktop Workarea: Sidebar + Module Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        <DesktopSidebar />

        <main className="flex-1 overflow-y-auto bg-[var(--bg-app)] relative">
          {renderModule()}
        </main>
      </div>

      {/* 4. Desktop Bottom Status Bar */}
      <StatusBar />

      {/* 5. Modals & Overlays */}
      <GlobalCommandPalette />
      <ContextMenu />
      <NotificationToasts />
      <NewPatientModal />
      <NewAppointmentModal />
      <PrintInvoiceModal />
      <PrintPrescriptionModal />
      <OrderReceiptPrintModal />
      <RoseThemePinModal />
      <ShiftControlCenterModal />
      <InitialClinicSetupWizardModal />
      <VikiAssistant />

      {/* Auth Modals & Screen Lock Overlay */}
      {isScreenLocked && <LockScreenModal />}
      <AuthActivityLogModal isOpen={isAuthLogsOpen} onClose={() => setIsAuthLogsOpen(false)} />
      <ChangePasswordModal isOpen={isChangePasswordOpen} onClose={() => setIsChangePasswordOpen(false)} />
    </div>
  );
};
