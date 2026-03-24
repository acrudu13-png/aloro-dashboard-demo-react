import {
  LayoutDashboard,
  Bot,
  MessageSquare,
  Database,
  BookOpen,
  Webhook,
  FileText,
  BarChart3,
  ChevronRight,
  Users,
  Zap,
  MessageCircle,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: string;
}

interface NavCategory {
  label: string;
  items: NavItem[];
}

const navCategories: NavCategory[] = [
  {
    label: 'Analytics',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'insights', label: 'Message Insights', icon: BarChart3 },
    ],
  },
  {
    label: 'Conversations',
    items: [
      { id: 'conversations', label: 'Conversations', icon: MessageCircle },
      { id: 'customers', label: 'Contacts', icon: Users },
    ],
  },
  {
    label: 'Chatbot Config',
    items: [
      { id: 'assistants', label: 'Support Agents', icon: Bot },
      { id: 'knowledge-bases', label: 'Knowledge Bases', icon: Database },
      { id: 'prompt-snippets', label: 'Message Templates', icon: FileText },
      { id: 'tools', label: 'Tools & Actions', icon: Zap },
    ],
  },
  {
    label: 'Channels',
    items: [
      { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
    ],
  },
  {
    label: 'Integrations',
    items: [
      { id: 'webhooks', label: 'Webhooks', icon: Webhook },
      { id: 'documentation', label: 'Documentation', icon: BookOpen },
    ],
  },
];

export function Sidebar({ currentPage, onNavigate, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-14 bottom-0 w-60 bg-white border-r border-slate-200 overflow-y-auto z-50',
          'transition-transform duration-300',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Organization */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">Horeca Support</p>
              <p className="text-xs text-slate-500">WhatsApp Chatbot</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Categorized Navigation */}
        <div className="py-3">
          {navCategories.map((category, catIndex) => (
            <nav key={category.label} className={catIndex > 0 ? 'border-t border-slate-100 pt-3 mt-3' : ''}>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 px-4">
                {category.label}
              </p>
              <ul className="space-y-0.5 px-2">
                {category.items.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        onNavigate(item.id);
                        onClose();
                      }}
                      className={cn(
                        'sidebar-item w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
                        currentPage === item.id
                          ? 'bg-accent-50 text-accent-700 font-medium'
                          : 'text-slate-600 hover:bg-slate-50'
                      )}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded font-medium">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </aside>
    </>
  );
}
