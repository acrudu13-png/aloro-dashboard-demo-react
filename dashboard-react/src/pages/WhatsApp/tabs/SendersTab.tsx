import { useState } from 'react';
import { Phone, Plus, Wifi, WifiOff, AlertCircle, Settings, Zap, ChevronRight, X, Bot } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { useWhatsAppStore } from '../../../stores/whatsapp';
import type { WhatsAppSender, AgentClassification, TranscriberConfig, AgentPersona } from '../../../types';

const mockSenders: WhatsAppSender[] = [
  {
    id: 'sender-1',
    number: '+1 (512) 555-0141',
    displayName: 'Meridian Support',
    type: 'cloud-api',
    status: 'online',
    quality: 'high',
    messagesCount: 8432,
    agentClassification: 'technical-support',
    persona: {
      systemPrompt: 'You are a friendly and efficient technical support agent for Meridian Financial Services. Help customers troubleshoot issues with their accounts, billing, and services. Always verify customer identity first.',
      greeting: 'Hi! Welcome to Meridian Financial support. How can I help you today?',
      fallbackMessage: "I'm sorry, I didn't quite catch that. Could you rephrase your question?",
      language: 'en-US',
      tone: 'friendly',
    },
    flowId: 'flow-1',
    transcriber: {
      provider: 'soniox',
      language: 'en-US',
      contextHints: ['Meridian Financial', 'account balance', 'payment plan', 'billing portal'],
      keywords: ['payment', 'refund', 'balance', 'invoice', 'dispute'],
      enablePunctuation: true,
      enableProfanityFilter: true,
    },
    sessionTimeoutMinutes: 30,
    maxConcurrentSessions: 50,
  },
  {
    id: 'sender-2',
    number: '+1 (512) 555-0182',
    displayName: 'Meridian Sales',
    type: 'platform',
    status: 'connecting',
    quality: 'medium',
    messagesCount: 1205,
    agentClassification: 'sales',
    persona: {
      systemPrompt: 'You are a persuasive but respectful sales agent for Meridian Financial Services. Help customers explore lending options, service upgrades, and special offers.',
      greeting: 'Hello! Thanks for reaching out to Meridian Financial. I can help you explore our latest offers.',
      fallbackMessage: "Sorry, could you say that again? I want to make sure I get this right for you.",
      language: 'en-US',
      tone: 'friendly',
    },
    transcriber: {
      provider: 'soniox',
      language: 'en-US',
      contextHints: ['loan', 'credit line', 'interest rate', 'annual percentage'],
      keywords: ['upgrade', 'offer', 'promotion', 'sign up'],
      enablePunctuation: true,
      enableProfanityFilter: false,
    },
    sessionTimeoutMinutes: 20,
    maxConcurrentSessions: 25,
  },
];

const statusVariant: Record<WhatsAppSender['status'], 'success' | 'warning' | 'default' | 'danger'> = {
  online: 'success',
  connecting: 'warning',
  pending: 'default',
  offline: 'danger',
};

const StatusIcon = ({ status }: { status: WhatsAppSender['status'] }) => {
  if (status === 'online') return <Wifi className="w-3.5 h-3.5 text-green-500" />;
  if (status === 'connecting') return <Wifi className="w-3.5 h-3.5 text-amber-500 animate-pulse" />;
  if (status === 'offline') return <WifiOff className="w-3.5 h-3.5 text-red-500" />;
  return <AlertCircle className="w-3.5 h-3.5 text-slate-400" />;
};

const classificationLabels: Record<AgentClassification, string> = {
  'technical-support': 'Technical Support',
  'customer-service': 'Customer Service',
  'sales': 'Sales',
  'onboarding': 'Onboarding',
  'debt-collection': 'Debt Collection',
  'scheduling': 'Scheduling',
  'custom': 'Custom',
};

// ─── Agent Config Modal ──────────────────────────────────────────────────────

type ModalTab = 'identity' | 'flow' | 'transcriber' | 'settings';

interface AgentModalProps {
  sender: WhatsAppSender;
  onClose: () => void;
  onSave: (id: string, data: Partial<WhatsAppSender>) => void;
  flowNames: Record<string, string>;
}

const inputCls = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500';
const selectCls = `${inputCls} bg-white`;

