import { Handle, Position } from '@xyflow/react';
import type { Node, NodeProps } from '@xyflow/react';
import { UserCheck } from 'lucide-react';
import type { FlowNodeData } from '../../../../types';
import { NodeWrapper } from './NodeWrapper';

export function HandoffNode({ id, data, selected }: NodeProps<Node<FlowNodeData>>) {
  const target = data.handoffTarget as string | undefined;
  const message = data.handoffMessage as string | undefined;

  return (
    <NodeWrapper nodeId={id} selected={!!selected}>
    <div className={`bg-white rounded-xl shadow-sm min-w-[200px] border-2 transition-colors ${selected ? 'border-red-500' : 'border-red-200'}`}>
      <Handle type="target" position={Position.Top} className="!bg-red-400 !border-red-600" />
      <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-t-xl border-b border-red-100">
        <UserCheck className="w-4 h-4 text-red-600" />
        <span className="text-sm font-medium text-red-800">{(data.label as string) || 'Handoff to Human'}</span>
      </div>
      <div className="px-3 py-2 space-y-1">
        {target ? (
          <p className="text-xs text-slate-500">→ <span className="font-medium text-slate-700">{target}</span></p>
        ) : (
          <p className="text-xs text-slate-400">No target agent configured</p>
        )}
        {message && <p className="text-xs text-slate-400 line-clamp-2">{message}</p>}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-red-400 !border-red-600" />
    </div>
    </NodeWrapper>
  );
}
