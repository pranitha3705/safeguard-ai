import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { Incident, EvidenceItem, TimelineEvent, PrivacyPreferences } from '../types';
import { supabase, isSupabaseConfigured, deletePrivateFile } from '../lib/supabase';
import { classifyIncidentText, evaluateRiskLevel } from '../lib/aiService';

interface IncidentContextType {
  incidents: Incident[];
  evidence: EvidenceItem[];
  timeline: TimelineEvent[];
  privacy: PrivacyPreferences;
  selectedIncident: Incident | null;
  setSelectedIncident: (incident: Incident | null) => void;
  createIncident: (incident: Omit<Incident, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Incident>;
  updateIncident: (id: string, updates: Partial<Incident>) => Promise<void>;
  deleteIncident: (id: string) => Promise<void>;
  addEvidence: (evidenceItem: Omit<EvidenceItem, 'id' | 'user_id' | 'created_at'>) => Promise<EvidenceItem>;
  deleteEvidence: (id: string) => Promise<void>;
  toggleEvidenceAI: (id: string, enabled: boolean) => Promise<void>;
  updateEvidenceOCR: (id: string, ocrText: string) => Promise<void>;
  addTimelineEvent: (event: Omit<TimelineEvent, 'id' | 'user_id' | 'created_at'>) => Promise<TimelineEvent>;
  deleteTimelineEvent: (id: string) => Promise<void>;
  updatePrivacy: (updates: Partial<PrivacyPreferences>) => void;
  wipeAllData: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const DEFAULT_PRIVACY: PrivacyPreferences = {
  global_ai_consent: false, // OFF by default
  quick_exit_hotkey: 'Escape',
  quick_exit_url: 'https://www.google.com/search?q=weather+today',
  discreet_mode: false,
  auto_lock_minutes: 15,
  share_anonymous_metrics: false,
};

const INITIAL_DEMO_INCIDENTS: Incident[] = [
  {
    id: 'inc-9021',
    user_id: 'usr-demo-771',
    title: 'Persistent Unwanted DMs & Geolocation Stalking Threats',
    incident_date: new Date(Date.now() - 86400000 * 2).toISOString(),
    category: 'stalking',
    status: 'preserved',
    severity_self_rating: 'severe',
    perpetrator_name: 'Marcus Vance',
    perpetrator_handle: '@m_vance_99 / +1-555-014-9921',
    perpetrator_relationship: 'Former acquaintance',
    location_or_platform: 'Instagram Direct & WhatsApp',
    narrative:
      'The individual has sent over 45 unsolicited messages after being blocked on multiple channels. Yesterday, they referenced my exact work building address and stated: "I know you leave at 6 PM. You cannot avoid me forever. Answer my calls or you will regret it." They also created burner profiles to bypass blocks.',
    impact_description: 'Fear of commuting alone, insomnia, constant anxiety whenever notifications chime.',
    witness_notes: 'Colleague Sarah saw him standing outside the office lobby on Tuesday.',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    ai_classification: {
      primary_category: 'stalking',
      confidence_score: 0.94,
      secondary_categories: [
        { category: 'threats', score: 0.82 },
        { category: 'harassment', score: 0.78 },
      ],
      key_indicators: [
        'Surveillance and physical workplace proximity',
        'Repetitive bypassing of digital blocking mechanisms',
        'Direct statement implying retaliatory harm ("you will regret it")',
      ],
      legal_context:
        'Stalking statutes in most jurisdictions prohibit repeated acts of surveillance or harassment that would cause a reasonable person to fear for their safety or suffer substantial emotional distress.',
      recommended_steps: [
        'Report immediately to local police station with this documented log.',
        'Request building security footage for Tuesday lobby loitering.',
        'Apply for a temporary civil restraining or protective order.',
      ],
      analyzed_at: new Date().toISOString(),
    },
    risk_assessment: {
      level: 'high',
      score: 8,
      factors: [
        {
          factor: 'Physical Location Proximity Awareness',
          severity: 'high',
          description: 'Perpetrator knows workplace departure time and physical building address.',
        },
        {
          factor: 'Explicit Threat of Retaliation',
          severity: 'high',
          description: '"You will regret it" statement constitutes coercion/intimidation.',
        },
        {
          factor: 'Boundary Circumvention via Burner Accounts',
          severity: 'medium',
          description: 'Repeatedly bypassing blocks across multiple apps demonstrates fixation.',
        },
      ],
      rationale:
        'High Risk: The perpetrator combines digital harassment with physical location surveillance and explicit ultimatums.',
      disclaimer:
        'Automated risk aid for personal documentation only. If in imminent danger, contact emergency services (911 / 999 / 112).',
      immediate_actions: [
        'Do not commute home alone; ask a colleague or security escort.',
        'File an official police report utilizing the PDF export.',
        'Do not respond or engage with new burner accounts.',
      ],
      evaluated_at: new Date().toISOString(),
    },
  },
];

const INITIAL_DEMO_EVIDENCE: EvidenceItem[] = [
  {
    id: 'ev-101',
    incident_id: 'inc-9021',
    user_id: 'usr-demo-771',
    file_name: 'instagram_threat_dm_screenshot.png',
    file_type: 'screenshot',
    mime_type: 'image/png',
    file_size: 482910,
    sha256_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    storage_path: 'usr-demo-771/instagram_threat_dm_screenshot.png',
    is_private_storage: true,
    ai_analysis_enabled: false,
    ocr_extracted_text:
      'Marcus: "I know you leave at 6 PM. You cannot avoid me forever. Answer my calls or you will regret it." [Timestamp: Oct 11, 2026 5:48 PM]',
    notes: 'Direct screenshot taken within 2 minutes of receiving the DM before account was switched.',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'ev-102',
    incident_id: 'inc-9021',
    user_id: 'usr-demo-771',
    file_name: 'whatsapp_call_log_frequency.png',
    file_type: 'screenshot',
    mime_type: 'image/png',
    file_size: 320140,
    sha256_hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    storage_path: 'usr-demo-771/whatsapp_call_log_frequency.png',
    is_private_storage: true,
    ai_analysis_enabled: false,
    ocr_extracted_text: 'Missed WhatsApp Voice Calls: 18 missed calls between 11:30 PM and 2:15 AM.',
    notes: 'Call log showing relentless night-time calls.',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

const INITIAL_DEMO_TIMELINE: TimelineEvent[] = [
  {
    id: 'tl-1',
    incident_id: 'inc-9021',
    user_id: 'usr-demo-771',
    event_date: new Date(Date.now() - 86400000 * 4).toISOString(),
    title: 'First Unsolicited Contact Request',
    description: 'Initial barrage of unwanted DMs following verbal request to stop contact.',
    category: 'harassment',
    severity: 'low',
    source: 'manual',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'tl-2',
    incident_id: 'inc-9021',
    user_id: 'usr-demo-771',
    event_date: new Date(Date.now() - 86400000 * 2).toISOString(),
    title: 'Physical Workplace Threat Communicated',
    description: 'Perpetrator explicitly referenced office address and departure time.',
    category: 'threat_escalation',
    severity: 'high',
    source: 'incident',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'tl-3',
    incident_id: 'inc-9021',
    user_id: 'usr-demo-771',
    event_date: new Date(Date.now() - 86400000 * 1).toISOString(),
    title: 'Evidence Logged & Cryptographically Hashed',
    description: 'Screenshots uploaded to Vault with SHA-256 verification hash.',
    category: 'evidence_logged',
    severity: 'medium',
    source: 'evidence',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

const IncidentContext = createContext<IncidentContextType | undefined>(undefined);

export const IncidentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [privacy, setPrivacy] = useState<PrivacyPreferences>(DEFAULT_PRIVACY);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // Load data on user change
  useEffect(() => {
    if (!user) {
      setIncidents([]);
      setEvidence([]);
      setTimeline([]);
      setSelectedIncident(null);
      return;
    }

    // Load privacy settings
    const savedPrivacy = localStorage.getItem(`safeguard_privacy_${user.id}`);
    if (savedPrivacy) {
      try {
        setPrivacy(JSON.parse(savedPrivacy));
      } catch (e) {
        console.error(e);
      }
    }

    refreshData();
  }, [user]);

  const refreshData = async () => {
    if (!user) return;

    if (!isSupabaseConfigured() || user.id.startsWith('usr-demo') || user.id.startsWith('usr-local')) {
      // Local demo persistence
      const savedIncidents = localStorage.getItem(`safeguard_incidents_${user.id}`);
      const savedEvidence = localStorage.getItem(`safeguard_evidence_${user.id}`);
      const savedTimeline = localStorage.getItem(`safeguard_timeline_${user.id}`);

      const initialInc = savedIncidents ? JSON.parse(savedIncidents) : INITIAL_DEMO_INCIDENTS;
      const initialEv = savedEvidence ? JSON.parse(savedEvidence) : INITIAL_DEMO_EVIDENCE;
      const initialTl = savedTimeline ? JSON.parse(savedTimeline) : INITIAL_DEMO_TIMELINE;

      setIncidents(initialInc);
      setEvidence(initialEv);
      setTimeline(initialTl);
      if (initialInc.length > 0 && !selectedIncident) {
        setSelectedIncident(initialInc[0]);
      }
      return;
    }

    // Live Supabase Fetch with RLS
    try {
      const { data: incData, error: incError } = await supabase
        .from('incidents')
        .select('*')
        .order('incident_date', { ascending: false });

      if (!incError && incData) {
        setIncidents(incData);
        if (incData.length > 0 && !selectedIncident) {
          setSelectedIncident(incData[0]);
        }
      }

      const { data: evData, error: evError } = await supabase
        .from('evidence_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (!evError && evData) {
        setEvidence(evData);
      }

      const { data: tlData, error: tlError } = await supabase
        .from('timeline_events')
        .select('*')
        .order('event_date', { ascending: false });

      if (!tlError && tlData) {
        setTimeline(tlData);
      }
    } catch (err) {
      console.error('Error fetching data from Supabase', err);
    }
  };

  const createIncident = async (
    data: Omit<Incident, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<Incident> => {
    if (!user) throw new Error('User not authenticated');

    // Run AI classification & risk evaluation
    const aiClassification = await classifyIncidentText(data.narrative, data.location_or_platform);
    const riskAssessment = await evaluateRiskLevel(data.narrative, data.category, evidence.length);

    const newIncident: Incident = {
      ...data,
      id: 'inc-' + Math.random().toString(36).substr(2, 9),
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ai_classification: aiClassification,
      risk_assessment: riskAssessment,
    };

    if (isSupabaseConfigured() && !user.id.startsWith('usr-demo')) {
      try {
        const { data: inserted, error } = await supabase
          .from('incidents')
          .insert(newIncident)
          .select()
          .single();
        if (!error && inserted) {
          newIncident.id = inserted.id;
        }
      } catch (err) {
        console.error('Supabase incident insert failed', err);
      }
    }

    const updated = [newIncident, ...incidents];
    setIncidents(updated);
    setSelectedIncident(newIncident);
    localStorage.setItem(`safeguard_incidents_${user.id}`, JSON.stringify(updated));

    // Also auto-add to timeline
    await addTimelineEvent({
      incident_id: newIncident.id,
      event_date: newIncident.incident_date,
      title: newIncident.title,
      description: newIncident.narrative.slice(0, 150) + (newIncident.narrative.length > 150 ? '...' : ''),
      category: newIncident.category,
      severity: riskAssessment.level,
      source: 'incident',
    });

    return newIncident;
  };

  const updateIncident = async (id: string, updates: Partial<Incident>) => {
    if (!user) return;
    const updated = incidents.map(inc => (inc.id === id ? { ...inc, ...updates, updated_at: new Date().toISOString() } : inc));
    setIncidents(updated);
    if (selectedIncident?.id === id) {
      setSelectedIncident(updated.find(i => i.id === id) || null);
    }
    localStorage.setItem(`safeguard_incidents_${user.id}`, JSON.stringify(updated));

    if (isSupabaseConfigured() && !user.id.startsWith('usr-demo')) {
      await supabase.from('incidents').update(updates).eq('id', id);
    }
  };

  const deleteIncident = async (id: string) => {
    if (!user) return;
    const updated = incidents.filter(i => i.id !== id);
    setIncidents(updated);
    if (selectedIncident?.id === id) {
      setSelectedIncident(updated[0] || null);
    }
    localStorage.setItem(`safeguard_incidents_${user.id}`, JSON.stringify(updated));

    if (isSupabaseConfigured() && !user.id.startsWith('usr-demo')) {
      await supabase.from('incidents').delete().eq('id', id);
    }
  };

  const addEvidence = async (
    item: Omit<EvidenceItem, 'id' | 'user_id' | 'created_at'>
  ): Promise<EvidenceItem> => {
    if (!user) throw new Error('User not authenticated');

    const newEvidence: EvidenceItem = {
      ...item,
      id: 'ev-' + Math.random().toString(36).substr(2, 9),
      user_id: user.id,
      ai_analysis_enabled: item.ai_analysis_enabled || false, // Mandatory default FALSE
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && !user.id.startsWith('usr-demo')) {
      try {
        const { data: inserted, error } = await supabase
          .from('evidence_items')
          .insert(newEvidence)
          .select()
          .single();
        if (!error && inserted) {
          newEvidence.id = inserted.id;
        }
      } catch (err) {
        console.error('Supabase evidence insert failed', err);
      }
    }

    const updated = [newEvidence, ...evidence];
    setEvidence(updated);
    localStorage.setItem(`safeguard_evidence_${user.id}`, JSON.stringify(updated));

    // Auto-record to timeline
    await addTimelineEvent({
      incident_id: newEvidence.incident_id,
      event_date: newEvidence.created_at,
      title: `Evidence Preserved: ${newEvidence.file_name}`,
      description: `Integrity verified with SHA-256 (${newEvidence.sha256_hash.slice(0, 12)}...)`,
      category: 'evidence_logged',
      severity: 'medium',
      source: 'evidence',
    });

    return newEvidence;
  };

  const deleteEvidence = async (id: string) => {
    if (!user) return;
    const itemToDelete = evidence.find(e => e.id === id);
    if (itemToDelete?.storage_path) {
      await deletePrivateFile(itemToDelete.storage_path);
    }

    const updated = evidence.filter(e => e.id !== id);
    setEvidence(updated);
    localStorage.setItem(`safeguard_evidence_${user.id}`, JSON.stringify(updated));

    if (isSupabaseConfigured() && !user.id.startsWith('usr-demo')) {
      await supabase.from('evidence_items').delete().eq('id', id);
    }
  };

  const toggleEvidenceAI = async (id: string, enabled: boolean) => {
    if (!user) return;
    const updated = evidence.map(e => (e.id === id ? { ...e, ai_analysis_enabled: enabled } : e));
    setEvidence(updated);
    localStorage.setItem(`safeguard_evidence_${user.id}`, JSON.stringify(updated));

    if (isSupabaseConfigured() && !user.id.startsWith('usr-demo')) {
      await supabase.from('evidence_items').update({ ai_analysis_enabled: enabled }).eq('id', id);
    }
  };

  const updateEvidenceOCR = async (id: string, ocrText: string) => {
    if (!user) return;
    const updated = evidence.map(e => (e.id === id ? { ...e, ocr_extracted_text: ocrText } : e));
    setEvidence(updated);
    localStorage.setItem(`safeguard_evidence_${user.id}`, JSON.stringify(updated));

    if (isSupabaseConfigured() && !user.id.startsWith('usr-demo')) {
      await supabase.from('evidence_items').update({ ocr_extracted_text: ocrText }).eq('id', id);
    }
  };

  const addTimelineEvent = async (
    item: Omit<TimelineEvent, 'id' | 'user_id' | 'created_at'>
  ): Promise<TimelineEvent> => {
    if (!user) throw new Error('User not authenticated');

    const newEvent: TimelineEvent = {
      ...item,
      id: 'tl-' + Math.random().toString(36).substr(2, 9),
      user_id: user.id,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && !user.id.startsWith('usr-demo')) {
      try {
        const { data: inserted, error } = await supabase
          .from('timeline_events')
          .insert(newEvent)
          .select()
          .single();
        if (!error && inserted) {
          newEvent.id = inserted.id;
        }
      } catch (err) {
        console.error('Supabase timeline insert failed', err);
      }
    }

    const updated = [newEvent, ...timeline].sort(
      (a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
    );
    setTimeline(updated);
    localStorage.setItem(`safeguard_timeline_${user.id}`, JSON.stringify(updated));
    return newEvent;
  };

  const deleteTimelineEvent = async (id: string) => {
    if (!user) return;
    const updated = timeline.filter(t => t.id !== id);
    setTimeline(updated);
    localStorage.setItem(`safeguard_timeline_${user.id}`, JSON.stringify(updated));

    if (isSupabaseConfigured() && !user.id.startsWith('usr-demo')) {
      await supabase.from('timeline_events').delete().eq('id', id);
    }
  };

  const updatePrivacy = (updates: Partial<PrivacyPreferences>) => {
    if (!user) return;
    const updated = { ...privacy, ...updates };
    setPrivacy(updated);
    localStorage.setItem(`safeguard_privacy_${user.id}`, JSON.stringify(updated));
  };

  const wipeAllData = async () => {
    if (!user) return;
    localStorage.removeItem(`safeguard_incidents_${user.id}`);
    localStorage.removeItem(`safeguard_evidence_${user.id}`);
    localStorage.removeItem(`safeguard_timeline_${user.id}`);
    localStorage.removeItem(`safeguard_privacy_${user.id}`);

    if (isSupabaseConfigured() && !user.id.startsWith('usr-demo')) {
      await supabase.from('evidence_items').delete().eq('user_id', user.id);
      await supabase.from('timeline_events').delete().eq('user_id', user.id);
      await supabase.from('incidents').delete().eq('user_id', user.id);
    }

    setIncidents([]);
    setEvidence([]);
    setTimeline([]);
    setSelectedIncident(null);
  };

  return (
    <IncidentContext.Provider
      value={{
        incidents,
        evidence,
        timeline,
        privacy,
        selectedIncident,
        setSelectedIncident,
        createIncident,
        updateIncident,
        deleteIncident,
        addEvidence,
        deleteEvidence,
        toggleEvidenceAI,
        updateEvidenceOCR,
        addTimelineEvent,
        deleteTimelineEvent,
        updatePrivacy,
        wipeAllData,
        refreshData,
      }}
    >
      {children}
    </IncidentContext.Provider>
  );
};

export const useIncidents = (): IncidentContextType => {
  const context = useContext(IncidentContext);
  if (!context) {
    throw new Error('useIncidents must be used within an IncidentProvider');
  }
  return context;
};
