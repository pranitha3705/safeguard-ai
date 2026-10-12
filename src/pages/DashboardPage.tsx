import React from 'react';
import {
  ShieldAlert,
  FolderLock,
  GitCommit,
  FilePlus2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  TrendingUp,
  PhoneCall,
  Clock
} from 'lucide-react';
import { useIncidents } from '../context/IncidentContext';
import { useAuth } from '../context/AuthContext';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { incidents, evidence, timeline, selectedIncident } = useIncidents();

  const currentRisk = selectedIncident?.risk_assessment?.level || 'low';
  const highRiskIncidents = incidents.filter(i => i.risk_assessment?.level === 'high').length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0F172A] via-[#162038] to-[#0F172A] p-6 border border-slate-800 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Safe Session Active
              </span>
              <span className="text-xs text-slate-400">Personal Protected Space</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Welcome back, {user?.full_name || 'Protected User'}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              All incident reports, digital media, and chain-of-custody checksums are encrypted with SHA-256 and accessible only to your account.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('new-incident')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/25 transition-all hover:scale-[1.02]"
            >
              <FilePlus2 className="w-4 h-4" />
              <span>Log New Incident</span>
            </button>
            <button
              onClick={() => onNavigate('vault')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
            >
              <FolderLock className="w-4 h-4 text-brand-400" />
              <span>Evidence Vault</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Incidents */}
        <div className="p-4 rounded-xl bg-[#0F172A]/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Recorded Incidents</span>
            <GitCommit className="w-4 h-4 text-brand-400" />
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{incidents.length}</span>
            <span className="text-[11px] text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> Logged & Signed
            </span>
          </div>
        </div>

        {/* Preserved Evidence Files */}
        <div className="p-4 rounded-xl bg-[#0F172A]/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Preserved Evidence</span>
            <FolderLock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{evidence.length}</span>
            <span className="text-[11px] text-emerald-400 font-medium">
              100% SHA-256 Hashed
            </span>
          </div>
        </div>

        {/* Current Risk Indicator */}
        <div
          onClick={() => onNavigate('risk-assessment')}
          className="p-4 rounded-xl bg-[#0F172A]/90 border border-slate-800 shadow-sm cursor-pointer hover:border-slate-700 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Current Risk Level</span>
            <AlertTriangle
              className={`w-4 h-4 ${
                currentRisk === 'high'
                  ? 'text-rose-400'
                  : currentRisk === 'medium'
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            />
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span
              className={`text-2xl font-bold uppercase ${
                currentRisk === 'high'
                  ? 'text-rose-400'
                  : currentRisk === 'medium'
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {currentRisk}
            </span>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              {highRiskIncidents} urgent alert{highRiskIncidents === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        {/* Privacy & Integrity Status */}
        <div className="p-4 rounded-xl bg-[#0F172A]/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Vault Security</span>
            <Lock className="w-4 h-4 text-brand-400" />
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-lg font-bold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Isolated RLS
            </span>
            <span className="text-[11px] text-slate-400">Private Bucket</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Case Analysis & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Case Overview */}
        <div className="lg:col-span-2 space-y-6">
          {selectedIncident ? (
            <div className="p-5 sm:p-6 rounded-2xl bg-[#0F172A]/90 border border-slate-800 shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30 uppercase">
                      {selectedIncident.category.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400">
                      Logged {new Date(selectedIncident.incident_date).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-white">{selectedIncident.title}</h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('reports')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-brand-400" />
                    <span>Export Legal PDF</span>
                  </button>
                  <button
                    onClick={() => onNavigate('classification')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600/20 hover:bg-brand-600 text-brand-300 hover:text-white text-xs font-medium border border-brand-500/30 transition-colors"
                  >
                    <span>AI Breakdown</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Narrative snippet */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                <span className="font-semibold text-slate-200 block mb-1">Incident Narrative:</span>
                <p className="line-clamp-3">{selectedIncident.narrative}</p>
              </div>

              {/* Key Indicators & Perpetrator Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
                  <span className="text-slate-400 text-[11px] block">Person of Interest / Identifier</span>
                  <span className="font-semibold text-white mt-0.5 block">
                    {selectedIncident.perpetrator_name || 'Unidentified'} ({selectedIncident.perpetrator_handle || 'No handle'})
                  </span>
                  <span className="text-slate-400 text-[11px] mt-1 block">
                    Platform: <strong className="text-slate-300">{selectedIncident.location_or_platform}</strong>
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
                  <span className="text-slate-400 text-[11px] block">AI Classification Confidence</span>
                  <span className="font-semibold text-brand-300 mt-0.5 flex items-center gap-1.5">
                    {selectedIncident.ai_classification ? (
                      <>
                        <span>{Math.round(selectedIncident.ai_classification.confidence_score * 100)}% Match</span>
                        <span className="text-slate-400 font-normal">
                          ({selectedIncident.ai_classification.primary_category})
                        </span>
                      </>
                    ) : (
                      'Ready for analysis'
                    )}
                  </span>
                  <span className="text-slate-400 text-[11px] mt-1 block">
                    Status: <strong className="text-emerald-400">{selectedIncident.status}</strong>
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-[#0F172A]/90 border border-slate-800 text-center">
              <FilePlus2 className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <h3 className="text-base font-semibold text-white">No Incidents Logged Yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Begin by documenting your first incident. You can add timeline events, photos, screenshots, and audio recordings.
              </p>
              <button
                onClick={() => onNavigate('new-incident')}
                className="mt-4 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold"
              >
                Create Incident Report
              </button>
            </div>
          )}

          {/* Recent Timeline Activity */}
          <div className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-400" />
                <span>Recent Timeline Events</span>
              </h3>
              <button
                onClick={() => onNavigate('timeline')}
                className="text-xs text-brand-400 hover:text-brand-300 font-medium"
              >
                View Full Timeline ({timeline.length})
              </button>
            </div>

            <div className="space-y-3">
              {timeline.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200">{item.title}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          item.severity === 'high'
                            ? 'bg-rose-500/20 text-rose-300'
                            : item.severity === 'medium'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {item.severity}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-1">{item.description}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 whitespace-nowrap">
                    {new Date(item.event_date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Action Cards & Safety Hub */}
        <div className="space-y-4">
          {/* Emergency Safety Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-950/40 via-red-950/20 to-slate-900 border border-rose-500/30 shadow-lg">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold mb-2">
              <PhoneCall className="w-4 h-4" />
              <span>Emergency Safety Hotline</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              If you feel in imminent physical danger, connect immediately with verified crisis hotlines or local emergency services.
            </p>
            <button
              onClick={() => onNavigate('emergency')}
              className="w-full py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-rose-900/50 transition-colors"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Access Emergency Help</span>
            </button>
          </div>

          {/* AI Safety Assistant Quick Chat */}
          <div className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-white">Confidential AI Assistant</span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-brand-500/20 text-brand-300">
                Encrypted
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Get immediate guidance on legal definitions, de-escalation strategies, and evidence preservation guidelines.
            </p>
            <button
              onClick={() => onNavigate('assistant')}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <span>Ask AI Safety Assistant</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-brand-400" />
            </button>
          </div>

          {/* Evidence Vault Status */}
          <div className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-white">Evidence Integrity Status</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span>Hashing Algorithm:</span>
                <strong className="text-slate-200 font-mono">SHA-256</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span>Bucket Privacy:</span>
                <strong className="text-emerald-400">Private (Signed URLs)</strong>
              </div>
              <div className="flex justify-between py-1">
                <span>AI Photo Inspection:</span>
                <strong className="text-rose-400">OFF (Strict Privacy)</strong>
              </div>
            </div>
            <button
              onClick={() => onNavigate('vault')}
              className="mt-3 w-full py-2 px-3 rounded-xl bg-brand-600/10 hover:bg-brand-600/20 text-brand-300 text-xs font-medium border border-brand-500/20 transition-colors"
            >
              Manage Vault Files
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
