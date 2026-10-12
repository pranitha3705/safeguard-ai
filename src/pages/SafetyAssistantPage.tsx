import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  User,
  Send,
  ShieldAlert,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  Trash2,
  BookOpen
} from 'lucide-react';
import { SafetyMessage } from '../types';

export const SafetyAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<SafetyMessage[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      content:
        'Hello. I am your confidential SafeGuard AI Safety Assistant. I can help guide you through digital evidence preservation, de-escalation practices, stalkerware audits, and safety planning.\n\nPlease remember: I provide informational guidance and support, not formal legal counsel. If you are ever in immediate physical danger, contact emergency services right away.',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'How do I legally preserve disappearing WhatsApp/IG messages?',
    'What should I do if someone threatens to leak private photos (extortion)?',
    'How do I check my phone for hidden tracking or stalkerware?',
    'What criteria are typically needed for an emergency protection order?',
    'How do I document in-person stalking without putting myself in danger?',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: SafetyMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // AI Safety response engine (secure heuristic advice with safety guardrails)
    setTimeout(() => {
      let reply = '';
      const lower = textToSend.toLowerCase();

      if (lower.includes('disappearing') || lower.includes('preserve') || lower.includes('screenshot')) {
        reply =
          '**Evidence Preservation Protocols for Digital Messaging:**\n\n' +
          '1. **Do not crop screenshots:** Capture the complete screen displaying status bar, battery, time, and visible username or phone number.\n' +
          '2. **Capture profile information:** Click into the sender profile and take screenshots showing full handles, registered numbers, or profile IDs.\n' +
          '3. **Record screen scroll:** Use built-in screen recording while scrolling slowly through chat histories.\n' +
          '4. **Export chat logs:** Use "Export Chat" (without media or with media) and store the raw .txt or .zip file in your SafeGuard Vault to calculate an immediate SHA-256 integrity hash.\n' +
          '5. **Never alter or rename files beforehand:** Preserving original file creation metadata provides stronger corroboration in court.';
      } else if (lower.includes('leak') || lower.includes('extort') || lower.includes('photo') || lower.includes('nude') || lower.includes('blackmail')) {
        reply =
          '**Crucial Guidance for Extortion / Non-Consensual Imagery Threats:**\n\n' +
          '1. **DO NOT PAY MONEY OR COMPLY WITH DEMANDS:** Extortionists almost invariably escalate demands after receiving money or additional photos. Payment does not guarantee deletion.\n' +
          '2. **Preserve evidence immediately:** Screenshot payment accounts, usernames, and threat messages before the perpetrator deletes their account.\n' +
          '3. **Stop communicating:** Cease all interaction immediately. Do not beg or negotiate.\n' +
          '4. **Utilize StopNCII.org / Take It Down:** You can create cryptographic hashes of sensitive images via StopNCII.org (18+) or TakeItDown.ncmec.org (<18) to prevent them from being uploaded to major platforms.\n' +
          '5. **Report to authorities:** Sextortion is a serious criminal offense. File a report with the FBI IC3 (ic3.gov) or your national cybercrime helpline.';
      } else if (lower.includes('track') || lower.includes('stalkerware') || lower.includes('airtag') || lower.includes('phone')) {
        reply =
          '**Device Security & Stalkerware Defense Checklist:**\n\n' +
          '1. **Check Location Sharing:** In Google Maps, Apple "Find My", and WhatsApp, check who currently has access to your live location.\n' +
          '2. **Scan for unknown Bluetooth Trackers:** Use "Tracker Detect" (Android) or Apple Find My (iOS) to identify unknown AirTags traveling with you.\n' +
          '3. **Inspect Installed Apps & Permissions:** Review apps with background access to Camera, Microphone, or Location. Remove any unknown administration profiles in settings.\n' +
          '4. **Change passwords from a safe device:** If your primary device might be compromised, change passwords from a trusted library or friend\'s computer.\n' +
          '5. **Enable Hardware 2-Factor Authentication:** Use an authenticator app (like Aegis or Google Authenticator) rather than SMS.';
      } else if (lower.includes('restraining') || lower.includes('protection order') || lower.includes('court')) {
        reply =
          '**Key Elements for Civil Protection / Restraining Orders:**\n\n' +
          '1. **Demonstrated pattern of conduct:** Evidence showing repeated, unwanted contact after notice to cease.\n' +
          '2. **Clear identification:** Proof linking the perpetrator to phone numbers, accounts, or physical sightings.\n' +
          '3. **Credible threat or fear:** Documentation showing reasonable fear for physical safety, employment, or mental well-being.\n' +
          '4. **Official Evidence Summary:** Export your SafeGuard AI Incident Report (PDF) with the SHA-256 evidence integrity log to hand directly to the court clerk or advocate.\n' +
          '5. **Legal Aid advocates:** Contact your local domestic violence or victim advocacy clinic—many provide free legal representation.';
      } else {
        reply =
          'Thank you for reaching out. Based on your inquiry, here are recommended safety principles:\n\n' +
          '• **Document consistently:** Add every new message, phone call, or sighting directly to your SafeGuard Timeline.\n' +
          '• **Maintain strict boundaries:** Do not answer retaliatory messages once you have stated "Do not contact me."\n' +
          '• **Establish a trusted check-in buddy:** Agree on a daily check-in time and a discreet code word.\n' +
          '• **Preserve original files:** Store full-resolution captures in your Evidence Vault.\n\n' +
          'Would you like assistance generating your official PDF evidence report or reviewing emergency hotlines?';
      }

      const botMsg: SafetyMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'assistant',
        content: reply,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
              CONFIDENTIAL SAFETY ADVISOR
            </span>
            <span className="text-xs text-slate-400">Zero Retention & Server-Side Security</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Bot className="w-6 h-6 text-brand-400" />
            <span>AI Safety Assistant</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Ask confidential questions regarding evidence preservation, de-escalation tactics, stalkerware checks, and safety rights.
          </p>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: 'msg-cleared',
                sender: 'assistant',
                content: 'Chat session reset. What safety guidance can I provide?',
                timestamp: new Date().toISOString(),
              },
            ])
          }
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs border border-slate-700 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Main Chat Interface */}
      <div className="rounded-2xl bg-[#0F172A]/90 border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[600px]">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white flex-shrink-0 shadow-md">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-xl rounded-2xl p-4 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 shadow-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <span
                  className={`block text-[10px] mt-2 font-medium ${
                    msg.sender === 'user' ? 'text-brand-200 text-right' : 'text-slate-500'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-brand-600/30 text-brand-400 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce delay-100"></span>
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce delay-200"></span>
                <span className="ml-1 text-[11px]">Formulating safety guidance...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompt Chips */}
        <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/40 overflow-x-auto flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase flex-shrink-0">
            Suggested:
          </span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="text-[11px] whitespace-nowrap px-3 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors flex-shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask a question about digital evidence, personal safety, or legal documentation..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white shadow-lg shadow-brand-600/30 transition-all hover:scale-105"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
