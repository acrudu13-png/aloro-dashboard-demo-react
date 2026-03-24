import {
  MessageSquare,
  CheckCircle,
  UserPlus,
  Clock,
  MessageCircle,
  Zap,
} from 'lucide-react';
import { KPICard } from '../components/ui/KPICard';
import { Badge } from '../components/ui/Badge';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// Mock data — last 7 days
const chartData = [
  { name: 'Mon', conversations: 42, resolved: 38, handoffs: 2, botOnly: 36 },
  { name: 'Tue', conversations: 67, resolved: 61, handoffs: 4, botOnly: 57 },
  { name: 'Wed', conversations: 35, resolved: 31, handoffs: 1, botOnly: 30 },
  { name: 'Thu', conversations: 81, resolved: 74, handoffs: 5, botOnly: 69 },
  { name: 'Fri', conversations: 59, resolved: 54, handoffs: 3, botOnly: 51 },
  { name: 'Sat', conversations: 28, resolved: 25, handoffs: 1, botOnly: 24 },
  { name: 'Sun', conversations: 14, resolved: 12, handoffs: 0, botOnly: 12 },
];

// Resolution type breakdown
const resolutionData = [
  { name: 'Mon', botResolved: 36, humanHandoff: 2, serverCheck: 8, endpointTrigger: 14 },
  { name: 'Tue', botResolved: 57, humanHandoff: 4, serverCheck: 13, endpointTrigger: 22 },
  { name: 'Wed', botResolved: 30, humanHandoff: 1, serverCheck: 6, endpointTrigger: 10 },
  { name: 'Thu', botResolved: 69, humanHandoff: 5, serverCheck: 18, endpointTrigger: 31 },
  { name: 'Fri', botResolved: 51, humanHandoff: 3, serverCheck: 12, endpointTrigger: 24 },
  { name: 'Sat', botResolved: 24, humanHandoff: 1, serverCheck: 5, endpointTrigger: 9 },
  { name: 'Sun', botResolved: 12, humanHandoff: 0, serverCheck: 2, endpointTrigger: 4 },
];

