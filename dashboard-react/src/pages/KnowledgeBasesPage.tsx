import { useState, useRef } from 'react';
import { Plus, Database, FileText, Trash2, Upload, Search, RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import type { KnowledgeBase } from '../types';

interface KBDocument {
  id: string;
  name: string;
  type: 'pdf' | 'txt' | 'md' | 'docx' | 'url';
  size: string;
  status: 'indexed' | 'indexing' | 'error';
  addedAt: string;
}

interface KBWithDocs extends KnowledgeBase {
  documents: KBDocument[];
}

const mockKBs: KBWithDocs[] = [
  {
    id: 'kb-1',
    name: 'Horeca Software Documentation',
    description: 'POS setup guides, Kitchen Display manual, Inventory system docs, and API reference',
    documentsCount: 24,
    lastUpdated: '2026-03-22',
    status: 'ready',
    documents: [
      { id: 'd1', name: 'POS Terminal Setup Guide.pdf', type: 'pdf', size: '3.2 MB', status: 'indexed', addedAt: '2026-03-10' },
      { id: 'd2', name: 'Kitchen Display System Manual.pdf', type: 'pdf', size: '2.1 MB', status: 'indexed', addedAt: '2026-03-10' },
      { id: 'd3', name: 'Inventory Management User Guide.pdf', type: 'pdf', size: '1.8 MB', status: 'indexed', addedAt: '2026-03-12' },
      { id: 'd4', name: 'Reservations System Config.md', type: 'md', size: '180 KB', status: 'indexed', addedAt: '2026-03-12' },
      { id: 'd5', name: 'Horeca API Reference v2.md', type: 'md', size: '420 KB', status: 'indexed', addedAt: '2026-03-15' },
      { id: 'd6', name: 'Oracle RightNow Integration Guide.pdf', type: 'pdf', size: '890 KB', status: 'indexed', addedAt: '2026-03-20' },
    ],
  },
  {
    id: 'kb-2',
    name: 'Support Runbooks',
    description: 'Common POS errors, server restart procedures, escalation playbooks, and diagnostic steps',
    documentsCount: 12,
    lastUpdated: '2026-03-18',
    status: 'ready',
    documents: [
      { id: 'd7', name: 'POS Common Errors & Fixes.md', type: 'md', size: '95 KB', status: 'indexed', addedAt: '2026-03-15' },
      { id: 'd8', name: 'Server Restart Playbook.docx', type: 'docx', size: '340 KB', status: 'indexed', addedAt: '2026-03-18' },
      { id: 'd9', name: 'Escalation SOP.docx', type: 'docx', size: '210 KB', status: 'indexed', addedAt: '2026-03-18' },
      { id: 'd10', name: 'Kitchen Display Troubleshooting.md', type: 'md', size: '65 KB', status: 'indexed', addedAt: '2026-03-18' },
      { id: 'd11', name: 'Database Connection Issues.txt', type: 'txt', size: '28 KB', status: 'indexed', addedAt: '2026-03-18' },
    ],
  },
  {
    id: 'kb-3',
    name: 'Horeca SLA & Licensing',
    description: 'Service level agreements, license types, subscription plans, and refund policies',
    documentsCount: 5,
    lastUpdated: '2026-03-01',
    status: 'ready',
    documents: [
      { id: 'd12', name: 'SLA Terms - Enterprise.pdf', type: 'pdf', size: '180 KB', status: 'indexed', addedAt: '2026-02-20' },
      { id: 'd13', name: 'License Types & Features.md', type: 'md', size: '45 KB', status: 'indexed', addedAt: '2026-02-25' },
      { id: 'd14', name: 'Subscription Plans Overview.pdf', type: 'pdf', size: '120 KB', status: 'indexed', addedAt: '2026-03-01' },
    ],
  },
];

const statusVariant: Record<KnowledgeBase['status'], 'success' | 'warning' | 'danger'> = {
  ready: 'success',
  indexing: 'warning',
  error: 'danger',
};

const docTypeColor: Record<KBDocument['type'], string> = {
  pdf: 'bg-red-100 text-red-700',
  txt: 'bg-slate-100 text-slate-600',
  md: 'bg-blue-100 text-blue-700',
  docx: 'bg-blue-100 text-blue-700',
  url: 'bg-purple-100 text-purple-700',
};

const StatusIcon = ({ status }: { status: KBDocument['status'] }) => {
  if (status === 'indexed') return <CheckCircle className="w-3.5 h-3.5 text-green-500" />;
  if (status === 'error') return <AlertCircle className="w-3.5 h-3.5 text-red-500" />;
  return <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin" />;
};

interface CreateKBModalProps {
  onClose: () => void;
  onCreate: (name: string, description: string) => void;
}

function CreateKBModal({ onClose, onCreate }: CreateKBModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">New Knowledge Base</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">✕</button>
        </div>
        <form onSubmit={e => { e.preventDefault(); if (name.trim()) { onCreate(name.trim(), description.trim()); onClose(); } }} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
            <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Product Documentation"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description <span className="text-slate-400">(optional)</span></label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
              placeholder="What kind of documents will this contain?"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition">Cancel</button>
            <button type="submit" disabled={!name.trim()}
              className="px-4 py-2 bg-accent-500 hover:bg-accent-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition">
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface KBDetailProps {
  kb: KBWithDocs;
  onBack: () => void;
  onAddDocs: (kbId: string, files: File[]) => void;
  onDeleteDoc: (kbId: string, docId: string) => void;
  onAddUrl: (kbId: string, url: string) => void;
}

function KBDetail({ kb, onBack, onAddDocs, onDeleteDoc, onAddUrl }: KBDetailProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const filtered = kb.documents.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    onAddDocs(kb.id, Array.from(files));
  };

  const handleUrlAdd = () => {
    if (urlInput.trim()) {
      onAddUrl(kb.id, urlInput.trim());
      setUrlInput('');
      setShowUrlInput(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-700 transition mb-3">← All Knowledge Bases</button>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-700 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-800">{kb.name}</h1>
              <p className="text-sm text-slate-500">{kb.description}</p>
            </div>
          </div>
          <Badge variant={statusVariant[kb.status]}>{kb.status}</Badge>
        </div>
      </div>

      {/* Upload area */}
      <div
        className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-accent-400 transition-colors cursor-pointer mb-6 group"
        onClick={() => fileRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
      >
        <Upload className="w-8 h-8 text-slate-300 group-hover:text-accent-400 mx-auto mb-2 transition-colors" />
        <p className="text-sm font-medium text-slate-600 group-hover:text-accent-600 transition-colors">Drop files here or click to upload</p>
        <p className="text-xs text-slate-400 mt-1">PDF, DOCX, TXT, Markdown — max 50 MB per file</p>
        <input ref={fileRef} type="file" multiple accept=".pdf,.docx,.txt,.md" className="hidden"
          onChange={e => handleFiles(e.target.files)} />
      </div>

      {/* URL ingestion */}
      <div className="mb-4">
        {showUrlInput ? (
          <div className="flex gap-2">
            <input
              autoFocus value={urlInput} onChange={e => setUrlInput(e.target.value)}
              placeholder="https://docs.example.com/page"
              onKeyDown={e => { if (e.key === 'Enter') handleUrlAdd(); if (e.key === 'Escape') setShowUrlInput(false); }}
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
            <button onClick={handleUrlAdd} className="px-3 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg text-sm transition">Add URL</button>
            <button onClick={() => setShowUrlInput(false)} className="px-3 py-2 text-slate-600 hover:text-slate-800 transition text-sm">Cancel</button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents…"
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" />
            </div>
            <button onClick={() => setShowUrlInput(true)}
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 rounded-lg text-sm transition">
              + Add URL
            </button>
          </div>
        )}
      </div>

      {/* Document list */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            {search ? 'No documents match your search.' : 'No documents yet. Upload files above.'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Document</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Size</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Added</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(doc => (
                <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="font-medium text-slate-800 truncate max-w-xs">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium uppercase ${docTypeColor[doc.type]}`}>{doc.type}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{doc.size}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <StatusIcon status={doc.status} />
                      <span className="text-xs text-slate-500 capitalize">{doc.status}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{doc.addedAt}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => onDeleteDoc(kb.id, doc.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export function KnowledgeBasesPage() {
  const [kbs, setKbs] = useState<KBWithDocs[]>(mockKBs);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedKBId, setSelectedKBId] = useState<string | null>(null);

  const selectedKB = kbs.find(kb => kb.id === selectedKBId) ?? null;

  const handleCreate = (name: string, description: string) => {
    setKbs(prev => [...prev, {
      id: `kb-${Date.now()}`,
      name, description,
      documentsCount: 0,
      lastUpdated: new Date().toISOString().slice(0, 10),
      status: 'ready',
      documents: [],
    }]);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this knowledge base and all its documents?')) {
      setKbs(prev => prev.filter(kb => kb.id !== id));
    }
  };

  const handleAddDocs = (kbId: string, files: File[]) => {
    setKbs(prev => prev.map(kb => {
      if (kb.id !== kbId) return kb;
      const newDocs: KBDocument[] = files.map(f => ({
        id: `doc-${Date.now()}-${f.name}`,
        name: f.name,
        type: (f.name.split('.').pop() as KBDocument['type']) || 'txt',
        size: `${(f.size / 1024).toFixed(0)} KB`,
        status: 'indexing' as const,
        addedAt: new Date().toISOString().slice(0, 10),
      }));
      return { ...kb, documents: [...kb.documents, ...newDocs], documentsCount: kb.documentsCount + newDocs.length };
    }));
    // Simulate indexing completion
    setTimeout(() => {
      setKbs(prev => prev.map(kb => {
        if (kb.id !== kbId) return kb;
        return { ...kb, documents: kb.documents.map(d => d.status === 'indexing' ? { ...d, status: 'indexed' as const } : d) };
      }));
    }, 3000);
  };

  const handleAddUrl = (kbId: string, url: string) => {
    setKbs(prev => prev.map(kb => {
      if (kb.id !== kbId) return kb;
      const newDoc: KBDocument = {
        id: `doc-${Date.now()}`,
        name: url,
        type: 'url',
        size: '—',
        status: 'indexing',
        addedAt: new Date().toISOString().slice(0, 10),
      };
      return { ...kb, documents: [...kb.documents, newDoc], documentsCount: kb.documentsCount + 1 };
    }));
  };

  const handleDeleteDoc = (kbId: string, docId: string) => {
    setKbs(prev => prev.map(kb => {
      if (kb.id !== kbId) return kb;
      return { ...kb, documents: kb.documents.filter(d => d.id !== docId), documentsCount: kb.documentsCount - 1 };
    }));
  };

  if (selectedKB) {
    return (
      <KBDetail
        kb={selectedKB}
        onBack={() => setSelectedKBId(null)}
        onAddDocs={handleAddDocs}
        onDeleteDoc={handleDeleteDoc}
        onAddUrl={handleAddUrl}
      />
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Knowledge Bases</h1>
          <p className="text-sm text-slate-500 mt-0.5">Attach document collections to AI flows and assistants</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg text-sm font-medium transition"
        >
          <Plus className="w-4 h-4" />
          New Knowledge Base
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kbs.map(kb => (
          <div key={kb.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-sm transition-shadow">
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-700 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <Badge variant={statusVariant[kb.status]}>{kb.status}</Badge>
              </div>
              <h3 className="font-medium text-slate-800 mb-1">{kb.name}</h3>
              <p className="text-sm text-slate-500 mb-3 line-clamp-2">{kb.description}</p>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" />{kb.documentsCount} documents</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Updated {kb.lastUpdated}</span>
              </div>
            </div>
            <div className="px-4 pb-4 flex gap-2">
              <button
                onClick={() => setSelectedKBId(kb.id)}
                className="flex-1 px-3 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg text-sm font-medium transition"
              >
                Manage Documents
              </button>
              <button
                onClick={() => handleDelete(kb.id)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={() => setShowCreateModal(true)}
          className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-accent-400 hover:text-accent-500 transition-colors min-h-[180px]"
        >
          <div className="w-10 h-10 rounded-lg border-2 border-dashed border-current flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium">New Knowledge Base</span>
        </button>
      </div>

      {showCreateModal && (
        <CreateKBModal onClose={() => setShowCreateModal(false)} onCreate={handleCreate} />
      )}
    </div>
  );
}
