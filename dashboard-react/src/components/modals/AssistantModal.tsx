import { useState } from 'react';
import { Bot, Wrench, Settings2, UserPlus, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';

interface AssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  assistantId?: string | null;
}

const webhooks = [
  { id: 'none', name: 'None' },
  { id: 'wh-1', name: 'Post-conversation Analytics' },
  { id: 'wh-2', name: 'CRM Sync' },
  { id: 'wh-3', name: 'Slack Notification' },
];

const languages = ['Romanian', 'Spanish', 'English', 'Portuguese', 'French', 'Italian'];

export function AssistantModal({ isOpen, onClose, assistantId }: AssistantModalProps) {
  const [greetingMessage, setGreetingMessage] = useState(
    'Bună ziua! Sunt asistentul de suport Aloro. Cu ce vă pot ajuta astăzi?'
  );
  const [prompt, setPrompt] = useState(
    `You are a support assistant for Horeca Software. Your goals:
- Diagnose POS and server issues reported by restaurant clients
- Trigger the appropriate API endpoints to restart services or check server health
- Escalate to a human agent when the issue cannot be resolved automatically
- Always reply in the same language the customer uses

Available actions: check_server_status, restart_pos, validate_license, create_support_ticket`
  );
  const [language, setLanguage] = useState('Romanian');
  const [humanHandoffEnabled, setHumanHandoffEnabled] = useState(true);
  const [whenToHandoff, setWhenToHandoff] = useState(
    'Hand off to a human agent when the customer requests it, or when 3 automated resolution attempts have failed'
  );
  const [endConvEnabled, setEndConvEnabled] = useState(true);
  const [whenToEnd, setWhenToEnd] = useState(
    'End the conversation when the issue is resolved and the customer confirms satisfaction'
  );
  const [postConvWebhook, setPostConvWebhook] = useState('wh-1');
  const [followUpMessage, setFollowUpMessage] = useState(
    'Hola {name}, ¿pudiste resolver el problema con tu sistema? Estamos aquí si necesitas más ayuda.'
  );
  const [responseTimeout, setResponseTimeout] = useState(24);

  const isNew = !assistantId;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>{isNew ? 'Create Agent' : 'Edit Agent'}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="flex flex-col flex-1 overflow-hidden">
          <TabsList className="border-b rounded-none bg-transparent h-auto px-6 justify-start gap-0 pb-0">
            <TabsTrigger value="general" className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm">
              <Bot className="w-4 h-4" /> General
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm">
              <Wrench className="w-4 h-4" /> Tools
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm">
              <Settings2 className="w-4 h-4" /> Advanced
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto">
            <TabsContent value="general" className="p-6 mt-0 space-y-6">
              <div className="space-y-1.5">
                <Label>Agent Name</Label>
                <Input
                  defaultValue={isNew ? '' : 'Horeca Support Bot'}
                  placeholder="e.g. Horeca Support Bot"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(lang => (
                      <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Greeting Message</Label>
                <Textarea
                  value={greetingMessage}
                  onChange={e => setGreetingMessage(e.target.value)}
                  rows={2}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">Sent when a new conversation starts</p>
              </div>

              <div className="space-y-1.5">
                <Label>System Prompt</Label>
                <Textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  rows={8}
                  className="font-mono resize-y"
                  style={{ minHeight: '150px' }}
                />
                <p className="text-xs text-muted-foreground">Define the chatbot's behavior, goals, and available actions</p>
              </div>
            </TabsContent>

            <TabsContent value="tools" className="p-6 mt-0 space-y-6">
              {/* Human Handoff */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Human Handoff</span>
                  </div>
                  <Switch
                    checked={humanHandoffEnabled}
                    onCheckedChange={setHumanHandoffEnabled}
                  />
                </div>
                {humanHandoffEnabled && (
                  <div className="space-y-1">
                    <Label className="text-xs">When to hand off</Label>
                    <Textarea
                      value={whenToHandoff}
                      onChange={e => setWhenToHandoff(e.target.value)}
                      rows={3}
                      className="resize-none bg-background"
                    />
                  </div>
                )}
              </div>

              {/* End Conversation */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">End Conversation</span>
                  </div>
                  <Switch
                    checked={endConvEnabled}
                    onCheckedChange={setEndConvEnabled}
                  />
                </div>
                {endConvEnabled && (
                  <div className="space-y-1">
                    <Label className="text-xs">When to end</Label>
                    <Textarea
                      value={whenToEnd}
                      onChange={e => setWhenToEnd(e.target.value)}
                      rows={2}
                      className="resize-none bg-background"
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="p-6 mt-0 space-y-6">
              <div className="space-y-1.5">
                <Label>Post-conversation Webhook</Label>
                <Select value={postConvWebhook} onValueChange={setPostConvWebhook}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {webhooks.map(wh => (
                      <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Triggered when a conversation ends</p>
              </div>

              <div className="space-y-1.5">
                <Label>Follow-up Message</Label>
                <Textarea
                  value={followUpMessage}
                  onChange={e => setFollowUpMessage(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Sent if customer goes silent. Use {'{name}'} for contact name.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label>Conversation Timeout (hours)</Label>
                <Input
                  type="number"
                  value={responseTimeout}
                  onChange={e => setResponseTimeout(Number(e.target.value))}
                  min={1}
                  max={72}
                />
                <p className="text-xs text-muted-foreground">Auto-close conversation after this many hours of inactivity</p>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="px-6 py-4 border-t bg-muted/30">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button>{isNew ? 'Create Agent' : 'Save Changes'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
