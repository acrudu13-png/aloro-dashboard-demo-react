import { Handle, Position } from '@xyflow/react';
import type { Node, NodeProps } from '@xyflow/react';
import { MessageCircle, Clock } from 'lucide-react';
import type { FlowNodeData } from '../../../../types';
import { NodeWrapper } from './NodeWrapper';

export function WaitForInputNode({ id, data, selected }: NodeProps<Node<FlowNodeData>>) {
  const prompt = data.promptMessage as string | undefined;
  const variableName = data.variableName as string | undefined;
  const timeout = data.timeout as number | undefined;
  const preview = prompt ? prompt.slice(0, 60) + (prompt.length > 60 ? '...' : '') : 'No prompt configured';

  return (
    <NodeWrapper nodeId={id} selected={!!selected}>
      <div className={`bg-white rounded-xl shadow-sm min-w-[220px] border-2 transition-colors ${selected ? 'border-teal-500' : 'border-teal-200'}`}>
        <Handle type="target" position={Position.Top} className="!bg-teal-400 !border-teal-600" />
        <div className="flex items-center gap-2 px-3 py-2 bg-teal-50 rounded-t-xl border-b border-teal-100">
          <MessageCircle className="w-4 h-4 text-teal-600" />
          <span className="text-sm font-medium text-teal-800">{(data.label as string) || 'Wait for Input'}</span>
        </div>
        <div className="px-3 py-2 space-y-1.5">
          <p className="text-xs text-slate-500 line-clamp-2">{preview}</p>
          <div className="flex items-center gap-3">
            {variableName && (
              <span className="text-xs font-mono bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded">
                {`{{${variableName}}}`}
              </span>
            )}
            {timeout && (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Clock className="w-3 h-3" />{timeout}s
              </span>
            )}
          </div>
        </div>
        {/* Received response handle */}
        <Handle
          type="source"
          position={Position.Bottom}
          id="received"
          style={{ left: '35%' }}
          className="!bg-teal-400 !border-teal-600"
        />
        {/* Timeout handle */}
        <Handle
          type="source"
          position={Position.Bottom}
          id="timeout"
          style={{ left: '65%' }}
          className="!bg-amber-400 !border-amber-600"
        />
      </div>
    </NodeWrapper>
  );
}
