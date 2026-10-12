import React from 'react';
import { Shield, ShieldAlert, User, Menu, Sparkles, Database } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useIncidents } from '../../context/IncidentContext';
import { QuickExitButton } from '../common/QuickExitButton';

interface NavbarProps {
  onToggleSidebar: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, setActiveTab }) => {
  const { user, isDemoMode, isConfigured, signOut } = useAuth();
  const { selectedIncident, incidents, setSelectedIncident } = useIncidents();

  return (
    <header className="sticky top-0 z-40 bg-[#0F172A]/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Menu toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-white">SafeGuard</span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Encrypted Evidence & Safety Platform</p>
            </div>
          </div>
        </div>

        {/* Middle: Active Case Selector */}
        {incidents.length > 0 && (
          <div className="hidden md:flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300">
            <span className="text-slate-500 font-medium">Active Case:</span>
            <select
              value={selectedIncident?.id || ''}
              onChange={(e) => {
                const found = incidents.find(i => i.id === e.target.value);
                if (found) setSelectedIncident(found);
              }}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer max-w-[220px] truncate"
            >
              {incidents.map((inc) => (
                <option key={inc.id} value={inc.id} className="bg-slate-900 text-slate-200">
                  {inc.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Right: Quick Exit, Demo Indicator, Emergency Button, Profile */}
        <div className="flex items-center gap-2.5">
          {/* Quick Exit Panic Button */}
          <QuickExitButton />

          {/* Emergency One-Tap Button */}
          <button
            onClick={() => setActiveTab('emergency')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-semibold transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">Emergency Help</span>
          </button>

          {/* Supabase / Demo indicator */}
          <div className="hidden xl:flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-800/60 border border-slate-700/60 text-[11px] text-slate-400">
            {isConfigured ? (
              <>
                <Database className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Supabase Connected</span>
              </>
            ) : isDemoMode ? (
              <>
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span className="text-amber-400 font-medium">Preview Demo Mode</span>
              </>
            ) : null}
          </div>

          {/* User Profile / Logout */}
          {user && (
            <div className="flex items-center gap-2 pl-1 border-l border-slate-800">
              <button
                onClick={() => setActiveTab('settings')}
                title={user.email}
                className="flex items-center gap-2 p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 text-xs"
              >
                <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 font-medium">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
                <span className="hidden lg:inline text-xs font-medium max-w-[100px] truncate">{user.full_name}</span>
              </button>
              <button
                onClick={signOut}
                className="text-xs text-slate-400 hover:text-rose-400 px-2 py-1 rounded hover:bg-slate-800 transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
