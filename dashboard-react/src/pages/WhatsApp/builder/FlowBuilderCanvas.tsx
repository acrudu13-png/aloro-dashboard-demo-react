import { useCallback, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useReactFlow,
  BackgroundVariant,
  type Node,
  type Edge,
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
  type NodeMouseHandler,
  type NodeTypes,
} from '@xyflow/react';
import { Trash2, Copy } from 'lucide-react';
import { StartNode } from './nodes/StartNode';
import { AiConversationNode } from './nodes/AiConversationNode';
import { FunctionNode } from './nodes/FunctionNode';
import { ConditionNode } from './nodes/ConditionNode';
import { SendMessageNode } from './nodes/SendMessageNode';
import { HandoffNode } from './nodes/HandoffNode';
import { EndNode } from './nodes/EndNode';
import { ToolCallNode } from './nodes/ToolCallNode';
import { WaitForInputNode } from './nodes/WaitForInputNode';
import { SetVariableNode } from './nodes/SetVariableNode';
import type { FlowNodeData, FlowNodeType } from '../../../types';

// Module-level constant — must NOT be inside a component
const nodeTypes: NodeTypes = {
  start: StartNode,
  'ai-conversation': AiConversationNode,
  'tool-call': ToolCallNode,
  condition: ConditionNode,
  'send-message': SendMessageNode,
  'wait-for-input': WaitForInputNode,
  'set-variable': SetVariableNode,
  handoff: HandoffNode,
  end: EndNode,
  // Legacy — kept for backward compat with existing flows
  function: FunctionNode,
};

const nodeDefaults: Record<FlowNodeType, Partial<FlowNodeData>> = {
  start: { label: 'Welcome Node', nodeType: 'start', description: 'Conversation entry point' },
  'ai-conversation': { label: 'AI Conversation', nodeType: 'ai-conversation', model: 'gpt-4o', temperature: 0.7, toolIds: [], knowledgeBaseIds: [], exitConditions: [], maxTurns: 10 },
  'tool-call': { label: 'Tool Call', nodeType: 'tool-call' },
  condition: { label: 'Condition', nodeType: 'condition', conditions: [] },
  'send-message': { label: 'Send Message', nodeType: 'send-message', messageBody: '' },
  'wait-for-input': { label: 'Wait for Input', nodeType: 'wait-for-input', timeout: 120, timeoutAction: 'repeat' },
  'set-variable': { label: 'Set Variable', nodeType: 'set-variable', assignments: [] },
  handoff: { label: 'Handoff to Human', nodeType: 'handoff' },
  end: { label: 'End Conversation', nodeType: 'end', description: 'Conversation ends here' },
  // Legacy
  function: { label: 'Function', nodeType: 'function', httpMethod: 'POST' },
};

interface ContextMenu {
  x: number;
  y: number;
  nodeId: string;
}

interface FlowBuilderCanvasProps {
  nodes: Node<FlowNodeData>[];
  edges: Edge[];
  onNodesChange: OnNodesChange<Node<FlowNodeData>>;
  onEdgesChange: OnEdgesChange;
  setNodes: (nodes: Node<FlowNodeData>[] | ((prev: Node<FlowNodeData>[]) => Node<FlowNodeData>[])) => void;
  setEdges: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void;
  onNodeSelect: (nodeId: string | null) => void;
}

export function FlowBuilderCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  setNodes,
  setEdges,
  onNodeSelect,
}: FlowBuilderCanvasProps) {
  const { screenToFlowPosition, deleteElements, getNode } = useReactFlow();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);

  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge({ ...connection, animated: true }, eds)),
    [setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const nodeType = event.dataTransfer.getData('application/reactflow') as FlowNodeType;
      if (!nodeType) return;

      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      const defaults = nodeDefaults[nodeType];
      const newNode: Node<FlowNodeData> = {
        id: `${nodeType}-${Date.now()}`,
        type: nodeType,
        position,
        data: { ...defaults } as FlowNodeData,
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [screenToFlowPosition, setNodes],
  );

  const onNodeContextMenu: NodeMouseHandler = useCallback((event, node) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, nodeId: node.id });
  }, []);

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  const handleDeleteFromMenu = useCallback(() => {
    if (!contextMenu) return;
    const node = getNode(contextMenu.nodeId);
    if (node) deleteElements({ nodes: [node] });
    closeContextMenu();
  }, [contextMenu, getNode, deleteElements, closeContextMenu]);

  const handleDuplicateFromMenu = useCallback(() => {
    if (!contextMenu) return;
    const node = getNode(contextMenu.nodeId) as Node<FlowNodeData> | undefined;
    if (node) {
      const newNode: Node<FlowNodeData> = {
        ...node,
        id: `${node.type}-${Date.now()}`,
        position: { x: node.position.x + 40, y: node.position.y + 40 },
        selected: false,
      };
      setNodes((nds) => [...nds, newNode]);
    }
    closeContextMenu();
  }, [contextMenu, getNode, setNodes, closeContextMenu]);

  return (
    <div ref={canvasRef} className="flex-1 h-full relative" onClick={closeContextMenu}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => { closeContextMenu(); onNodeSelect(node.id); }}
        onPaneClick={() => { closeContextMenu(); onNodeSelect(null); }}
        onNodeContextMenu={onNodeContextMenu}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        deleteKeyCode="Delete"
        className="bg-slate-50"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#cbd5e1" />
        <Controls className="!border-slate-200 !shadow-sm" />
        <MiniMap
          nodeStrokeColor="#94a3b8"
          nodeColor="#f1f5f9"
          maskColor="rgba(248,250,252,0.7)"
          className="!border-slate-200 !shadow-sm"
        />
      </ReactFlow>

      {/* Right-click context menu */}
      {contextMenu && (
        <div
          className="fixed bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 min-w-[160px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={handleDuplicateFromMenu}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Copy className="w-4 h-4 text-slate-400" />
            Duplicate node
          </button>
          <div className="h-px bg-slate-100 my-1" />
          <button
            onClick={handleDeleteFromMenu}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete node
          </button>
        </div>
      )}
    </div>
  );
}
