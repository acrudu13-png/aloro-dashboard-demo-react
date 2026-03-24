# WhatsApp Customers Page Adaptation Plan

## Overview

The current [`CustomersPage.tsx`](src/pages/CustomersPage.tsx) is designed for a voice agency context with call-related metrics and actions. This plan outlines the changes needed to adapt it for a WhatsApp chatbot customers page.

## Current State Analysis

### Voice Agency Features (to be replaced)

| Feature | Current Implementation |
|---------|----------------------|
| **Metrics** | Total Calls, Answered Calls, Answer Rate, Avg Duration |
| **Statuses** | active, do_not_call, callback, completed |
| **Actions** | Call Now, Schedule Call, Do Not Call, Reactivate |
| **Icons** | Phone, Mail, User |
| **Export Fields** | Name, Phone, Email, Total Calls, Answered, Answer Rate, Avg Duration, Last Contact, Status |

## Target State: WhatsApp Chatbot Customers

### Customer Interface Changes

```typescript
// FROM: Voice Agency Customer
interface Customer {
  id: string;
  name: string | null;
  phone: string;
  email: string | null;
  totalCalls: number;
  answeredCalls: number;
  answerRate: number;
  avgDuration: string;
  lastContact: string;
  status: 'active' | 'do_not_call' | 'callback' | 'completed';
}

// TO: WhatsApp Chatbot Customer
interface WhatsAppCustomer {
  id: string;
  name: string | null;
  phone: string;              // WhatsApp number
  email: string | null;
  totalMessages: number;      // Total messages sent/received
  conversations: number;      // Number of conversation sessions
  avgResponseTime: string;    // Average bot response time
  lastMessage: string;        // Date of last message
  status: 'active' | 'opted_out' | 'blocked' | 'pending';
  // Optional WhatsApp-specific fields
  profileName?: string;       // WhatsApp profile name
  tags?: string[];            // Customer tags/labels
}
```

### Status Configuration Changes

```typescript
// FROM: Voice Agency Statuses
const statusConfig = {
  active: { label: 'Active', variant: 'success' },
  do_not_call: { label: 'Do Not Call', variant: 'danger' },
  callback: { label: 'Call Back', variant: 'warning' },
  completed: { label: 'Completed', variant: 'info' },
};

// TO: WhatsApp Chatbot Statuses
const statusConfig = {
  active: { label: 'Active', variant: 'success' },
  opted_out: { label: 'Opted Out', variant: 'default' },
  blocked: { label: 'Blocked', variant: 'danger' },
  pending: { label: 'Pending', variant: 'warning' },
};
```

### Table Columns Changes

| Current Column | New Column | Description |
|---------------|------------|-------------|
| Total Calls | Total Messages | Messages exchanged |
| Answered | Conversations | Conversation sessions |
| Rate | Response Time | Avg bot response time |
| Avg Duration | - | Remove |
| Last Contact | Last Message | Last message timestamp |
| Status | Status | Updated status values |

### Action Menu Changes

| Current Action | New Action | Description |
|---------------|------------|-------------|
| Call Now | Send Message | Open message dialog |
| Schedule Call | View Conversation | Navigate to conversation |
| Do Not Call | Block | Block customer |
| Reactivate | Unblock | Unblock customer |

### Icon Changes

| Current Icon | New Icon | Usage |
|-------------|----------|-------|
| Phone | MessageSquare | Phone number display |
| - | Zap | Bot indicator |
| Ban | Ban | Block action |
| CheckCircle | CheckCircle | Unblock action |
| Clock | MessageCircle | Response time |

## Implementation Details

### 1. Update Imports

```typescript
// Remove
import { Phone, ... } from 'lucide-react';

// Add
import { 
  MessageSquare, 
  MessageCircle, 
  Zap,
  Ban,
  CheckCircle,
  Eye,
  Send,
  // Keep existing
  Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  Mail, User, MoreHorizontal, Download, Upload
} from 'lucide-react';
```

### 2. Update Mock Data

Replace call-related metrics with message-related metrics:

```typescript
const mockCustomers: WhatsAppCustomer[] = [
  {
    id: '1',
    name: 'Sarah Mitchell',
    phone: '+1 (512) 555-0147',
    email: 'sarah.mitchell@email.com',
    totalMessages: 156,
    conversations: 12,
    avgResponseTime: '1.2s',
    lastMessage: 'Mar 24, 2026',
    status: 'active',
    profileName: 'Sarah M',
    tags: ['premium', 'support'],
  },
  // ... more customers
];
```

### 3. Update Table Headers

```tsx
// Replace table headers
<th>Total Messages</th>      // was Total Calls
<th>Conversations</th>       // was Answered
<th>Avg Response</th>        // was Rate
<th>Last Message</th>        // was Last Contact
```

### 4. Update Table Cells

```tsx
// Phone column - change icon
<MessageSquare className="w-3.5 h-3.5 text-slate-400" />

// Messages column
<td>{customer.totalMessages}</td>

// Conversations column
<td>{customer.conversations}</td>

// Response time column
<span className={`text-sm font-medium ${
  customer.avgResponseTime < 2 ? 'text-green-600' :
  customer.avgResponseTime < 5 ? 'text-amber-600' :
  'text-red-500'
}`}>
  {customer.avgResponseTime}
</span>
```

### 5. Update Action Menu

```tsx
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
```

### 6. Update Export Function

```typescript
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
  // ... rest of export logic
};
```

## Visual Comparison

### Before: Voice Agency Customers Page

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Customers                          [Import CSV] [Export CSV]                │
├─────────────────────────────────────────────────────────────────────────────┤
│ Search by name, phone, or email...                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ Name    │ Phone        │ Email    │ Calls │ Answered │ Rate │ Duration │ ...│
│ Sarah M │ +1 512 555   │ sarah@   │ 12    │ 10       │ 83%  │ 4:32     │ ...│
└─────────────────────────────────────────────────────────────────────────────┘
```

### After: WhatsApp Chatbot Customers Page

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Customers                          [Import CSV] [Export CSV]                │
├─────────────────────────────────────────────────────────────────────────────┤
│ Search by name, phone, or email...                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ Name    │ Phone        │ Email    │ Messages │ Conv │ Response │ Last │ ...│
│ Sarah M │ +1 512 555   │ sarah@   │ 156      │ 12   │ 1.2s     │ Mar24│ ...│
└─────────────────────────────────────────────────────────────────────────────┘
```

## Files to Modify

1. [`src/pages/CustomersPage.tsx`](src/pages/CustomersPage.tsx) - Main page component
   - Update Customer interface
   - Update mock data
   - Update status configuration
   - Update table columns and cells
   - Update action menu
   - Update export function
   - Update icons

## Optional Enhancements

Consider adding these WhatsApp-specific features:

1. **Tags/Labels Column** - Display customer tags with colored badges
2. **Profile Name** - Show WhatsApp profile name if different from contact name
3. **Opt-in Status** - Show when customer opted in to WhatsApp messages
4. **Quick Message Button** - Direct message input in the table row
5. **Conversation Preview** - Show last message snippet on hover
6. **Bulk Actions** - Select multiple customers for bulk messaging

## Summary

The adaptation involves:
- Changing metrics from call-based to message-based
- Updating statuses to reflect WhatsApp opt-in/opt-out states
- Replacing phone-related actions with messaging actions
- Updating icons to reflect messaging context
- Keeping the same UI structure and patterns

This maintains consistency with the existing design while making the page relevant for WhatsApp chatbot operations.
