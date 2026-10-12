import React from 'react';
import {
  LayoutDashboard,
  FilePlus2,
  FolderLock,
  GitCommit,
  BrainCircuit,
  AlertTriangle,
  Bot,
  PhoneCall,
  FileText,
  Sliders,
  ShieldCheck,
  X
} from 'lucide-react';
import { useIncidents } from '../../context/IncidentContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
}) => {
  const { evidence, timeline, selectedIncident } = useIncidents();

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'new-incident',
      label: 'Report Incident',
      icon: FilePlus2,
      badge: null,
    },
    {
      id: 'vault',
      label: 'Secure Evidence Vault',
      icon: FolderLock,
      badge: evidence.length > 0 ? evidence.length : null,
    },
    {
      id: 'timeline',
      label: 'Case Timeline',
      icon: GitCommit,
      badge: timeline.length > 0 ? timeline.length : null,
    },
    {
      id: 'classification',
      label: 'AI Incident Classification',
      icon: BrainCircuit,
      badge: 'AI',
    },
    {
      id: 'risk-assessment',
      label: 'Risk Indication',
      icon: AlertTriangle,
      badge: selectedIncident?.risk_assessment?.level?.toUpperCase() || null,
      badgeColor:
        selectedIncident?.risk_assessment?.level === 'high'
          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
          : selectedIncident?.risk_assessment?.level === 'medium'
          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'assistant',
      label: 'AI Safety Assistant',
      icon: Bot,
      badge: 'Private',
    },
    {
      id: 'emergency',
      label: 'Emergency Help',
      icon: PhoneCall,
      highlight: true,
      badge: '24/7',
    },
    {
      id: 'reports',
      label: 'PDF Report Generator',
      icon: FileText,
      badge: 'Export',
    },
    {
      id: 'settings',
      label: 'Privacy Settings',
      icon: Sliders,
      badge: null,
    },
  ];

  const handleSelect = (id: string) => {
    setActiveTab(id);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0E1526] border-r border-slate-800/80 flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header (visible on mobile drawer) */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white text-base">SafeGuard AI</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Assurance Tag */}
        <div className="px-4 pt-4 pb-2">
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] leading-relaxed text-slate-400">
            <div className="flex items-center gap-1.5 font-semibold text-slate-200 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Encrypted Storage Active</span>
            </div>
            <p>SHA-256 pre-upload hashing & isolated RLS storage. Zero automatic police dispatch.</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-brand-600/15 text-brand-300 border border-brand-500/30 shadow-sm'
                    : item.highlight
                    ? 'text-rose-300 hover:bg-rose-500/10 hover:text-rose-200 border border-rose-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive
                        ? 'text-brand-400'
                        : item.highlight
                        ? 'text-rose-400'
                        : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span className="tracking-wide">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      item.badgeColor ||
                      (isActive
                        ? 'bg-brand-500/30 text-brand-200 border-brand-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer info */}
        <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
          <span>SafeGuard AI v1.0</span>
          <span className="text-emerald-400 font-medium">Privacy Hardened</span>
        </div>
      </aside>
    </>
  );
};
