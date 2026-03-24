import { Handle, Position } from '@xyflow/react';
import type { Node, NodeProps } from '@xyflow/react';
import { Variable } from 'lucide-react';
import type { FlowNodeData, VariableAssignment } from '../../../../types';
import { NodeWrapper } from './NodeWrapper';

export function SetVariableNode({ id, data, selected }: NodeProps<Node<FlowNodeData>>) {
  const assignments = (data.assignments as VariableAssignment[] | undefined) || [];

  return (
    <NodeWrapper nodeId={id} selected={!!selected}>
      <div className={`bg-white rounded-xl shadow-sm min-w-[210px] border-2 transition-colors ${selected ? 'border-indigo-500' : 'border-indigo-200'}`}>
        <Handle type="target" position={Position.Top} className="!bg-indigo-400 !border-indigo-600" />
        <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 rounded-t-xl border-b border-indigo-100">
          <Variable className="w-4 h-4 text-indigo-600" />
          <span className="text-sm font-medium text-indigo-800">{(data.label as string) || 'Set Variable'}</span>
        </div>
        <div className="px-3 py-2 space-y-1">
          {assignments.length > 0 ? (
            assignments.slice(0, 3).map((a, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs">
                <span className="font-mono text-indigo-600 font-medium">{a.variable}</span>
                <span className="text-slate-400">=</span>
                <span className="text-slate-600 truncate max-w-[100px]">{a.expression}</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400">No variables configured</p>
          )}
          {assignments.length > 3 && (
            <p className="text-xs text-slate-400">+{assignments.length - 3} more...</p>
          )}
        </div>
        <Handle type="source" position={Position.Bottom} className="!bg-indigo-400 !border-indigo-600" />
      </div>
    </NodeWrapper>
  );
}
