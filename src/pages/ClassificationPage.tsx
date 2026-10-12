import React, { useState } from 'react';
import {
  BrainCircuit,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Scale
} from 'lucide-react';
import { useIncidents } from '../context/IncidentContext';
import { classifyIncidentText } from '../lib/aiService';
import { AIClassification } from '../types';

export const ClassificationPage: React.FC = () => {
  const { selectedIncident, incidents, setSelectedIncident } = useIncidents();

  const [testText, setTestText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [activeResult, setActiveResult] = useState<AIClassification | null>(
    selectedIncident?.ai_classification || null
  );

  const handleRunAnalysis = async (textToAnalyze: string) => {
    if (!textToAnalyze.trim()) return;
    setAnalyzing(true);
    try {
      const result = await classifyIncidentText(textToAnalyze);
      setActiveResult(result);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
            NATURAL LANGUAGE EVALUATION
          </span>
          <span className="text-xs text-slate-400">Strict Server-Side / Heuristic Privacy</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <BrainCircuit className="w-6 h-6 text-brand-400" />
          <span>AI Incident Classification</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Objective linguistic categorization into statutory definitions: Harassment, Stalking, Cyberbullying, Threats, Blackmail, Relationship Disputes, or Deception.
        </p>
      </div>

      {/* Case Switcher & Custom Test Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Input Sandbox */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800 shadow-lg space-y-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
              <span>Select Active Incident</span>
              <Sparkles className="w-4 h-4 text-brand-400" />
            </h2>

            {incidents.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs text-slate-400">Saved Incident:</label>
                <select
                  value={selectedIncident?.id || ''}
                  onChange={(e) => {
                    const found = incidents.find((i) => i.id === e.target.value);
                    if (found) {
                      setSelectedIncident(found);
                      if (found.ai_classification) {
                        setActiveResult(found.ai_classification);
                      } else {
                        handleRunAnalysis(found.narrative);
                      }
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                >
                  {incidents.map((inc) => (
                    <option key={inc.id} value={inc.id}>
                      {inc.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Or Test Any Incident Narrative:
              </label>
              <textarea
                rows={5}
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="Paste or type suspicious messages, threatening communications, or stalking observations to classify..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 leading-relaxed"
              />
              <button
                type="button"
                onClick={() => handleRunAnalysis(testText)}
                disabled={analyzing || !testText.trim()}
                className="mt-2.5 w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all"
              >
                {analyzing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Linguistic Patterns...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run AI Classification</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Privacy Guarantee Card */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Zero-Storage Guarantee</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Analyzed text is processed solely in memory for category matching. Raw text is never retained or indexed for AI model retraining.
            </p>
          </div>
        </div>

        {/* Right 2 Columns: Analysis Results View */}
        <div className="lg:col-span-2 space-y-6">
          {activeResult ? (
            <div className="p-6 rounded-2xl bg-[#0F172A]/90 border border-slate-800 shadow-xl space-y-6">
              {/* Primary Category Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Primary Classified Offense
                  </span>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl font-extrabold text-white capitalize">
                      {activeResult.primary_category.replace('_', ' ')}
                    </h2>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                      {Math.round(activeResult.confidence_score * 100)}% Match
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Evaluated At</span>
                  <span className="text-xs text-slate-400">
                    {new Date(activeResult.analyzed_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Confidence Spectrum */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <span>Confidence Level</span>
                  <span>{Math.round(activeResult.confidence_score * 100)}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-indigo-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.round(activeResult.confidence_score * 100)}%` }}
                  />
                </div>
              </div>

              {/* Secondary Overlapping Categories */}
              {activeResult.secondary_categories.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-300 block">
                    Secondary Overlapping Patterns:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeResult.secondary_categories.map((sec) => (
                      <div
                        key={sec.category}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs"
                      >
                        <span className="text-slate-300 capitalize">{sec.category.replace('_', ' ')}</span>
                        <span className="text-[10px] font-bold text-slate-500">
                          {Math.round(sec.score * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Indicators Identified */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Identified Linguistic & Behavioral Indicators</span>
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {activeResult.key_indicators.map((indicator, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-200 flex items-center gap-2.5"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0" />
                      <span>{indicator}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legal Context & Statutory Definition */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Scale className="w-4 h-4 text-brand-400" />
                  <span>Legal & Statutory Framework Overview</span>
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeResult.legal_context}
                </p>
                <p className="text-[10px] text-slate-500 italic">
                  Note: This analytical explanation illustrates standard statutory interpretations and does not constitute formal legal representation.
                </p>
              </div>

              {/* Recommended Steps */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  <span>Recommended Protective Steps</span>
                </span>
                <div className="space-y-2">
                  {activeResult.recommended_steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-200 flex items-start gap-2.5"
                    >
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-[#0F172A]/90 border border-slate-800 text-center">
              <BrainCircuit className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white">No Narrative Evaluated Yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Select an incident from the left or paste sample communication text into the sandbox to generate a full statutory breakdown.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
