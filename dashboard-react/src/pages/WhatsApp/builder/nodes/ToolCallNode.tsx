import { Handle, Position } from '@xyflow/react';
import type { Node, NodeProps } from '@xyflow/react';
import { Zap, AlertCircle } from 'lucide-react';
import type { FlowNodeData } from '../../../../types';
import { NodeWrapper } from './NodeWrapper';

// Mock tool names for display — in production this would come from a store/context
const toolNames: Record<string, { name: string; category: string }> = {
  'tool-1': { name: 'Create Ticket (RightNow)', category: 'ticketing' },
  'tool-2': { name: 'Lookup Customer (CRM)', category: 'crm' },
  'tool-3': { name: 'Send Slack Alert', category: 'notification' },
  'tool-4': { name: 'Check Service Status', category: 'api' },
  'tool-5': { name: 'Restart Service', category: 'api' },
  'tool-6': { name: 'Update Ticket Status', category: 'ticketing' },
  'tool-7': { name: 'Validate License Key', category: 'data' },
};

const categoryColors: Record<string, string> = {
  ticketing: 'bg-purple-50 text-purple-700',
  crm: 'bg-blue-50 text-blue-700',
  notification: 'bg-green-50 text-green-700',
  api: 'bg-orange-50 text-orange-700',
  data: 'bg-slate-100 text-slate-600',
};

export function ToolCallNode({ id, data, selected }: NodeProps<Node<FlowNodeData>>) {
  const toolId = data.toolId as string | undefined;
  const tool = toolId ? toolNames[toolId] : null;
  const inputMapping = data.inputMapping as Record<string, string> | undefined;
  const mappingCount = inputMapping ? Object.keys(inputMapping).length : 0;

  return (
    <NodeWrapper nodeId={id} selected={!!selected}>
      <div className={`bg-white rounded-xl shadow-sm min-w-[230px] border-2 transition-colors ${selected ? 'border-orange-500' : 'border-orange-200'}`}>
        <Handle type="target" position={Position.Top} className="!bg-orange-400 !border-orange-600" />
        <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 rounded-t-xl border-b border-orange-100">
          <Zap className="w-4 h-4 text-orange-600" />
          <span className="text-sm font-medium text-orange-800">{(data.label as string) || 'Tool Call'}</span>
        </div>
        <div className="px-3 py-2 space-y-1.5">
          {tool ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${categoryColors[tool.category] || categoryColors.api}`}>
                  {tool.category}
                </span>
                <span className="text-xs font-medium text-slate-700 truncate">{tool.name}</span>
              </div>
              {mappingCount > 0 && (
                <p className="text-xs text-slate-400">{mappingCount} input{mappingCount !== 1 ? 's' : ''} mapped</p>
              )}
            </>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>No tool selected</span>
            </div>
          )}
        </div>
        {/* Success handle */}
        <Handle
          type="source"
          position={Position.Bottom}
          id="success"
          style={{ left: '35%' }}
          className="!bg-green-400 !border-green-600"
        />
        {/* Error handle */}
        <Handle
          type="source"
          position={Position.Bottom}
          id="error"
          style={{ left: '65%' }}
          className="!bg-red-400 !border-red-600"
        />
      </div>
    </NodeWrapper>
  );
}