function AgentModal({ sender, onClose, onSave, flowNames }: AgentModalProps) {
  const [tab, setTab] = useState<ModalTab>('identity');
  const [persona, setPersona] = useState<AgentPersona>({ ...sender.persona });
  const [classification, setClassification] = useState(sender.agentClassification);
  const [flowId, setFlowId] = useState(sender.flowId || '');
  const [transcriber, setTranscriber] = useState<TranscriberConfig>({ ...sender.transcriber });
  const [sessionTimeout, setSessionTimeout] = useState(sender.sessionTimeoutMinutes);
  const [maxSessions, setMaxSessions] = useState(sender.maxConcurrentSessions ?? 50);

  const tabs: { id: ModalTab; label: string }[] = [
    { id: 'identity', label: 'Identity' },
    { id: 'flow', label: 'Flow' },
    { id: 'transcriber', label: 'Transcriber' },
    { id: 'settings', label: 'Settings' },
  ];

  const handleSave = () => {
    onSave(sender.id, {
      agentClassification: classification,
      persona,
      flowId: flowId || undefined,
      transcriber,
      sessionTimeoutMinutes: sessionTimeout,
      maxConcurrentSessions: maxSessions,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-green-700" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">{sender.displayName}</h2>
              <p className="text-xs text-slate-400">{sender.number}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition -mb-px ${
                tab === t.id ? 'border-accent-500 text-accent-600' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {tab === 'identity' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Agent Classification</label>
                <select value={classification} onChange={e => setClassification(e.target.value as AgentClassification)} className={selectCls}>
                  {Object.entries(classificationLabels).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Tone</label>
                <select value={persona.tone} onChange={e => setPersona(p => ({ ...p, tone: e.target.value as AgentPersona['tone'] }))} className={selectCls}>
                  <option value="formal">Formal</option>
                  <option value="friendly">Friendly</option>
                  <option value="neutral">Neutral</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">System Prompt</label>
                <textarea value={persona.systemPrompt} onChange={e => setPersona(p => ({ ...p, systemPrompt: e.target.value }))}
                  rows={5} className={`${inputCls} resize-none`} placeholder="Define the agent's personality and instructions..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Greeting Message</label>
                <textarea value={persona.greeting} onChange={e => setPersona(p => ({ ...p, greeting: e.target.value }))}
                  rows={2} className={`${inputCls} resize-none`} placeholder="First message sent to the customer..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Fallback Message</label>
                <textarea value={persona.fallbackMessage} onChange={e => setPersona(p => ({ ...p, fallbackMessage: e.target.value }))}
                  rows={2} className={`${inputCls} resize-none`} placeholder="Message when the AI doesn't understand..." />
              </div>
            </>
          )}

          {tab === 'flow' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Attached Flow</label>
                <select value={flowId} onChange={e => setFlowId(e.target.value)} className={selectCls}>
                  <option value="">No flow attached</option>
                  {Object.entries(flowNames).map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-1.5">The conversation flow this agent follows when a customer messages.</p>
              </div>
              {flowId && (
                <div className="bg-accent-50 rounded-lg p-4 border border-accent-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-accent-600" />
                    <span className="text-sm font-medium text-accent-700">{flowNames[flowId] || flowId}</span>
                  </div>
                  <p className="text-xs text-accent-600">Open the flow builder to edit conversation steps, tools, and conditions.</p>
                </div>
              )}
            </>
          )}

          {tab === 'transcriber' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Transcription Provider</label>
                <select value={transcriber.provider} onChange={e => setTranscriber(t => ({ ...t, provider: e.target.value as TranscriberConfig['provider'] }))} className={selectCls}>
                  <option value="soniox">Soniox</option>
                  <option value="deepgram">Deepgram</option>
                  <option value="whisper">OpenAI Whisper</option>
                  <option value="google">Google Speech-to-Text</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Language</label>
                <select value={transcriber.language} onChange={e => setTranscriber(t => ({ ...t, language: e.target.value }))} className={selectCls}>
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="es-ES">Spanish</option>
                  <option value="fr-FR">French</option>
                  <option value="de-DE">German</option>
                  <option value="pt-BR">Portuguese (BR)</option>
                  <option value="ro-RO">Romanian</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Context Hints</label>
                <textarea
                  value={transcriber.contextHints.join('\n')}
                  onChange={e => setTranscriber(t => ({ ...t, contextHints: e.target.value.split('\n').filter(Boolean) }))}
                  rows={4} className={`${inputCls} resize-none font-mono text-xs`}
                  placeholder="One phrase per line — domain-specific terms for better recognition" />
                <p className="text-xs text-slate-400 mt-1">e.g., product names, technical terms, company jargon</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Boost Keywords</label>
                <textarea
                  value={transcriber.keywords.join('\n')}
                  onChange={e => setTranscriber(t => ({ ...t, keywords: e.target.value.split('\n').filter(Boolean) }))}
                  rows={3} className={`${inputCls} resize-none font-mono text-xs`}
                  placeholder="One keyword per line — high-priority words to listen for carefully" />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={transcriber.enablePunctuation}
                    onChange={e => setTranscriber(t => ({ ...t, enablePunctuation: e.target.checked }))}
                    className="w-4 h-4 accent-accent-500 rounded" />
                  <span className="text-sm text-slate-700">Auto-punctuation</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={transcriber.enableProfanityFilter}
                    onChange={e => setTranscriber(t => ({ ...t, enableProfanityFilter: e.target.checked }))}
                    className="w-4 h-4 accent-accent-500 rounded" />
                  <span className="text-sm text-slate-700">Profanity filter</span>
                </label>
              </div>
            </>
          )}

          {tab === 'settings' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Session Timeout (minutes)</label>
                <input type="number" min={1} max={1440} value={sessionTimeout}
                  onChange={e => setSessionTimeout(parseInt(e.target.value) || 30)}
                  className={inputCls} />
                <p className="text-xs text-slate-400 mt-1">How long before an idle conversation automatically ends.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Max Concurrent Sessions</label>
                <input type="number" min={1} max={500} value={maxSessions}
                  onChange={e => setMaxSessions(parseInt(e.target.value) || 50)}
                  className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Primary Language</label>
                <select value={persona.language} onChange={e => setPersona(p => ({ ...p, language: e.target.value }))} className={selectCls}>
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="es-ES">Spanish</option>
                  <option value="fr-FR">French</option>
                  <option value="de-DE">German</option>
                  <option value="pt-BR">Portuguese (BR)</option>
                  <option value="ro-RO">Romanian</option>
                </select>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg text-sm font-medium transition">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main SendersTab ─────────────────────────────────────────────────────────

export function SendersTab() {
  const { senders, setSenders, updateSender, flows } = useWhatsAppStore();
  const [editingSenderId, setEditingSenderId] = useState<string | null>(null);

  // Initialize mock data on first render
  if (senders.length === 0) {
    setSenders(mockSenders);
  }

  const editingSender = senders.find(s => s.id === editingSenderId) ?? null;
  const flowNames = Object.fromEntries(flows.map(f => [f.id, f.name]));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-slate-500">Each number is a conversational AI agent with its own persona, flow, and transcriber settings.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg text-sm font-medium transition">
          <Plus className="w-4 h-4" /> Add Agent
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {senders.map(sender => (
          <div key={sender.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-sm transition-shadow">
            <div className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Bot className="w-5 h-5 text-green-700" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-800">{sender.displayName}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-500 font-mono">{sender.number}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <StatusIcon status={sender.status} />
                  <Badge variant={statusVariant[sender.status]}>{sender.status}</Badge>
                </div>
              </div>

              {/* Agent info */}
              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-medium">
                    {classificationLabels[sender.agentClassification]}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                    {sender.type === 'cloud-api' ? 'Cloud API' : 'Platform'}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 rounded">
                    {sender.transcriber.provider}
                  </span>
                  {sender.persona.tone && (
                    <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 rounded capitalize">
                      {sender.persona.tone}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 line-clamp-2">{sender.persona.systemPrompt}</p>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-100">
                <span>{sender.messagesCount.toLocaleString()} messages</span>
                {sender.flowId && (
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {flowNames[sender.flowId] || 'Flow attached'}
                  </span>
                )}
                <span>{sender.transcriber.keywords.length} keywords</span>
              </div>
            </div>

            {/* Actions */}
            <div className="px-4 pb-4 flex gap-2">
              <button
                onClick={() => setEditingSenderId(sender.id)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg text-sm font-medium transition"
              >
                <Settings className="w-4 h-4" />
                Configure Agent
              </button>
              <button className="p-2 border border-slate-200 hover:border-slate-300 text-slate-600 rounded-lg transition">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {/* Add new agent card */}
        <button className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-accent-400 hover:text-accent-500 transition-colors min-h-[200px]">
          <div className="w-10 h-10 rounded-lg border-2 border-dashed border-current flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium">Add New Agent</span>
        </button>
      </div>

      {/* Agent Config Modal */}
      {editingSender && (
        <AgentModal
          sender={editingSender}
          onClose={() => setEditingSenderId(null)}
          onSave={updateSender}
          flowNames={flowNames}
        />
      )}
    </div>
  );
}
