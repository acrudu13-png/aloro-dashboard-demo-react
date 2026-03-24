import { useState } from 'react';
import { Plus, Webhook, Trash2, Play, CheckCircle, XCircle, Clock, ChevronDown, ChevronRight, Copy } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import type { Webhook as WebhookType } from '../types';

const ALL_EVENTS = [
  { group: 'Conversation', events: ['conversation.started', 'conversation.ended', 'conversation.message_received', 'conversation.message_sent'] },
  { group: 'Ticket', events: ['ticket.created', 'ticket.updated', 'ticket.resolved', 'ticket.escalated'] },
  { group: 'Flow', events: ['flow.node_entered', 'flow.node_exited', 'flow.completed', 'flow.failed'] },
  { group: 'Agent', events: ['agent.handoff_requested', 'agent.handoff_completed'] },
];

const mockWebhooks: WebhookType[] = [
  {
    id: 'wh-1',
    name: 'CRM Sync',
    url: 'https://crm.example.com/api/webhook',
    events: ['conversation.ended', 'ticket.created'],
    status: 'active',
    lastTriggered: '2026-03-23T10:45:00Z',
  },
  {
    id: 'wh-2',
    name: 'Slack Notifications',
    url: 'https://hooks.slack.com/services/T00/B00/XXXX',
    events: ['agent.handoff_requested', 'ticket.escalated'],
    status: 'active',
    lastTriggered: '2026-03-23T09:12:00Z',
  },
  {
    id: 'wh-3',
    name: 'Analytics Pipeline',
    url: 'https://analytics.internal/ingest',
    events: ['conversation.started', 'conversation.ended', 'flow.completed'],
    status: 'error',
    lastTriggered: '2026-03-22T18:00:00Z',
  },
];

const statusVariant: Record<WebhookType['status'], 'success' | 'danger' | 'default'> = {
  active: 'success',
  error: 'danger',
  inactive: 'default',
};

interface TestResult {
  status: 'success' | 'error';
  statusCode?: number;
  message: string;
  responseTime: number;
}

interface WebhookModalProps {
  webhook?: WebhookType;
  onClose: () => void;
  onSave: (webhook: Partial<WebhookType>) => void;
}

