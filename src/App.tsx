import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { IncidentProvider } from './context/IncidentContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { IncidentFormPage } from './pages/IncidentFormPage';
import { EvidenceVaultPage } from './pages/EvidenceVaultPage';
import { TimelinePage } from './pages/TimelinePage';
import { ClassificationPage } from './pages/ClassificationPage';
import { RiskIndicationPage } from './pages/RiskIndicationPage';
import { SafetyAssistantPage } from './pages/SafetyAssistantPage';
import { EmergencyHelpPage } from './pages/EmergencyHelpPage';
import { ReportGeneratorPage } from './pages/ReportGeneratorPage';
import { PrivacySettingsPage } from './pages/PrivacySettingsPage';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080D1A] flex items-center justify-center text-slate-400 text-xs">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span>Initializing SafeGuard AI Vault...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans">
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && <DashboardPage onNavigate={setActiveTab} />}
          {activeTab === 'new-incident' && <IncidentFormPage onNavigate={setActiveTab} />}
          {activeTab === 'vault' && <EvidenceVaultPage />}
          {activeTab === 'timeline' && <TimelinePage />}
          {activeTab === 'classification' && <ClassificationPage />}
          {activeTab === 'risk-assessment' && <RiskIndicationPage onNavigate={setActiveTab} />}
          {activeTab === 'assistant' && <SafetyAssistantPage />}
          {activeTab === 'emergency' && <EmergencyHelpPage onNavigate={setActiveTab} />}
          {activeTab === 'reports' && <ReportGeneratorPage />}
          {activeTab === 'settings' && <PrivacySettingsPage />}
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <IncidentProvider>
        <AppContent />
      </IncidentProvider>
    </AuthProvider>
  );
}

export default App;
