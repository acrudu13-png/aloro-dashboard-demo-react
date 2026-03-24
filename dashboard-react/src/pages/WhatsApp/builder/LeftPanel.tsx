import { Bot, Zap, GitBranch, MessageSquare, Play, StopCircle, UserCheck, MessageCircle, Variable } from 'lucide-react';
import type { FlowNodeType } from '../../../types';

interface NodeDef {
  type: FlowNodeType;
  label: string;
  description: string;
  icon: React.ElementType;
  colorClass: string;
  dragClass: string;
}

interface NodeCategory {
  label: string;
  items: NodeDef[];
}

const nodeCategories: NodeCategory[] = [
  {
    label: 'Conversation',
    items: [
      {
        type: 'ai-conversation',
        label: 'AI Conversation',
        description: 'Multi-turn AI dialogue step',
        icon: Bot,
        colorClass: 'bg-blue-100 text-blue-700 border-blue-200',
        dragClass: 'hover:bg-blue-50 hover:border-blue-300',
      },
      {
        type: 'send-message',
        label: 'Send Message',
        description: 'Send a static message',
        icon: MessageSquare,
        colorClass: 'bg-green-100 text-green-700 border-green-200',
        dragClass: 'hover:bg-green-50 hover:border-green-300',
      },
      {
        type: 'wait-for-input',
        label: 'Wait for Input',
        description: 'Pause and collect response',
        icon: MessageCircle,
        colorClass: 'bg-teal-100 text-teal-700 border-teal-200',
        dragClass: 'hover:bg-teal-50 hover:border-teal-300',
      },
    ],
  },
  {
    label: 'Logic',
    items: [
      {
        type: 'condition',
        label: 'Condition',
        description: 'Branch on variable, intent, or pattern',
        icon: GitBranch,
        colorClass: 'bg-amber-100 text-amber-700 border-amber-200',
        dragClass: 'hover:bg-amber-50 hover:border-amber-300',
      },
      {
        type: 'set-variable',
        label: 'Set Variable',
        description: 'Assign or transform data',
        icon: Variable,
        colorClass: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        dragClass: 'hover:bg-indigo-50 hover:border-indigo-300',
      },
    ],
  },
  {
    label: 'Actions',
    items: [
      {
        type: 'tool-call',
        label: 'Tool Call',
        description: 'Invoke an API tool',
        icon: Zap,
        colorClass: 'bg-orange-100 text-orange-700 border-orange-200',
        dragClass: 'hover:bg-orange-50 hover:border-orange-300',
      },
      {
        type: 'handoff',
        label: 'Handoff to Human',
        description: 'Transfer to live agent',
        icon: UserCheck,
        colorClass: 'bg-red-100 text-red-700 border-red-200',
        dragClass: 'hover:bg-red-50 hover:border-red-300',
      },
    ],
  },
  {
    label: 'Flow Control',
    items: [
      {
        type: 'start',
        label: 'Welcome Node',
        description: 'Entry point (one per flow)',
        icon: Play,
        colorClass: 'bg-purple-100 text-purple-700 border-purple-200',
        dragClass: 'hover:bg-purple-50 hover:border-purple-300',
      },
      {
        type: 'end',
        label: 'End Conversation',
        description: 'Close the conversation',
        icon: StopCircle,
        colorClass: 'bg-slate-100 text-slate-700 border-slate-200',
        dragClass: 'hover:bg-slate-100 hover:border-slate-300',
      },
    ],
  },
];

export function LeftPanel() {
  const onDragStart = (event: React.DragEvent, nodeType: FlowNodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-60 bg-white border-r border-slate-200 flex flex-col overflow-y-auto">
      <div className="px-4 py-3 border-b border-slate-100">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Add Node</p>
        <p className="text-xs text-slate-400 mt-0.5">Drag onto canvas</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {nodeCategories.map((category) => (
          <div key={category.label} className="border-b border-slate-100 last:border-0">
            <p className="px-4 pt-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {category.label}
            </p>
            <div className="p-2 pt-0 space-y-1.5">
              {category.items.map((def) => {
                const Icon = def.icon;
                return (
                  <div
                    key={def.type}
                    draggable
                    onDragStart={(e) => onDragStart(e, def.type)}
                    className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-grab active:cursor-grabbing transition-colors select-none ${def.colorClass} ${def.dragClass}`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium leading-tight">{def.label}</p>
                      <p className="text-xs opacity-70 leading-tight mt-0.5 truncate">{def.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-400">
        <p>Connect nodes by dragging from a handle to another node</p>
      </div>
    </div>
  );
}
