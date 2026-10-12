import React, { useState } from 'react';
import {
  PhoneCall,
  ShieldAlert,
  Globe,
  ExternalLink,
  MessageSquare,
  AlertTriangle,
  Lock,
  CheckSquare,
  FileText,
  HelpCircle
} from 'lucide-react';
import { EmergencyResource } from '../types';

interface EmergencyHelpPageProps {
  onNavigate: (tab: string) => void;
}

const RESOURCES: Record<string, EmergencyResource[]> = {
  US: [
    {
      id: 'us-1',
      country: 'US',
      organization: 'Emergency Services (Police / Fire / EMS)',
      category: 'emergency',
      contact: '911',
      availability: '24/7 Toll-Free',
      description: 'Immediate physical emergency dispatch.',
      is_official_channel: true,
    },
    {
      id: 'us-2',
      country: 'US',
      organization: 'National Domestic Violence Hotline',
      category: 'domestic_violence',
      contact: '1-800-799-SAFE (7233)',
      availability: '24/7 Confidential',
      description: 'Free confidential support, safety planning, and local shelter referrals.',
      url: 'https://www.thehotline.org',
      is_official_channel: false,
    },
    {
      id: 'us-3',
      country: 'US',
      organization: 'Crisis Text Line',
      category: 'mental_health',
      contact: 'Text HOME to 741741',
      availability: '24/7 Free',
      description: 'Connect with a crisis counselor by text anytime.',
      url: 'https://www.crisistextline.org',
      is_official_channel: false,
    },
    {
      id: 'us-4',
      country: 'US',
      organization: 'FBI Internet Crime Complaint Center (IC3)',
      category: 'official_reporting',
      contact: 'Online Portal',
      availability: 'Online Intake',
      description: 'Official US federal reporting mechanism for cyber extortion, hacking, and online threats.',
      url: 'https://www.ic3.gov',
      is_official_channel: true,
    },
    {
      id: 'us-5',
      country: 'US',
      organization: 'Cyber Civil Rights Initiative (CCRI)',
      category: 'cyberbullying',
      contact: '844-878-2274',
      availability: 'Helpline Support',
      description: 'Non-consensual intimate imagery (revenge porn) victim helpline.',
      url: 'https://cybercivilrights.org',
      is_official_channel: false,
    },
  ],
  UK: [
    {
      id: 'uk-1',
      country: 'UK',
      organization: 'Emergency Police Dispatch',
      category: 'emergency',
      contact: '999 (Non-Emergency: 101)',
      availability: '24/7',
      description: 'Immediate police response for crimes in progress.',
      is_official_channel: true,
    },
    {
      id: 'uk-2',
      country: 'UK',
      organization: 'National Domestic Abuse Helpline (Refuge)',
      category: 'domestic_violence',
      contact: '0808 2000 247',
      availability: '24/7 Freephone',
      description: 'Dedicated national service for women and children experiencing domestic abuse.',
      url: 'https://www.nationaldahelpline.org.uk',
      is_official_channel: false,
    },
    {
      id: 'uk-3',
      country: 'UK',
      organization: 'Action Fraud (National Cybercrime Unit)',
      category: 'official_reporting',
      contact: '0300 123 2040',
      availability: 'Monday-Friday',
      description: 'UK police national reporting center for fraud and cybercrime.',
      url: 'https://www.actionfraud.police.uk',
      is_official_channel: true,
    },
  ],
  IN: [
    {
      id: 'in-1',
      country: 'IN',
      organization: 'National Emergency Number (Police/EMS)',
      category: 'emergency',
      contact: '112',
      availability: '24/7 Pan-India',
      description: 'Unified emergency response support system.',
      is_official_channel: true,
    },
    {
      id: 'in-2',
      country: 'IN',
      organization: 'National Cyber Crime Reporting Portal',
      category: 'official_reporting',
      contact: '1930 / cybercrime.gov.in',
      availability: '24/7 Portal & Hotline',
      description: 'Government of India official portal for reporting cyber harassment, financial fraud, and cyberstalking.',
      url: 'https://cybercrime.gov.in',
      is_official_channel: true,
    },
    {
      id: 'in-3',
      country: 'IN',
      organization: 'National Commission for Women (NCW) Helpline',
      category: 'domestic_violence',
      contact: '7827170170',
      availability: '24/7 Support',
      description: 'Dedicated emergency line for women facing violence or harassment.',
      url: 'https://ncw.nic.in',
      is_official_channel: false,
    },
  ],
  CA: [
    {
      id: 'ca-1',
      country: 'CA',
      organization: 'Emergency Police Dispatch',
      category: 'emergency',
      contact: '911',
      availability: '24/7',
      description: 'Police, fire, and ambulance service.',
      is_official_channel: true,
    },
    {
      id: 'ca-2',
      country: 'CA',
      organization: 'Canadian Centre for Cyber Security',
      category: 'official_reporting',
      contact: 'Online Portal',
      availability: 'Business Hours',
      description: 'Official reporting for severe cyber incidents and threats.',
      url: 'https://www.cyber.gc.ca',
      is_official_channel: true,
    },
    {
      id: 'ca-3',
      country: 'CA',
      organization: 'ShelterSafe Canada',
      category: 'domestic_violence',
      contact: 'Online Helpline Directory',
      availability: '24/7 Directory',
      description: 'Connecting women with safe emergency shelter across Canada.',
      url: 'https://www.sheltersafe.ca',
      is_official_channel: false,
    },
  ],
};

