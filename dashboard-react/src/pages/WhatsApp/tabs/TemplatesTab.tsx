import { useState } from 'react';
import { Plus, FileText } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { useWhatsAppStore } from '../../../stores/whatsapp';
import type { WhatsAppTemplate } from '../../../types';

const mockTemplates: WhatsAppTemplate[] = [
  { id: 'tpl-1', name: 'ticket_created', category: 'utility', language: 'en', status: 'approved', sender: '+1 (512) 555-0141' },
  { id: 'tpl-2', name: 'issue_resolved', category: 'utility', language: 'en', status: 'approved', sender: '+1 (512) 555-0141' },
  { id: 'tpl-3', name: 'promo_offer', category: 'marketing', language: 'en', status: 'pending', sender: '+1 (512) 555-0182' },
  { id: 'tpl-4', name: 'otp_verification', category: 'authentication', language: 'en', status: 'approved', sender: '+1 (512) 555-0141' },
];

const statusVariant: Record<WhatsAppTemplate['status'], 'success' | 'warning' | 'danger'> = {
  approved: 'success',
  pending: 'warning',
  rejected: 'danger',
};

const categoryColor: Record<WhatsAppTemplate['category'], string> = {
  utility: 'bg-blue-100 text-blue-700',
  authentication: 'bg-purple-100 text-purple-700',
  marketing: 'bg-orange-100 text-orange-700',
};

interface CreateTemplateModalProps {
  onClose: () => void;
  onCreate: (tpl: Partial<WhatsAppTemplate> & { body: string }) => void;
}

function CreateTemplateModal({ onClose, onCreate }: CreateTemplateModalProps) {
  const [tab, setTab] = useState<'general' | 'content' | 'preview'>('general');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<WhatsAppTemplate['category']>('utility');
  const [language, setLanguage] = useState('en');
  const [header, setHeader] = useState('');
  const [body, setBody] = useState('');
  const [footer, setFooter] = useState('');

  const tabs = [
    { id: 'general' as const, label: 'General' },
    { id: 'content' as const, label: 'Content' },
    { id: 'preview' as const, label: 'Preview' },
  ];

  const handleSubmit = () => {
    if (name && body) {
      onCreate({ name, category, language, status: 'pending', body, sender: '' });
      onClose();
    }
  };

  const previewBody = body.replace(/\{\{(\d+)\}\}/g, (_, n) => `[Variable ${n}]`);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">New Template</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition -mb-px ${
                tab === t.id
                  ? 'border-accent-500 text-accent-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {tab === 'general' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Template Name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                  placeholder="ticket_created"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
                <p className="text-xs text-slate-400 mt-1">Lowercase letters, numbers and underscores only</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as WhatsAppTemplate['category'])}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
                >
                  <option value="utility">Utility</option>
                  <option value="authentication">Authentication</option>
                  <option value="marketing">Marketing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Language</label>
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
                >
                  <option value="en">English</option>
                  <option value="ro">Romanian</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
            </>
          )}

          {tab === 'content' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Header <span className="text-slate-400">(optional)</span></label>
                <input
                  value={header}
                  onChange={e => setHeader(e.target.value)}
                  placeholder="Support Ticket Update"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Body</label>
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder="Hi {{1}}, your ticket #{{2}} has been updated. Status: {{3}}"
                  rows={5}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none"
                />
                <p className="text-xs text-slate-400 mt-1">Use {'{{1}}'}, {'{{2}}'}, etc. for dynamic variables</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Footer <span className="text-slate-400">(optional)</span></label>
                <input
                  value={footer}
                  onChange={e => setFooter(e.target.value)}
                  placeholder="Reply STOP to unsubscribe"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>
            </>
          )}

          {tab === 'preview' && (
            <div className="flex items-center justify-center py-8">
              <div className="bg-[#e5ddd5] rounded-2xl p-4 w-80">
                <div className="bg-white rounded-xl p-3 shadow-sm space-y-1 max-w-xs">
                  {header && <p className="font-semibold text-slate-800 text-sm">{header}</p>}
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{previewBody || 'Your message body will appear here…'}</p>
                  {footer && <p className="text-xs text-slate-400 border-t border-slate-100 pt-1 mt-1">{footer}</p>}
                  <p className="text-xs text-slate-400 text-right">12:00</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={!name || !body}
            className="px-4 py-2 bg-accent-500 hover:bg-accent-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition"
          >
            Submit for Approval
          </button>
        </div>
      </div>
    </div>
  );
}

export function TemplatesTab() {
  const { templates, setTemplates } = useWhatsAppStore();
  const [showModal, setShowModal] = useState(false);

  if (templates.length === 0) setTemplates(mockTemplates);

  const handleCreate = (tpl: Partial<WhatsAppTemplate> & { body: string }) => {
    const newTpl: WhatsAppTemplate = {
      id: `tpl-${Date.now()}`,
      name: tpl.name || 'new_template',
      category: tpl.category || 'utility',
      language: tpl.language || 'en',
      status: 'pending',
      sender: '',
    };
    setTemplates([...templates, newTpl]);
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg text-sm font-medium transition"
        >
          <Plus className="w-4 h-4" />
          New Template
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Language</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Sender</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {templates.map((tpl) => (
              <tr key={tpl.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span className="font-mono text-slate-800">{tpl.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${categoryColor[tpl.category]}`}>
                    {tpl.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600 uppercase text-xs font-medium">{tpl.language}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{tpl.sender || '—'}</td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant[tpl.status]}>{tpl.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <CreateTemplateModal onClose={() => setShowModal(false)} onCreate={handleCreate} />
      )}
    </div>
  );
}
