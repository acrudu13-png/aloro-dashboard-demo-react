import { useState } from 'react';
import { Phone, ChevronRight, Filter } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';

// Mock data
const mockCalls = [
  { id: '1', status: 'completed', phone: '+1 (512) 555-0147', assistant: 'Debt Collection', duration: '4:32', outcome: 'promise', date: 'Today, 11:15' },
  { id: '2', status: 'completed', phone: '+1 (512) 555-0231', assistant: 'Debt Collection', duration: '3:15', outcome: 'escalate', date: 'Yesterday, 16:22' },
  { id: '3', status: 'no-answer', phone: '+1 (737) 555-0389', assistant: 'Sales Outreach', duration: '-', outcome: 'none', date: 'Yesterday, 14:05' },
  { id: '4', status: 'completed', phone: '+1 (512) 555-0462', assistant: 'Debt Collection', duration: '5:47', outcome: 'promise', date: 'Feb 23, 09:30' },
];

const outcomeConfig: Record<string, { variant: 'success' | 'danger' | 'warning' | 'info' | 'default'; label: string }> = {
  promise: { variant: 'success', label: 'Promise' },
  escalate: { variant: 'danger', label: 'Escalate' },
  refused: { variant: 'warning', label: 'Refused' },
  callback: { variant: 'info', label: 'Call Back' },
  none: { variant: 'default', label: 'None' },
};

export function CallsPage() {
  const [expandedCall, setExpandedCall] = useState<string | null>(null);

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Calls</h1>
          <p className="text-sm text-slate-500 mt-0.5">View and manage all call history</p>
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
        {[
          { label: 'Total Calls', value: '1,247' },
          { label: 'Connected', value: '1,113' },
          { label: 'No Answer', value: '98' },
          { label: 'Failed', value: '36' },
          { label: 'Avg Duration', value: '3:42' },
        ].map((stat, i) => (
          <Card key={i} className="p-4">
            <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
            <p className="text-xl font-semibold text-slate-800 mt-1">{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-4 mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Search</label>
            <Input placeholder="Phone number..." />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Assistant</label>
            <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm">
              <option>All</option>
              <option>Debt Collection</option>
              <option>Sales Outreach</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
            <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm">
              <option>All</option>
              <option>Completed</option>
              <option>No Answer</option>
              <option>Failed</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Outcome</label>
            <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm">
              <option>All</option>
              <option>Promise to Pay</option>
              <option>Escalate</option>
              <option>Refused</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
            <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm">
              <option>All time</option>
              <option>Today</option>
              <option>Yesterday</option>
              <option>This week</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Assistant</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Outcome</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockCalls.map((call) => (
              <TableRow
                key={call.id}
                className="cursor-pointer hover:bg-slate-50"
                onClick={() => setExpandedCall(expandedCall === call.id ? null : call.id)}
              >
                <TableCell>
                  <ChevronRight
                    className={`w-3 h-3 text-slate-300 transition-transform ${
                      expandedCall === call.id ? 'rotate-90' : ''
                    }`}
                  />
                </TableCell>
                <TableCell>
                  <Badge variant={call.status === 'completed' ? 'success' : 'default'}>
                    {call.status === 'completed' ? 'Completed' : 'No Answer'}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-slate-700">{call.phone}</TableCell>
                <TableCell className="text-sm text-accent-600 font-medium">{call.assistant}</TableCell>
                <TableCell className="text-sm text-slate-700">{call.duration}</TableCell>
                <TableCell>
                  <Badge variant={outcomeConfig[call.outcome]?.variant || 'default'}>
                    {outcomeConfig[call.outcome]?.label || call.outcome}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-slate-500">{call.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <p className="text-sm text-slate-500">Showing 4 of 1,247 calls</p>
          <div className="flex items-center gap-1">
            <button className="px-2.5 py-1 text-sm text-slate-500 hover:bg-white rounded">
              <Phone className="w-4 h-4" />
            </button>
            <button className="px-2.5 py-1 text-sm text-accent-600 bg-white rounded font-medium">1</button>
            <button className="px-2.5 py-1 text-sm text-slate-500 hover:bg-white rounded">2</button>
            <button className="px-2.5 py-1 text-sm text-slate-500 hover:bg-white rounded">3</button>
          </div>
        </div>
      </Card>
    </div>
  );
}