export const EmergencyHelpPage: React.FC<EmergencyHelpPageProps> = ({ onNavigate }) => {
  const [selectedCountry, setSelectedCountry] = useState<string>('US');
  const [safetyChecklist, setSafetyChecklist] = useState<Record<number, boolean>>({
    0: true,
    1: false,
    2: false,
    3: false,
    4: false,
  });

  const safetySteps = [
    'Secure Device: Access this account only from a clean, private device without stalkerware.',
    'Code Word: Agree upon an innocent emergency code word with a trusted friend or family member.',
    'Go-Bag: Prepare essential identity documents, medication, and spare keys in a discreet location.',
    'Location Privacy: Verify all location sharing and Bluetooth tracker settings are disabled.',
    'Export Evidence: Download the SHA-256 PDF report to bring in person to official authorities.',
  ];

  const toggleChecklist = (index: number) => {
    setSafetyChecklist((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const currentResources = RESOURCES[selectedCountry] || RESOURCES.US;

  return (
    <div className="space-y-6">
      {/* Top Urgent Alert Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-950 via-red-950/80 to-[#0F172A] border border-rose-500/50 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-rose-900/50">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  IMMEDIATE PHYSICAL DANGER
                </span>
                <span className="text-xs text-slate-400">24/7 Emergency Dispatch</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Emergency Assistance & Verified Hotlines
              </h1>
              <p className="text-xs text-rose-200/90 mt-1 max-w-xl leading-relaxed">
                If you believe you are in immediate danger of injury or harm, call local emergency services immediately.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="tel:911"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-xl shadow-rose-900/60 transition-all hover:scale-105"
            >
              <PhoneCall className="w-5 h-5" />
              <span>Call Emergency</span>
            </a>
          </div>
        </div>
      </div>

      {/* Strict Anti-Automatic Dispatch Notice */}
      <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 flex items-start gap-3 text-xs">
        <Lock className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-white block">
            Absolute Privacy Assurance: Zero Automated Police Dispatch
          </span>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            SafeGuard AI will <strong>never</strong> send your records, personal details, or evidence files to police or external organizations automatically.
            You remain in 100% control of your evidence. When you are ready to file an official complaint, download your tamper-evident PDF package and submit it through official channels listed below.
          </p>
        </div>
      </div>

      {/* Country Selector & Verified Resources */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-brand-400" />
            <span>Select Your Country or Region</span>
          </h2>

          <div className="flex items-center gap-2">
            {[
              { code: 'US', label: 'United States' },
              { code: 'UK', label: 'United Kingdom' },
              { code: 'IN', label: 'India' },
              { code: 'CA', label: 'Canada' },
            ].map((c) => (
              <button
                key={c.code}
                onClick={() => setSelectedCountry(c.code)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  selectedCountry === c.code
                    ? 'bg-brand-600 text-white border-brand-500 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Resources Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentResources.map((res) => (
            <div
              key={res.id}
              className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800 hover:border-slate-700 transition-colors shadow-md flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
                    {res.category.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] text-emerald-400 font-medium">
                    {res.availability}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">{res.organization}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{res.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-brand-300">
                  <PhoneCall className="w-3.5 h-3.5 text-brand-400" />
                  <span>{res.contact}</span>
                </div>

                <div className="flex items-center gap-2">
                  {res.url && (
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                    >
                      <span>Official Portal</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  )}
                  {res.contact.includes('-') || res.contact.length <= 4 ? (
                    <a
                      href={`tel:${res.contact.replace(/[^0-9]/g, '')}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors"
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>Call Now</span>
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Safety Planning Checklist */}
      <div className="p-6 rounded-2xl bg-[#0F172A]/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Interactive Personal Safety Action Plan</h2>
          </div>
          <button
            onClick={() => onNavigate('reports')}
            className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 font-medium"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Official Evidence PDF</span>
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Personalized steps recommended by victim advocacy organizations when dealing with escalating harassment or stalking:
        </p>

        <div className="space-y-2.5">
          {safetySteps.map((step, idx) => (
            <div
              key={idx}
              onClick={() => toggleChecklist(idx)}
              className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs cursor-pointer select-none transition-all ${
                safetyChecklist[idx]
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border transition-colors ${
                  safetyChecklist[idx]
                    ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                    : 'border-slate-600 bg-slate-950'
                }`}
              >
                {safetyChecklist[idx] && <CheckSquare className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />}
              </div>
              <span className="leading-relaxed">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
