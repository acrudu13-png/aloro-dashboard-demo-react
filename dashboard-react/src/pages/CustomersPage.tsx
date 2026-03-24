import { useState, useMemo } from 'react';
import {
  Upload,
  Download,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Mail,
  User,
  MoreHorizontal,
  Ban,
  CheckCircle,
  Eye,
  Send,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';

interface WhatsAppCustomer {
  id: string;
  name: string | null;
  phone: string;
  email: string | null;
  totalMessages: number;
  conversations: number;
  avgResponseTime: string;
  lastMessage: string;
  status: 'active' | 'opted_out' | 'blocked' | 'pending';
}

const mockCustomers: WhatsAppCustomer[] = [
  { id: '1', name: 'Andrei Popescu', phone: '+40 721 234 567', email: 'andrei.popescu@email.com', totalMessages: 156, conversations: 12, avgResponseTime: '1.2s', lastMessage: 'Mar 24, 2026', status: 'active' },
  { id: '2', name: 'Mihai Ionescu', phone: '+40 722 345 678', email: 'mihai.ionescu@email.com', totalMessages: 89, conversations: 8, avgResponseTime: '2.5s', lastMessage: 'Mar 23, 2026', status: 'pending' },
  { id: '3', name: null, phone: '+40 723 456 789', email: null, totalMessages: 34, conversations: 5, avgResponseTime: '1.8s', lastMessage: 'Mar 22, 2026', status: 'active' },
  { id: '4', name: 'Elena Dumitrescu', phone: '+40 724 567 890', email: 'elena.dumitrescu@email.com', totalMessages: 245, conversations: 15, avgResponseTime: '0.9s', lastMessage: 'Mar 24, 2026', status: 'active' },
  { id: '5', name: 'Radu Stanescu', phone: '+40 725 678 901', email: 'radu.stanescu@email.com', totalMessages: 12, conversations: 3, avgResponseTime: '-', lastMessage: 'Mar 18, 2026', status: 'blocked' },
  { id: '6', name: 'Ioana Georgescu', phone: '+40 726 789 012', email: 'ioana.georgescu@email.com', totalMessages: 78, conversations: 7, avgResponseTime: '1.5s', lastMessage: 'Mar 21, 2026', status: 'active' },
  { id: '7', name: null, phone: '+40 727 890 123', email: null, totalMessages: 45, conversations: 4, avgResponseTime: '2.1s', lastMessage: 'Mar 20, 2026', status: 'pending' },
  { id: '8', name: 'Alexandru Marinescu', phone: '+40 728 901 234', email: 'alex.marinescu@email.com', totalMessages: 112, conversations: 9, avgResponseTime: '1.3s', lastMessage: 'Mar 23, 2026', status: 'active' },
  { id: '9', name: 'Cristina Petrescu', phone: '+40 729 012 345', email: 'cristina.petrescu@email.com', totalMessages: 67, conversations: 6, avgResponseTime: '1.7s', lastMessage: 'Mar 22, 2026', status: 'active' },
  { id: '10', name: 'Florin Constantin', phone: '+40 730 123 456', email: null, totalMessages: 8, conversations: 2, avgResponseTime: '3.2s', lastMessage: 'Mar 15, 2026', status: 'opted_out' },
  { id: '11', name: 'Ana-Maria Stoica', phone: '+40 731 234 567', email: 'ana.stoica@email.com', totalMessages: 189, conversations: 11, avgResponseTime: '1.1s', lastMessage: 'Mar 24, 2026', status: 'active' },
  { id: '12', name: null, phone: '+40 732 345 678', email: null, totalMessages: 23, conversations: 1, avgResponseTime: '0.8s', lastMessage: 'Mar 14, 2026', status: 'active' },
  { id: '13', name: 'Dan Vladulescu', phone: '+40 733 456 789', email: 'dan.vladulescu@email.com', totalMessages: 56, conversations: 4, avgResponseTime: '2.8s', lastMessage: 'Mar 19, 2026', status: 'pending' },
  { id: '14', name: 'Maria Neagu', phone: '+40 734 567 890', email: 'maria.neagu@email.com', totalMessages: 98, conversations: 8, avgResponseTime: '1.4s', lastMessage: 'Mar 21, 2026', status: 'active' },
  { id: '15', name: 'Ciprian Dobre', phone: '+40 735 678 901', email: null, totalMessages: 41, conversations: 3, avgResponseTime: '1.9s', lastMessage: 'Mar 20, 2026', status: 'active' },
];

type SortKey = keyof WhatsAppCustomer;
type SortDirection = 'asc' | 'desc';

const statusConfig: Record<WhatsAppCustomer['status'], { label: string; variant: 'success' | 'danger' | 'warning' | 'info' | 'default' }> = {
  active: { label: 'Active', variant: 'success' },
  opted_out: { label: 'Opted Out', variant: 'default' },
  blocked: { label: 'Blocked', variant: 'danger' },
  pending: { label: 'Pending', variant: 'warning' },
};

const ITEMS_PER_PAGE = 10;

export function CustomersPage() {
  const [customers] = useState<WhatsAppCustomer[]>(mockCustomers);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('lastMessage');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showActions, setShowActions] = useState<string | null>(null);

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const query = searchQuery.toLowerCase();
      return (
        customer.phone.toLowerCase().includes(query) ||
        (customer.name?.toLowerCase().includes(query) ?? false) ||
        (customer.email?.toLowerCase().includes(query) ?? false)
      );
    });
  }, [customers, searchQuery]);

  const sortedCustomers = useMemo(() => {
    return [...filteredCustomers].sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];

      // Handle null values
      if (aVal === null) aVal = '';
      if (bVal === null) bVal = '';

      // Handle string comparison
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredCustomers, sortKey, sortDirection]);

  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedCustomers.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedCustomers, currentPage]);

  const totalPages = Math.ceil(sortedCustomers.length / ITEMS_PER_PAGE);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) return null;
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-3 h-3" /> 
      : <ChevronDown className="w-3 h-3" />;
  };

  const handleExport = () => {
    const headers = ['Name', 'Phone', 'Email', 'Total Messages', 'Conversations', 'Avg Response Time', 'Last Message', 'Status'];
    const rows = sortedCustomers.map(c => [
      c.name ?? '',
      c.phone,
      c.email ?? '',
      c.totalMessages,
      c.conversations,
      c.avgResponseTime,
      c.lastMessage,
      c.status
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `whatsapp_customers_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Customers</h1>
          <p className="text-sm text-slate-500 mt-0.5">{sortedCustomers.length} customers in database</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition">
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg text-sm font-medium transition"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th 
                  className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    Name <SortIcon columnKey="name" />
                  </div>
                </th>
                <th 
                  className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                  onClick={() => handleSort('phone')}
                >
                  <div className="flex items-center gap-1">
                    Phone <SortIcon columnKey="phone" />
                  </div>
                </th>
                <th 
                  className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center gap-1">
                    Email <SortIcon columnKey="email" />
                  </div>
                </th>
                <th 
                  className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                  onClick={() => handleSort('totalMessages')}
                >
                  <div className="flex items-center gap-1">
                    Messages <SortIcon columnKey="totalMessages" />
                  </div>
                </th>
                <th 
                  className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                  onClick={() => handleSort('conversations')}
                >
                  <div className="flex items-center gap-1">
                    Conversations <SortIcon columnKey="conversations" />
                  </div>
                </th>
                <th 
                  className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                  onClick={() => handleSort('avgResponseTime')}
                >
                  <div className="flex items-center gap-1">
                    Avg Response <SortIcon columnKey="avgResponseTime" />
                  </div>
                </th>
                <th 
                  className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                  onClick={() => handleSort('lastMessage')}
                >
                  <div className="flex items-center gap-1">
                    Last Message <SortIcon columnKey="lastMessage" />
                  </div>
                </th>
                <th 
                  className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    Status <SortIcon columnKey="status" />
                  </div>
                </th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {paginatedCustomers.map(customer => (
                <tr key={customer.id} className="border-t border-slate-50 hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                        {customer.name ? (
                          <span className="text-xs font-medium text-slate-600">
                            {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </span>
                        ) : (
                          <User className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <span className="text-sm text-slate-700">
                        {customer.name ?? <span className="text-slate-400 italic">Unknown</span>}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      {customer.phone}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {customer.email ? (
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {customer.email}
                      </div>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600">{customer.totalMessages}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">{customer.conversations}</td>
                  <td className="py-3 px-4">
                    <span className={`text-sm font-medium ${
                      customer.avgResponseTime === '-' ? 'text-slate-400' :
                      parseFloat(customer.avgResponseTime) < 2 ? 'text-green-600' :
                      parseFloat(customer.avgResponseTime) < 3 ? 'text-amber-600' :
                      'text-red-500'
                    }`}>
                      {customer.avgResponseTime}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-500">{customer.lastMessage}</td>
                  <td className="py-3 px-4">
                    <Badge variant={statusConfig[customer.status].variant}>
                      {statusConfig[customer.status].label}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 relative">
                    <button 
                      onClick={() => setShowActions(showActions === customer.id ? null : customer.id)}
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {showActions === customer.id && (
                      <div className="absolute right-4 top-full mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                          <Send className="w-4 h-4" />
                          Send Message
                        </button>
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                          <Eye className="w-4 h-4" />
                          View Conversation
                        </button>
                        {customer.status !== 'blocked' ? (
                          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                            <Ban className="w-4 h-4" />
                            Block
                          </button>
                        ) : (
                          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50">
                            <CheckCircle className="w-4 h-4" />
                            Unblock
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {paginatedCustomers.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-500">
                    No customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, sortedCustomers.length)} of {sortedCustomers.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded text-sm font-medium transition ${
                    currentPage === page
                      ? 'bg-accent-500 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
