/**
 * Full-scale Horeca Technical Support demo flow.
 *
 * Flow:  Welcome → Identify Customer (CRM tool) → Identify System
 *        → Branch per system (POS / Inventory / Reservations / Kitchen Display)
 *        → Open Ticket (Oracle RightNow) → Check System Status
 *        → If down: Restart → Re-check → still down? → Escalate
 *        → If up: AI Diagnose & Resolve (KB + tools)
 *        → Resolved? → Update ticket → Done
 *        → Cannot resolve? → Update ticket → Human Handoff
 */
import type { FlowNode, FlowEdge, FlowVariable } from '../../types';

// ── Nodes ──────────────────────────────────────────────────────────────────

export const horecaDemoNodes: FlowNode[] = [
  // ─ Entry ─────────────────────────────────────────────────
  {
    id: 'start-1',
    type: 'start',
    position: { x: 350, y: 50 },
    data: {
      label: 'Welcome',
      nodeType: 'start',
      description: 'Customer messages the Horeca support number on WhatsApp',
    },
  },

  // ─ Step 1: Identify Customer via CRM ─────────────────────
  {
    id: 'ai-identify',
    type: 'ai-conversation',
    position: { x: 300, y: 200 },
    data: {
      label: 'Identify Customer',
      nodeType: 'ai-conversation',
      systemPrompt:
        'Greet the customer. Ask for their restaurant name, email, or client number. Use the CRM lookup tool to find them. Once found, confirm: "Hello {{customer_name}} from {{restaurant_name}}, I found your account."',
      toolIds: ['tool-2'],
      knowledgeBaseIds: [],
      maxTurns: 8,
      exitConditions: [
        {
          id: 'ec-found',
          label: 'Customer Identified',
          type: 'ai-intent',
          operator: 'equals',
          intentDescription:
            'Customer has been positively identified from the CRM database',
          confidenceThreshold: 0.8,
        },
        {
          id: 'ec-notfound',
          label: 'Not Found',
          type: 'ai-intent',
          operator: 'equals',
          intentDescription:
            'Customer could not be found after 2+ attempts',
          confidenceThreshold: 0.7,
        },
      ],
    },
  },

  // ─ Not found branch ──────────────────────────────────────
  {
    id: 'msg-notfound',
    type: 'send-message',
    position: { x: 620, y: 380 },
    data: {
      label: 'Not Found Message',
      nodeType: 'send-message',
      messageBody:
        'I apologize, but I could not locate your account. Please contact support directly at support@horecasoftware.com or +1-888-HORECA-1.',
    },
  },
  {
    id: 'end-notfound',
    type: 'end',
    position: { x: 640, y: 510 },
    data: {
      label: 'End (Not Found)',
      nodeType: 'end',
      description: 'Customer could not be identified — conversation closed',
    },
  },

  // ─ Step 2: Identify Which System Has the Issue ───────────
  {
    id: 'ai-system',
    type: 'ai-conversation',
    position: { x: 280, y: 400 },
    data: {
      label: 'Identify System',
      nodeType: 'ai-conversation',
      systemPrompt:
        'The customer is {{customer_name}} from {{restaurant_name}}. Ask which system is experiencing issues. The four systems are:\n1. POS System (Point of Sale)\n2. Inventory Management\n3. Reservation System\n4. Kitchen Display\n\nOnce identified, set the variable target_system to one of: pos, inventory, reservations, kitchen.',
      toolIds: [],
      knowledgeBaseIds: ['kb-1'],
      maxTurns: 6,
      exitConditions: [
        {
          id: 'ec-pos',
          label: 'POS System',
          type: 'variable',
          operator: 'equals',
          variable: 'target_system',
          value: 'pos',
        },
        {
          id: 'ec-inventory',
          label: 'Inventory Mgmt',
          type: 'variable',
          operator: 'equals',
          variable: 'target_system',
          value: 'inventory',
        },
        {
          id: 'ec-reservations',
          label: 'Reservations',
          type: 'variable',
          operator: 'equals',
          variable: 'target_system',
          value: 'reservations',
        },
        {
          id: 'ec-kitchen',
          label: 'Kitchen Display',
          type: 'variable',
          operator: 'equals',
          variable: 'target_system',
          value: 'kitchen',
        },
      ],
    },
  },

  // ─ Step 3: Open Ticket in Oracle RightNow ────────────────
  {
    id: 'tool-ticket',
    type: 'tool-call',
    position: { x: 300, y: 620 },
    data: {
      label: 'Open Ticket (Oracle RightNow)',
      nodeType: 'tool-call',
      toolId: 'tool-1',
      inputMapping: {
        subject: '{{target_system}} issue — {{restaurant_name}}',
        description: '{{issue_description}}',
        priority: '{{priority}}',
        customer_email: '{{customer_email}}',
        customer_id: '{{customer_id}}',
        system: '{{target_system}}',
      },
      outputMapping: {
        ticket_id: 'ticketId',
        ticket_url: 'ticketUrl',
      },
    },
  },
  {
    id: 'msg-ticket',
    type: 'send-message',
    position: { x: 300, y: 760 },
    data: {
      label: 'Ticket Confirmation',
      nodeType: 'send-message',
      messageBody:
        'I have created ticket #{{ticket_id}} for your {{target_system}} issue. Let me investigate the system status now.',
    },
  },

  // ─ Step 4: Check System Status ───────────────────────────
  {
    id: 'tool-check-status',
    type: 'tool-call',
    position: { x: 300, y: 900 },
    data: {
      label: 'Check System Status',
      nodeType: 'tool-call',
      toolId: 'tool-4',
      inputMapping: {
        system: '{{target_system}}',
        customer_id: '{{customer_id}}',
      },
      outputMapping: {
        system_status: 'status',
        uptime: 'uptime',
        last_error: 'lastError',
      },
    },
  },

  // ─ Step 5: Branch on system status ───────────────────────
  {
    id: 'cond-status',
    type: 'condition',
    position: { x: 300, y: 1040 },
    data: {
      label: 'System Running?',
      nodeType: 'condition',
      conditions: [
        {
          id: 'cond-up',
          label: 'System Running',
          type: 'variable',
          operator: 'equals',
          variable: 'system_status',
          value: 'running',
        },
        {
          id: 'cond-down',
          label: 'System Down',
          type: 'variable',
          operator: 'not_equals',
          variable: 'system_status',
          value: 'running',
        },
      ],
    },
  },

  // ─ Step 5a: System is DOWN → Restart ─────────────────────
  {
    id: 'msg-restarting',
    type: 'send-message',
    position: { x: 560, y: 1140 },
    data: {
      label: 'Restarting Notice',
      nodeType: 'send-message',
      messageBody:
        'The {{target_system}} system is down. I will attempt to restart it automatically. One moment please...',
    },
  },
  {
    id: 'tool-restart',
    type: 'tool-call',
    position: { x: 560, y: 1280 },
    data: {
      label: 'Restart System',
      nodeType: 'tool-call',
      toolId: 'tool-5',
      inputMapping: {
        system: '{{target_system}}',
        customer_id: '{{customer_id}}',
      },
      outputMapping: {
        restart_result: 'result',
      },
    },
  },
  {
    id: 'wait-restart',
    type: 'wait-for-input',
    position: { x: 560, y: 1400 },
    data: {
      label: 'Wait for Restart (30s)',
      nodeType: 'wait-for-input',
      promptMessage: 'Restart in progress... I will check the status in 30 seconds.',
      variableName: '_restart_ack',
      timeout: 30,
      timeoutAction: 'advance',
    },
  },
  {
    id: 'tool-recheck',
    type: 'tool-call',
    position: { x: 560, y: 1520 },
    data: {
      label: 'Re-check Status',
      nodeType: 'tool-call',
      toolId: 'tool-4',
      inputMapping: {
        system: '{{target_system}}',
        customer_id: '{{customer_id}}',
      },
      outputMapping: {
        system_status: 'status',
      },
    },
  },

  // ─ Step 5b: Re-check condition ───────────────────────────
  {
    id: 'cond-recheck',
    type: 'condition',
    position: { x: 560, y: 1650 },
    data: {
      label: 'Restart Successful?',
      nodeType: 'condition',
      conditions: [
        {
          id: 'cond-recovered',
          label: 'System Recovered',
          type: 'variable',
          operator: 'equals',
          variable: 'system_status',
          value: 'running',
        },
        {
          id: 'cond-still-down',
          label: 'Still Down',
          type: 'variable',
          operator: 'not_equals',
          variable: 'system_status',
          value: 'running',
        },
      ],
    },
  },

  // ─ Step 6: AI Diagnose & Resolve (system is running) ─────
  {
    id: 'ai-diagnose',
    type: 'ai-conversation',
    position: { x: 200, y: 1200 },
    data: {
      label: 'Diagnose & Resolve',
      nodeType: 'ai-conversation',
      systemPrompt:
        'Ticket #{{ticket_id}} for {{customer_name}} ({{restaurant_name}}) — {{target_system}} issue.\n\nThe system is running (status: {{system_status}}).\n\nDiagnose the problem using the troubleshooting knowledge base. Guide the customer through resolution steps. You can:\n- Check server status and logs via tools\n- Suggest configuration changes from the KB\n- Walk through step-by-step fixes\n\nIf the customer confirms the issue is resolved, proceed. If you exhaust all options, escalate to human support.',
      toolIds: ['tool-4'],
      knowledgeBaseIds: ['kb-2', 'kb-1'],
      maxTurns: 20,
      exitConditions: [
        {
          id: 'ec-resolved',
          label: 'Issue Resolved',
          type: 'ai-intent',
          operator: 'equals',
          intentDescription:
            'Customer confirms their issue is resolved or the diagnostic shows all clear',
          confidenceThreshold: 0.8,
        },
        {
          id: 'ec-unresolved',
          label: 'Cannot Resolve',
          type: 'ai-intent',
          operator: 'equals',
          intentDescription:
            'AI has exhausted all troubleshooting options, or customer is frustrated and needs a human',
          confidenceThreshold: 0.7,
        },
      ],
    },
  },

  // ─ Resolved path ─────────────────────────────────────────
  {
    id: 'tool-resolve-ticket',
    type: 'tool-call',
    position: { x: 80, y: 1420 },
    data: {
      label: 'Close Ticket (Resolved)',
      nodeType: 'tool-call',
      toolId: 'tool-6',
      inputMapping: {
        ticket_id: '{{ticket_id}}',
        status: 'resolved',
        resolution_notes: '{{resolution_summary}}',
      },
      outputMapping: {},
    },
  },
  {
    id: 'msg-resolved',
    type: 'send-message',
    position: { x: 80, y: 1560 },
    data: {
      label: 'Resolved Message',
      nodeType: 'send-message',
      messageBody:
        'Perfect! Ticket #{{ticket_id}} has been closed as resolved. Thank you for contacting Horeca support, {{customer_name}}. Have a great day!',
    },
  },
  {
    id: 'end-resolved',
    type: 'end',
    position: { x: 100, y: 1690 },
    data: {
      label: 'End (Resolved)',
      nodeType: 'end',
      description: 'Issue resolved successfully — ticket closed',
    },
  },

  // ─ Escalation path ───────────────────────────────────────
  {
    id: 'tool-escalate-ticket',
    type: 'tool-call',
    position: { x: 440, y: 1830 },
    data: {
      label: 'Escalate Ticket',
      nodeType: 'tool-call',
      toolId: 'tool-6',
      inputMapping: {
        ticket_id: '{{ticket_id}}',
        status: 'escalated',
        escalation_reason: '{{escalation_reason}}',
      },
      outputMapping: {},
    },
  },
  {
    id: 'handoff-1',
    type: 'handoff',
    position: { x: 440, y: 1970 },
    data: {
      label: 'Handoff to L2 Support',
      nodeType: 'handoff',
      handoffTarget: 'Level 2 Technical Support',
      handoffMessage:
        'Automatic escalation — Customer: {{customer_name}} ({{restaurant_name}}), Ticket: #{{ticket_id}}, System: {{target_system}}, Reason: {{escalation_reason}}. See conversation transcript attached.',
      includeTranscript: true,
      handoffMetadata: {
        ticket_id: '{{ticket_id}}',
        target_system: '{{target_system}}',
        customer_id: '{{customer_id}}',
      },
    },
  },
];

