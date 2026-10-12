import React, { useState } from 'react';
import {
  GitCommit,
  Plus,
  Filter,
  Calendar,
  AlertTriangle,
  FolderLock,
  MessageSquare,
  Clock,
  Trash2,
  X
} from 'lucide-react';
import { useIncidents } from '../context/IncidentContext';
import { RiskLevel, TimelineEvent } from '../types';

export const TimelinePage: React.FC = () => {
  const { timeline, selectedIncident, addTimelineEvent, deleteTimelineEvent } = useIncidents();

  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterSearch, setFilterSearch] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Form state for new timeline entry
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 16));
  const [newSeverity, setNewSeverity] = useState<RiskLevel>('medium');
  const [newDescription, setNewDescription] = useState('');

  const filteredEvents = timeline.filter((event) => {
    if (filterSeverity !== 'all' && event.severity !== filterSeverity) return false;
    if (
      filterSearch &&
      !event.title.toLowerCase().includes(filterSearch.toLowerCase()) &&
      !event.description.toLowerCase().includes(filterSearch.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await addTimelineEvent({
      incident_id: selectedIncident?.id,
      event_date: new Date(newDate).toISOString(),
      title: newTitle,
      description: newDescription,
      category: 'threat_escalation',
      severity: newSeverity,
      source: 'manual',
    });

    setNewTitle('');
    setNewDescription('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
              CHRONOLOGICAL CORROBORATION
            </span>
            <span className="text-xs text-slate-400">Court-Admissible Timeline</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <GitCommit className="w-6 h-6 text-brand-400" />
            <span>Case Timeline</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Visual chronological chain of threats, evidence uploads, perpetrator interactions, and escalations.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Timeline Event</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-[#0F172A]/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Filter className="w-4 h-4" />
            <span>Severity:</span>
          </div>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
          >
            <option value="all">All Severities</option>
            <option value="high">High Severity Only</option>
            <option value="medium">Medium Severity</option>
            <option value="low">Low Severity</option>
          </select>
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            placeholder="Search timeline notes..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 sm:pl-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800 space-y-6">
        {filteredEvents.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#0F172A]/90 border border-slate-800 text-center">
            <Clock className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-white">No Matching Timeline Events</h3>
            <p className="text-xs text-slate-400 mt-1">
              Change your filter or click "Add Timeline Event" to log an interaction.
            </p>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div key={event.id} className="relative group">
              {/* Timeline Node Point */}
              <div
                className={`absolute -left-6 sm:-left-8 top-3 w-4 h-4 rounded-full border-2 border-[#0B0F19] transition-transform group-hover:scale-125 ${
                  event.severity === 'high'
                    ? 'bg-rose-500 ring-4 ring-rose-500/20'
                    : event.severity === 'medium'
                    ? 'bg-amber-500 ring-4 ring-amber-500/20'
                    : 'bg-emerald-500 ring-4 ring-emerald-500/20'
                }`}
              />

              {/* Event Card */}
              <div className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800 hover:border-slate-700 transition-colors shadow-md space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        event.severity === 'high'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : event.severity === 'medium'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {event.severity} SEVERITY
                    </span>

                    <span className="text-[10px] text-slate-400 font-medium px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                      {event.source === 'evidence' ? (
                        <span className="flex items-center gap-1">
                          <FolderLock className="w-3 h-3 text-emerald-400" /> Evidence Checked
                        </span>
                      ) : event.source === 'incident' ? (
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 text-brand-400" /> Incident Statement
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <GitCommit className="w-3 h-3 text-blue-400" /> Manual Entry
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {new Date(event.event_date).toLocaleString()}
                    </span>
                    <button
                      onClick={() => deleteTimelineEvent(event.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white">{event.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{event.description}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="max-w-md w-full bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <GitCommit className="w-5 h-5 text-brand-400" />
                <h3 className="text-sm font-bold text-white">Log Chronological Event</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Unannounced appearance at grocery store"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Assessed Severity</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as RiskLevel)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Event Narrative Details</label>
                <textarea
                  rows={4}
                  required
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Specific details of what was witnessed, statements spoken, or vehicle/person physical identifiers."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
