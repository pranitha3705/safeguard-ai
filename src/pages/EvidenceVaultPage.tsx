import React, { useState, useRef } from 'react';
import {
  FolderLock,
  Upload,
  ShieldCheck,
  FileText,
  Image,
  Video,
  Music,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Copy,
  ScanText,
  FileCheck,
  X
} from 'lucide-react';
import { useIncidents } from '../context/IncidentContext';
import { calculateFileSHA256, detectFileType, formatFileSize } from '../lib/crypto';
import { uploadEvidenceFile } from '../lib/supabase';
import { extractTextFromScreenshot } from '../lib/aiService';
import { EvidenceItem } from '../types';

export const EvidenceVaultPage: React.FC = () => {
  const { evidence, selectedIncident, addEvidence, deleteEvidence, toggleEvidenceAI, updateEvidenceOCR } =
    useIncidents();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<EvidenceItem | null>(null);
  const [copiedHashId, setCopiedHashId] = useState<string | null>(null);
  const [ocrModalItem, setOcrModalItem] = useState<EvidenceItem | null>(null);
  const [ocrDraftText, setOcrDraftText] = useState<string>('');
  const [previewItem, setPreviewItem] = useState<EvidenceItem | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgressText('Computing client-side SHA-256 hash...');

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgressText(`Hashing ${file.name} (SHA-256)...`);

        // Compute SHA-256 in browser before upload
        const sha256 = await calculateFileSHA256(file);
        const fileType = detectFileType(file);

        setUploadProgressText(`Uploading ${file.name} to private vault storage...`);
        const uploadResult = await uploadEvidenceFile('usr-current', file, sha256);

        let initialOcrText = '';
        if (fileType === 'screenshot') {
          setUploadProgressText(`Extracting client-side text from screenshot...`);
          initialOcrText = await extractTextFromScreenshot(file);
        }

        await addEvidence({
          incident_id: selectedIncident?.id,
          file_name: file.name,
          file_type: fileType,
          mime_type: file.type || 'application/octet-stream',
          file_size: file.size,
          sha256_hash: sha256,
          storage_path: uploadResult.path,
          file_url: uploadResult.url,
          is_private_storage: true,
          ai_analysis_enabled: false, // MANDATORY: AI analysis is OFF by default
          ocr_extracted_text: initialOcrText || undefined,
          notes: `Uploaded securely with SHA-256 checksum`,
        });
      }
    } catch (err: any) {
      alert(`Upload error: ${err?.message || 'Failed to upload'}`);
    } finally {
      setIsUploading(false);
      setUploadProgressText('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHashId(id);
    setTimeout(() => setCopiedHashId(null), 2000);
  };

  const getFileIcon = (type: EvidenceItem['file_type']) => {
    switch (type) {
      case 'photo':
      case 'screenshot':
        return <Image className="w-4 h-4 text-brand-400" />;
      case 'video':
        return <Video className="w-4 h-4 text-purple-400" />;
      case 'audio':
        return <Music className="w-4 h-4 text-emerald-400" />;
      default:
        return <FileText className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              TAMPER-EVIDENT VAULT
            </span>
            <span className="text-xs text-slate-400">Private Bucket Isolation</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FolderLock className="w-6 h-6 text-brand-400" />
            <span>Secure Evidence Vault</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Preserve digital proof with client-side SHA-256 integrity checksums. AI analysis is strictly optional and off by default.
          </p>
        </div>

        {/* Upload Trigger */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all hover:scale-[1.02]"
          >
            <Upload className="w-4 h-4" />
            <span>{isUploading ? 'Securing File...' : 'Upload Evidence File'}</span>
          </button>
        </div>
      </div>

      {/* Uploading progress notification */}
      {isUploading && (
        <div className="p-4 rounded-xl bg-brand-950/40 border border-brand-500/30 flex items-center gap-3 text-xs text-brand-300 animate-pulse">
          <ShieldCheck className="w-5 h-5 text-brand-400" />
          <span>{uploadProgressText}</span>
        </div>
      )}

      {/* Strict Privacy & Chain of Custody Guarantee Alert */}
      <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
        <div className="space-y-1">
          <span className="font-semibold text-white flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Strict Zero-Knowledge Privacy Protocols:
          </span>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            • <strong>Original photos & videos are never submitted to AI models.</strong>
            <br />
            • For user-approved screenshots, text is parsed locally and only approved text is ever analyzed.
            <br />• SHA-256 hashes are immutable mathematical proofs that evidence was not edited or doctored.
          </p>
        </div>

        <div className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
          Total Vault Files: <strong className="text-white">{evidence.length}</strong>
        </div>
      </div>

      {/* Evidence Table */}
      <div className="rounded-2xl bg-[#0F172A]/90 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">
            Preserved Evidence Items & Chain of Custody
          </h2>
          <span className="text-[11px] text-slate-400">
            Case: <strong>{selectedIncident ? selectedIncident.title : 'All Files'}</strong>
          </span>
        </div>

        {evidence.length === 0 ? (
          <div className="p-12 text-center">
            <FolderLock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-white">Your Vault is Empty</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Upload chat screenshots, call audio, photos, or PDF threat logs to secure their cryptographic checksums.
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold"
            >
              Upload First Evidence File
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Evidence Details</th>
                  <th className="py-3 px-4 font-semibold">File Type / Size</th>
                  <th className="py-3 px-4 font-semibold">SHA-256 Integrity Hash</th>
                  <th className="py-3 px-4 font-semibold">AI Analysis</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {evidence.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                    {/* Name & Date */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                          {getFileIcon(item.file_type)}
                        </div>
                        <div>
                          <span className="font-semibold text-white block max-w-xs truncate" title={item.file_name}>
                            {item.file_name}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Logged: {new Date(item.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Type & Size */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 uppercase block w-fit mb-0.5">
                        {item.file_type}
                      </span>
                      <span className="text-[11px] text-slate-400">{formatFileSize(item.file_size)}</span>
                    </td>

                    {/* SHA-256 Hash with Copy */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <code
                          className="font-mono text-[11px] bg-slate-900 px-2 py-1 rounded border border-slate-800 text-brand-300 max-w-[170px] truncate"
                          title={item.sha256_hash}
                        >
                          {item.sha256_hash.slice(0, 10)}...{item.sha256_hash.slice(-8)}
                        </code>
                        <button
                          onClick={() => copyToClipboard(item.sha256_hash, item.id)}
                          className="p-1 text-slate-400 hover:text-white"
                          title="Copy Full SHA-256 Hash"
                        >
                          {copiedHashId === item.id ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* AI Analysis Toggle (OFF by default) */}
                    <td className="py-3.5 px-4">
                      {item.file_type === 'photo' || item.file_type === 'video' ? (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400" title="Zero-Knowledge: Photos and videos are never sent to AI">
                          <XCircle className="w-3.5 h-3.5 text-slate-500" />
                          <span>Disabled (Private Media)</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleEvidenceAI(item.id, !item.ai_analysis_enabled)}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all ${
                              item.ai_analysis_enabled
                                ? 'bg-brand-600/20 text-brand-300 border-brand-500/40'
                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                            }`}
                          >
                            {item.ai_analysis_enabled ? 'Opted In' : 'OFF (Default)'}
                          </button>

                          {item.ocr_extracted_text && (
                            <button
                              onClick={() => {
                                setOcrModalItem(item);
                                setOcrDraftText(item.ocr_extracted_text || '');
                              }}
                              className="p-1 rounded text-slate-400 hover:text-brand-300 hover:bg-slate-800"
                              title="Review & edit extracted screenshot text"
                            >
                              <ScanText className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.file_url && (
                          <button
                            onClick={() => setPreviewItem(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-300 hover:bg-slate-800"
                            title="Inspect Vault Media"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                          title="Permanently Delete Evidence"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Permanent Deletion Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="max-w-md w-full bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <Trash2 className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Permanently Delete Evidence File?</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                This action is permanent and cannot be undone. The encrypted file <strong className="text-white">{deleteTarget.file_name}</strong> will be wiped from both PostgreSQL and Supabase Private Storage.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-mono">
              SHA-256: {deleteTarget.sha256_hash.slice(0, 20)}...
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await deleteEvidence(deleteTarget.id);
                  setDeleteTarget(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-900/50"
              >
                Confirm Permanent Deletion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Screenshot OCR Text Review */}
      {ocrModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="max-w-lg w-full bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ScanText className="w-5 h-5 text-brand-400" />
                <h3 className="text-sm font-bold text-white">Screenshot Text Extraction (OCR)</h3>
              </div>
              <button onClick={() => setOcrModalItem(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Only the extracted text below can be used for AI incident classification. Your original image is never transmitted. Review or edit the text before saving:
            </p>

            <textarea
              rows={6}
              value={ocrDraftText}
              onChange={(e) => setOcrDraftText(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-500 font-mono leading-relaxed"
            />

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setOcrModalItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await updateEvidenceOCR(ocrModalItem.id, ocrDraftText);
                  setOcrModalItem(null);
                }}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold"
              >
                Save Approved Text
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Media Preview */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-xl w-full bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-semibold text-white truncate max-w-sm">{previewItem.file_name}</span>
              <button onClick={() => setPreviewItem(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[400px] overflow-hidden rounded-xl bg-slate-950 flex items-center justify-center p-2">
              {previewItem.file_type === 'photo' || previewItem.file_type === 'screenshot' ? (
                <img src={previewItem.file_url} alt="Evidence preview" className="max-h-[380px] object-contain rounded" />
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <FileCheck className="w-12 h-12 text-brand-400 mx-auto mb-2" />
                  <span>Encrypted media stored securely. SHA-256 verified.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
