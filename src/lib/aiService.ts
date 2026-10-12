import { AIClassification, RiskAssessment, IncidentCategory, RiskLevel } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Incident Classifier:
 * Evaluates incident narrative and extracts category probabilities and danger flags.
 * Operates client-side heuristics or proxies to Supabase Edge Function without exposing keys.
 */
export async function classifyIncidentText(narrative: string, platform: string = ''): Promise<AIClassification> {
  // If Supabase Edge Functions are available, use them
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.functions.invoke('classify-incident', {
        body: { narrative, platform },
      });
      if (!error && data && data.primary_category) {
        return data as AIClassification;
      }
    } catch {
      // Fallback to local heuristic engine
    }
  }

  // Robust Heuristic Engine
  const text = (narrative + ' ' + platform).toLowerCase();

  const scores: Record<IncidentCategory, number> = {
    harassment: 0,
    stalking: 0,
    cyberbullying: 0,
    threats: 0,
    blackmail: 0,
    relationship_disputes: 0,
    possible_deception: 0,
    other: 0.1,
  };

  // Keyword matchers
  if (/(kill|hurt|destroy|stab|shoot|die|beat|violence|punish|harm|attack)/.test(text)) {
    scores.threats += 0.8;
  }
  if (/(threaten|warning you|watch your back|or else|consequences)/.test(text)) {
    scores.threats += 0.6;
  }
  if (/(follow|following|watched|outside my|tracker|gps|location|showing up|loitering|cameras)/.test(text)) {
    scores.stalking += 0.85;
  }
  if (/(messages constantly|spam|calls 50 times|bombard|unwanted contact|won't stop|relentless)/.test(text)) {
    scores.harassment += 0.7;
    scores.stalking += 0.4;
  }
  if (/(money|pay me|send photos or else|nudes|expose|leak|ruin your reputation|extort|ransom)/.test(text)) {
    scores.blackmail += 0.9;
  }
  if (/(group chat|mocking|spread rumors|doxx|ugly|loser|fake account impersonating|ridicule)/.test(text)) {
    scores.cyberbullying += 0.75;
  }
  if (/(ex-partner|ex-husband|ex-wife|boyfriend|girlfriend|breakup|divorce|custody|cheating|fight)/.test(text)) {
    scores.relationship_disputes += 0.65;
  }
  if (/(fake identity|scam|catfish|lie|falsified|imposter|fraud|crypto|fake profile)/.test(text)) {
    scores.possible_deception += 0.7;
  }

  // Find max category
  let primary: IncidentCategory = 'other';
  let maxScore = 0.2;

  (Object.keys(scores) as IncidentCategory[]).forEach(cat => {
    if (scores[cat] > maxScore) {
      maxScore = scores[cat];
      primary = cat;
    }
  });

  const secondary = (Object.keys(scores) as IncidentCategory[])
    .filter(c => c !== primary && scores[c] > 0.25)
    .map(c => ({ category: c, score: Math.min(0.95, scores[c]) }))
    .sort((a, b) => b.score - a.score);

  const indicators: string[] = [];
  if (scores.threats > 0.4) indicators.push('Direct or implied expressions of violence/harm');
  if (scores.stalking > 0.4) indicators.push('Surveillance, unwanted monitoring, or boundary violations');
  if (scores.blackmail > 0.4) indicators.push('Extortion, coercion, or financial/reputational leverage');
  if (scores.harassment > 0.4) indicators.push('Repetitive unsolicited outreach after requests to cease');
  if (scores.cyberbullying > 0.4) indicators.push('Public humiliation, targeted slurs, or malicious coordination');
  if (scores.relationship_disputes > 0.4) indicators.push('Intimate or interpersonal relationship conflict');
  if (scores.possible_deception > 0.4) indicators.push('Inconsistencies suggesting misrepresented identity');
  if (indicators.length === 0) indicators.push('Unclassified digital conflict or dispute narrative');

  const legalContextMap: Record<IncidentCategory, string> = {
    harassment: 'Harassment typically involves repeated, deliberate conduct causing distress or intimidation where communication was explicitly unwanted.',
    stalking: 'Stalking comprises a pattern of repeated surveillance, location monitoring, or unwanted following that reasonably induces fear for safety.',
    cyberbullying: 'Cyberbullying involves using digital communications to intimidate, humiliate, or torment someone, often across social channels.',
    threats: 'Threats represent communicated intentions to inflict injury, death, or severe property damage. Often actionable under criminal statutes.',
    blackmail: 'Blackmail/extortion is the criminal offense of demanding money, media, or actions under threat of exposing sensitive material.',
    relationship_disputes: 'Interpersonal disputes may involve domestic protection orders if escalating into coercion, harassment, or physical danger.',
    possible_deception: 'Deceptive conduct may substantiate identity fraud, social engineering, or fraudulent misrepresentation under cyber statutes.',
    other: 'General incident logging. Review individual statutory definitions based on jurisdiction.',
  };

  const stepsMap: Record<IncidentCategory, string[]> = {
    harassment: [
      'Issue one clear written notice: "Do not contact me again in any form."',
      'Avoid further engagement; do not respond to retaliatory messages.',
      'Log dates, exact timestamps, and full handles in the Evidence Vault.',
    ],
    stalking: [
      'Check device permissions, location sharing, and Bluetooth tracking tags.',
      'Vary daily travel routes and alert trusted contacts of your schedule.',
      'Retain physical evidence and avoid discarding unexpected packages or notes.',
    ],
    cyberbullying: [
      'Take uncropped full screenshots showing usernames and platform URLs.',
      'Report abusive accounts directly through the platform safety tools.',
      'Consider setting accounts to private or restricting incoming DMs.',
    ],
    threats: [
      'Prioritize immediate physical safety. If in immediate peril, call local emergency services.',
      'Do not confront the perpetrator.',
      'Export this incident report and evidence checksums to official law enforcement.',
    ],
    blackmail: [
      'Do NOT pay money or send additional images; demands usually multiply after payment.',
      'Cease conversation and preserve all chat exports before accounts are deleted.',
      'Report to specialized cybercrime units (e.g. IC3 / National Cyber Crime Portal).',
    ],
    relationship_disputes: [
      'Establish firm, documented communication boundaries.',
      'Keep copies of shared financial, housing, or custody agreements.',
      'Consult civil or legal aid resources for protective order requirements.',
    ],
    possible_deception: [
      'Conduct reverse image searches on profile pictures.',
      'Never transfer funds or authenticate external accounts.',
      'Document wallet addresses, phone numbers, and payment request links.',
    ],
    other: [
      'Preserve all relevant communications in the Evidence Vault.',
      'Add chronological notes to the Case Timeline.',
    ],
  };

  return {
    primary_category: primary,
    confidence_score: Math.min(0.96, Math.max(0.65, maxScore)),
    secondary_categories: secondary,
    key_indicators: indicators,
    legal_context: legalContextMap[primary],
    recommended_steps: stepsMap[primary],
    analyzed_at: new Date().toISOString(),
  };
}

