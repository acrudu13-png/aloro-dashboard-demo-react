import { useState } from 'react';
import { Plus, Zap, Trash2, Code2, Ticket, Globe, Database, Bell, ChevronDown, ChevronRight, Copy } from 'lucide-react';
import { Badge } from '../components/ui/Badge';

type ToolCategory = 'api' | 'crm' | 'ticketing' | 'notification' | 'data';

interface ToolParam {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object';
  description: string;
  required: boolean;
  defaultValue?: string;
}

interface Tool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  status: 'active' | 'inactive';
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  headers: Record<string, string>;
  params: ToolParam[];
  responseMapping?: string;
  usedInFlows: string[];
}

const categoryMeta: Record<ToolCategory, { label: string; icon: React.ElementType; color: string }> = {
  api: { label: 'API Request', icon: Code2, color: 'bg-orange-100 text-orange-700' },
  crm: { label: 'CRM', icon: Database, color: 'bg-blue-100 text-blue-700' },
  ticketing: { label: 'Ticketing', icon: Ticket, color: 'bg-purple-100 text-purple-700' },
  notification: { label: 'Notification', icon: Bell, color: 'bg-green-100 text-green-700' },
  data: { label: 'Data Lookup', icon: Globe, color: 'bg-slate-100 text-slate-700' },
};

