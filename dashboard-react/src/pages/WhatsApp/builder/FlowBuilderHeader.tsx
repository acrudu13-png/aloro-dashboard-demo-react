import { useState } from 'react';
import { ArrowLeft, Check, Globe, Save, ChevronRight } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import type { WhatsAppFlow } from '../../../types';

interface FlowBuilderHeaderProps {
  flow: WhatsAppFlow | null;
  agentName: string | null;
  isSaving: boolean;
  onBack: () => void;
  onSave: () => void;
  onPublish: () => void;
  onRename: (name: string) => void;
}

export function FlowBuilderHeader({ flow, agentName, isSaving, onBack, onSave, onPublish, onRename }: FlowBuilderHeaderProps) {
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(flow?.name || 'Untitled Flow');

  const handleNameBlur = () => {
    setEditingName(false);
    if (nameValue.trim()) onRename(nameValue.trim());
  };

  const statusVariant: Record<WhatsAppFlow['status'], 'success' | 'default' | 'warning'> = {
    active: 'success',
    draft: 'default',
    archived: 'warning',
  };

  return (
    <div className="h-12 bg-white border-b border-slate-200 flex items-center px-4 gap-3 flex-shrink-0">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition flex-shrink-0"
      >
        <ArrowLeft className="w-4 h-4" />
        Agents
      </button>

      <div className="w-px h-5 bg-slate-200" />

      {/* Breadcrumb: Agent → Flow */}
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        {agentName && (
          <>
            <span className="text-sm text-slate-400 truncate max-w-[140px]">{agentName}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
          </>
        )}

        {editingName ? (
          <input
            autoFocus
            value={nameValue}
            onChange={e => setNameValue(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={e => {
              if (e.key === 'Enter') handleNameBlur();
              if (e.key === 'Escape') setEditingName(false);
            }}
            className="text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-accent-500 min-w-0 max-w-64"
          />
        ) : (
          <button
            onClick={() => setEditingName(true)}
            className="text-sm font-semibold text-slate-800 hover:text-accent-600 truncate transition"
            title="Click to rename"
          >
            {flow?.name || 'Untitled Flow'}
          </button>
        )}

        {flow && <Badge variant={statusVariant[flow.status]}>{flow.status}</Badge>}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:border-slate-300 text-slate-700 rounded-lg text-xs font-medium transition disabled:opacity-50"
        >
          {isSaving ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Save className="w-3.5 h-3.5" />}
          {isSaving ? 'Saved' : 'Save'}
        </button>
        <button
          onClick={onPublish}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-500 hover:bg-accent-600 text-white rounded-lg text-xs font-medium transition"
        >
          <Globe className="w-3.5 h-3.5" />
          Publish
        </button>
      </div>
    </div>
  );
}
