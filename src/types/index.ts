export type IncidentCategory =
  | 'harassment'
  | 'stalking'
  | 'cyberbullying'
  | 'threats'
  | 'blackmail'
  | 'relationship_disputes'
  | 'possible_deception'
  | 'other';

export type RiskLevel = 'low' | 'medium' | 'high';

export type IncidentStatus = 'draft' | 'under_review' | 'preserved' | 'resolved' | 'archived';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  created_at: string;
}

export interface AIClassification {
  primary_category: IncidentCategory;
  confidence_score: number;
  secondary_categories: Array<{ category: IncidentCategory; score: number }>;
  key_indicators: string[];
  legal_context: string;
  recommended_steps: string[];
  analyzed_at: string;
}

export interface RiskFactor {
  factor: string;
  severity: RiskLevel;
  description: string;
}

export interface RiskAssessment {
  level: RiskLevel;
  score: number; // 1-10
  factors: RiskFactor[];
  rationale: string;
  disclaimer: string;
  immediate_actions: string[];
  evaluated_at: string;
}

export interface Incident {
  id: string;
  user_id: string;
  title: string;
  incident_date: string;
  category: IncidentCategory;
  status: IncidentStatus;
  severity_self_rating: 'mild' | 'moderate' | 'severe';
  perpetrator_name?: string;
  perpetrator_handle?: string;
  perpetrator_relationship?: string;
  location_or_platform: string;
  narrative: string;
  impact_description?: string;
  witness_notes?: string;
  created_at: string;
  updated_at: string;
  ai_classification?: AIClassification;
  risk_assessment?: RiskAssessment;
}

export interface EvidenceItem {
  id: string;
  incident_id?: string;
  user_id: string;
  file_name: string;
  file_type: 'photo' | 'video' | 'screenshot' | 'audio' | 'document' | 'other';
  mime_type: string;
  file_size: number;
  sha256_hash: string;
  storage_path: string;
  file_url?: string;
  is_private_storage: boolean;
  ai_analysis_enabled: boolean; // MUST be false by default
  ocr_extracted_text?: string;
  notes?: string;
  created_at: string;
}

export interface TimelineEvent {
  id: string;
  incident_id?: string;
  user_id: string;
  event_date: string;
  title: string;
  description: string;
  category: IncidentCategory | 'evidence_logged' | 'report_generated' | 'threat_escalation';
  severity: RiskLevel;
  source: 'manual' | 'incident' | 'evidence';
  created_at: string;
}

export interface SafetyMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  disclaimer?: string;
}

export interface EmergencyResource {
  id: string;
  country: string;
  organization: string;
  category: 'emergency' | 'domestic_violence' | 'cyberbullying' | 'mental_health' | 'official_reporting';
  contact: string;
  availability: string;
  description: string;
  url?: string;
  is_official_channel: boolean;
}

export interface PrivacyPreferences {
  global_ai_consent: boolean;
  quick_exit_hotkey: string;
  quick_exit_url: string;
  discreet_mode: boolean;
  auto_lock_minutes: number;
  share_anonymous_metrics: boolean;
}
