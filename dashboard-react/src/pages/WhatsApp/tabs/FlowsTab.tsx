import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, GitBranch, Trash2, ExternalLink, MessageSquare, Bot } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { useWhatsAppStore } from '../../../stores/whatsapp';
import { useAssistantsStore } from '../../../stores/assistants';
import type { WhatsAppFlow, FlowEdge } from '../../../types';

const statusVariant: Record<WhatsAppFlow['status'], 'success' | 'default' | 'warning'> = {
  active: 'success',
  draft: 'default',
  archived: 'warning',
};

interface NewFlowModalProps {
  onClose: () => void;
  onCreate: (name: string, description: string, agentId: string) => void;
  agents: { id: string; name: string }[];
}

function NewFlowModal({ onClose, onCreate, agents }: NewFlowModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [agentId, setAgentId] = useState(agents[0]?.id || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && agentId) onCreate(name.trim(), description.trim(), agentId);
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
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Agent</label>
            <select
              value={agentId}
              onChange={e => setAgentId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
            >
              {agents.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Flow name</label>
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Technical Support Flow"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description <span className="text-slate-400">(optional)</span></label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What does this flow handle?"
              rows={3}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !agentId}
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

export function FlowsTab() {
  const navigate = useNavigate();
  const { flows, addFlow, deleteFlow } = useWhatsAppStore();
  const { agents, updateAgent } = useAssistantsStore();
  const [showNewModal, setShowNewModal] = useState(false);

  const agentName = (agentId: string) => agents.find(a => a.id === agentId)?.name ?? 'Unassigned';

  const handleCreate = (name: string, description: string, agentId: string) => {
    const newFlow: WhatsAppFlow = {
      id: `flow-${Date.now()}`,
      agentId,
      name,
      description,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messagesCount: 0,
      nodes: [{ id: 'start-1', type: 'start', position: { x: 200, y: 200 }, data: { label: 'Welcome', nodeType: 'start', description: 'Conversation entry point' } }],
      edges: [] as FlowEdge[],
      variables: [],
      version: 1,
    };
    addFlow(newFlow);
    const agent = agents.find(a => a.id === agentId);
    if (agent) {
      updateAgent(agentId, { flowIds: [...agent.flowIds, newFlow.id] });
    }
    setShowNewModal(false);
    navigate(`/whatsapp/flows/${newFlow.id}`);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Delete this flow?')) {
      const flow = flows.find(f => f.id === id);
      deleteFlow(id);
      if (flow) {
        const agent = agents.find(a => a.id === flow.agentId);
        if (agent) {
          updateAgent(flow.agentId, { flowIds: agent.flowIds.filter(fid => fid !== id) });
        }
      }
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Create card */}
        <button
          onClick={() => setShowNewModal(true)}
          className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-accent-400 hover:text-accent-500 transition-colors min-h-[180px]"
        >
          <div className="w-10 h-10 rounded-lg border-2 border-dashed border-current flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium">New Flow</span>
        </button>

        {flows.map((flow) => (
          <div
            key={flow.id}
            className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-sm transition-shadow"
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <GitBranch className="w-5 h-5 text-white" />
                </div>
                <Badge variant={statusVariant[flow.status]}>{flow.status}</Badge>
              </div>
              <h3 className="font-medium text-slate-800 mb-1">{flow.name}</h3>
              <p className="text-sm text-slate-500 mb-3 line-clamp-2">{flow.description}</p>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Bot className="w-3.5 h-3.5" />
                  {agentName(flow.agentId)}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" />
                  {flow.messagesCount.toLocaleString()} messages
                </span>
              </div>
            </div>
            <div className="px-4 pb-4 flex gap-2">
              <button
                onClick={() => navigate(`/whatsapp/flows/${flow.id}`)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg text-sm font-medium transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open Builder
              </button>
              <button
                onClick={(e) => handleDelete(e, flow.id)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showNewModal && (
        <NewFlowModal
          onClose={() => setShowNewModal(false)}
          onCreate={handleCreate}
          agents={agents.map(a => ({ id: a.id, name: a.name }))}
        />
      )}
    </div>
  );
}
