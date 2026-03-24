import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Copy,
  Edit2,
  Trash2,
  FileText,
  Check,
  X,
  ChevronDown,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';

interface PromptSnippet {
  id: string;
  name: string;
  content: string;
  category: 'company' | 'legal' | 'instructions' | 'custom';
  lastUpdated: string;
  usageCount: number;
}

const mockSnippets: PromptSnippet[] = [
  {
    id: '1',
    name: 'company_info',
    content: 'Meridian Financial Services is a consumer lending and accounts receivable management company based in Austin, TX. We\'ve been helping customers manage their financial obligations since 2017, serving over 80,000 clients nationwide.',
    category: 'company',
    lastUpdated: 'Feb 20, 2026',
    usageCount: 5,
  },
  {
    id: '2',
    name: 'payment_instructions',
    content: 'To make a payment, please visit meridianfs.com/pay and enter your account number. You can pay by debit card, credit card, or ACH bank transfer. Payments are typically processed within 1 business day.',
    category: 'instructions',
    lastUpdated: 'Feb 18, 2026',
    usageCount: 3,
  },
  {
    id: '3',
    name: 'legal_disclaimer',
    content: 'This call may be recorded for quality assurance and training purposes. By continuing this conversation, you acknowledge that you have been informed of the recording. Your personal data will be processed in accordance with applicable federal and state privacy laws.',
    category: 'legal',
    lastUpdated: 'Feb 15, 2026',
    usageCount: 8,
  },
  {
    id: '4',
    name: 'hours_of_operation',
    content: 'Our customer service team is available Monday through Friday from 8:00 AM to 7:00 PM CT, and Saturday from 9:00 AM to 3:00 PM CT. We are closed on Sundays and federal holidays.',
    category: 'company',
    lastUpdated: 'Feb 10, 2026',
    usageCount: 4,
  },
  {
    id: '5',
    name: 'late_fee_policy',
    content: 'A late payment fee of $25 or 5% of the outstanding amount (whichever is greater) is applied after the due date. Additional fees may apply for accounts more than 30 days past due. Please contact us if you\'re experiencing payment difficulties.',
    category: 'legal',
    lastUpdated: 'Feb 12, 2026',
    usageCount: 2,
  },
  {
    id: '6',
    name: 'dispute_process',
    content: 'To dispute a charge, submit your request in writing to disputes@meridianfs.com or call 1-800-555-0175. We will investigate and respond within 30 business days in accordance with the Fair Debt Collection Practices Act.',
    category: 'instructions',
    lastUpdated: 'Feb 22, 2026',
    usageCount: 2,
  },
  {
    id: '7',
    name: 'payment_plan_options',
    content: 'You may qualify for an extended payment plan or a reduced settlement offer. Ask your agent about available options based on your account standing and payment history. Plans can be set up online at meridianfs.com/plans.',
    category: 'custom',
    lastUpdated: 'Feb 24, 2026',
    usageCount: 1,
  },
  {
    id: '8',
    name: 'contact_info',
    content: 'You can reach us by phone at 1-800-555-0175 (toll-free), by email at support@meridianfs.com, or via WhatsApp at +1 (512) 555-0163. Our website is www.meridianfs.com.',
    category: 'company',
    lastUpdated: 'Feb 8, 2026',
    usageCount: 6,
  },
];

const categoryConfig: Record<PromptSnippet['category'], { label: string; variant: 'default' | 'info' | 'warning' | 'success' | 'danger' }> = {
  company: { label: 'Company', variant: 'info' },
  legal: { label: 'Legal', variant: 'warning' },
  instructions: { label: 'Instructions', variant: 'success' },
  custom: { label: 'Custom', variant: 'default' },
};

type CategoryFilter = 'all' | PromptSnippet['category'];

interface SnippetModalProps {
  isOpen: boolean;
  onClose: () => void;
  snippet?: PromptSnippet | null;
  onSave: (snippet: Omit<PromptSnippet, 'id' | 'lastUpdated' | 'usageCount'> & { id?: string }) => void;
}

