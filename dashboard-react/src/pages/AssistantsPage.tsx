import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Bot, MessageCircle, CheckCircle,
  GitBranch, ExternalLink, Trash2, Globe,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { AssistantModal } from '../components/modals/AssistantModal';
import { useAssistantsStore } from '../stores/assistants';
import { useWhatsAppStore } from '../stores/whatsapp';
import type { SupportAgent, WhatsAppFlow } from '../types';
import { horecaDemoNodes, horecaDemoEdges, horecaDemoVariables } from './WhatsApp/demoFlow';

// ── Seed data ────────────────────────────────────────────────────────────────

export const seedAgents: SupportAgent[] = [
  {
    id: 'agent-1',
    name: 'Horeca Support Bot',
    description: 'Handles POS system issues, server health checks, and software troubleshooting for restaurant clients',
    status: 'active',
    language: 'Romanian',
    systemPrompt: `You are a technical support assistant for Horeca Software. Your goals:
- Diagnose POS and server issues reported by restaurant clients
- Trigger the appropriate API endpoints to restart services or check server health
- Escalate to a human agent when the issue cannot be resolved automatically
- Always reply in the same language the customer uses`,
    greetingMessage: 'Hello! I am the Horeca Software support assistant. How can I help you today?',
    fallbackMessage: 'I apologize, I did not understand that. Could you please rephrase your question?',
    model: 'gpt-4o',
    temperature: 0.7,
    toolIds: ['tool-1', 'tool-2', 'tool-4', 'tool-5', 'tool-6'],
    knowledgeBaseIds: ['kb-1', 'kb-2'],
    conversationTimeoutHours: 24,
    humanHandoff: { enabled: true, condition: 'Escalate when customer requests it or 3 auto-recovery attempts fail' },
    postConversationWebhookId: 'wh-1',
    followUpMessage: 'Hi {name}, were you able to resolve your issue? We are here if you need further assistance.',
    flowIds: ['flow-1', 'flow-2'],
    activeFlowId: 'flow-1',
    whatsappSenderId: 'sender-1',
    conversationsCount: 847,
    resolutionRate: 91,
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-03-20T14:30:00Z',
  },
  {
    id: 'agent-2',
    name: 'License & Billing Bot',
    description: 'Answers licensing questions, triggers invoice webhooks, and validates subscription status',
    status: 'active',
    language: 'Romanian',
    systemPrompt: `You are a billing and license support assistant for Horeca Software.
- Answer questions about subscription plans and pricing
- Validate license keys and subscription status via API
- Trigger invoice generation and payment link webhooks
- Escalate billing disputes to a human agent`,
    greetingMessage: 'Hello! I am the Horeca billing and licensing assistant. How can I help?',
    fallbackMessage: 'I could not understand your question. Could you please try again?',
    model: 'gpt-4o',
    temperature: 0.5,
    toolIds: ['tool-2', 'tool-7'],
    knowledgeBaseIds: ['kb-1', 'kb-3'],
    conversationTimeoutHours: 48,
    humanHandoff: { enabled: true, condition: 'Escalate billing disputes or unrecognized license issues' },
    flowIds: ['flow-3'],
    activeFlowId: 'flow-3',
    conversationsCount: 234,
    resolutionRate: 88,
    createdAt: '2026-02-15T09:00:00Z',
    updatedAt: '2026-03-18T11:00:00Z',
  },
  {
    id: 'agent-3',
    name: 'Onboarding Assistant',
    description: 'Guides new clients through initial setup and configuration of Horeca software',
    status: 'draft',
    language: 'Romanian',
    systemPrompt: `You are an onboarding assistant for Horeca Software.
- Guide new restaurant clients through first-time software setup
- Walk through POS configuration step by step
- Confirm successful setup by checking server status endpoints`,
    greetingMessage: 'Welcome to Horeca Software! I will help you with the initial setup and configuration.',
    fallbackMessage: 'I did not understand your response. Could you please try again?',
    model: 'gpt-4o',
    temperature: 0.6,
    toolIds: [],
    knowledgeBaseIds: ['kb-2'],
    conversationTimeoutHours: 72,
    humanHandoff: { enabled: true, condition: 'Escalate if client cannot complete setup after 3 attempts' },
    flowIds: [],
    conversationsCount: 0,
    resolutionRate: 0,
    createdAt: '2026-03-10T09:00:00Z',
    updatedAt: '2026-03-10T09:00:00Z',
  },
];

