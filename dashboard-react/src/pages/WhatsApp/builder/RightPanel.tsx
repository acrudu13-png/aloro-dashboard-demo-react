import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2, Database, Zap } from 'lucide-react';
import type { Node } from '@xyflow/react';
import type { FlowNodeData, FlowNodeType, FlowGlobalSettings, FlowCondition, ConditionType, VariableAssignment } from '../../../types';

// ─── Shared UI Helpers ──────────────────────────────────────────────────────

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{title}</span>
        {open ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

const inputCls = 'w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-accent-500';
const selectCls = `${inputCls} bg-white`;

// Mock data for tool/KB selection — in production from store
const availableTools = [
  { id: 'tool-1', name: 'Create Support Ticket', category: 'ticketing' },
  { id: 'tool-2', name: 'Lookup Customer', category: 'crm' },
  { id: 'tool-3', name: 'Send Slack Alert', category: 'notification' },
  { id: 'tool-4', name: 'Check Service Status', category: 'api' },
];
const availableKBs = [
  { id: 'kb-1', name: 'Product Documentation' },
  { id: 'kb-2', name: 'Support Playbooks' },
  { id: 'kb-3', name: 'Customer Policies' },
];

// ─── Reusable: Checklist for Tools ──────────────────────────────────────────

function ToolChecklist({ selectedIds, onChange }: { selectedIds: string[]; onChange: (ids: string[]) => void }) {
  return (
    <div className="space-y-1.5">
      {availableTools.map(t => (
        <label key={t.id} className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-50 transition">
          <input
            type="checkbox" className="w-3.5 h-3.5 rounded accent-accent-500"
            checked={selectedIds.includes(t.id)}
            onChange={e => onChange(e.target.checked ? [...selectedIds, t.id] : selectedIds.filter(id => id !== t.id))}
          />
          <Zap className="w-3 h-3 text-orange-500 flex-shrink-0" />
          <span className="text-xs text-slate-700">{t.name}</span>
          <span className="text-xs text-slate-400 ml-auto">{t.category}</span>
        </label>
      ))}
    </div>
  );
}

// ─── Reusable: Checklist for Knowledge Bases ────────────────────────────────

function KBChecklist({ selectedIds, onChange }: { selectedIds: string[]; onChange: (ids: string[]) => void }) {
  return (
    <div className="space-y-1.5">
      {availableKBs.map(kb => (
        <label key={kb.id} className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-50 transition">
          <input
            type="checkbox" className="w-3.5 h-3.5 rounded accent-accent-500"
            checked={selectedIds.includes(kb.id)}
            onChange={e => onChange(e.target.checked ? [...selectedIds, kb.id] : selectedIds.filter(id => id !== kb.id))}
          />
          <Database className="w-3 h-3 text-emerald-500 flex-shrink-0" />
          <span className="text-xs text-slate-700">{kb.name}</span>
        </label>
      ))}
    </div>
  );
}

// ─── Reusable: Exit / Branch Condition Editor ───────────────────────────────

function ConditionEditor({ conditions, onChange, conditionLabel }: {
  conditions: FlowCondition[];
  onChange: (conditions: FlowCondition[]) => void;
  conditionLabel?: string;
}) {
  const add = () => {
    onChange([...conditions, {
      id: `cond-${Date.now()}`,
      label: '',
      type: 'ai-intent',
      operator: 'equals',
      value: '',
      intentDescription: '',
      confidenceThreshold: 0.7,
    }]);
  };
  const remove = (id: string) => onChange(conditions.filter(c => c.id !== id));
  const update = (id: string, key: string, value: unknown) => {
    onChange(conditions.map(c => c.id === id ? { ...c, [key]: value } : c));
  };

  return (
    <div className="space-y-3">
      {conditions.map((c, i) => (
        <div key={c.id} className="bg-slate-50 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">{conditionLabel || 'Branch'} {i + 1}</span>
            <button onClick={() => remove(c.id)} className="text-slate-400 hover:text-red-500 transition">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <input
            value={c.label}
            onChange={e => update(c.id, 'label', e.target.value)}
            placeholder="Label (e.g., Customer Identified)"
            className={inputCls}
          />
          <select value={c.type} onChange={e => update(c.id, 'type', e.target.value as ConditionType)} className={selectCls}>
            <option value="ai-intent">AI Intent</option>
            <option value="variable">Variable Check</option>
            <option value="pattern">Pattern Match</option>
          </select>

          {c.type === 'ai-intent' && (
            <>
              <textarea
                value={c.intentDescription || ''}
                onChange={e => update(c.id, 'intentDescription', e.target.value)}
                placeholder="Describe when this branch should activate (e.g., customer confirms the issue is resolved)"
                rows={2}
                className={`${inputCls} resize-none`}
              />
              <Field label={`Confidence: ${c.confidenceThreshold ?? 0.7}`}>
                <input type="range" min={0} max={1} step={0.05}
                  value={c.confidenceThreshold ?? 0.7}
                  onChange={e => update(c.id, 'confidenceThreshold', parseFloat(e.target.value))}
                  className="w-full accent-accent-500" />
              </Field>
            </>
          )}

          {c.type === 'variable' && (
            <>
              <input
                value={c.variable || ''}
                onChange={e => update(c.id, 'variable', e.target.value)}
                placeholder="Variable name (e.g., target_system)"
                className={`${inputCls} font-mono`}
              />
              <select value={c.operator} onChange={e => update(c.id, 'operator', e.target.value)} className={selectCls}>
                <option value="equals">Equals</option>
                <option value="not_equals">Not Equals</option>
                <option value="contains">Contains</option>
                <option value="starts_with">Starts with</option>
                <option value="is_set">Is Set</option>
                <option value="is_empty">Is Empty</option>
                <option value="greater_than">Greater Than</option>
                <option value="less_than">Less Than</option>
              </select>
              {!['is_set', 'is_empty'].includes(c.operator) && (
                <input
                  value={c.value || ''}
                  onChange={e => update(c.id, 'value', e.target.value)}
                  placeholder="Value to compare"
                  className={inputCls}
                />
              )}
            </>
          )}

          {c.type === 'pattern' && (
            <>
              <select value={c.operator} onChange={e => update(c.id, 'operator', e.target.value)} className={selectCls}>
                <option value="contains">Contains</option>
                <option value="equals">Equals</option>
                <option value="starts_with">Starts with</option>
                <option value="matches_regex">Matches regex</option>
              </select>
              <input
                value={c.value || ''}
                onChange={e => update(c.id, 'value', e.target.value)}
                placeholder="Value or regex pattern"
                className={inputCls}
              />
            </>
          )}
        </div>
      ))}
      <button
        onClick={add}
        className="flex items-center gap-1.5 text-xs text-accent-600 hover:text-accent-700 font-medium transition"
      >
        <Plus className="w-3.5 h-3.5" />
        Add {conditionLabel || 'Branch'}
      </button>
    </div>
  );
}

// ─── Global Settings Panel ────────────────────────────────────────────────────

interface GlobalSettingsPanelProps {
  settings: FlowGlobalSettings;
  onChange: (settings: FlowGlobalSettings) => void;
}

function GlobalSettingsPanel({ settings, onChange }: GlobalSettingsPanelProps) {
  const set = <K extends keyof FlowGlobalSettings>(key: K, value: FlowGlobalSettings[K]) =>
    onChange({ ...settings, [key]: value });

  return (
    <div>
      <div className="px-4 py-3 border-b border-slate-200">
        <p className="text-sm font-semibold text-slate-800">Global Settings</p>
        <p className="text-xs text-slate-400 mt-0.5">Applied to this entire flow</p>
      </div>

      <Section title="Agent Settings">
        <Field label="LLM Model">
          <select value={settings.agentModel} onChange={e => set('agentModel', e.target.value)} className={selectCls}>
            <option value="gpt-4o">GPT-4o</option>
            <option value="gpt-4o-mini">GPT-4o Mini</option>
            <option value="claude-sonnet-4-6">Claude Sonnet 4.6</option>
            <option value="claude-haiku-4-5">Claude Haiku 4.5</option>
          </select>
        </Field>
        <Field label={`Temperature: ${settings.temperature}`}>
          <input
            type="range" min={0} max={1} step={0.1}
            value={settings.temperature}
            onChange={e => set('temperature', parseFloat(e.target.value))}
            className="w-full accent-accent-500"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>Precise</span><span>Creative</span>
          </div>
        </Field>
        <Field label="System Prompt">
          <textarea
            value={settings.systemPrompt}
            onChange={e => set('systemPrompt', e.target.value)}
            rows={4}
            placeholder="You are a helpful technical support assistant..."
            className={`${inputCls} resize-none`}
          />
        </Field>
      </Section>

      <Section title="Global Tools" defaultOpen={false}>
        <p className="text-xs text-slate-500 mb-2">Tools available to all AI nodes (unless overridden at node level).</p>
        <ToolChecklist selectedIds={settings.toolIds || []} onChange={ids => set('toolIds', ids)} />
      </Section>

      <Section title="Global Knowledge Bases" defaultOpen={false}>
        <p className="text-xs text-slate-500 mb-2">Knowledge bases available to all AI nodes.</p>
        <KBChecklist selectedIds={settings.knowledgeBaseIds} onChange={ids => set('knowledgeBaseIds', ids)} />
      </Section>

      <Section title="Webhook Settings" defaultOpen={false}>
        <Field label="Global Webhook URL" hint="Called on every conversation event">
          <input
            value={settings.globalWebhookId || ''}
            onChange={e => set('globalWebhookId', e.target.value)}
            placeholder="https://your-server.com/webhook"
            className={inputCls}
          />
        </Field>
      </Section>

      <Section title="Flow Settings" defaultOpen={false}>
        <Field label="Session Timeout (minutes)">
          <input
            type="number" min={1} max={1440}
            value={settings.sessionTimeoutMinutes}
            onChange={e => set('sessionTimeoutMinutes', parseInt(e.target.value))}
            className={inputCls}
          />
        </Field>
        <Field label="Fallback Message">
          <textarea
            value={settings.fallbackMessage}
            onChange={e => set('fallbackMessage', e.target.value)}
            rows={2}
            className={`${inputCls} resize-none`}
          />
        </Field>
      </Section>
    </div>
  );
}

// ─── Per-Node Settings ────────────────────────────────────────────────────────

interface NodeSettingsPanelProps {
  node: Node<FlowNodeData>;
  onUpdate: (id: string, data: Partial<FlowNodeData>) => void;
}

function AiConversationSettings({ node, onUpdate }: NodeSettingsPanelProps) {
  const d = node.data;
  const set = (key: keyof FlowNodeData, value: unknown) => onUpdate(node.id, { [key]: value });
  const toolIds = (d.toolIds as string[] | undefined) || [];
  const kbIds = (d.knowledgeBaseIds as string[] | undefined) || [];
  const exitConditions = (d.exitConditions as FlowCondition[] | undefined) || [];

  return (
    <>
      <Section title="Conversation">
        <Field label="Node Label">
          <input value={(d.label as string) || ''} onChange={e => set('label', e.target.value)} className={inputCls} />
        </Field>
        <Field label="System Prompt" hint="Instructions specific to this conversation step">
          <textarea
            value={(d.systemPrompt as string) || ''}
            onChange={e => set('systemPrompt', e.target.value)}
            rows={5}
            placeholder="Instructions for the AI in this conversation step..."
            className={`${inputCls} resize-none`}
          />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Model Override">
            <select value={(d.model as string) || ''} onChange={e => set('model', e.target.value)} className={selectCls}>
              <option value="">Use global</option>
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-4o-mini">GPT-4o Mini</option>
              <option value="claude-sonnet-4-6">Claude Sonnet 4.6</option>
            </select>
          </Field>
          <Field label="Max Turns">
            <input type="number" min={1} max={100}
              value={(d.maxTurns as number) || 10}
              onChange={e => set('maxTurns', parseInt(e.target.value) || 10)}
              className={inputCls} />
          </Field>
        </div>
      </Section>

      <Section title="Tools (this step)" defaultOpen={toolIds.length > 0}>
        <p className="text-xs text-slate-500 mb-2">Only these tools are available during this conversation step.</p>
        <ToolChecklist selectedIds={toolIds} onChange={ids => set('toolIds', ids)} />
      </Section>

      <Section title="Knowledge Bases (this step)" defaultOpen={kbIds.length > 0}>
        <p className="text-xs text-slate-500 mb-2">Only these KBs are searchable during this step.</p>
        <KBChecklist selectedIds={kbIds} onChange={ids => set('knowledgeBaseIds', ids)} />
      </Section>

      <Section title="Exit Conditions" defaultOpen={exitConditions.length > 0}>
        <p className="text-xs text-slate-500 mb-2">Define when this step should transition to the next node. Each condition creates a separate output handle.</p>
        <ConditionEditor
          conditions={exitConditions}
          onChange={conds => set('exitConditions', conds)}
          conditionLabel="Exit"
        />
      </Section>
    </>
  );
}

function ToolCallSettings({ node, onUpdate }: NodeSettingsPanelProps) {
  const d = node.data;
  const set = (key: keyof FlowNodeData, value: unknown) => onUpdate(node.id, { [key]: value });
  const inputMapping = (d.inputMapping as Record<string, string> | undefined) || {};
  const outputMapping = (d.outputMapping as Record<string, string> | undefined) || {};
  const selectedTool = availableTools.find(t => t.id === d.toolId);

  return (
    <>
      <Section title="Tool">
        <Field label="Node Label">
          <input value={(d.label as string) || ''} onChange={e => set('label', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Select Tool">
          <select value={(d.toolId as string) || ''} onChange={e => set('toolId', e.target.value)} className={selectCls}>
            <option value="">Choose a tool...</option>
            {availableTools.map(t => (
              <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
            ))}
          </select>
        </Field>
        {selectedTool && (
          <div className="bg-orange-50 rounded-lg p-2 text-xs text-orange-700">
            <span className="font-medium">{selectedTool.name}</span> — {selectedTool.category}
          </div>
        )}
      </Section>

      <Section title="Input Mapping" defaultOpen={Object.keys(inputMapping).length > 0}>
        <p className="text-xs text-slate-500 mb-2">Map flow variables to tool parameters. Use {'{{variable}}'} syntax.</p>
        {Object.entries(inputMapping).map(([param, value]) => (
          <div key={param} className="flex items-center gap-2">
            <input value={param} readOnly className={`${inputCls} bg-slate-50 flex-1 font-mono`} />
            <span className="text-xs text-slate-400">=</span>
            <input
              value={value}
              onChange={e => set('inputMapping', { ...inputMapping, [param]: e.target.value })}
              placeholder="{{variable}}"
              className={`${inputCls} flex-1 font-mono`}
            />
            <button onClick={() => {
              const next = { ...inputMapping };
              delete next[param];
              set('inputMapping', next);
            }} className="text-slate-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
          </div>
        ))}
        <button
          onClick={() => set('inputMapping', { ...inputMapping, ['param_' + Date.now()]: '' })}
          className="flex items-center gap-1.5 text-xs text-accent-600 hover:text-accent-700 font-medium transition"
        >
          <Plus className="w-3.5 h-3.5" /> Add Mapping
        </button>
      </Section>

      <Section title="Output Mapping" defaultOpen={Object.keys(outputMapping).length > 0}>
        <p className="text-xs text-slate-500 mb-2">Map tool response fields to flow variables.</p>
        {Object.entries(outputMapping).map(([variable, field]) => (
          <div key={variable} className="flex items-center gap-2">
            <input
              value={variable}
              onChange={e => {
                const next = { ...outputMapping };
                delete next[variable];
                next[e.target.value] = field;
                set('outputMapping', next);
              }}
              placeholder="flow_variable"
              className={`${inputCls} flex-1 font-mono`}
            />
            <span className="text-xs text-slate-400">←</span>
            <input value={field}
              onChange={e => set('outputMapping', { ...outputMapping, [variable]: e.target.value })}
              placeholder="$.response.field"
              className={`${inputCls} flex-1 font-mono`}
            />
            <button onClick={() => {
              const next = { ...outputMapping };
              delete next[variable];
              set('outputMapping', next);
            }} className="text-slate-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
          </div>
        ))}
        <button
          onClick={() => set('outputMapping', { ...outputMapping, ['var_' + Date.now()]: '' })}
          className="flex items-center gap-1.5 text-xs text-accent-600 hover:text-accent-700 font-medium transition"
        >
          <Plus className="w-3.5 h-3.5" /> Add Mapping
        </button>
      </Section>
    </>
  );
}

function ConditionSettings({ node, onUpdate }: NodeSettingsPanelProps) {
  const d = node.data;
  const conditions = ((d.conditions as FlowCondition[]) || []);

  return (
    <>
      <Section title="Conditions">
        <Field label="Node Label">
          <input value={(d.label as string) || ''} onChange={e => onUpdate(node.id, { label: e.target.value })} className={inputCls} />
        </Field>
        <ConditionEditor
          conditions={conditions}
          onChange={conds => onUpdate(node.id, { conditions: conds })}
        />
      </Section>
    </>
  );
}

function SendMessageSettings({ node, onUpdate }: NodeSettingsPanelProps) {
  const d = node.data;
  const set = (key: keyof FlowNodeData, value: unknown) => onUpdate(node.id, { [key]: value });
  return (
    <>
      <Section title="Message">
        <Field label="Node Label">
          <input value={(d.label as string) || ''} onChange={e => set('label', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Message Body" hint="Use {{variable}} for dynamic content">
          <textarea
            value={(d.messageBody as string) || ''}
            onChange={e => set('messageBody', e.target.value)}
            rows={5}
            placeholder="Hi {{name}}, your ticket has been created..."
            className={`${inputCls} resize-none`}
          />
        </Field>
        <Field label="Use Template (optional)">
          <select value={(d.templateId as string) || ''} onChange={e => set('templateId', e.target.value)} className={selectCls}>
            <option value="">No template</option>
            <option value="tpl-1">ticket_created</option>
            <option value="tpl-2">issue_resolved</option>
          </select>
        </Field>
      </Section>
    </>
  );
}

function WaitForInputSettings({ node, onUpdate }: NodeSettingsPanelProps) {
  const d = node.data;
  const set = (key: keyof FlowNodeData, value: unknown) => onUpdate(node.id, { [key]: value });
  return (
    <>
      <Section title="Wait for Input">
        <Field label="Node Label">
          <input value={(d.label as string) || ''} onChange={e => set('label', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Prompt Message" hint="Message sent before waiting for the customer's response">
          <textarea
            value={(d.promptMessage as string) || ''}
            onChange={e => set('promptMessage', e.target.value)}
            rows={3}
            placeholder="Please provide your account number..."
            className={`${inputCls} resize-none`}
          />
        </Field>
        <Field label="Store Response In" hint="The flow variable that will hold the customer's response">
          <input
            value={(d.variableName as string) || ''}
            onChange={e => set('variableName', e.target.value)}
            placeholder="customer_response"
            className={`${inputCls} font-mono`}
          />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Timeout (seconds)">
            <input type="number" min={10} max={3600}
              value={(d.timeout as number) || 120}
              onChange={e => set('timeout', parseInt(e.target.value) || 120)}
              className={inputCls} />
          </Field>
          <Field label="On Timeout">
            <select value={(d.timeoutAction as string) || 'repeat'} onChange={e => set('timeoutAction', e.target.value)} className={selectCls}>
              <option value="repeat">Re-prompt</option>
              <option value="advance">Move on</option>
              <option value="end">End conversation</option>
            </select>
          </Field>
        </div>
      </Section>
    </>
  );
}

function SetVariableSettings({ node, onUpdate }: NodeSettingsPanelProps) {
  const d = node.data;
  const assignments = (d.assignments as VariableAssignment[] | undefined) || [];
  const setAssignments = (a: VariableAssignment[]) => onUpdate(node.id, { assignments: a });

  return (
    <>
      <Section title="Variables">
        <Field label="Node Label">
          <input value={(d.label as string) || ''} onChange={e => onUpdate(node.id, { label: e.target.value })} className={inputCls} />
        </Field>
        <p className="text-xs text-slate-500 mb-2">Assign values to flow variables. Use {'{{variable}}'} to reference other variables.</p>
        <div className="space-y-2">
          {assignments.map((a, i) => (
            <div key={i} className="bg-slate-50 rounded-lg p-2 space-y-1.5">
              <div className="flex items-center gap-2">
                <input
                  value={a.variable}
                  onChange={e => setAssignments(assignments.map((x, j) => j === i ? { ...x, variable: e.target.value } : x))}
                  placeholder="variable_name"
                  className={`${inputCls} font-mono flex-1`}
                />
                <span className="text-xs text-slate-400">=</span>
                <button onClick={() => setAssignments(assignments.filter((_, j) => j !== i))}
                  className="text-slate-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
              </div>
              <input
                value={a.expression}
                onChange={e => setAssignments(assignments.map((x, j) => j === i ? { ...x, expression: e.target.value } : x))}
                placeholder="Value or {{other_variable}}_suffix"
                className={`${inputCls} font-mono`}
              />
            </div>
          ))}
          <button
            onClick={() => setAssignments([...assignments, { variable: '', expression: '' }])}
            className="flex items-center gap-1.5 text-xs text-accent-600 hover:text-accent-700 font-medium transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add Assignment
          </button>
        </div>
      </Section>
    </>
  );
}

function HandoffSettings({ node, onUpdate }: NodeSettingsPanelProps) {
  const d = node.data;
  const set = (key: keyof FlowNodeData, value: unknown) => onUpdate(node.id, { [key]: value });
  return (
    <>
      <Section title="Handoff">
        <Field label="Node Label">
          <input value={(d.label as string) || ''} onChange={e => set('label', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Target Agent / Queue" hint="Which team or agent receives this handoff">
          <input
            value={(d.handoffTarget as string) || ''}
            onChange={e => set('handoffTarget', e.target.value)}
            placeholder="Level 2 Support"
            className={inputCls}
          />
        </Field>
        <Field label="Handoff Message" hint="Context message sent to the human agent">
          <textarea
            value={(d.handoffMessage as string) || ''}
            onChange={e => set('handoffMessage', e.target.value)}
            rows={3}
            placeholder="Customer needs help with..."
            className={`${inputCls} resize-none`}
          />
        </Field>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox"
            checked={!!d.includeTranscript}
            onChange={e => set('includeTranscript', e.target.checked)}
            className="w-3.5 h-3.5 rounded accent-accent-500" />
          <span className="text-xs text-slate-700">Include conversation transcript</span>
        </label>
      </Section>
    </>
  );
}

function FunctionSettings({ node, onUpdate }: NodeSettingsPanelProps) {
  const d = node.data;
  const set = (key: keyof FlowNodeData, value: unknown) => onUpdate(node.id, { [key]: value });
  return (
    <>
      <Section title="Endpoint (Legacy)">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-xs text-amber-700 mb-2">
          This node type is deprecated. Use "Tool Call" instead, which references tools from the Tools page.
        </div>
        <Field label="Node Label">
          <input value={(d.label as string) || ''} onChange={e => set('label', e.target.value)} className={inputCls} />
        </Field>
        <Field label="HTTP Method">
          <select value={(d.httpMethod as string) || 'POST'} onChange={e => set('httpMethod', e.target.value)} className={selectCls}>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
          </select>
        </Field>
        <Field label="URL">
          <input
            value={(d.webhookUrl as string) || ''}
            onChange={e => set('webhookUrl', e.target.value)}
            placeholder="https://api.example.com/endpoint"
            className={inputCls}
          />
        </Field>
        <Field label="Request Body (JSON)">
          <textarea
            value={(d.requestBody as string) || ''}
            onChange={e => set('requestBody', e.target.value)}
            rows={4}
            placeholder={'{\n  "userId": "{{user_id}}"\n}'}
            className={`${inputCls} resize-none font-mono text-xs`}
          />
        </Field>
      </Section>
    </>
  );
}

function EndSettings({ node, onUpdate }: NodeSettingsPanelProps) {
  const d = node.data;
  return (
    <>
      <Section title="End">
        <Field label="Node Label">
          <input value={(d.label as string) || ''} onChange={e => onUpdate(node.id, { label: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Closing Message (optional)">
          <textarea
            value={(d.description as string) || ''}
            onChange={e => onUpdate(node.id, { description: e.target.value })}
            rows={2}
            placeholder="Thank you for contacting us!"
            className={`${inputCls} resize-none`}
          />
        </Field>
      </Section>
    </>
  );
}

const nodePanelMap: Record<FlowNodeType, React.ComponentType<NodeSettingsPanelProps> | null> = {
  start: null,
  'ai-conversation': AiConversationSettings,
  'tool-call': ToolCallSettings,
  condition: ConditionSettings,
  'send-message': SendMessageSettings,
  'wait-for-input': WaitForInputSettings,
  'set-variable': SetVariableSettings,
  handoff: HandoffSettings,
  end: EndSettings,
  // Legacy
  function: FunctionSettings,
};

// ─── Main RightPanel ──────────────────────────────────────────────────────────

interface RightPanelProps {
  selectedNode: Node<FlowNodeData> | null;
  globalSettings: FlowGlobalSettings;
  onGlobalSettingsChange: (settings: FlowGlobalSettings) => void;
  onNodeUpdate: (id: string, data: Partial<FlowNodeData>) => void;
}

export function RightPanel({ selectedNode, globalSettings, onGlobalSettingsChange, onNodeUpdate }: RightPanelProps) {
  return (
    <div className="w-72 bg-white border-l border-slate-200 flex flex-col overflow-y-auto">
      {selectedNode ? (
        <>
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
            <p className="text-sm font-semibold text-slate-800 capitalize">
              {(selectedNode.data.label as string) || selectedNode.type}
            </p>
            <p className="text-xs text-slate-400 mt-0.5 capitalize">{selectedNode.type?.replace(/-/g, ' ')} Node</p>
          </div>
          {nodePanelMap[selectedNode.data.nodeType as FlowNodeType]
            ? (() => {
                const Panel = nodePanelMap[selectedNode.data.nodeType as FlowNodeType]!;
                return <Panel node={selectedNode} onUpdate={onNodeUpdate} />;
              })()
            : (
              <div className="px-4 py-6 text-xs text-slate-400 text-center">
                No settings available for this node type.
              </div>
            )
          }
        </>
      ) : (
        <GlobalSettingsPanel settings={globalSettings} onChange={onGlobalSettingsChange} />
      )}
    </div>
  );
}
