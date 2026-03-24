import { useState } from 'react';
import { X, Bot, Wrench, Settings2, UserPlus, MessageSquare } from 'lucide-react';

interface AssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  assistantId?: string | null;
}

type TabKey = 'general' | 'tools' | 'advanced';

const webhooks = [
  { id: 'none', name: 'None' },
  { id: 'wh-1', name: 'Post-conversation Analytics' },
  { id: 'wh-2', name: 'CRM Sync' },
  { id: 'wh-3', name: 'Slack Notification' },
];

const languages = ['Spanish', 'English', 'Portuguese', 'French', 'Italian'];

export function AssistantModal({ isOpen, onClose, assistantId }: AssistantModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('general');
  const [greetingMessage, setGreetingMessage] = useState(
    'Hola! Soy el asistente de soporte de Horeca Software. ¿En qué puedo ayudarte hoy?'
  );
  const [prompt, setPrompt] = useState(
    `You are a support assistant for Horeca Software. Your goals:
- Diagnose POS and server issues reported by restaurant clients
- Trigger the appropriate API endpoints to restart services or check server health
- Escalate to a human agent when the issue cannot be resolved automatically
- Always reply in the same language the customer uses

Available actions: check_server_status, restart_pos, validate_license, create_support_ticket`
  );
  const [language, setLanguage] = useState('Spanish');
  const [humanHandoffEnabled, setHumanHandoffEnabled] = useState(true);
  const [whenToHandoff, setWhenToHandoff] = useState(
    'Hand off to a human agent when the customer requests it, or when 3 automated resolution attempts have failed'
  );
  const [endConvEnabled, setEndConvEnabled] = useState(true);
  const [whenToEnd, setWhenToEnd] = useState(
    'End the conversation when the issue is resolved and the customer confirms satisfaction'
  );
  const [postConvWebhook, setPostConvWebhook] = useState('wh-1');
  const [followUpMessage, setFollowUpMessage] = useState(
    'Hola {name}, ¿pudiste resolver el problema con tu sistema? Estamos aquí si necesitas más ayuda.'
  );
  const [responseTimeout, setResponseTimeout] = useState(24);

  if (!isOpen) return null;

  const tabs: { key: TabKey; label: string; icon: typeof Bot }[] = [
    { key: 'general', label: 'General', icon: Bot },
    { key: 'tools', label: 'Tools', icon: Wrench },
    { key: 'advanced', label: 'Advanced', icon: Settings2 },
  ];

  const isNew = !assistantId;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">
            {isNew ? 'Create Agent' : 'Edit Agent'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200">
          <div className="flex px-6">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition -mb-px ${
                  activeTab === tab.key
                    ? 'border-accent-500 text-accent-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Agent Name</label>
                <input
                  type="text"
                  defaultValue={isNew ? '' : 'Horeca Support Bot'}
                  placeholder="e.g. Horeca Support Bot"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Language</label>
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
                >
                  {languages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Greeting Message</label>
                <textarea
                  value={greetingMessage}
                  onChange={e => setGreetingMessage(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none"
                />
                <p className="text-xs text-slate-400 mt-1">Sent when a new conversation starts</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">System Prompt</label>
                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 font-mono resize-y"
                  style={{ minHeight: '150px' }}
                />
                <p className="text-xs text-slate-400 mt-1">Define the chatbot's behavior, goals, and available actions</p>
              </div>
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="space-y-6">
              {/* Human Handoff */}
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">Human Handoff</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={humanHandoffEnabled}
                      onChange={e => setHumanHandoffEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:ring-2 peer-focus:ring-accent-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent-500"></div>
                  </label>
                </div>
                {humanHandoffEnabled && (
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">When to hand off</label>
                    <textarea
                      value={whenToHandoff}
                      onChange={e => setWhenToHandoff(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none bg-white"
                    />
                  </div>
                )}
              </div>

              {/* End Conversation */}
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">End Conversation</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={endConvEnabled}
                      onChange={e => setEndConvEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:ring-2 peer-focus:ring-accent-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent-500"></div>
                  </label>
                </div>
                {endConvEnabled && (
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">When to end</label>
                    <textarea
                      value={whenToEnd}
                      onChange={e => setWhenToEnd(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none bg-white"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Post-conversation Webhook</label>
                <select
                  value={postConvWebhook}
                  onChange={e => setPostConvWebhook(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
                >
                  {webhooks.map(wh => (
                    <option key={wh.id} value={wh.id}>{wh.name}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-1">Triggered when a conversation ends</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Follow-up Message</label>
                <textarea
                  value={followUpMessage}
                  onChange={e => setFollowUpMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Sent if customer goes silent. Use {'{name}'} for contact name.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Conversation Timeout (hours)
                </label>
                <input
                  type="number"
                  value={responseTimeout}
                  onChange={e => setResponseTimeout(Number(e.target.value))}
                  min={1}
                  max={72}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
                <p className="text-xs text-slate-400 mt-1">Auto-close conversation after this many hours of inactivity</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition">
            Cancel
          </button>
          <button className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg text-sm font-medium transition">
            {isNew ? 'Create Agent' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