function WebhookModal({ webhook, onClose, onSave }: WebhookModalProps) {
  const [name, setName] = useState(webhook?.name || '');
  const [url, setUrl] = useState(webhook?.url || '');
  const [secret, setSecret] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>(webhook?.events || []);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Conversation']);

  const toggleGroup = (group: string) =>
    setExpandedGroups(g => g.includes(group) ? g.filter(x => x !== group) : [...g, group]);

  const toggleEvent = (event: string) =>
    setSelectedEvents(e => e.includes(event) ? e.filter(x => x !== event) : [...e, event]);

  const toggleGroupAll = (events: string[]) => {
    const allSelected = events.every(e => selectedEvents.includes(e));
    if (allSelected) setSelectedEvents(s => s.filter(e => !events.includes(e)));
    else setSelectedEvents(s => [...new Set([...s, ...events])]);
  };

  const handleSave = () => {
    if (!name.trim() || !url.trim()) return;
    onSave({ name: name.trim(), url: url.trim(), events: selectedEvents, status: 'active' });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">{webhook ? 'Edit Webhook' : 'New Webhook'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
              <input
                autoFocus value={name} onChange={e => setName(e.target.value)}
                placeholder="CRM Sync"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Endpoint URL</label>
              <input
                value={url} onChange={e => setUrl(e.target.value)}
                placeholder="https://your-server.com/webhook"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 font-mono"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Secret <span className="text-slate-400 font-normal">(optional — used to sign payloads)</span>
              </label>
              <input
                value={secret} onChange={e => setSecret(e.target.value)}
                placeholder="whsec_…"
                type="password"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Events to subscribe <span className="text-slate-400 font-normal">({selectedEvents.length} selected)</span>
            </label>
            <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
              {ALL_EVENTS.map(({ group, events }) => {
                const allSelected = events.every(e => selectedEvents.includes(e));
                const someSelected = events.some(e => selectedEvents.includes(e));
                const isOpen = expandedGroups.includes(group);

                return (
                  <div key={group}>
                    <div className="flex items-center px-3 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                      onClick={() => toggleGroup(group)}>
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={el => { if (el) el.indeterminate = someSelected && !allSelected; }}
                        onChange={() => toggleGroupAll(events)}
                        onClick={e => e.stopPropagation()}
                        className="w-3.5 h-3.5 mr-2.5 accent-accent-500"
                      />
                      <span className="text-xs font-semibold text-slate-600 flex-1">{group}</span>
                      {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                    </div>
                    {isOpen && (
                      <div className="px-4 py-2 space-y-1.5 bg-white">
                        {events.map(event => (
                          <label key={event} className="flex items-center gap-2.5 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={selectedEvents.includes(event)}
                              onChange={() => toggleEvent(event)}
                              className="w-3.5 h-3.5 accent-accent-500"
                            />
                            <span className="text-xs font-mono text-slate-600 group-hover:text-slate-800 transition-colors">{event}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition">Cancel</button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || !url.trim()}
            className="px-4 py-2 bg-accent-500 hover:bg-accent-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition"
          >
            {webhook ? 'Save Changes' : 'Create Webhook'}
          </button>
        </div>
      </div>
    </div>
  );
}

function WebhookRow({ webhook, onDelete, onTest, onEdit }: {
  webhook: WebhookType;
  onDelete: (id: string) => void;
  onTest: (id: string) => void;
  onEdit: (webhook: WebhookType) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [testing, setTesting] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    await new Promise(r => setTimeout(r, 900));
    // Simulate a test ping
    const success = Math.random() > 0.3;
    setTestResult({
      status: success ? 'success' : 'error',
      statusCode: success ? 200 : 500,
      message: success ? 'Webhook responded successfully' : 'Connection refused or timeout',
      responseTime: Math.floor(Math.random() * 400 + 50),
    });
    setTesting(false);
    onTest(webhook.id);
  };

  const copyUrl = () => navigator.clipboard.writeText(webhook.url);

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div className="flex items-center gap-4 px-4 py-3">
        <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Webhook className="w-4.5 h-4.5 text-slate-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-800 text-sm">{webhook.name}</span>
            <Badge variant={statusVariant[webhook.status]}>{webhook.status}</Badge>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs text-slate-400 font-mono truncate max-w-xs">{webhook.url}</span>
            <button onClick={copyUrl} className="text-slate-300 hover:text-slate-500 transition flex-shrink-0">
              <Copy className="w-3 h-3" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 flex-shrink-0">
          <Clock className="w-3.5 h-3.5" />
          {webhook.lastTriggered ? new Date(webhook.lastTriggered).toLocaleString() : 'Never'}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={handleTest}
            disabled={testing}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-800 border border-slate-200 hover:border-slate-300 rounded-lg transition disabled:opacity-50"
          >
            <Play className="w-3 h-3" />
            {testing ? 'Testing…' : 'Test'}
          </button>
          <button onClick={() => onEdit(webhook)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition text-xs px-2.5 py-1.5 border border-slate-200">
            Edit
          </button>
          <button onClick={() => onDelete(webhook.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
            <Trash2 className="w-4 h-4" />
          </button>
          <button onClick={() => setExpanded(!expanded)} className="p-1.5 text-slate-400 hover:text-slate-600 transition">
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 px-4 py-3 bg-slate-50 space-y-3">
          <div>
            <p className="text-xs font-medium text-slate-600 mb-1.5">Subscribed events</p>
            <div className="flex flex-wrap gap-1.5">
              {webhook.events.map(event => (
                <span key={event} className="text-xs bg-white border border-slate-200 text-slate-600 font-mono px-2 py-0.5 rounded-md">{event}</span>
              ))}
            </div>
          </div>

          {testResult && (
            <div className={`flex items-start gap-2.5 p-3 rounded-lg text-sm ${testResult.status === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {testResult.status === 'success'
                ? <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                : <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              }
              <div>
                <p className="font-medium text-xs">{testResult.statusCode} — {testResult.message}</p>
                <p className="text-xs opacity-70 mt-0.5">Response time: {testResult.responseTime}ms</p>
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-slate-600 mb-1.5">Sample payload</p>
            <pre className="text-xs bg-slate-800 text-slate-100 rounded-lg p-3 overflow-x-auto">{JSON.stringify({
              event: webhook.events[0] || 'conversation.ended',
              timestamp: new Date().toISOString(),
              data: { conversationId: 'conv_abc123', customerId: 'cust_xyz456' }
            }, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

export function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookType[]>(mockWebhooks);
  const [showModal, setShowModal] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookType | undefined>();

  const handleSave = (data: Partial<WebhookType>) => {
    if (editingWebhook) {
      setWebhooks(whs => whs.map(wh => wh.id === editingWebhook.id ? { ...wh, ...data } : wh));
    } else {
      setWebhooks(whs => [...whs, { id: `wh-${Date.now()}`, ...data } as WebhookType]);
    }
    setEditingWebhook(undefined);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this webhook?')) setWebhooks(whs => whs.filter(wh => wh.id !== id));
  };

  const handleEdit = (webhook: WebhookType) => {
    setEditingWebhook(webhook);
    setShowModal(true);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Webhooks</h1>
          <p className="text-sm text-slate-500 mt-0.5">Receive real-time event notifications at your endpoints</p>
        </div>
        <button
          onClick={() => { setEditingWebhook(undefined); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg text-sm font-medium transition"
        >
          <Plus className="w-4 h-4" />
          New Webhook
        </button>
      </div>

      {webhooks.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
          <Webhook className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No webhooks yet. Create one to start receiving events.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {webhooks.map(wh => (
            <WebhookRow
              key={wh.id}
              webhook={wh}
              onDelete={handleDelete}
              onTest={(id) => setWebhooks(whs => whs.map(w => w.id === id ? { ...w, lastTriggered: new Date().toISOString() } : w))}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {showModal && (
        <WebhookModal
          webhook={editingWebhook}
          onClose={() => { setShowModal(false); setEditingWebhook(undefined); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
