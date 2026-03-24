import { Handle, Position } from '@xyflow/react';
import type { Node, NodeProps } from '@xyflow/react';
import { GitBranch } from 'lucide-react';
import type { FlowNodeData, FlowCondition } from '../../../../types';
import { NodeWrapper } from './NodeWrapper';

export function ConditionNode({ id, data, selected }: NodeProps<Node<FlowNodeData>>) {
  const conditions = (data.conditions as FlowCondition[] | undefined) || [];

  return (
    <NodeWrapper nodeId={id} selected={!!selected}>
    <div className={`bg-white rounded-xl shadow-sm min-w-[220px] border-2 transition-colors ${selected ? 'border-amber-500' : 'border-amber-200'}`}>
      <Handle type="target" position={Position.Top} className="!bg-amber-400 !border-amber-600" />
      <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-t-xl border-b border-amber-100">
        <GitBranch className="w-4 h-4 text-amber-600" />
        <span className="text-sm font-medium text-amber-800">{(data.label as string) || 'Condition'}</span>
      </div>
      <div className="px-3 py-2 space-y-1">
        {conditions.length > 0 ? (
          conditions.slice(0, 3).map((c, i) => (
            <div key={c.id} className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="text-amber-600 font-medium">{i + 1}.</span>
              <span className="truncate">{c.label || `${c.operator} "${c.value}"`}</span>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-400">No conditions configured</p>
        )}
        {conditions.length > 3 && (
          <p className="text-xs text-slate-400">+{conditions.length - 3} more…</p>
        )}
      </div>

      {conditions.map((c, i) => (
        <Handle
          key={c.id}
          type="source"
          position={Position.Bottom}
          id={c.id}
          style={{ left: `${((i + 1) / (conditions.length + 1)) * 100}%` }}
          className="!bg-amber-400 !border-amber-600"
        />
      ))}
      <Handle
        type="source"
        position={Position.Bottom}
        id="default"
        style={{ left: conditions.length > 0 ? `${(conditions.length / (conditions.length + 1)) * 100}%` : '50%' }}
        className="!bg-slate-400 !border-slate-600"
      />
    </div>
    </NodeWrapper>
  );
}