const mockTools: Tool[] = [
  {
    id: 'tool-1',
    name: 'Create Ticket (Oracle RightNow)',
    description: 'Creates a new support ticket in Oracle RightNow with customer info, system type, and issue description',
    category: 'ticketing',
    status: 'active',
    method: 'POST',
    url: 'https://rightnow.horecasoftware.com/api/v2/tickets',
    headers: { 'Authorization': 'Bearer {{RIGHTNOW_TOKEN}}', 'Content-Type': 'application/json' },
    params: [
      { id: 'p1', name: 'subject', type: 'string', description: 'Ticket subject line', required: true },
      { id: 'p2', name: 'description', type: 'string', description: 'Detailed issue description', required: true },
      { id: 'p3', name: 'priority', type: 'string', description: 'low | medium | high | urgent', required: false, defaultValue: 'medium' },
      { id: 'p4', name: 'customer_email', type: 'string', description: 'Customer email address', required: true },
    ],
    responseMapping: '{ "ticketId": "$.id", "ticketUrl": "$.url" }',
    usedInFlows: ['Technical Support Flow'],
  },
  {
    id: 'tool-2',
    name: 'Lookup Customer (CRM)',
    description: 'Fetches customer account details, subscription plan, and assigned systems from the Horeca CRM',
    category: 'crm',
    status: 'active',
    method: 'GET',
    url: 'https://crm.horecasoftware.com/api/v1/customers/lookup',
    headers: { 'X-API-Key': '{{CRM_API_KEY}}' },
    params: [
      { id: 'p5', name: 'email', type: 'string', description: 'Customer email', required: false },
      { id: 'p6', name: 'phone', type: 'string', description: 'Customer phone number (WhatsApp)', required: false },
      { id: 'p6b', name: 'account_id', type: 'string', description: 'Customer account ID', required: false },
    ],
    responseMapping: '{ "customer_id": "$.id", "name": "$.fullName", "plan": "$.subscription.plan", "systems": "$.assignedSystems", "since": "$.createdAt" }',
    usedInFlows: ['Technical Support Flow', 'License Validation Flow'],
  },
  {
    id: 'tool-3',
    name: 'Send Slack Alert',
    description: 'Posts an alert message to the #horeca-escalations Slack channel when human intervention is needed',
    category: 'notification',
    status: 'active',
    method: 'POST',
    url: 'https://hooks.slack.com/services/T00/B00/XXXX',
    headers: { 'Content-Type': 'application/json' },
    params: [
      { id: 'p7', name: 'text', type: 'string', description: 'Message text to send', required: true },
      { id: 'p8', name: 'channel', type: 'string', description: 'Channel override', required: false, defaultValue: '#horeca-escalations' },
    ],
    usedInFlows: ['Technical Support Flow'],
  },
  {
    id: 'tool-4',
    name: 'Check Service Status',
    description: 'Queries the Horeca infrastructure API to check if a specific service (POS, Inventory, etc.) is operational, degraded, or down',
    category: 'api',
    status: 'active',
    method: 'GET',
    url: 'https://infra.horecasoftware.com/api/v1/services/status',
    headers: { 'X-API-Key': '{{INFRA_API_KEY}}' },
    params: [
      { id: 'p9', name: 'system', type: 'string', description: 'System identifier: pos | inventory | reservations | kitchen_display', required: true },
      { id: 'p10', name: 'customer_id', type: 'string', description: 'Customer ID to check their specific instance', required: false },
    ],
    responseMapping: '{ "status": "$.status", "uptime": "$.uptime", "lastIncident": "$.lastIncident", "version": "$.version" }',
    usedInFlows: ['Technical Support Flow'],
  },
  {
    id: 'tool-5',
    name: 'Restart Service',
    description: 'Triggers a graceful restart of a Horeca service instance for a specific customer. Requires confirmation before execution.',
    category: 'api',
    status: 'active',
    method: 'POST',
    url: 'https://infra.horecasoftware.com/api/v1/services/restart',
    headers: { 'Authorization': 'Bearer {{INFRA_TOKEN}}', 'Content-Type': 'application/json' },
    params: [
      { id: 'p11', name: 'system', type: 'string', description: 'System to restart: pos | inventory | reservations | kitchen_display', required: true },
      { id: 'p12', name: 'customer_id', type: 'string', description: 'Customer ID whose instance to restart', required: true },
      { id: 'p13', name: 'force', type: 'boolean', description: 'Force restart even if sessions are active', required: false, defaultValue: 'false' },
    ],
    responseMapping: '{ "restart_id": "$.restartId", "estimated_seconds": "$.estimatedSeconds", "status": "$.status" }',
    usedInFlows: ['Technical Support Flow'],
  },
  {
    id: 'tool-6',
    name: 'Update Ticket Status',
    description: 'Updates an existing Oracle RightNow ticket with new status, resolution notes, or assignment changes',
    category: 'ticketing',
    status: 'active',
    method: 'PATCH',
    url: 'https://rightnow.horecasoftware.com/api/v2/tickets/{{ticket_id}}',
    headers: { 'Authorization': 'Bearer {{RIGHTNOW_TOKEN}}', 'Content-Type': 'application/json' },
    params: [
      { id: 'p14', name: 'ticket_id', type: 'string', description: 'ID of the ticket to update', required: true },
      { id: 'p15', name: 'status', type: 'string', description: 'New status: open | in_progress | resolved | escalated', required: true },
      { id: 'p16', name: 'resolution_notes', type: 'string', description: 'Notes about the resolution or escalation reason', required: false },
      { id: 'p17', name: 'assigned_to', type: 'string', description: 'Assign to a specific agent or team', required: false },
    ],
    responseMapping: '{ "updated_at": "$.updatedAt", "ticket_status": "$.status" }',
    usedInFlows: ['Technical Support Flow'],
  },
  {
    id: 'tool-7',
    name: 'Validate License Key',
    description: 'Validates a Horeca software license key and returns plan details, expiration date, and feature entitlements',
    category: 'data',
    status: 'active',
    method: 'GET',
    url: 'https://licensing.horecasoftware.com/api/v1/validate',
    headers: { 'X-API-Key': '{{LICENSE_API_KEY}}' },
    params: [
      { id: 'p18', name: 'license_key', type: 'string', description: 'The license key to validate', required: true },
      { id: 'p19', name: 'product', type: 'string', description: 'Product filter: pos | inventory | reservations | kitchen_display | suite', required: false },
    ],
    responseMapping: '{ "valid": "$.valid", "plan": "$.plan", "expires_at": "$.expiresAt", "customer_name": "$.customerName", "features": "$.features" }',
    usedInFlows: ['License Validation Flow'],
  },
];

interface ParamEditorProps {
  params: ToolParam[];
  onChange: (params: ToolParam[]) => void;
}

