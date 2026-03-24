import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { Code2, Link } from 'lucide-react';
import type { FlowNodeData } from '../../../../types';
import { NodeWrapper } from './NodeWrapper';

export function FunctionNode({ id, data, selected }: NodeProps<FlowNodeData>) {
  const url = data.webhookUrl as string | undefined;
  const method = (data.httpMethod as string | undefined) || 'POST';

  return (
    <NodeWrapper nodeId={id} selected={!!selected}>
    <div className={`bg-white rounded-xl shadow-sm min-w-[220px] border-2 transition-colors ${selected ? 'border-orange-500' : 'border-orange-200'}`}>
      <Handle type="target" position={Position.Top} className="!bg-orange-400 !border-orange-600" />
      <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 rounded-t-xl border-b border-orange-100">
        <Code2 className="w-4 h-4 text-orange-600" />
        <span className="text-sm font-medium text-orange-800">{(data.label as string) || 'Function'}</span>
      </div>
      <div className="px-3 py-2 space-y-1">
        {url ? (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-mono bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded text-xs">{method}</span>
            <Link className="w-3 h-3 flex-shrink-0" />
            <span className="truncate max-w-[140px]">{url}</span>
          </div>
        ) : (
          <p className="text-xs text-slate-400">No endpoint configured</p>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-orange-400 !border-orange-600" />
    </div>
    </NodeWrapper>
  );
}
