import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  FileText,
  PhoneCall,
  RefreshCw
} from 'lucide-react';
import { useIncidents } from '../context/IncidentContext';
import { evaluateRiskLevel } from '../lib/aiService';
import { RiskAssessment } from '../types';

interface RiskIndicationPageProps {
  onNavigate: (tab: string) => void;
}

export const RiskIndicationPage: React.FC<RiskIndicationPageProps> = ({ onNavigate }) => {
  const { selectedIncident, incidents, evidence, setSelectedIncident } = useIncidents();

  const [activeRisk, setActiveRisk] = useState<RiskAssessment | null>(
    selectedIncident?.risk_assessment || null
  );
  const [reEvaluating, setReEvaluating] = useState(false);

  const handleReEvaluate = async () => {
    if (!selectedIncident) return;
    setReEvaluating(true);
    try {
      const result = await evaluateRiskLevel(
        selectedIncident.narrative,
        selectedIncident.category,
        evidence.length
      );
      setActiveRisk(result);
    } finally {
      setReEvaluating(false);
    }
  };

  const riskLevel = activeRisk?.level || 'low';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              OBJECTIVE DANGER ASSESSMENT
            </span>
            <span className="text-xs text-slate-400">Non-Alarmist Algorithmic Aid</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
            <span>Risk Indication & Threat Analysis</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Cautious risk scoring evaluating physical threats, location awareness, extortion, and contact acceleration.
          </p>
        </div>

        {selectedIncident && (
          <button
            onClick={handleReEvaluate}
            disabled={reEvaluating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${reEvaluating ? 'animate-spin' : ''}`} />
            <span>Re-evaluate Threat Factors</span>
          </button>
        )}
      </div>

      {/* Case Selector Banner */}
      {incidents.length > 0 && (
        <div className="p-4 rounded-xl bg-[#0F172A]/90 border border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">Evaluating Record:</span>
          <select
            value={selectedIncident?.id || ''}
            onChange={(e) => {
              const found = incidents.find((i) => i.id === e.target.value);
              if (found) {
                setSelectedIncident(found);
                setActiveRisk(found.risk_assessment || null);
              }
            }}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500 font-semibold"
          >
            {incidents.map((i) => (
              <option key={i.id} value={i.id}>
                {i.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {activeRisk ? (
        <div className="space-y-6">
          {/* Main Risk Severity Banner */}
          <div
            className={`p-6 rounded-2xl border shadow-xl relative overflow-hidden ${
              riskLevel === 'high'
                ? 'bg-gradient-to-br from-rose-950/40 via-red-950/20 to-[#0F172A] border-rose-500/40'
                : riskLevel === 'medium'
                ? 'bg-gradient-to-br from-amber-950/40 via-yellow-950/20 to-[#0F172A] border-amber-500/40'
                : 'bg-gradient-to-br from-emerald-950/40 via-teal-950/20 to-[#0F172A] border-emerald-500/40'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                      riskLevel === 'high'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : riskLevel === 'medium'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {riskLevel} RISK THREAT LEVEL
                  </span>
                  <span className="text-xs text-slate-400">Score: {activeRisk.score} / 10</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white">{activeRisk.rationale}</h2>

                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Calculated based on linguistic patterns, documented threats, digital harassment frequency, and cryptographic evidence stored.
                </p>
              </div>

              {/* Quick Action Button depending on risk */}
              <div className="flex flex-col gap-2.5 sm:min-w-[200px]">
                {riskLevel === 'high' && (
                  <button
                    onClick={() => onNavigate('emergency')}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-900/50 transition-all hover:scale-[1.02]"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Emergency Assistance</span>
                  </button>
                )}
                <button
                  onClick={() => onNavigate('reports')}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
                >
                  <FileText className="w-4 h-4 text-brand-400" />
                  <span>Generate Legal PDF Report</span>
                </button>
              </div>
            </div>
          </div>

          {/* Risk Factors Breakdown */}
          <div className="p-6 rounded-2xl bg-[#0F172A]/90 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-400" />
              <span>Contributing Danger Factors & Indicators</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeRisk.factors.map((factor, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border space-y-1.5 text-xs ${
                    factor.severity === 'high'
                      ? 'bg-rose-950/20 border-rose-500/30'
                      : factor.severity === 'medium'
                      ? 'bg-amber-950/20 border-amber-500/30'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{factor.factor}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        factor.severity === 'high'
                          ? 'bg-rose-500/20 text-rose-300'
                          : factor.severity === 'medium'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {factor.severity}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{factor.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Immediate Action Items Checklist */}
          <div className="p-6 rounded-2xl bg-[#0F172A]/90 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Recommended Immediate Safety Steps</span>
            </h3>

            <div className="space-y-2.5">
              {activeRisk.immediate_actions.map((action, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs text-slate-200"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Formal Legal Disclaimer Box */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <span className="font-bold text-slate-300 block">Formal Transparency Notice:</span>
            <p className="leading-relaxed">{activeRisk.disclaimer}</p>
          </div>
        </div>
      ) : (
        <div className="p-12 rounded-2xl bg-[#0F172A]/90 border border-slate-800 text-center">
          <AlertTriangle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No Risk Evaluation Available</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Log an incident first to automatically generate a cautious threat indication.
          </p>
          <button
            onClick={() => onNavigate('new-incident')}
            className="mt-4 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold"
          >
            Create Incident Report
          </button>
        </div>
      )}
    </div>
  );
};
