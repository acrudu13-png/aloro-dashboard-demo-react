// Core types for the Aloro Dashboard

export interface KPIStats {
  totalCalls: number;
  connectedRate: number;
  resolutions: number;
  escalations: number;
  talkTime: string;
}

export interface Call {
  id: string;
  status: 'completed' | 'no-answer' | 'failed';
  phone: string;
  assistant: string;
  duration: string;
  outcome: 'promise' | 'escalate' | 'refused' | 'callback' | 'none';
  date: string;
  variables?: CallVariable[];
}

export interface CallVariable {
  name: string;
  value: string;
  type?: 'promise_date' | 'amount' | 'escalation_reason' | 'priority' | 'other';
}

export interface SupportAgent {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'draft' | 'archived';
  language: string;
  // Core AI config — inherited by all flows
  systemPrompt: string;
  greetingMessage: string;
  fallbackMessage: string;
  model: string;
  temperature: number;
  // Resources available to all flows
  toolIds: string[];
  knowledgeBaseIds: string[];
  // Conversation behavior
  conversationTimeoutHours: number;
  humanHandoff: {
    enabled: boolean;
    condition: string;
  };
  // Post-conversation
  postConversationWebhookId?: string;
  followUpMessage?: string;
  // Flow management
  flowIds: string[];
  activeFlowId?: string;
  // Channel assignment
  whatsappSenderId?: string;
  // Stats (from API in production)
  conversationsCount: number;
  resolutionRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  assistant: string;
  status: 'running' | 'paused' | 'completed' | 'draft';
  totalContacts: number;
  callsMade: number;
  connectedCalls: number;
  successRate: number;
  createdAt: string;
}

// ─── WhatsApp Sender / Agent ────────────────────────────────────────────────

export interface TranscriberConfig {
  provider: 'soniox' | 'deepgram' | 'whisper' | 'google';
  language: string;
  contextHints: string[];
  keywords: string[];
  enablePunctuation: boolean;
  enableProfanityFilter: boolean;
}

export type AgentClassification =
  | 'technical-support'
  | 'customer-service'
  | 'sales'
  | 'onboarding'
  | 'debt-collection'
  | 'scheduling'
  | 'custom';

export interface AgentPersona {
  systemPrompt: string;
  greeting: string;
  fallbackMessage: string;
  language: string;
  tone: 'formal' | 'friendly' | 'neutral';
}

export interface BusinessHours {
  enabled: boolean;
  timezone: string;
  schedule: Record<string, { start: string; end: string } | null>;
  offlineMessage: string;
}

export interface WhatsAppSender {
  id: string;
  number: string;
  displayName: string;
  type: 'platform' | 'cloud-api';
  status: 'online' | 'connecting' | 'pending' | 'offline';
  quality: 'high' | 'medium' | 'low';
  messagesCount: number;
  // Agent configuration
  agentClassification: AgentClassification;
  persona: AgentPersona;
  flowId?: string;
  transcriber: TranscriberConfig;
  sessionTimeoutMinutes: number;
  businessHours?: BusinessHours;
  maxConcurrentSessions?: number;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: 'utility' | 'authentication' | 'marketing';
  language: string;
  status: 'approved' | 'pending' | 'rejected';
  sender: string;
}

export interface Conversation {
  id: string;
  source: 'whatsapp' | 'web' | 'sms';
  customerName: string;
  assistant: string;
  messagesCount: number;
  tokensUsed: number;
  lastMessage: string;
}

export interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  documentsCount: number;
  lastUpdated: string;
  status: 'ready' | 'indexing' | 'error';
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive' | 'error';
  lastTriggered?: string;
}

export interface PhoneNumber {
  id: string;
  number: string;
  type: 'dedicated' | 'shared' | 'sip';
  assignedTo: string;
  status: 'active' | 'inactive';
  monthlyCost: string;
}

// ─── Tools (referenced by flow nodes) ───────────────────────────────────────

export type ToolCategory = 'api' | 'crm' | 'ticketing' | 'notification' | 'data';

export interface ToolParam {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object';
  description: string;
  required: boolean;
  defaultValue?: string;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  status: 'active' | 'inactive';
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  headers: Record<string, string>;
  params: ToolParam[];
  responseMapping?: string;
  usedInFlows: string[];
}

// ─── WhatsApp Flow Builder Types ─────────────────────────────────────────────

export type FlowNodeType =
  | 'start'
  | 'ai-conversation'
  | 'tool-call'
  | 'condition'
  | 'send-message'
  | 'wait-for-input'
  | 'set-variable'
  | 'handoff'
  | 'end'
  // Legacy — kept for backward compat with existing flows
  | 'function';

export interface FlowVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object';
  defaultValue?: string;
  description?: string;
}

export type ConditionType = 'variable' | 'ai-intent' | 'pattern';

export interface FlowCondition {
  id: string;
  label: string;
  type: ConditionType;
  // Variable check
  variable?: string;
  operator: 'contains' | 'equals' | 'not_equals' | 'starts_with' | 'matches_regex'
    | 'greater_than' | 'less_than' | 'is_empty' | 'is_set';
  value?: string;
  // AI Intent
  intentDescription?: string;
  confidenceThreshold?: number;
}

export interface VariableAssignment {
  variable: string;
  expression: string;
}

export interface FlowNodeData extends Record<string, unknown> {
  label: string;
  nodeType: FlowNodeType;
  description?: string;

  // === AI Conversation node ===
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  maxTurns?: number;
  toolIds?: string[];
  knowledgeBaseIds?: string[];
  exitConditions?: FlowCondition[];

  // === Tool Call node ===
  toolId?: string;
  inputMapping?: Record<string, string>;
  outputMapping?: Record<string, string>;

  // === Condition node ===
  conditions?: FlowCondition[];

  // === Send Message node ===
  messageBody?: string;
  templateId?: string;
  mediaUrl?: string;

  // === Wait for Input node ===
  promptMessage?: string;
  variableName?: string;
  timeout?: number;
  timeoutAction?: 'repeat' | 'advance' | 'end';

  // === Set Variable node ===
  assignments?: VariableAssignment[];

  // === Handoff node ===
  handoffTarget?: string;
  handoffMessage?: string;
  includeTranscript?: boolean;
  handoffMetadata?: Record<string, string>;

  // === Legacy Function node (deprecated — use tool-call) ===
  webhookId?: string;
  webhookUrl?: string;
  httpMethod?: 'GET' | 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  requestBody?: string;
}

export interface FlowGlobalSettings {
  agentModel: string;
  temperature: number;
  systemPrompt: string;
  knowledgeBaseIds: string[];
  toolIds: string[];
  globalWebhookId?: string;
  fallbackMessage: string;
  sessionTimeoutMinutes: number;
}

export interface WhatsAppFlow {
  id: string;
  agentId: string;          // which SupportAgent owns this flow
  name: string;
  description: string;
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
  updatedAt: string;
  messagesCount: number;
  nodes: FlowNode[];
  edges: FlowEdge[];
  variables: FlowVariable[];
  version: number;
  lastPublishedAt?: string;
}

// Minimal React Flow-compatible node/edge shapes (avoids importing @xyflow/react in types)
export interface FlowNode {
  id: string;
  type: FlowNodeType;
  position: { x: number; y: number };
  data: FlowNodeData;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  label?: string;
  conditionId?: string;
  animated?: boolean;
}

export interface PromiseDate {
  date: string;
  count: number;
  amount: string;
  isToday?: boolean;
}

export interface OutcomeStats {
  promiseToPay: number;
  partialPayment: number;
  refused: number;
  escalation: number;
  callBack: number;
  noResolution: number;
}
