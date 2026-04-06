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
import { Calendar, ChevronDown, Zap, Timer, MessageSquare, Database } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../components/ui/table';

// Performance metrics data - last 14 days
const performanceData = [
  { name: 'Feb 12', llmTTFT: 0.8, ttsTTFB: 0.3, e2eLatency: 1.2, tokensPerCall: 245, cachedPercent: 35 },
  { name: 'Feb 13', llmTTFT: 0.7, ttsTTFB: 0.28, e2eLatency: 1.1, tokensPerCall: 252, cachedPercent: 38 },
  { name: 'Feb 14', llmTTFT: 0.9, ttsTTFB: 0.32, e2eLatency: 1.3, tokensPerCall: 268, cachedPercent: 32 },
  { name: 'Feb 15', llmTTFT: 0.75, ttsTTFB: 0.25, e2eLatency: 1.05, tokensPerCall: 238, cachedPercent: 42 },
  { name: 'Feb 16', llmTTFT: 0.85, ttsTTFB: 0.29, e2eLatency: 1.25, tokensPerCall: 255, cachedPercent: 36 },
  { name: 'Feb 17', llmTTFT: 0.65, ttsTTFB: 0.22, e2eLatency: 0.95, tokensPerCall: 228, cachedPercent: 45 },
  { name: 'Feb 18', llmTTFT: 0.78, ttsTTFB: 0.27, e2eLatency: 1.15, tokensPerCall: 242, cachedPercent: 40 },
  { name: 'Feb 19', llmTTFT: 0.82, ttsTTFB: 0.31, e2eLatency: 1.22, tokensPerCall: 261, cachedPercent: 34 },
  { name: 'Feb 20', llmTTFT: 0.72, ttsTTFB: 0.26, e2eLatency: 1.08, tokensPerCall: 248, cachedPercent: 39 },
  { name: 'Feb 21', llmTTFT: 0.68, ttsTTFB: 0.24, e2eLatency: 1.0, tokensPerCall: 235, cachedPercent: 44 },
  { name: 'Feb 22', llmTTFT: 0.88, ttsTTFB: 0.33, e2eLatency: 1.28, tokensPerCall: 272, cachedPercent: 30 },
  { name: 'Feb 23', llmTTFT: 0.76, ttsTTFB: 0.28, e2eLatency: 1.12, tokensPerCall: 250, cachedPercent: 37 },
  { name: 'Feb 24', llmTTFT: 0.71, ttsTTFB: 0.25, e2eLatency: 1.02, tokensPerCall: 240, cachedPercent: 41 },
  { name: 'Feb 25', llmTTFT: 0.74, ttsTTFB: 0.26, e2eLatency: 1.06, tokensPerCall: 245, cachedPercent: 43 },
];

const assistants = [
  { id: 'all', name: 'All Assistants' },
  { id: 'debt-collection', name: 'Debt Collection' },
  { id: 'sales-outreach', name: 'Sales Outreach' },
  { id: 'customer-support', name: 'Customer Support' },
];

type TimeFrame = '7d' | '30d' | 'custom';
type MetricKey = 'llmTTFT' | 'ttsTTFB' | 'e2eLatency' | 'tokensPerCall' | 'cachedPercent';

