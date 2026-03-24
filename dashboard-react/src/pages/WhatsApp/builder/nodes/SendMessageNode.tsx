import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { MessageSquare } from 'lucide-react';
import type { FlowNodeData } from '../../../../types';
import { NodeWrapper } from './NodeWrapper';

export function SendMessageNode({ id, data, selected }: NodeProps<FlowNodeData>) {
  const body = data.messageBody as string | undefined;
  const preview = body ? body.slice(0, 70) + (body.length > 70 ? '…' : '') : 'No message configured';

  return (
    <NodeWrapper nodeId={id} selected={!!selected}>
    <div className={`bg-white rounded-xl shadow-sm min-w-[220px] border-2 transition-colors ${selected ? 'border-green-500' : 'border-green-200'}`}>
      <Handle type="target" position={Position.Top} className="!bg-green-400 !border-green-600" />
      <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-t-xl border-b border-green-100">
        <MessageSquare className="w-4 h-4 text-green-600" />
        <span className="text-sm font-medium text-green-800">{(data.label as string) || 'Send Message'}</span>
      </div>
      <div className="px-3 py-2">
        <p className="text-xs text-slate-500 line-clamp-3 whitespace-pre-wrap">{preview}</p>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-green-400 !border-green-600" />
    </div>
    </NodeWrapper>
  );
}
