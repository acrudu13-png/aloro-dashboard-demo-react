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
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';

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
      { id: 'ai-collect', type: 'ai-conversation', position: { x: 260, y: 180 }, data: { label: 'Collect License Key', nodeType: 'ai-conversation', systemPrompt: 'Ask the customer for their license key.', toolIds: ['tool-2'], knowledgeBaseIds: ['kb-3'], maxTurns: 6, exitConditions: [] } },
      { id: 'end-1', type: 'end', position: { x: 280, y: 820 }, data: { label: 'End', nodeType: 'end', description: 'License check complete' } },
    ],
    edges: [
      { id: 'e-start', source: 'start-1', target: 'ai-collect', animated: true },
    ],
    variables: [
      { name: 'license_key', type: 'string', description: 'Customer license key' },
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
    <Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Flow</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Flow name</Label>
            <Input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. After-Hours Flow"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What does this flow handle?"
              rows={2}
              className="resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={!name.trim()}>
              Create & Open Builder
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
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
    <Card className="overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-lg flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <Badge variant={agentStatusVariant[agent.status]}>{agent.status}</Badge>
        </div>
        <h3 className="text-base font-semibold mb-1">{agent.name}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{agent.description}</p>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageCircle className="w-4 h-4" />
            {agent.conversationsCount.toLocaleString()} chats
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="w-4 h-4" />
            {agent.resolutionRate}% resolved
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{agent.language}</p>
      </CardContent>

      {/* Flows section */}
      <div className="border-t bg-muted/30 flex-1">
        <div className="px-4 pt-3 pb-1 flex items-center justify-between">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <GitBranch className="w-3 h-3" />
            Flows
          </p>
          <button
            onClick={onAddFlow}
            className="text-[11px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Add Flow
          </button>
        </div>

        {flows.length === 0 ? (
          <p className="px-4 py-3 text-xs text-muted-foreground italic">No flows yet — add one to get started</p>
        ) : (
          <ul className="px-3 pb-3 space-y-1.5">
            {flows.map(flow => {
              const isActive = flow.id === agent.activeFlowId;
              return (
                <li
                  key={flow.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs ${
                    isActive ? 'bg-green-50 border-green-200' : 'bg-background border-border'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isActive ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
                  <span className="flex-1 truncate font-medium">{flow.name}</span>
                  <Badge variant={flowStatusVariant[flow.status]}>{flow.status}</Badge>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    {!isActive && flow.status !== 'archived' && (
                      <button
                        onClick={() => onSetActiveFlow(flow.id)}
                        title="Set as active flow"
                        className="p-1 text-muted-foreground hover:text-green-600 transition"
                      >
                        <Globe className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/whatsapp/flows/${flow.id}`)}
                      title="Open in builder"
                      className="p-1 text-muted-foreground hover:text-blue-600 transition"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </button>
                    {!isActive && (
                      <button
                        onClick={() => { if (confirm(`Delete "${flow.name}"?`)) onDeleteFlow(flow.id); }}
                        title="Delete flow"
                        className="p-1 text-muted-foreground hover:text-red-500 transition"
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
      <div className="border-t px-4 py-3 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onEdit} className="text-sm h-auto py-1">
          Edit Agent
        </Button>
        {agent.activeFlowId && (
          <Button
            size="sm"
            onClick={() => navigate(`/whatsapp/flows/${agent.activeFlowId}`)}
            className="flex items-center gap-1.5 text-xs"
          >
            <ExternalLink className="w-3 h-3" />
            Open Active Flow
          </Button>
        )}
      </div>
    </Card>
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
          <h1 className="text-xl font-semibold">Support Agents</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Each agent defines the AI personality and owns one or more conversation flows
          </p>
        </div>
        <Button onClick={() => { setModalAgentId(null); setModalOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          New Agent
        </Button>
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
          className="bg-background rounded-lg border-2 border-dashed border-border p-4 flex flex-col items-center justify-center text-muted-foreground hover:text-foreground hover:border-muted-foreground/50 transition min-h-[240px]"
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