const kpiData = [
  {
    title: 'Total Conversations',
    value: '326',
    subtitle: 'vs last week',
    icon: MessageSquare,
    iconBgColor: 'bg-green-100',
    iconColor: 'text-green-600',
    trend: { value: 18.4, isPositive: true },
  },
  {
    title: 'Bot Resolution Rate',
    value: '91.4%',
    subtitle: 'resolved without human',
    icon: CheckCircle,
    iconBgColor: 'bg-accent-100',
    iconColor: 'text-accent-600',
    trend: { value: 3.1, isPositive: true },
  },
  {
    title: 'Avg. Response Time',
    value: '1.2s',
    subtitle: 'bot reply latency',
    icon: Clock,
    iconBgColor: 'bg-purple-100',
    iconColor: 'text-purple-500',
    trend: { value: 0.3, isPositive: true },
  },
  {
    title: 'Open Tickets',
    value: '17',
    subtitle: 'awaiting resolution',
    icon: MessageCircle,
    iconBgColor: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  {
    title: 'Human Handoffs',
    value: '16',
    subtitle: '4.9% escalation rate',
    subtitleColor: 'text-amber-600',
    icon: UserPlus,
    iconBgColor: 'bg-red-100',
    iconColor: 'text-red-500',
  },
  {
    title: 'Actions Triggered',
    value: '114',
    subtitle: 'endpoint calls this week',
    icon: Zap,
    iconBgColor: 'bg-blue-100',
    iconColor: 'text-blue-500',
    trend: { value: 22.7, isPositive: true },
  },
];

const resolutionSummary = [
  { label: 'Bot Resolved', count: 279, color: 'bg-green-500', bgClass: 'bg-green-50' },
  { label: 'Human Handoff', count: 16, color: 'bg-red-500', bgClass: 'bg-red-50' },
  { label: 'Server Checks', count: 64, color: 'bg-blue-500', bgClass: 'bg-blue-50' },
  { label: 'Endpoint Triggers', count: 114, color: 'bg-purple-500', bgClass: 'bg-purple-50' },
];

const recentConversations = [
  {
    id: '1',
    status: 'resolved',
    contact: '+34 612 345 678',
    chatbot: 'Horeca Support Bot',
    outcome: 'resolved',
    date: 'Today, 11:15',
    summary: 'POS system restart triggered via /restart-pos endpoint. Server status confirmed OK.',
  },
  {
    id: '2',
    status: 'handoff',
    contact: '+34 698 123 456',
    chatbot: 'Horeca Support Bot',
    outcome: 'handoff',
    date: 'Today, 09:42',
    summary: 'Database connection issue — escalated to human agent after 3 failed auto-recovery attempts.',
  },
  {
    id: '3',
    status: 'resolved',
    contact: '+34 611 987 654',
    chatbot: 'Horeca Support Bot',
    outcome: 'resolved',
    date: 'Yesterday, 16:30',
    summary: 'License validation check ran successfully. Invoice sent via webhook.',
  },
];

const outcomeConfig: Record<string, { variant: 'success' | 'danger' | 'warning' | 'info' | 'default'; label: string }> = {
  resolved: { variant: 'success', label: 'Resolved' },
  handoff: { variant: 'danger', label: 'Handoff' },
  pending: { variant: 'warning', label: 'Pending' },
  triggered: { variant: 'info', label: 'Triggered' },
};

type ChartLineKey = 'conversations' | 'resolved' | 'handoffs' | 'botOnly';
type ResolutionLineKey = 'botResolved' | 'humanHandoff' | 'serverCheck' | 'endpointTrigger';

export function Dashboard() {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [activeLines, setActiveLines] = useState<ChartLineKey[]>(['conversations', 'resolved']);
  const [activeResLines, setActiveResLines] = useState<ResolutionLineKey[]>(['botResolved', 'endpointTrigger']);

  const toggleLine = (key: ChartLineKey) => {
    setActiveLines(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const toggleResLine = (key: ResolutionLineKey) => {
    setActiveResLines(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const lineConfig: { key: ChartLineKey; label: string; color: string }[] = [
    { key: 'conversations', label: 'Total Conversations', color: '#3b82f6' },
    { key: 'resolved', label: 'Resolved', color: '#10b981' },
    { key: 'botOnly', label: 'Bot-Only', color: '#8b5cf6' },
    { key: 'handoffs', label: 'Human Handoffs', color: '#ef4444' },
  ];

  const resLineConfig: { key: ResolutionLineKey; label: string; color: string }[] = [
    { key: 'botResolved', label: 'Bot Resolved', color: '#10b981' },
    { key: 'humanHandoff', label: 'Human Handoff', color: '#ef4444' },
    { key: 'serverCheck', label: 'Server Checks', color: '#3b82f6' },
    { key: 'endpointTrigger', label: 'Endpoint Triggers', color: '#8b5cf6' },
  ];

  return (
    <div className="animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 lg:gap-4 mb-6">
        {kpiData.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Conversation Volume Chart */}
        <div className="bg-white rounded-lg p-4 lg:p-5 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700">Conversation Metrics (Last 7 Days)</h2>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {lineConfig.map(line => (
              <button
                key={line.key}
                onClick={() => toggleLine(line.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition ${
                  activeLines.includes(line.key)
                    ? 'border-transparent text-white'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                style={activeLines.includes(line.key) ? { backgroundColor: line.color } : {}}
              >
                {line.label}
              </button>
            ))}
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend />
                {lineConfig.map(line =>
                  activeLines.includes(line.key) && (
                    <Line
                      key={line.key}
                      type="monotone"
                      dataKey={line.key}
                      name={line.label}
                      stroke={line.color}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  )
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resolution Breakdown Chart */}
        <div className="bg-white rounded-lg p-4 lg:p-5 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700">Resolution Breakdown</h2>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {resLineConfig.map(line => (
              <button
                key={line.key}
                onClick={() => toggleResLine(line.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition ${
                  activeResLines.includes(line.key)
                    ? 'border-transparent text-white'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                style={activeResLines.includes(line.key) ? { backgroundColor: line.color } : {}}
              >
                {line.label}
              </button>
            ))}
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={resolutionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend />
                {resLineConfig.map(line =>
                  activeResLines.includes(line.key) && (
                    <Line
                      key={line.key}
                      type="monotone"
                      dataKey={line.key}
                      name={line.label}
                      stroke={line.color}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  )
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {resolutionSummary.map((item, i) => (
          <div
            key={i}
            className={`flex items-center justify-between p-3 rounded-lg ${item.bgClass} border border-slate-100`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${item.color}`} />
              <span className="text-sm text-slate-700">{item.label}</span>
            </div>
            <span className="text-sm font-semibold text-slate-800">{item.count}</span>
          </div>
        ))}
      </div>

      {/* Recent Conversations */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">Recent Conversations</h2>
          <a href="#" className="text-accent-600 font-medium hover:underline text-sm">
            View all →
          </a>
        </div>
        <div className="table-responsive">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-8"></th>
                <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Chatbot</th>
                <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Outcome</th>
                <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentConversations.map((conv) => (
                <>
                  <tr
                    key={conv.id}
                    className="border-b border-slate-50 cursor-pointer hover:bg-slate-50"
                    onClick={() => setExpandedRow(expandedRow === conv.id ? null : conv.id)}
                  >
                    <td className="py-3 px-4">
                      <ChevronRight
                        className={`w-3 h-3 text-slate-300 transition-transform ${
                          expandedRow === conv.id ? 'rotate-90' : ''
                        }`}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={conv.status === 'resolved' ? 'success' : 'danger'}>
                        {conv.status === 'resolved' ? 'Resolved' : 'Handoff'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-700">{conv.contact}</td>
                    <td className="py-3 px-4 text-sm text-accent-600 font-medium">{conv.chatbot}</td>
                    <td className="py-3 px-4">
                      <Badge variant={outcomeConfig[conv.outcome].variant}>
                        {outcomeConfig[conv.outcome].label}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-500">{conv.date}</td>
                  </tr>
                  {expandedRow === conv.id && (
                    <tr key={`${conv.id}-details`} className="bg-slate-50">
                      <td colSpan={6} className="px-4 py-3">
                        <p className="text-xs text-slate-500 mb-1 font-medium">Summary</p>
                        <p className="text-xs text-slate-700">{conv.summary}</p>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
