import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from '@xyflow/react';
import { FlowBuilderHeader } from './FlowBuilderHeader';
import { FlowBuilderCanvas } from './FlowBuilderCanvas';
import { LeftPanel } from './LeftPanel';
import { RightPanel } from './RightPanel';
import { useWhatsAppStore } from '../../../stores/whatsapp';
import { useAssistantsStore } from '../../../stores/assistants';
import type { FlowGlobalSettings, FlowNodeData, FlowNode, FlowEdge } from '../../../types';

/** Build a FlowGlobalSettings object from the owning agent. */
function agentToGlobalSettings(agent: { systemPrompt: string; model: string; temperature: number; knowledgeBaseIds: string[]; toolIds: string[]; fallbackMessage: string; conversationTimeoutHours: number } | null | undefined): FlowGlobalSettings {
  return {
    agentModel: agent?.model ?? 'gpt-4o',
    temperature: agent?.temperature ?? 0.7,
    systemPrompt: agent?.systemPrompt ?? '',
    knowledgeBaseIds: agent?.knowledgeBaseIds ?? [],
    toolIds: agent?.toolIds ?? [],
    fallbackMessage: agent?.fallbackMessage ?? "I'm sorry, I didn't understand that. Could you rephrase?",
    sessionTimeoutMinutes: (agent?.conversationTimeoutHours ?? 0.5) * 60,
  };
}

const defaultStartNode: Node<FlowNodeData> = {
  id: 'start-1',
  type: 'start',
  position: { x: 250, y: 150 },
  data: { label: 'Welcome Node', nodeType: 'start', description: 'Conversation entry point' },
};

function FlowBuilderInner() {
  const { flowId } = useParams<{ flowId: string }>();
  const navigate = useNavigate();
  const { flows, updateFlow, setFlows } = useWhatsAppStore();
  const { agents, updateAgent, setAgents } = useAssistantsStore();

  // Seed guard: if user deep-links to builder before visiting any page
  useEffect(() => {
    if (agents.length === 0 || flows.length === 0) {
      import('../../AssistantsPage').then(mod => {
        if (mod.seedAgents && agents.length === 0) setAgents(mod.seedAgents);
        if (mod.seedFlows && flows.length === 0) setFlows(mod.seedFlows);
      }).catch(() => {});
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const flow = flows.find(f => f.id === flowId) ?? null;
  const agent = agents.find(a => a.flowIds.includes(flowId ?? '')) ?? null;

  const initialNodes: Node<FlowNodeData>[] = flow?.nodes?.length
    ? (flow.nodes as unknown as Node<FlowNodeData>[])
    : [defaultStartNode];
  const initialEdges: Edge[] = flow?.edges?.length
    ? (flow.edges as unknown as Edge[])
    : [];

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<FlowNodeData>>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // globalSettings is derived from the agent — edits here update the agent
  const [globalSettings, setGlobalSettings] = useState<FlowGlobalSettings>(
    agentToGlobalSettings(agent),
  );

  // Re-sync when agent changes (e.g. navigating between flows)
  useEffect(() => {
    setGlobalSettings(agentToGlobalSettings(agent));
  }, [agent?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedNode = nodes.find(n => n.id === selectedNodeId) ?? null;

  const handleNodeUpdate = useCallback((id: string, data: Partial<FlowNodeData>) => {
    setNodes(nds => nds.map(n => (n.id === id ? { ...n, data: { ...n.data, ...data } } : n)));
  }, [setNodes]);

  const handleGlobalSettingsChange = useCallback((settings: FlowGlobalSettings) => {
    setGlobalSettings(settings);
    // Persist back to the agent immediately
    if (agent) {
      updateAgent(agent.id, {
        systemPrompt: settings.systemPrompt,
        model: settings.agentModel,
        temperature: settings.temperature,
        knowledgeBaseIds: settings.knowledgeBaseIds,
        toolIds: settings.toolIds,
        fallbackMessage: settings.fallbackMessage,
        conversationTimeoutHours: settings.sessionTimeoutMinutes / 60,
      });
    }
  }, [agent, updateAgent]);

  const handleSave = useCallback(async () => {
    if (!flowId) return;
    updateFlow(flowId, {
      nodes: nodes as unknown as FlowNode[],
      edges: edges as unknown as FlowEdge[],
      updatedAt: new Date().toISOString(),
    });
    await new Promise(r => setTimeout(r, 600));
  }, [flowId, nodes, edges, updateFlow]);

  const handlePublish = useCallback(() => {
    if (!flowId || !agent) return;
    updateFlow(flowId, { status: 'active', lastPublishedAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    // Make this the agent's active flow
    updateAgent(agent.id, { activeFlowId: flowId });
    handleSave();
  }, [flowId, agent, updateFlow, updateAgent, handleSave]);

  const handleRename = useCallback((name: string) => {
    if (flowId) updateFlow(flowId, { name });
  }, [flowId, updateFlow]);

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-slate-50">
      <FlowBuilderHeader
        flow={flow}
        agentName={agent?.name ?? null}
        isSaving={false}
        onBack={() => navigate('/assistants')}
        onSave={handleSave}
        onPublish={handlePublish}
        onRename={handleRename}
      />
      <div className="flex flex-1 overflow-hidden">
        <LeftPanel />
        <FlowBuilderCanvas
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          setNodes={setNodes}
          setEdges={setEdges}
          onNodeSelect={setSelectedNodeId}
        />
        <RightPanel
          selectedNode={selectedNode}
          globalSettings={globalSettings}
          onGlobalSettingsChange={handleGlobalSettingsChange}
          onNodeUpdate={handleNodeUpdate}
        />
      </div>
    </div>
  );
}

export function FlowBuilderPage() {
  return (
    <ReactFlowProvider>
      <FlowBuilderInner />
    </ReactFlowProvider>
  );
}
