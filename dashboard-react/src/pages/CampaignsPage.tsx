import { Plus, Megaphone, Play, Pause, Calendar, Users, Phone, CheckCircle, UserPlus, TrendingUp } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

interface Campaign {
  id: string;
  name: string;
  assistant: string;
  status: 'running' | 'paused' | 'completed' | 'scheduled';
  startDate: string;
  endDate: string;
  contacts: number;
  calls: number;
  connected: number;
  successRate: number;
  extractedVariables: { name: string; count: number }[];
  humanEscalations: number;
}

const campaigns: Campaign[] = [
  {
    id: '1',
    name: 'Q1 Debt Recovery',
    assistant: 'Debt Collection',
    status: 'running',
    startDate: 'Feb 1, 2026',
    endDate: 'Feb 28, 2026',
    contacts: 1250,
    calls: 847,
    connected: 753,
    successRate: 78,
    extractedVariables: [
      { name: 'Promise Date', count: 234 },
      { name: 'Payment Method', count: 189 },
      { name: 'Amount Confirmed', count: 312 },
    ],
    humanEscalations: 18,
  },
  {
    id: '2',
    name: 'Service Renewal - February',
    assistant: 'Sales Outreach',
    status: 'paused',
    startDate: 'Feb 10, 2026',
    endDate: 'Mar 10, 2026',
    contacts: 500,
    calls: 234,
    connected: 198,
    successRate: 45,
    extractedVariables: [
      { name: 'Renewal Interest', count: 89 },
      { name: 'Upgrade Request', count: 23 },
      { name: 'Callback Scheduled', count: 45 },
    ],
    humanEscalations: 12,
  },
  {
    id: '3',
    name: 'Payment Reminder - Week 8',
    assistant: 'Debt Collection',
    status: 'completed',
    startDate: 'Feb 17, 2026',
    endDate: 'Feb 23, 2026',
    contacts: 320,
    calls: 320,
    connected: 285,
    successRate: 82,
    extractedVariables: [
      { name: 'Promise Date', count: 156 },
      { name: 'Payment Method', count: 134 },
      { name: 'Dispute Filed', count: 8 },
    ],
    humanEscalations: 7,
  },
  {
    id: '4',
    name: 'New Customer Onboarding',
    assistant: 'Customer Support',
    status: 'scheduled',
    startDate: 'Mar 1, 2026',
    endDate: 'Mar 15, 2026',
    contacts: 200,
    calls: 0,
    connected: 0,
    successRate: 0,
    extractedVariables: [],
    humanEscalations: 0,
  },
];

export function CampaignsPage() {
  const progress = (campaign: Campaign) => Math.round((campaign.calls / campaign.contacts) * 100);

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Campaigns</h1>
          <p className="text-sm text-slate-500 mt-0.5">Outbound campaign management</p>
        </div>
        <Button>
          <Plus className="w-4 h-4" />
          New Campaign
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Megaphone className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 mb-1">No campaigns yet</h3>
            <p className="text-sm text-slate-500 mb-5">Create and manage outbound calling campaigns</p>
            <Button>Create Campaign</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="overflow-hidden hover:shadow-md transition-shadow">
              {/* Campaign Header */}
              <div className="p-4 lg:p-5 border-b border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                      <Megaphone className="w-5 h-5 text-accent-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-800">{campaign.name}</h3>
                      <p className="text-xs text-slate-500">Assistant: {campaign.assistant}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      campaign.status === 'running' ? 'success' :
                      campaign.status === 'paused' ? 'warning' :
                      campaign.status === 'completed' ? 'info' : 'default'
                    }>
                      {campaign.status}
                    </Badge>
                    <button className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition">
                      {campaign.status === 'running' ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Campaign Stats */}
              <CardContent className="p-4 lg:p-5">
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-slate-600">Progress</span>
                    <span className="font-medium text-slate-700">{campaign.calls}/{campaign.contacts} calls ({progress(campaign)}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all ${
                        campaign.status === 'completed' ? 'bg-green-500' : 'bg-accent-500'
                      }`}
                      style={{ width: `${progress(campaign)}%` }}
                    />
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Duration</p>
                      <p className="text-sm font-medium text-slate-700">{campaign.startDate.split(',')[0]} - {campaign.endDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Contacts</p>
                      <p className="text-sm font-medium text-slate-700">{campaign.contacts.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Calls Made</p>
                      <p className="text-sm font-medium text-slate-700">{campaign.calls.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-xs text-slate-500">Connected</p>
                      <p className="text-sm font-medium text-green-600">{campaign.connected.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-accent-500" />
                    <div>
                      <p className="text-xs text-slate-500">Success Rate</p>
                      <p className="text-sm font-medium text-accent-600">{campaign.successRate}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-amber-500" />
                    <div>
                      <p className="text-xs text-slate-500">Escalations</p>
                      <p className="text-sm font-medium text-amber-600">{campaign.humanEscalations}</p>
                    </div>
                  </div>
                </div>

                {/* Extracted Variables */}
                {campaign.extractedVariables.length > 0 && (
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-xs font-medium text-slate-500 mb-2">Extracted Variables</p>
                    <div className="flex flex-wrap gap-2">
                      {campaign.extractedVariables.map((v, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-full text-xs"
                        >
                          <span className="text-slate-600">{v.name}</span>
                          <span className="font-semibold text-accent-600">{v.count}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