export const seedFlows: WhatsAppFlow[] = [
  {
    id: 'flow-1',
    agentId: 'agent-1',
    name: 'Technical Support Flow',
    description: 'CRM lookup → identify system → open Oracle RightNow ticket → check/restart server → diagnose → resolve or escalate',
    status: 'active',
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-20T14:30:00Z',
    messagesCount: 1247,
    nodes: horecaDemoNodes,
    edges: horecaDemoEdges,
    variables: horecaDemoVariables,
    version: 3,
    lastPublishedAt: '2026-03-20T14:30:00Z',
  },
  {
    id: 'flow-2',
    agentId: 'agent-1',
    name: 'After-Hours Flow',
    description: 'Collect issue details and promise a callback the next business day',
    status: 'draft',
    createdAt: '2026-03-22T10:00:00Z',
    updatedAt: '2026-03-22T10:00:00Z',
    messagesCount: 0,
    nodes: [
      { id: 'start-1', type: 'start', position: { x: 250, y: 50 }, data: { label: 'Welcome', nodeType: 'start', description: 'Customer messages outside business hours' } },
      { id: 'msg-hours', type: 'send-message', position: { x: 220, y: 180 }, data: { label: 'After-Hours Notice', nodeType: 'send-message', messageBody: 'Hello, thank you for contacting Horeca Software support. Our hours are Monday to Friday, 9:00 AM - 6:00 PM EST. We will respond the next business day.' } },
      { id: 'wait-details', type: 'wait-for-input', position: { x: 220, y: 340 }, data: { label: 'Collect Issue', nodeType: 'wait-for-input', promptMessage: 'If you would like, please briefly describe your issue and we will review it first thing in the morning:', variableName: 'issue_description', timeout: 300, timeoutAction: 'advance' } },
      { id: 'msg-confirm', type: 'send-message', position: { x: 220, y: 500 }, data: { label: 'Confirmation', nodeType: 'send-message', messageBody: 'Thank you. We have recorded your inquiry and will contact you as soon as possible. Good evening!' } },
      { id: 'end-1', type: 'end', position: { x: 250, y: 630 }, data: { label: 'End', nodeType: 'end', description: 'After-hours conversation closed' } },
    ],
    edges: [
      { id: 'e-start', source: 'start-1', target: 'msg-hours', animated: true },
      { id: 'e-msg-wait', source: 'msg-hours', target: 'wait-details' },
      { id: 'e-wait-confirm', source: 'wait-details', target: 'msg-confirm' },
      { id: 'e-confirm-end', source: 'msg-confirm', target: 'end-1' },
    ],
    variables: [
      { name: 'issue_description', type: 'string', description: 'Issue details left by customer' },
    ],
    version: 1,
  },
  {
    id: 'flow-3',
    agentId: 'agent-2',
    name: 'License Validation Flow',
    description: 'Validate license key, show plan details, generate invoice if needed',
    status: 'active',
    createdAt: '2026-03-05T09:00:00Z',
    updatedAt: '2026-03-18T11:00:00Z',
    messagesCount: 412,
    nodes: [
      { id: 'start-1', type: 'start', position: { x: 300, y: 50 }, data: { label: 'Welcome', nodeType: 'start', description: 'Customer asks about license or billing' } },
      { id: 'ai-collect', type: 'ai-conversation', position: { x: 260, y: 180 }, data: { label: 'Collect License Key', nodeType: 'ai-conversation', systemPrompt: 'Ask the customer for their license key. They may provide their email or restaurant name instead. If they give an email, use the CRM lookup tool to find their license details.', toolIds: ['tool-2'], knowledgeBaseIds: ['kb-3'], maxTurns: 6, exitConditions: [{ id: 'ec-has-key', label: 'Key Provided', type: 'ai-intent', operator: 'equals', intentDescription: 'Customer has provided a license key', confidenceThreshold: 0.8 }, { id: 'ec-no-key', label: 'No Key', type: 'ai-intent', operator: 'equals', intentDescription: 'Customer cannot find their license key after multiple attempts', confidenceThreshold: 0.7 }] } },
      { id: 'tool-validate', type: 'tool-call', position: { x: 200, y: 380 }, data: { label: 'Validate License', nodeType: 'tool-call', toolId: 'tool-7', inputMapping: { license_key: '{{license_key}}' }, outputMapping: { license_valid: 'valid', license_plan: 'plan', license_expires: 'expiresAt' } } },
      { id: 'cond-valid', type: 'condition', position: { x: 200, y: 520 }, data: { label: 'License Valid?', nodeType: 'condition', conditions: [{ id: 'cond-ok', label: 'Valid', type: 'variable', operator: 'equals', variable: 'license_valid', value: 'true' }, { id: 'cond-expired', label: 'Expired', type: 'variable', operator: 'equals', variable: 'license_plan', value: 'expired' }, { id: 'cond-invalid', label: 'Invalid', type: 'variable', operator: 'equals', variable: 'license_valid', value: 'false' }] } },
      { id: 'msg-valid', type: 'send-message', position: { x: 60, y: 680 }, data: { label: 'License OK', nodeType: 'send-message', messageBody: 'Your license is valid. Plan: {{license_plan}}, expires: {{license_expires}}. Is there anything else I can help with?' } },
      { id: 'msg-expired', type: 'send-message', position: { x: 280, y: 680 }, data: { label: 'License Expired', nodeType: 'send-message', messageBody: 'Your license has expired. You can renew it from your customer portal or contact sales@horecasoftware.com.' } },
      { id: 'msg-invalid', type: 'send-message', position: { x: 500, y: 680 }, data: { label: 'License Invalid', nodeType: 'send-message', messageBody: 'The license key is not valid. Please verify you entered it correctly or contact support.' } },
      { id: 'handoff-no-key', type: 'handoff', position: { x: 480, y: 380 }, data: { label: 'Handoff (No Key)', nodeType: 'handoff', handoffTarget: 'Billing Support', handoffMessage: 'Customer cannot locate their license key. Please assist.', includeTranscript: true } },
      { id: 'end-1', type: 'end', position: { x: 280, y: 820 }, data: { label: 'End', nodeType: 'end', description: 'License check complete' } },
    ],
    edges: [
      { id: 'e-start', source: 'start-1', target: 'ai-collect', animated: true },
      { id: 'e-has-key', source: 'ai-collect', target: 'tool-validate', sourceHandle: 'ec-has-key', label: 'Key Provided' },
      { id: 'e-no-key', source: 'ai-collect', target: 'handoff-no-key', sourceHandle: 'ec-no-key', label: 'No Key' },
      { id: 'e-validate-cond', source: 'tool-validate', target: 'cond-valid', sourceHandle: 'success' },
      { id: 'e-valid', source: 'cond-valid', target: 'msg-valid', sourceHandle: 'cond-ok', label: 'Valid' },
      { id: 'e-expired', source: 'cond-valid', target: 'msg-expired', sourceHandle: 'cond-expired', label: 'Expired' },
      { id: 'e-invalid', source: 'cond-valid', target: 'msg-invalid', sourceHandle: 'cond-invalid', label: 'Invalid' },
      { id: 'e-valid-end', source: 'msg-valid', target: 'end-1' },
      { id: 'e-expired-end', source: 'msg-expired', target: 'end-1' },
      { id: 'e-invalid-end', source: 'msg-invalid', target: 'end-1' },
    ],
    variables: [
      { name: 'license_key', type: 'string', description: 'Customer license key' },
      { name: 'license_valid', type: 'string', description: 'Whether key is valid (true/false)' },
      { name: 'license_plan', type: 'string', description: 'Subscription plan name or expired' },
      { name: 'license_expires', type: 'string', description: 'License expiration date' },
    ],
    version: 2,
    lastPublishedAt: '2026-03-18T11:00:00Z',
  },
];