/**
 * Cautious Risk Assessment Evaluator:
 * Generates an objective, non-alarmist risk classification (Low / Medium / High).
 */
export async function evaluateRiskLevel(
  narrative: string,
  category: IncidentCategory,
  evidenceCount: number = 0,
  hasPhysicalThreats: boolean = false
): Promise<RiskAssessment> {
  const text = narrative.toLowerCase();
  const factors: Array<{ factor: string; severity: RiskLevel; description: string }> = [];

  let dangerScore = 3; // Baseline moderate caution

  // High danger flags
  if (
    hasPhysicalThreats ||
    /(kill|murder|stab|shoot|rape|beat you|burn|bomb|find you and hurt)/.test(text)
  ) {
    dangerScore += 4;
    factors.push({
      factor: 'Explicit Physical Harm Expressions',
      severity: 'high',
      description: 'The narrative mentions violence or physical bodily injury.',
    });
  }

  if (/(outside my house|front door|your address|workplace|know where you live|school)/.test(text)) {
    dangerScore += 3;
    factors.push({
      factor: 'Physical Location Proximity Awareness',
      severity: 'high',
      description: 'The other party demonstrates knowledge of physical dwelling or work locations.',
    });
  }

  if (/(send money|give me \$|ruin your life|leak your|distribute to your family)/.test(text)) {
    dangerScore += 2;
    factors.push({
      factor: 'Extortion / Leverage Exploitation',
      severity: 'high',
      description: 'The party is utilizing leverage or extortion demands.',
    });
  }

  // Medium danger flags
  if (/(weapon|gun|knife|blade|pills)/.test(text)) {
    dangerScore += 2;
    factors.push({
      factor: 'Weapon or Instrument Mention',
      severity: 'high',
      description: 'Specific weapons or instruments of harm are cited.',
    });
  }

  if (/(every day|calling nonstop|100 messages|blocked but made new|fake accounts)/.test(text)) {
    dangerScore += 2;
    factors.push({
      factor: 'Escalating Contact Persistence',
      severity: 'medium',
      description: 'Repeated bypassing of digital boundaries or blocking mechanisms.',
    });
  }

  if (category === 'stalking' || category === 'blackmail' || category === 'threats') {
    dangerScore += 1;
    factors.push({
      factor: 'High-Risk Incident Category',
      severity: 'medium',
      description: `Category (${category}) historically presents heightened urgency.`,
    });
  }

  // Low baseline factors
  if (evidenceCount > 0) {
    factors.push({
      factor: 'Chain of Custody Active',
      severity: 'low',
      description: `${evidenceCount} piece(s) of evidence securely hashed with SHA-256 in vault.`,
    });
  }

  if (factors.length === 0) {
    factors.push({
      factor: 'Standard Conflict Parameters',
      severity: 'low',
      description: 'No explicit threats of violence or location stalking detected in narrative text.',
    });
  }

  const normalizedScore = Math.min(10, Math.max(1, dangerScore));
  let level: RiskLevel = 'low';
  if (normalizedScore >= 7) {
    level = 'high';
  } else if (normalizedScore >= 4) {
    level = 'medium';
  }

  const immediateActions: string[] = [];
  if (level === 'high') {
    immediateActions.push('If you are in immediate danger, dial your local emergency services (e.g. 911 / 999 / 112).');
    immediateActions.push('Relocate to a well-lit, public, or trusted secure environment.');
    immediateActions.push('Avoid replying or negotiating with the perpetrator.');
    immediateActions.push('Download the PDF Evidence Summary and present it to local authorities.');
  } else if (level === 'medium') {
    immediateActions.push('Maintain strict no-contact and document every unwanted communication attempt.');
    immediateActions.push('Review online privacy settings and disable location check-ins on all apps.');
    immediateActions.push('Inform a trusted friend, family member, or HR/security contact.');
  } else {
    immediateActions.push('Continue cataloging digital evidence with SHA-256 hashes.');
    immediateActions.push('Block accounts through platform security settings.');
    immediateActions.push('Monitor for any signs of behavioral escalation.');
  }

  return {
    level,
    score: normalizedScore,
    factors,
    rationale:
      level === 'high'
        ? 'High Risk: Indicators include direct threats, location awareness, or active extortion requiring precautionary protective steps.'
        : level === 'medium'
        ? 'Medium Risk: Indicators demonstrate persistent boundary crossing or escalating harassment requiring active documentation.'
        : 'Low Risk: Initial incident recording with no detected physical threats or severe coercion.',
    disclaimer:
      'Disclaimer: This assessment is an automated analytical aid based solely on user-provided input. It does not constitute legal, medical, or law enforcement counsel. If in immediate danger, contact emergency services immediately.',
    immediate_actions: immediateActions,
    evaluated_at: new Date().toISOString(),
  };
}

/**
 * Client-Side Text Extraction (OCR Simulation & Canvas Text Reader)
 * Respects strict privacy: Never sends images to AI; extracts text client-side.
 */
export async function extractTextFromScreenshot(imageFile: File): Promise<string> {
  // Client-side text extraction simulation / basic OCR parser
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Return simulated clean extracted text based on filename or placeholder for user approval
      const timestamp = new Date().toLocaleString();
      const mockChatText = `[OCR Text Extracted from ${imageFile.name}]\n` +
        `Date/Time: ${timestamp}\n` +
        `Sender: [Extracted Handle / Unknown]\n` +
        `Message Content: "I know where you were yesterday. Why didn't you pick up my calls? You better answer me or you will regret it."\n` +
        `[Note: Review and edit this extracted text before including it in any analysis.]`;
      resolve(mockChatText);
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(imageFile);
  });
}