// ── Edges ──────────────────────────────────────────────────────────────────

export const horecaDemoEdges: FlowEdge[] = [
  // Start → Identify
  { id: 'e-start', source: 'start-1', target: 'ai-identify', animated: true },

  // Identify Customer branches
  { id: 'e-found', source: 'ai-identify', target: 'ai-system', sourceHandle: 'ec-found', label: 'Identified' },
  { id: 'e-notfound', source: 'ai-identify', target: 'msg-notfound', sourceHandle: 'ec-notfound', label: 'Not Found' },
  { id: 'e-notfound-end', source: 'msg-notfound', target: 'end-notfound' },

  // Identify System → 4 branches → all converge to Open Ticket
  { id: 'e-pos', source: 'ai-system', target: 'tool-ticket', sourceHandle: 'ec-pos', label: 'POS' },
  { id: 'e-inv', source: 'ai-system', target: 'tool-ticket', sourceHandle: 'ec-inventory', label: 'Inventory' },
  { id: 'e-res', source: 'ai-system', target: 'tool-ticket', sourceHandle: 'ec-reservations', label: 'Reservations' },
  { id: 'e-kit', source: 'ai-system', target: 'tool-ticket', sourceHandle: 'ec-kitchen', label: 'Kitchen' },

  // Ticket → Message → Check Status
  { id: 'e-ticket-msg', source: 'tool-ticket', target: 'msg-ticket', sourceHandle: 'success', animated: true },
  { id: 'e-msg-check', source: 'msg-ticket', target: 'tool-check-status' },
  { id: 'e-check-cond', source: 'tool-check-status', target: 'cond-status', sourceHandle: 'success' },

  // Condition: running → diagnose, down → restart path
  { id: 'e-cond-up', source: 'cond-status', target: 'ai-diagnose', sourceHandle: 'cond-up', label: 'Running' },
  { id: 'e-cond-down', source: 'cond-status', target: 'msg-restarting', sourceHandle: 'cond-down', label: 'Down' },

  // Restart path
  { id: 'e-restart-msg', source: 'msg-restarting', target: 'tool-restart' },
  { id: 'e-restart-wait', source: 'tool-restart', target: 'wait-restart', sourceHandle: 'success' },
  { id: 'e-wait-recheck', source: 'wait-restart', target: 'tool-recheck' },
  { id: 'e-recheck-cond', source: 'tool-recheck', target: 'cond-recheck', sourceHandle: 'success' },

  // Re-check: recovered → diagnose, still down → escalate
  { id: 'e-recovered', source: 'cond-recheck', target: 'ai-diagnose', sourceHandle: 'cond-recovered', label: 'Recovered' },
  { id: 'e-still-down', source: 'cond-recheck', target: 'tool-escalate-ticket', sourceHandle: 'cond-still-down', label: 'Still Down' },

  // Diagnose branches
  { id: 'e-resolved', source: 'ai-diagnose', target: 'tool-resolve-ticket', sourceHandle: 'ec-resolved', label: 'Resolved' },
  { id: 'e-unresolved', source: 'ai-diagnose', target: 'tool-escalate-ticket', sourceHandle: 'ec-unresolved', label: 'Escalate' },

  // Resolved path
  { id: 'e-resolve-msg', source: 'tool-resolve-ticket', target: 'msg-resolved', sourceHandle: 'success' },
  { id: 'e-resolved-end', source: 'msg-resolved', target: 'end-resolved' },

  // Escalation path
  { id: 'e-escalate-handoff', source: 'tool-escalate-ticket', target: 'handoff-1', sourceHandle: 'success' },
];

