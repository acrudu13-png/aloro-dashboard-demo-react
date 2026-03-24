import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { StopCircle } from 'lucide-react';
import type { FlowNodeData } from '../../../../types';
import { NodeWrapper } from './NodeWrapper';

export function EndNode({ id, data, selected }: NodeProps<FlowNodeData>) {
  return (
    <NodeWrapper nodeId={id} selected={!!selected}>
    <div className={`bg-white rounded-xl shadow-sm min-w-[180px] border-2 transition-colors ${selected ? 'border-slate-500' : 'border-slate-200'}`}>
      <Handle type="target" position={Position.Top} className="!bg-slate-400 !border-slate-600" />
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-t-xl border-b border-slate-100">
        <StopCircle className="w-4 h-4 text-slate-600" />
        <span className="text-sm font-medium text-slate-800">{(data.label as string) || 'End Conversation'}</span>
      </div>
      <div className="px-3 py-2">
        <p className="text-xs text-slate-400">{(data.description as string | undefined) || 'Conversation ends here'}</p>
      </div>
    </div>
    </NodeWrapper>
  );
}
