import { MessageSquare } from 'lucide-react';
import { FlowsTab } from './tabs/FlowsTab';
import { SendersTab } from './tabs/SendersTab';
import { TemplatesTab } from './tabs/TemplatesTab';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export function WhatsAppPage() {
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

      <Tabs defaultValue="flows">
        <TabsList className="border-b border-slate-200 rounded-none bg-transparent h-auto px-0 justify-start gap-0 pb-0 mb-6 w-full">
          <TabsTrigger value="flows" className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent-500 data-[state=active]:text-accent-600 data-[state=active]:bg-transparent px-5 py-3 text-sm font-medium text-slate-500 hover:text-slate-700 transition -mb-px">
            Flows
          </TabsTrigger>
          <TabsTrigger value="senders" className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent-500 data-[state=active]:text-accent-600 data-[state=active]:bg-transparent px-5 py-3 text-sm font-medium text-slate-500 hover:text-slate-700 transition -mb-px">
            Senders
          </TabsTrigger>
          <TabsTrigger value="templates" className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent-500 data-[state=active]:text-accent-600 data-[state=active]:bg-transparent px-5 py-3 text-sm font-medium text-slate-500 hover:text-slate-700 transition -mb-px">
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="flows" className="mt-0">
          <FlowsTab />
        </TabsContent>
        <TabsContent value="senders" className="mt-0">
          <SendersTab />
        </TabsContent>
        <TabsContent value="templates" className="mt-0">
          <TemplatesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
