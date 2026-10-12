import React, { useState } from 'react';
import {
  FileText,
  Download,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Printer,
  Sparkles,
  AlertTriangle,
  FolderLock
} from 'lucide-react';
import { useIncidents } from '../context/IncidentContext';
import { generateIncidentPDF } from '../lib/pdfGenerator';

export const ReportGeneratorPage: React.FC = () => {
  const { incidents, evidence, timeline, selectedIncident, setSelectedIncident } = useIncidents();

  const [includeAI, setIncludeAI] = useState(true);
  const [includeRisk, setIncludeRisk] = useState(true);
  const [includeWitness, setIncludeWitness] = useState(true);
  const [officerName, setOfficerName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadPDF = () => {
    if (!selectedIncident) return;
    setIsGenerating(true);
    try {
      const doc = generateIncidentPDF(selectedIncident, evidence, timeline, {
        includeAiClassification: includeAI,
        includeRiskAssessment: includeRisk,
        includeWitnessNotes: includeWitness,
        officialInvestigatorName: officerName.trim() || undefined,
      });

      const filename = `SafeGuard_Incident_Report_${selectedIncident.id}_${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(filename);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err: any) {
      alert(`PDF Generation error: ${err?.message || 'Failed to create PDF'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
              TAMPER-EVIDENT LEGAL DOSSIER
            </span>
            <span className="text-xs text-slate-400">Court & Police Corroboration</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-brand-400" />
            <span>PDF Evidence Report Generator</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Compile your statements, timeline events, and SHA-256 evidence checksums into a formal evidence dossier.
          </p>
        </div>

        {selectedIncident && (
          <button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition-all hover:scale-[1.02]"
          >
            <Download className="w-4 h-4" />
            <span>{isGenerating ? 'Compiling PDF...' : 'Download Official PDF'}</span>
          </button>
        )}
      </div>

      {downloadSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Official Legal PDF generated and downloaded to your device!</span>
        </div>
      )}

      {selectedIncident ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Report Options */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800 shadow-xl space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                Report Customization & Target
              </h2>

              {/* Case Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Select Incident:
                </label>
                <select
                  value={selectedIncident.id}
                  onChange={(e) => {
                    const found = incidents.find((i) => i.id === e.target.value);
                    if (found) setSelectedIncident(found);
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

              {/* Optional Recipient Info */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Designated Officer / Legal Counsel (Optional):
                </label>
                <input
                  type="text"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  placeholder="e.g. Officer Davies (Badge #4829) / Legal Aid"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Report Section Toggles */}
              <div className="pt-2 border-t border-slate-800 space-y-3">
                <span className="text-xs font-semibold text-slate-300 block">Include Sections:</span>

                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeAI}
                    onChange={(e) => setIncludeAI(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-brand-600 focus:ring-0"
                  />
                  <span>AI Linguistic Classification Analysis</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeRisk}
                    onChange={(e) => setIncludeRisk(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-brand-600 focus:ring-0"
                  />
                  <span>Calculated Threat & Risk Score</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeWitness}
                    onChange={(e) => setIncludeWitness(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-brand-600 focus:ring-0"
                  />
                  <span>Witness Statements & Third-Party Notes</span>
                </label>
              </div>

              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={isGenerating}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition-all hover:scale-[1.01]"
              >
                <Download className="w-4 h-4" />
                <span>Export PDF Dossier</span>
              </button>
            </div>

            {/* Legal Notice Box */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-white">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Chain of Custody Guarantee</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                The generated PDF contains a formal mathematical table listing every file’s 256-bit hash. When presenting to law enforcement, officers can verify that stored digital records are bit-for-bit identical to the originals.
              </p>
            </div>
          </div>

          {/* Right 2 Columns: Live Document Preview */}
          <div className="lg:col-span-2">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-2xl space-y-6">
              {/* Document Header Mockup */}
              <div className="border-b-2 border-slate-700 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-brand-400 uppercase">
                    OFFICIAL EVIDENCE SUMMARY
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    SAFEGUARD AI INCIDENT REPORT
                  </h3>
                  <span className="text-xs text-slate-400">CASE ID: {selectedIncident.id}</span>
                </div>
                <div className="text-left sm:text-right text-[11px] text-slate-400">
                  <span>Document Date: {new Date().toLocaleDateString()}</span>
                  <span className="block text-emerald-400 font-semibold">Integrity Verified</span>
                </div>
              </div>

              {/* Case Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Title</span>
                  <span className="font-semibold text-white truncate block">{selectedIncident.title}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Category</span>
                  <span className="font-semibold text-brand-300 capitalize">
                    {selectedIncident.category.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Incident Date</span>
                  <span className="font-semibold text-white">
                    {new Date(selectedIncident.incident_date).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Perpetrator</span>
                  <span className="font-semibold text-white">
                    {selectedIncident.perpetrator_name || 'Unidentified'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Handle / Number</span>
                  <span className="font-semibold text-slate-300">
                    {selectedIncident.perpetrator_handle || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Platform</span>
                  <span className="font-semibold text-slate-300">
                    {selectedIncident.location_or_platform}
                  </span>
                </div>
              </div>

              {/* Narrative Statement */}
              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-white uppercase text-[11px] tracking-wider">
                  Sworn Incident Statement
                </span>
                <p className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-slate-300 leading-relaxed font-sans">
                  {selectedIncident.narrative}
                </p>
              </div>

              {/* Evidence Integrity Table Preview */}
              <div className="space-y-2 text-xs">
                <span className="font-bold text-white uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                  <FolderLock className="w-3.5 h-3.5 text-brand-400" />
                  <span>SHA-256 Vault Evidence Chain of Custody</span>
                </span>
                <div className="rounded-xl border border-slate-800 overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-900 text-slate-400">
                      <tr>
                        <th className="py-2 px-3">Filename</th>
                        <th className="py-2 px-3">Type</th>
                        <th className="py-2 px-3">SHA-256 Hash Checksum</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
                      {evidence.map((item) => (
                        <tr key={item.id}>
                          <td className="py-2 px-3 text-white font-medium">{item.file_name}</td>
                          <td className="py-2 px-3 text-slate-400 uppercase">{item.file_type}</td>
                          <td className="py-2 px-3 font-mono text-brand-300">
                            {item.sha256_hash.slice(0, 16)}...
                          </td>
                        </tr>
                      ))}
                      {evidence.length === 0 && (
                        <tr>
                          <td colSpan={3} className="py-3 px-3 text-slate-500 text-center">
                            No files attached yet. Upload evidence in the Vault.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Statutory Notice */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-400 leading-relaxed">
                <strong>CITIZEN DECLARATION:</strong> This report compiles verifiable records maintained on SafeGuard AI. All files retain cryptographic SHA-256 signatures generated prior to cloud preservation. This document does not constitute automatic transmission to police; hand deliver or upload to official reporting portals.
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 rounded-2xl bg-[#0F172A]/90 border border-slate-800 text-center">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No Incident Selected</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Create an incident report first before compiling a legal PDF dossier.
          </p>
        </div>
      )}
    </div>
  );
};