function ParamEditor({ params, onChange }: ParamEditorProps) {
  const add = () => onChange([...params, { id: `p-${Date.now()}`, name: '', type: 'string', description: '', required: false }]);
  const remove = (id: string) => onChange(params.filter(p => p.id !== id));
  const update = (id: string, key: keyof ToolParam, value: unknown) =>
    onChange(params.map(p => p.id === id ? { ...p, [key]: value } : p));

  return (
    <div className="space-y-2">
      {params.map(p => (
        <div key={p.id} className="bg-slate-50 rounded-lg p-3 space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <input value={p.name} onChange={e => update(p.id, 'name', e.target.value)} placeholder="param_name"
              className="px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-accent-500 font-mono" />
            <select value={p.type} onChange={e => update(p.id, 'type', e.target.value)}
              className="px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-accent-500 bg-white">
              <option value="string">string</option>
              <option value="number">number</option>
              <option value="boolean">boolean</option>
              <option value="object">object</option>
            </select>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                <input type="checkbox" checked={p.required} onChange={e => update(p.id, 'required', e.target.checked)}
                  className="w-3 h-3 accent-accent-500" />
                Required
              </label>
              <button onClick={() => remove(p.id)} className="ml-auto text-slate-400 hover:text-red-500 transition">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <input value={p.description} onChange={e => update(p.id, 'description', e.target.value)}
            placeholder="Description of what this parameter does…"
            className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-accent-500" />
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-1.5 text-xs text-accent-600 hover:text-accent-700 font-medium transition">
        <Plus className="w-3.5 h-3.5" /> Add Parameter
      </button>
    </div>
  );
}

interface ToolModalProps {
  tool?: Tool;
  onClose: () => void;
  onSave: (tool: Partial<Tool>) => void;
}

function ToolModal({ tool, onClose, onSave }: ToolModalProps) {
  const [tab, setTab] = useState<'general' | 'params' | 'response'>('general');
  const [name, setName] = useState(tool?.name || '');
  const [description, setDescription] = useState(tool?.description || '');
  const [category, setCategory] = useState<ToolCategory>(tool?.category || 'api');
  const [method, setMethod] = useState(tool?.method || 'POST');
  const [url, setUrl] = useState(tool?.url || '');
  const [headers, setHeaders] = useState(
    tool?.headers ? JSON.stringify(tool.headers, null, 2) : '{\n  "Content-Type": "application/json"\n}'
  );
  const [params, setParams] = useState<ToolParam[]>(tool?.params || []);
  const [responseMapping, setResponseMapping] = useState(tool?.responseMapping || '');

  const tabs = [
    { id: 'general' as const, label: 'General' },
    { id: 'params' as const, label: 'Parameters' },
    { id: 'response' as const, label: 'Response Mapping' },
  ];

  const handleSave = () => {
    let parsedHeaders: Record<string, string> = {};
    try { parsedHeaders = JSON.parse(headers); } catch { /* ignore */ }
    onSave({ name, description, category, method: method as Tool['method'], url, headers: parsedHeaders, params, responseMapping, status: 'active' });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">{tool ? 'Edit Tool' : 'New Tool'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">✕</button>
        </div>

        <div className="flex border-b border-slate-100 px-6">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition -mb-px ${tab === t.id ? 'border-accent-500 text-accent-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {tab === 'general' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Tool Name</label>
                <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Create Support Ticket"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
                  placeholder="What does this tool do? The AI will use this to decide when to call it."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value as ToolCategory)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white">
                    {Object.entries(categoryMeta).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">HTTP Method</label>
                  <select value={method} onChange={e => setMethod(e.target.value as typeof method)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white">
                    {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Endpoint URL</label>
                <input value={url} onChange={e => setUrl(e.target.value)}
                  placeholder="https://api.example.com/endpoint"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 font-mono" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Headers <span className="text-slate-400 font-normal">(JSON — use {'{{ENV_VAR}}'} for secrets)</span>
                </label>
                <textarea value={headers} onChange={e => setHeaders(e.target.value)} rows={4}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none font-mono" />
              </div>
            </>
          )}

          {tab === 'params' && (
            <>
              <p className="text-sm text-slate-500">
                Define the parameters the AI can pass to this tool. The AI will extract these from the conversation context.
              </p>
              <ParamEditor params={params} onChange={setParams} />
            </>
          )}

          {tab === 'response' && (
            <>
              <p className="text-sm text-slate-500">
                Map response fields to conversation variables using JSONPath expressions. These variables will be available in subsequent flow nodes.
              </p>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Response Mapping <span className="text-slate-400 font-normal">(JSON)</span>
                </label>
                <textarea value={responseMapping} onChange={e => setResponseMapping(e.target.value)} rows={6}
                  placeholder={'{\n  "ticketId": "$.data.id",\n  "ticketUrl": "$.data.url"\n}'}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none font-mono" />
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
                Mapped variables are injected into the AI context automatically. Example: if you map <code className="bg-blue-100 px-1 rounded">ticketId</code>, the AI can say "I created ticket #&#123;&#123;ticketId&#125;&#125; for you."
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition">Cancel</button>
          <button onClick={handleSave} disabled={!name.trim() || !url.trim()}
            className="px-4 py-2 bg-accent-500 hover:bg-accent-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition">
            {tool ? 'Save Changes' : 'Create Tool'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ToolCard({ tool, onEdit, onDelete, onToggle }: {
  tool: Tool;
  onEdit: (tool: Tool) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { icon: Icon, color } = categoryMeta[tool.category];
  const copyUrl = () => navigator.clipboard.writeText(tool.url);

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div className="flex items-center gap-4 px-4 py-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-800 text-sm">{tool.name}</span>
            <Badge variant={tool.status === 'active' ? 'success' : 'default'}>{tool.status}</Badge>
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${color}`}>{categoryMeta[tool.category].label}</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 truncate">{tool.description}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-xs font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{tool.method}</span>
          <button onClick={() => onToggle(tool.id)}
            className={`ml-1 px-2.5 py-1.5 rounded-lg text-xs border transition ${tool.status === 'active' ? 'border-slate-200 text-slate-600 hover:border-slate-300' : 'border-green-200 text-green-700 hover:bg-green-50'}`}>
            {tool.status === 'active' ? 'Disable' : 'Enable'}
          </button>
          <button onClick={() => onEdit(tool)} className="px-2.5 py-1.5 border border-slate-200 text-slate-600 hover:border-slate-300 rounded-lg text-xs transition">Edit</button>
          <button onClick={() => onDelete(tool.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
            <Trash2 className="w-4 h-4" />
          </button>
          <button onClick={() => setExpanded(!expanded)} className="p-1.5 text-slate-400 hover:text-slate-600 transition">
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 px-4 py-3 bg-slate-50 space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded">{tool.method}</span>
            <span className="text-xs font-mono text-slate-600 truncate">{tool.url}</span>
            <button onClick={copyUrl} className="text-slate-400 hover:text-slate-600 transition flex-shrink-0"><Copy className="w-3 h-3" /></button>
          </div>

          {tool.params.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-600 mb-1.5">Parameters</p>
              <div className="space-y-1">
                {tool.params.map(p => (
                  <div key={p.id} className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-slate-700 font-medium">{p.name}</span>
                    <span className="text-slate-400">{p.type}</span>
                    {p.required && <span className="text-red-500 font-medium">*required</span>}
                    <span className="text-slate-400">— {p.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tool.usedInFlows.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-600 mb-1">Used in</p>
              <div className="flex flex-wrap gap-1.5">
                {tool.usedInFlows.map(f => (
                  <span key={f} className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{f}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>(mockTools);
  const [showModal, setShowModal] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | undefined>();
  const [filterCategory, setFilterCategory] = useState<ToolCategory | 'all'>('all');

  const filtered = filterCategory === 'all' ? tools : tools.filter(t => t.category === filterCategory);

  const handleSave = (data: Partial<Tool>) => {
    if (editingTool) {
      setTools(ts => ts.map(t => t.id === editingTool.id ? { ...t, ...data } : t));
    } else {
      setTools(ts => [...ts, { id: `tool-${Date.now()}`, usedInFlows: [], ...data } as Tool]);
    }
    setEditingTool(undefined);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this tool?')) setTools(ts => ts.filter(t => t.id !== id));
  };

  const handleEdit = (tool: Tool) => { setEditingTool(tool); setShowModal(true); };

  const handleToggle = (id: string) =>
    setTools(ts => ts.map(t => t.id === id ? { ...t, status: t.status === 'active' ? 'inactive' : 'active' } : t));

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Tools</h1>
          <p className="text-sm text-slate-500 mt-0.5">Mid-conversation tools the AI can invoke — API calls, ticket creation, lookups</p>
        </div>
        <button
          onClick={() => { setEditingTool(undefined); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg text-sm font-medium transition"
        >
          <Plus className="w-4 h-4" />
          New Tool
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setFilterCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${filterCategory === 'all' ? 'bg-accent-500 text-white border-accent-500' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
          All ({tools.length})
        </button>
        {Object.entries(categoryMeta).map(([k, v]) => {
          const count = tools.filter(t => t.category === k).length;
          if (count === 0) return null;
          return (
            <button key={k} onClick={() => setFilterCategory(k as ToolCategory)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${filterCategory === k ? 'bg-accent-500 text-white border-accent-500' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
              {v.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
            <Zap className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No tools yet. Create one to let the AI call external services.</p>
          </div>
        ) : filtered.map(tool => (
          <ToolCard key={tool.id} tool={tool} onEdit={handleEdit} onDelete={handleDelete} onToggle={handleToggle} />
        ))}
      </div>

      {showModal && (
        <ToolModal
          tool={editingTool}
          onClose={() => { setShowModal(false); setEditingTool(undefined); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
