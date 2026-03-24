import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { FlowsTab } from './tabs/FlowsTab';
import { SendersTab } from './tabs/SendersTab';
import { TemplatesTab } from './tabs/TemplatesTab';

type Tab = 'flows' | 'senders' | 'templates';

const tabs: { id: Tab; label: string }[] = [
  { id: 'flows', label: 'Flows' },
  { id: 'senders', label: 'Senders' },
  { id: 'templates', label: 'Templates' },
];

export function WhatsAppPage() {
  const [activeTab, setActiveTab] = useState<Tab>('flows');

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-800">WhatsApp</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage flows, connected numbers, and message templates</p>
        </div>
      </div>

      <div className="flex border-b border-slate-200 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition -mb-px ${
              activeTab === tab.id
                ? 'border-accent-500 text-accent-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'flows' && <FlowsTab />}
      {activeTab === 'senders' && <SendersTab />}
      {activeTab === 'templates' && <TemplatesTab />}
    </div>
  );
}