// ── New Flow Modal ────────────────────────────────────────────────────────────

interface NewFlowModalProps {
  agentId: string;
  onClose: () => void;
  onCreate: (flow: WhatsAppFlow) => void;
}

function NewFlowModal({ agentId, onClose, onCreate }: NewFlowModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({
      id: `flow-${Date.now()}`,
      agentId,
      name: name.trim(),
      description: description.trim(),
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messagesCount: 0,
      nodes: [{ id: 'start-1', type: 'start', position: { x: 250, y: 150 }, data: { label: 'Welcome', nodeType: 'start', description: 'Conversation entry point' } }],
      edges: [],
      variables: [],
      version: 1,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">New Flow</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Flow name</label>
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. After-Hours Flow"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Description <span className="text-slate-400">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What does this flow handle?"
              rows={2}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 bg-accent-500 hover:bg-accent-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition"
            >
              Create & Open Builder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Agent Card ────────────────────────────────────────────────────────────────

interface AgentCardProps {
  agent: SupportAgent;
  flows: WhatsAppFlow[];
  onEdit: () => void;
  onAddFlow: () => void;
  onDeleteFlow: (flowId: string) => void;
  onSetActiveFlow: (flowId: string) => void;
}

function AgentCard({ agent, flows, onEdit, onAddFlow, onDeleteFlow, onSetActiveFlow }: AgentCardProps) {
  const navigate = useNavigate();

  const agentStatusVariant: Record<SupportAgent['status'], 'success' | 'default' | 'warning'> = {
    active: 'success', draft: 'default', archived: 'warning',
  };
  const flowStatusVariant: Record<WhatsAppFlow['status'], 'success' | 'default' | 'warning'> = {
    active: 'success', draft: 'default', archived: 'warning',
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-sm transition-shadow flex flex-col">
      {/* Agent header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-lg flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <Badge variant={agentStatusVariant[agent.status]}>{agent.status}</Badge>
        </div>
        <h3 className="text-base font-semibold text-slate-800 mb-1">{agent.name}</h3>
        <p className="text-sm text-slate-500 mb-4 line-clamp-2">{agent.description}</p>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MessageCircle className="w-4 h-4 text-slate-400" />
            {agent.conversationsCount.toLocaleString()} chats
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <CheckCircle className="w-4 h-4 text-slate-400" />
            {agent.resolutionRate}% resolved
          </div>
        </div>
        <p className="text-xs text-slate-400">{agent.language}</p>
      </div>

      {/* Flows section */}
      <div className="border-t border-slate-100 bg-slate-50/50 flex-1">
        <div className="px-4 pt-3 pb-1 flex items-center justify-between">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <GitBranch className="w-3 h-3" />
            Flows
          </p>
          <button
            onClick={onAddFlow}
            className="text-[11px] text-accent-600 hover:text-accent-700 font-medium flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Add Flow
          </button>
        </div>

        {flows.length === 0 ? (
          <p className="px-4 py-3 text-xs text-slate-400 italic">No flows yet — add one to get started</p>
        ) : (
          <ul className="px-3 pb-3 space-y-1.5">
            {flows.map(flow => {
              const isActive = flow.id === agent.activeFlowId;
              return (
                <li
                  key={flow.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs ${
                    isActive ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isActive ? 'bg-green-500' : 'bg-slate-300'}`} />
                  <span className="flex-1 truncate text-slate-700 font-medium">{flow.name}</span>
                  <Badge variant={flowStatusVariant[flow.status]}>{flow.status}</Badge>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    {!isActive && flow.status !== 'archived' && (
                      <button
                        onClick={() => onSetActiveFlow(flow.id)}
                        title="Set as active flow"
                        className="p-1 text-slate-400 hover:text-green-600 transition"
                      >
                        <Globe className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/whatsapp/flows/${flow.id}`)}
                      title="Open in builder"
                      className="p-1 text-slate-400 hover:text-accent-600 transition"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </button>
                    {!isActive && (
                      <button
                        onClick={() => { if (confirm(`Delete "${flow.name}"?`)) onDeleteFlow(flow.id); }}
                        title="Delete flow"
                        className="p-1 text-slate-400 hover:text-red-500 transition"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 px-4 py-3 flex items-center justify-between">
        <button
          onClick={onEdit}
          className="text-sm text-slate-600 hover:text-slate-800 font-medium transition"
        >
          Edit Agent
        </button>
        {agent.activeFlowId && (
          <button
            onClick={() => navigate(`/whatsapp/flows/${agent.activeFlowId}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-500 hover:bg-accent-600 text-white rounded-lg text-xs font-medium transition"
          >
            <ExternalLink className="w-3 h-3" />
            Open Active Flow
          </button>
        )}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function AssistantsPage() {
  const navigate = useNavigate();
  const { agents, setAgents, updateAgent } = useAssistantsStore();
  const { flows, setFlows, addFlow, deleteFlow } = useWhatsAppStore();

  const [modalAgentId, setModalAgentId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newFlowForAgentId, setNewFlowForAgentId] = useState<string | null>(null);

  // Seed on first load
  if (agents.length === 0) {
    setAgents(seedAgents);
    setFlows(seedFlows);
  }

  const agentFlows = (agentId: string) => flows.filter(f => f.agentId === agentId);

  const handleCreateFlow = (flow: WhatsAppFlow) => {
    addFlow(flow);
    const agent = agents.find(a => a.id === flow.agentId);
    if (agent) {
      updateAgent(agent.id, { flowIds: [...agent.flowIds, flow.id] });
    }
    setNewFlowForAgentId(null);
    navigate(`/whatsapp/flows/${flow.id}`);
  };

  const handleDeleteFlow = (agentId: string, flowId: string) => {
    deleteFlow(flowId);
    const agent = agents.find(a => a.id === agentId);
    if (agent) {
      updateAgent(agentId, { flowIds: agent.flowIds.filter(id => id !== flowId) });
    }
  };

  const handleSetActiveFlow = (agentId: string, flowId: string) => {
    updateAgent(agentId, { activeFlowId: flowId });
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Support Agents</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Each agent defines the AI personality and owns one or more conversation flows
          </p>
        </div>
        <button
          onClick={() => { setModalAgentId(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg text-sm font-medium transition"
        >
          <Plus className="w-4 h-4" />
          New Agent
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map(agent => (
          <AgentCard
            key={agent.id}
            agent={agent}
            flows={agentFlows(agent.id)}
            onEdit={() => { setModalAgentId(agent.id); setModalOpen(true); }}
            onAddFlow={() => setNewFlowForAgentId(agent.id)}
            onDeleteFlow={(flowId) => handleDeleteFlow(agent.id, flowId)}
            onSetActiveFlow={(flowId) => handleSetActiveFlow(agent.id, flowId)}
          />
        ))}

        <button
          onClick={() => { setModalAgentId(null); setModalOpen(true); }}
          className="bg-white rounded-lg border-2 border-dashed border-slate-200 p-4 flex flex-col items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-300 transition min-h-[240px]"
        >
          <Plus className="w-8 h-8 mb-2" />
          <span className="text-sm font-medium">Create Agent</span>
        </button>
      </div>

      <AssistantModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setModalAgentId(null); }}
        assistantId={modalAgentId}
      />

      {newFlowForAgentId && (
        <NewFlowModal
          agentId={newFlowForAgentId}
          onClose={() => setNewFlowForAgentId(null)}
          onCreate={handleCreateFlow}
        />
      )}
    </div>
  );
}
