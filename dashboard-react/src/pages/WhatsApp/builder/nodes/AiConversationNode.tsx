import { Handle, Position } from '@xyflow/react';
import type { Node, NodeProps } from '@xyflow/react';
import { Bot, Zap, Database, ArrowRightCircle } from 'lucide-react';
import type { FlowNodeData, FlowCondition } from '../../../../types';
import { NodeWrapper } from './NodeWrapper';

// Mock tool/KB names — in production from store/context
const toolNames: Record<string, string> = {
  'tool-1': 'Create Ticket',
  'tool-2': 'Lookup Customer',
  'tool-3': 'Slack Alert',
  'tool-4': 'Check Status',
  'tool-5': 'Restart Service',
  'tool-6': 'Update Ticket',
  'tool-7': 'Validate License',
};
const kbNames: Record<string, string> = {
  'kb-1': 'Horeca Docs',
  'kb-2': 'Support Runbooks',
  'kb-3': 'SLA & Licensing',
};

export function AiConversationNode({ id, data, selected }: NodeProps<Node<FlowNodeData>>) {
  const prompt = data.systemPrompt as string | undefined;
  const preview = prompt ? prompt.slice(0, 80) + (prompt.length > 80 ? '...' : '') : 'No system prompt configured';
  const toolIds = (data.toolIds as string[] | undefined) || [];
  const knowledgeBaseIds = (data.knowledgeBaseIds as string[] | undefined) || [];
  const exitConditions = (data.exitConditions as FlowCondition[] | undefined) || [];
  const maxTurns = data.maxTurns as number | undefined;

  const hasAttachments = toolIds.length > 0 || knowledgeBaseIds.length > 0;

  return (
    <NodeWrapper nodeId={id} selected={!!selected}>
      <div className={`bg-white rounded-xl shadow-sm min-w-[260px] max-w-[300px] border-2 transition-colors ${selected ? 'border-blue-500' : 'border-blue-200'}`}>
        <Handle type="target" position={Position.Top} className="!bg-blue-400 !border-blue-600" />

        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-t-xl border-b border-blue-100">
          <Bot className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800 truncate">{(data.label as string) || 'AI Conversation'}</span>
          {maxTurns && (
            <span className="ml-auto text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full whitespace-nowrap">
              max {maxTurns}
            </span>
          )}
        </div>

        {/* Prompt preview */}
        <div className="px-3 py-2 space-y-2">
          <p className="text-xs text-slate-500 line-clamp-2">{preview}</p>

          {data.model && (
            <span className="inline-block text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
              {data.model as string}
            </span>
          )}

          {/* Tool & KB pills */}
          {hasAttachments && (
            <div className="flex flex-wrap gap-1">
              {toolIds.map(tid => (
                <span key={tid} className="flex items-center gap-1 text-xs bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded">
                  <Zap className="w-2.5 h-2.5" />{toolNames[tid] || tid}
                </span>
              ))}
              {knowledgeBaseIds.map(kid => (
                <span key={kid} className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">
                  <Database className="w-2.5 h-2.5" />{kbNames[kid] || kid}
                </span>
              ))}
            </div>
          )}

          {/* Exit conditions */}
          {exitConditions.length > 0 && (
            <div className="pt-1 border-t border-blue-100 space-y-0.5">
              {exitConditions.map((c, i) => (
                <div key={c.id} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <ArrowRightCircle className="w-3 h-3 text-blue-400 flex-shrink-0" />
                  <span className="truncate">{c.label || `Exit ${i + 1}`}</span>
                  <span className="text-slate-300 text-xs ml-auto">{c.type === 'ai-intent' ? 'AI' : c.type === 'variable' ? 'var' : 'pat'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic source handles: one per exit condition + default */}
        {exitConditions.length > 0 ? (
          <>
            {exitConditions.map((c, i) => (
              <Handle
                key={c.id}
                type="source"
                position={Position.Bottom}
                id={c.id}
                style={{ left: `${((i + 1) / (exitConditions.length + 2)) * 100}%` }}
                className="!bg-blue-400 !border-blue-600"
              />
            ))}
            {/* Default / fallback handle */}
            <Handle
              type="source"
              position={Position.Bottom}
              id="default"
              style={{ left: `${((exitConditions.length + 1) / (exitConditions.length + 2)) * 100}%` }}
              className="!bg-slate-400 !border-slate-600"
            />
          </>
        ) : (
          <Handle type="source" position={Position.Bottom} className="!bg-blue-400 !border-blue-600" />
        )}
      </div>
    </NodeWrapper>
  );
}
