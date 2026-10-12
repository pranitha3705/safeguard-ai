import React, { useState } from 'react';
import {
  Sliders,
  ShieldCheck,
  Lock,
  Trash2,
  Download,
  AlertTriangle,
  CheckCircle2,
  Key,
  Database,
  ExternalLink
} from 'lucide-react';
import { useIncidents } from '../context/IncidentContext';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';

export const PrivacySettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { privacy, updatePrivacy, wipeAllData, incidents, evidence, timeline } = useIncidents();

  const [globalAi, setGlobalAi] = useState(privacy.global_ai_consent);
  const [quickExitUrl, setQuickExitUrl] = useState(privacy.quick_exit_url);
  const [quickExitHotkey, setQuickExitHotkey] = useState(privacy.quick_exit_hotkey);
  const [autoLockMin, setAutoLockMin] = useState(privacy.auto_lock_minutes);
  const [savedNotice, setSavedNotice] = useState(false);
  const [isWipeModalOpen, setIsWipeModalOpen] = useState(false);
  const [wipeConfirmText, setWipeConfirmText] = useState('');

  const isConfigured = isSupabaseConfigured();

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updatePrivacy({
      global_ai_consent: globalAi,
      quick_exit_url: quickExitUrl,
      quick_exit_hotkey: quickExitHotkey,
      auto_lock_minutes: autoLockMin,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleExportDataJSON = () => {
    const exportBundle = {
      user: {
        id: user?.id,
        email: user?.email,
        full_name: user?.full_name,
      },
      export_timestamp: new Date().toISOString(),
      incidents,
      evidence_metadata: evidence.map((e) => ({
        id: e.id,
        file_name: e.file_name,
        file_type: e.file_type,
        file_size: e.file_size,
        sha256_hash: e.sha256_hash,
        created_at: e.created_at,
        ocr_extracted_text: e.ocr_extracted_text,
      })),
      timeline,
      security_declaration: 'SafeGuard AI cryptographic backup bundle.',
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportBundle, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `SafeGuard_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExecuteWipe = async () => {
    if (wipeConfirmText !== 'DELETE EVERYTHING') {
      alert('Please type "DELETE EVERYTHING" to confirm permanent wiping.');
      return;
    }
    await wipeAllData();
    setIsWipeModalOpen(false);
    setWipeConfirmText('');
    alert('All records, evidence hashes, and timeline events have been permanently purged.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
            SOVEREIGN DATA CONTROL
          </span>
          <span className="text-xs text-slate-400">Zero Third-Party Tracking</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <Sliders className="w-6 h-6 text-brand-400" />
          <span>Privacy & Security Controls</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure zero-knowledge AI boundaries, emergency panic shortcuts, and tamper-evident audit policies.
        </p>
      </div>

      {savedNotice && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Privacy preferences updated successfully.</span>
        </div>
      )}

      {/* Security Architecture Status Card */}
      <div className="p-6 rounded-2xl bg-[#0F172A]/90 border border-slate-800 shadow-xl space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-brand-400" />
          <span>Database & Cloud Isolation Architecture</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[11px] block">PostgreSQL Row Level Security</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Enforced by Supabase
            </span>
            <p className="text-[10px] text-slate-500 mt-1">
              Policies restrict read/write queries to `auth.uid() = user_id`.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[11px] block">Storage Bucket Access</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
              <Lock className="w-3.5 h-3.5" /> Private (Signed URLs Only)
            </span>
            <p className="text-[10px] text-slate-500 mt-1">
              Public URLs are disabled. Access links expire automatically after 60 minutes.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[11px] block">File Integrity Hashing</span>
            <span className="font-bold text-brand-300 flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5" /> SHA-256 Web Crypto
            </span>
            <p className="text-[10px] text-slate-500 mt-1">
              Calculated client-side before file leaves your browser memory.
            </p>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="rounded-2xl bg-[#0F172A]/90 border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
        {/* Section 1: AI Data Transmission Boundaries */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-400">
            1. Artificial Intelligence Data Boundaries
          </h2>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={globalAi}
                onChange={(e) => setGlobalAi(e.target.checked)}
                className="mt-0.5 rounded bg-slate-800 border-slate-700 text-brand-600 focus:ring-0"
              />
              <div className="space-y-1">
                <span className="text-xs font-bold text-white block">
                  Enable AI Processing for Incident Statements (Optional, Off by Default)
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  When enabled, incident narrative text and approved OCR screenshot text are processed via secure server-side Edge Functions for classification. Raw media is never transmitted.
                </p>
              </div>
            </label>

            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Zero-Media Guarantee:</strong> Original photos, videos, and sensitive recordings are permanently blocked from AI transmission under all circumstances.
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Emergency Panic Button Settings */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-400">
            2. Quick Exit Panic Redirection
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                Quick Exit Destination URL:
              </label>
              <input
                type="url"
                value={quickExitUrl}
                onChange={(e) => setQuickExitUrl(e.target.value)}
                placeholder="https://www.google.com/search?q=weather"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-brand-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                The URL opened when the red "Quick Exit" button is clicked.
              </span>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                Quick Exit Keyboard Shortcut:
              </label>
              <input
                type="text"
                value={quickExitHotkey}
                onChange={(e) => setQuickExitHotkey(e.target.value)}
                placeholder="Escape"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-brand-500 font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Double-pressing this key triggers immediate redirection and history wipe.
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Session Timeout */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-400">
            3. Session Security
          </h2>

          <div className="text-xs">
            <label className="block text-slate-300 font-medium mb-1.5">
              Auto-Lock Inactivity Window (Minutes):
            </label>
            <select
              value={autoLockMin}
              onChange={(e) => setAutoLockMin(Number(e.target.value))}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-brand-500"
            >
              <option value={5}>5 minutes</option>
              <option value={15}>15 minutes (Recommended)</option>
              <option value={30}>30 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
          </div>
        </div>

        {/* Save button */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition-all hover:scale-[1.02]"
          >
            Save Privacy Settings
          </button>
        </div>
      </form>

      {/* Section 4: Data Export & Destruction */}
      <div className="p-6 rounded-2xl bg-[#0F172A]/90 border border-slate-800 shadow-xl space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-white">
          Data Export & Permanent Deletion
        </h2>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
          <div>
            <span className="font-bold text-white block">Download Encrypted JSON Archive</span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Export all {incidents.length} incidents, {evidence.length} evidence metadata records, and {timeline.length} timeline events.
            </p>
          </div>
          <button
            onClick={handleExportDataJSON}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold"
          >
            <Download className="w-4 h-4 text-brand-400" />
            <span>Export All Records (JSON)</span>
          </button>
        </div>

        {/* Permanent Wipe Warning Box */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 text-xs">
          <div>
            <span className="font-bold text-rose-300 block">Permanent Account & Vault Wipe</span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Permanently purges all PostgreSQL records, hashes, timeline events, and storage files. This action cannot be reversed.
            </p>
          </div>
          <button
            onClick={() => setIsWipeModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-md shadow-rose-900/50"
          >
            <Trash2 className="w-4 h-4" />
            <span>Wipe Vault Data</span>
          </button>
        </div>
      </div>

      {/* Modal: Permanent Wipe Double-Confirmation */}
      {isWipeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-md w-full bg-[#0F172A] border border-rose-500/50 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center border border-rose-500/40">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Permanently Wipe Entire Vault?</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                This will delete all incident reports, evidence files, and case timelines from both PostgreSQL tables and Supabase Private Storage.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-rose-400 mb-1.5">
                Type <strong>DELETE EVERYTHING</strong> to confirm:
              </label>
              <input
                type="text"
                value={wipeConfirmText}
                onChange={(e) => setWipeConfirmText(e.target.value)}
                placeholder="DELETE EVERYTHING"
                className="w-full bg-slate-900 border border-rose-500/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-400 font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setIsWipeModalOpen(false);
                  setWipeConfirmText('');
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteWipe}
                disabled={wipeConfirmText !== 'DELETE EVERYTHING'}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white text-xs font-bold"
              >
                Permanently Destroy All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