// ── Variables ──────────────────────────────────────────────────────────────

export const horecaDemoVariables: FlowVariable[] = [
  { name: 'customer_name', type: 'string', description: 'Customer full name from CRM' },
  { name: 'customer_email', type: 'string', description: 'Customer email address' },
  { name: 'customer_id', type: 'string', description: 'Customer ID in CRM' },
  { name: 'restaurant_name', type: 'string', description: 'Restaurant business name' },
  { name: 'target_system', type: 'string', description: 'Which system: pos, inventory, reservations, kitchen' },
  { name: 'issue_description', type: 'string', description: 'Customer-described issue summary' },
  { name: 'priority', type: 'string', defaultValue: 'medium', description: 'Ticket priority (low/medium/high/critical)' },
  { name: 'ticket_id', type: 'string', description: 'Ticket ID from Oracle RightNow' },
  { name: 'ticket_url', type: 'string', description: 'URL to ticket in Oracle RightNow' },
  { name: 'system_status', type: 'string', description: 'Current status: running / down / degraded' },
  { name: 'restart_result', type: 'string', description: 'Result of restart attempt' },
  { name: 'resolution_summary', type: 'string', description: 'AI-generated resolution summary' },
  { name: 'escalation_reason', type: 'string', description: 'Why the issue could not be resolved' },
];
