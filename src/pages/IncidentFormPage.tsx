import React, { useState } from 'react';
import {
  FilePlus2,
  Calendar,
  AlertTriangle,
  User,
  MapPin,
  CheckCircle2,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { useIncidents } from '../context/IncidentContext';
import { IncidentCategory } from '../types';

interface IncidentFormPageProps {
  onNavigate: (tab: string) => void;
}

export const IncidentFormPage: React.FC<IncidentFormPageProps> = ({ onNavigate }) => {
  const { createIncident } = useIncidents();

  const [title, setTitle] = useState('');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().slice(0, 16));
  const [category, setCategory] = useState<IncidentCategory>('harassment');
  const [severityRating, setSeverityRating] = useState<'mild' | 'moderate' | 'severe'>('moderate');
  const [perpetratorName, setPerpetratorName] = useState('');
  const [perpetratorHandle, setPerpetratorHandle] = useState('');
  const [perpetratorRelationship, setPerpetratorRelationship] = useState('');
  const [locationOrPlatform, setLocationOrPlatform] = useState('Instagram Direct');
  const [narrative, setNarrative] = useState('');
  const [impactDescription, setImpactDescription] = useState('');
  const [witnessNotes, setWitnessNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !narrative.trim()) {
      setError('Please provide at least a title and a narrative description of the incident.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createIncident({
        title,
        incident_date: new Date(incidentDate).toISOString(),
        category,
        status: 'preserved',
        severity_self_rating: severityRating,
        perpetrator_name: perpetratorName.trim() || undefined,
        perpetrator_handle: perpetratorHandle.trim() || undefined,
        perpetrator_relationship: perpetratorRelationship.trim() || undefined,
        location_or_platform: locationOrPlatform,
        narrative,
        impact_description: impactDescription.trim() || undefined,
        witness_notes: witnessNotes.trim() || undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        onNavigate('dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Failed to record incident report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
        <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          Auto-Encrypted & Hashed upon Save
        </span>
      </div>

      {/* Main Card */}
      <div className="rounded-2xl bg-[#0F172A]/90 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="border-b border-slate-800 pb-5 mb-6">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-9 h-9 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center border border-brand-500/30">
              <FilePlus2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white">Document Incident Statement</h1>
              <p className="text-xs text-slate-400">
                Record facts systematically. All entries receive cryptographic timestamps for legal and personal protection.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Incident recorded successfully! AI Risk Assessment generated. Redirecting...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Overview */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
              <span>1. Overview & Classification</span>
            </h2>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Incident Title / Summary Headline *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Unsolicited threatening WhatsApp messages and workplace monitoring"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Initial Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as IncidentCategory)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 transition-colors"
                >
                  <option value="harassment">Harassment</option>
                  <option value="stalking">Stalking</option>
                  <option value="cyberbullying">Cyberbullying</option>
                  <option value="threats">Threats</option>
                  <option value="blackmail">Blackmail / Extortion</option>
                  <option value="relationship_disputes">Relationship Dispute</option>
                  <option value="possible_deception">Possible Deception / Impersonation</option>
                  <option value="other">Other / Unclassified</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Date & Time of Occurrence *
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    required
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 transition-colors"
                  />
                  <Calendar className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Severity Self-Rating
                </label>
                <select
                  value={severityRating}
                  onChange={(e) => setSeverityRating(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 transition-colors"
                >
                  <option value="mild">Mild (Distressful)</option>
                  <option value="moderate">Moderate (Escalating)</option>
                  <option value="severe">Severe (Imminent / Extreme)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Person of Interest */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
              <span>2. Person of Interest & Platform</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Perpetrator Name / Alias
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={perpetratorName}
                    onChange={(e) => setPerpetratorName(e.target.value)}
                    placeholder="Full name or nickname"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Online Handle / Phone Number
                </label>
                <input
                  type="text"
                  value={perpetratorHandle}
                  onChange={(e) => setPerpetratorHandle(e.target.value)}
                  placeholder="@handle or phone number"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Prior Relationship
                </label>
                <input
                  type="text"
                  value={perpetratorRelationship}
                  onChange={(e) => setPerpetratorRelationship(e.target.value)}
                  placeholder="e.g. Ex-partner, Colleague, Stranger"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Location or Digital Platform *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={locationOrPlatform}
                  onChange={(e) => setLocationOrPlatform(e.target.value)}
                  placeholder="e.g. WhatsApp, Instagram DM, Workplace lobby, Discord, SMS"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Detailed Statement */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
              <span>3. Incident Narrative & Impact</span>
            </h2>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Detailed Narrative Statement *
              </label>
              <textarea
                required
                rows={5}
                value={narrative}
                onChange={(e) => setNarrative(e.target.value)}
                placeholder="Describe what occurred with exact chronological details. Include quotes of words used, threats issued, frequency of contact, or actions taken."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 leading-relaxed"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Tip: Quote exact messages whenever possible. SafeGuard AI will categorize key risk factors.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Personal & Emotional Impact
                </label>
                <textarea
                  rows={3}
                  value={impactDescription}
                  onChange={(e) => setImpactDescription(e.target.value)}
                  placeholder="e.g. Forced change of commute route, loss of sleep, medical visit, missed work."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Witnesses & Third-Party Observations
                </label>
                <textarea
                  rows={3}
                  value={witnessNotes}
                  onChange={(e) => setWitnessNotes(e.target.value)}
                  placeholder="Names of friends, colleagues, or security personnel who witnessed interactions."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-[11px] text-slate-400">
              Files and media can be securely attached in the <strong>Evidence Vault</strong> after saving.
            </span>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-1/2 sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all hover:scale-[1.02]"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSubmitting ? 'Securing & Evaluating...' : 'Save & Analyze Risk'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