function SnippetModal({ isOpen, onClose, snippet, onSave }: SnippetModalProps) {
  const [name, setName] = useState(snippet?.name || '');
  const [content, setContent] = useState(snippet?.content || '');
  const [category, setCategory] = useState<PromptSnippet['category']>(snippet?.category || 'custom');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    const cleanName = name.replace(/[{}]/g, '').trim().toLowerCase().replace(/\s+/g, '_');
    onSave({
      id: snippet?.id,
      name: cleanName || 'new_snippet',
      content,
      category,
    });
    onClose();
  };

  const copyToClipboard = () => {
    const cleanName = name.replace(/[{}]/g, '').trim().toLowerCase().replace(/\s+/g, '_');
    navigator.clipboard.writeText(`{{${cleanName}}}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">
            {snippet ? 'Edit Snippet' : 'Create Snippet'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Snippet Name
            </label>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-sm">{"{{"}</span>
              <input
                type="text"
                value={name.replace(/[{}]/g, '')}
                onChange={e => setName(e.target.value)}
                placeholder="snippet_name"
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 font-mono"
              />
              <span className="text-slate-400 text-sm">{"}}"}</span>
              <button
                onClick={copyToClipboard}
                className="p-2 text-slate-400 hover:text-accent-600 border border-slate-200 rounded-lg transition"
                title="Copy to clipboard"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Use <code className="font-mono">{"{{"}{name.replace(/[{}]/g, '').trim().toLowerCase().replace(/\s+/g, '_') || 'snippet_name'}{"}}"}</code> in your prompts
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as PromptSnippet['category'])}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
            >
              <option value="company">Company</option>
              <option value="legal">Legal</option>
              <option value="instructions">Instructions</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Content
            </label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 resize-y font-mono"
              placeholder="Enter the snippet content..."
            />
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Preview
            </label>
            <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600 border border-slate-200">
              {content || <span className="text-slate-400 italic">Content will appear here...</span>}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || !content.trim()}
            className="px-4 py-2 bg-accent-500 hover:bg-accent-600 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium transition"
          >
            {snippet ? 'Save Changes' : 'Create Snippet'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function PromptSnippetsPage() {
  const [snippets, setSnippets] = useState<PromptSnippet[]>(mockSnippets);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<PromptSnippet | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredSnippets = useMemo(() => {
    return snippets.filter(snippet => {
      const matchesSearch = 
        snippet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        snippet.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || snippet.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [snippets, searchQuery, categoryFilter]);

  const handleSave = (data: Omit<PromptSnippet, 'id' | 'lastUpdated' | 'usageCount'> & { id?: string }) => {
    if (data.id) {
      // Edit existing
      setSnippets(prev => prev.map(s => 
        s.id === data.id 
          ? { ...s, name: data.name, content: data.content, category: data.category, lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
          : s
      ));
    } else {
      // Create new
      const newSnippet: PromptSnippet = {
        id: Date.now().toString(),
        name: data.name,
        content: data.content,
        category: data.category,
        lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        usageCount: 0,
      };
      setSnippets(prev => [...prev, newSnippet]);
    }
    setEditingSnippet(null);
  };

  const handleDelete = (id: string) => {
    setSnippets(prev => prev.filter(s => s.id !== id));
    setDeleteConfirm(null);
  };

  const copySnippetName = (snippet: PromptSnippet) => {
    navigator.clipboard.writeText(`{{${snippet.name}}}`);
    setCopiedId(snippet.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openEditModal = (snippet: PromptSnippet) => {
    setEditingSnippet(snippet);
    setModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingSnippet(null);
    setModalOpen(true);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Prompt Snippets</h1>
          <p className="text-sm text-slate-500 mt-0.5">Reusable text blocks for agent prompts</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg text-sm font-medium transition"
        >
          <Plus className="w-4 h-4" />
          New Snippet
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search snippets..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <button
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50 min-w-[140px]"
          >
            {categoryFilter === 'all' ? 'All Categories' : categoryConfig[categoryFilter].label}
            <ChevronDown className="w-4 h-4 text-slate-400 ml-auto" />
          </button>
          {showCategoryDropdown && (
            <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
              <button
                onClick={() => { setCategoryFilter('all'); setShowCategoryDropdown(false); }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 ${categoryFilter === 'all' ? 'text-accent-600 bg-accent-50' : 'text-slate-700'}`}
              >
                All Categories
              </button>
              {Object.entries(categoryConfig).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => { setCategoryFilter(key as CategoryFilter); setShowCategoryDropdown(false); }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 ${categoryFilter === key ? 'text-accent-600 bg-accent-50' : 'text-slate-700'}`}
                >
                  {config.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Snippets List */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {filteredSnippets.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 mb-1">No snippets found</h3>
            <p className="text-sm text-slate-500 mb-5">
              {searchQuery || categoryFilter !== 'all' 
                ? 'Try adjusting your filters'
                : 'Create reusable text blocks for your agent prompts'}
            </p>
            {!searchQuery && categoryFilter === 'all' && (
              <button 
                onClick={openCreateModal}
                className="bg-accent-500 hover:bg-accent-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
              >
                Create Snippet
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredSnippets.map(snippet => (
              <div 
                key={snippet.id} 
                className="p-4 hover:bg-slate-50 transition group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-accent-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-sm font-mono font-medium text-accent-600 bg-accent-50 px-2 py-0.5 rounded">
                        {"{{"}{snippet.name}{"}}"}
                      </code>
                      <Badge variant={categoryConfig[snippet.category].variant}>
                        {categoryConfig[snippet.category].label}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                      {snippet.content}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span>Updated {snippet.lastUpdated}</span>
                      <span>•</span>
                      <span>{snippet.usageCount} agent{snippet.usageCount !== 1 ? 's' : ''} using</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => copySnippetName(snippet)}
                      className="p-2 text-slate-400 hover:text-accent-600 hover:bg-accent-50 rounded-lg transition"
                      title="Copy snippet name"
                    >
                      {copiedId === snippet.id ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => openEditModal(snippet)}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {deleteConfirm === snippet.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(snippet.id)}
                          className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-lg transition"
                          title="Confirm delete"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-lg transition"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(snippet.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <SnippetModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingSnippet(null); }}
        snippet={editingSnippet}
        onSave={handleSave}
      />
    </div>
  );
}