export function InsightsPage() {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('7d');
  const [selectedAssistant, setSelectedAssistant] = useState('all');
  const [showAssistantDropdown, setShowAssistantDropdown] = useState(false);
  const [activeMetrics, setActiveMetrics] = useState<MetricKey[]>(['llmTTFT', 'e2eLatency']);

  const toggleMetric = (key: MetricKey) => {
    setActiveMetrics(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const metricConfig: { key: MetricKey; label: string; color: string; unit: string; icon: typeof Zap }[] = [
    { key: 'llmTTFT', label: 'Avg LLM TTFT', color: '#3b82f6', unit: 's', icon: Zap },
    { key: 'ttsTTFB', label: 'Avg TTS TTFB', color: '#10b981', unit: 's', icon: Timer },
    { key: 'e2eLatency', label: 'Avg E2E Latency', color: '#8b5cf6', unit: 's', icon: MessageSquare },
    { key: 'tokensPerCall', label: 'Avg Tokens/Call', color: '#f59e0b', unit: '', icon: Database },
    { key: 'cachedPercent', label: 'Cached Tokens %', color: '#ef4444', unit: '%', icon: Database },
  ];

  // Stats summary
  const stats = [
    { label: 'Avg LLM TTFT', value: '0.76s', change: '-5%', isPositive: true },
    { label: 'Avg TTS TTFB', value: '0.27s', change: '-3%', isPositive: true },
    { label: 'Avg E2E Latency', value: '1.12s', change: '-8%', isPositive: true },
    { label: 'Avg Tokens/Call', value: '248', change: '+2%', isPositive: false },
    { label: 'Cache Hit Rate', value: '38%', change: '+12%', isPositive: true },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Call Insights</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Performance metrics and analytics</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Time Frame Selector */}
          <div className="flex items-center bg-muted rounded-lg p-1">
            {(['7d', '30d', 'custom'] as TimeFrame[]).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeFrame(tf)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                  timeFrame === tf
                    ? 'bg-background shadow text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tf === 'custom' ? 'Custom' : tf}
              </button>
            ))}
          </div>

          {/* Assistant Dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowAssistantDropdown(!showAssistantDropdown)}
              className="flex items-center gap-2 h-9 text-sm"
            >
              <Calendar className="w-4 h-4 text-slate-400" />
              {assistants.find(a => a.id === selectedAssistant)?.name}
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </Button>
            {showAssistantDropdown && (
              <div className="absolute right-0 mt-1 w-48 bg-background border rounded-lg shadow-lg z-10">
                {assistants.map(assistant => (
                  <button
                    key={assistant.id}
                    onClick={() => {
                      setSelectedAssistant(assistant.id);
                      setShowAssistantDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 ${
                      selectedAssistant === assistant.id ? 'text-accent-600 bg-accent-50' : 'text-slate-700'
                    }`}
                  >
                    {assistant.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
            <div className="flex items-end justify-between">
              <span className="text-lg font-semibold text-slate-800">{stat.value}</span>
              <span className={`text-xs font-medium ${stat.isPositive ? 'text-green-600' : 'text-red-500'}`}>
                {stat.change}
              </span>
            </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Metrics Chart */}
      <Card className="mb-6"><CardContent className="p-4 lg:p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">Performance Metrics Over Time</h2>
        </div>
        
        {/* Metric Toggle Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {metricConfig.map(metric => (
            <button
              key={metric.key}
              onClick={() => toggleMetric(metric.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition ${
                activeMetrics.includes(metric.key)
                  ? 'border-transparent text-white'
                  : 'border-border text-muted-foreground hover:bg-muted'
              }`}
              style={activeMetrics.includes(metric.key) ? { backgroundColor: metric.color } : {}}
            >
              <metric.icon className="w-3 h-3" />
              {metric.label}
            </button>
          ))}
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend />
              {metricConfig.map(metric =>
                activeMetrics.includes(metric.key) && (
                  <Line
                    key={metric.key}
                    type="monotone"
                    dataKey={metric.key}
                    name={metric.label}
                    stroke={metric.color}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                )
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent></Card>

      {/* Detailed Metrics Table */}
      <Card>
        <CardHeader className="p-4 pb-0 border-b">
          <h2 className="text-sm font-semibold">Detailed Metrics</h2>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>LLM TTFT</TableHead>
                <TableHead>TTS TTFB</TableHead>
                <TableHead>E2E Latency</TableHead>
                <TableHead>Tokens/Call</TableHead>
                <TableHead>Cache %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {performanceData.slice(-7).map((row, i) => (
                <TableRow key={i}>
                  <TableCell className="text-sm">{row.name}</TableCell>
                  <TableCell className="text-sm">{row.llmTTFT}s</TableCell>
                  <TableCell className="text-sm">{row.ttsTTFB}s</TableCell>
                  <TableCell className="text-sm">{row.e2eLatency}s</TableCell>
                  <TableCell className="text-sm">{row.tokensPerCall}</TableCell>
                  <TableCell className="text-sm">
                    <span className={`font-medium ${row.cachedPercent >= 40 ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {row.cachedPercent}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
