import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { Play } from 'lucide-react';
import type { FlowNodeData } from '../../../../types';

export function StartNode({ data, selected }: NodeProps<FlowNodeData>) {
  return (
    <div className={`bg-white rounded-xl shadow-sm min-w-[200px] border-2 transition-colors ${selected ? 'border-purple-500' : 'border-purple-200'}`}>
      <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-t-xl border-b border-purple-100">
        <Play className="w-4 h-4 text-purple-600" />
        <span className="text-sm font-medium text-purple-800">Welcome Node</span>
      </div>
      <div className="px-3 py-2 text-xs text-slate-500">
        {data.description || 'Conversation entry point'}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-purple-400 !border-purple-600" />
    </div>
  );
}
