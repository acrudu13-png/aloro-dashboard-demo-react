# WhatsApp Agent Architecture Review

**Date:** 2026-03-24
**Context:** Logic review of the WhatsApp technical support chatbot architecture

---

## Current Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      WhatsAppSender                              │
│  (WhatsApp number + Agent config bundled together)              │
├─────────────────────────────────────────────────────────────────┤
│  - number, displayName, status                                   │
│  - agentClassification (technical-support, sales, etc.)         │
│  - persona: { systemPrompt, greeting, fallback, tone }          │
│  - transcriber: { provider, language, contextHints, keywords } │
│  - flowId → points to WhatsAppFlow                               │
│  - sessionTimeoutMinutes, maxConcurrentSessions                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ flowId
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      WhatsAppFlow                                │
├─────────────────────────────────────────────────────────────────┤
│  - agentId (owner)                                               │
│  - nodes: FlowNode[] (start, ai-conversation, tool-call, etc.)  │
│  - edges: FlowEdge[]                                             │
│  - variables: FlowVariable[]                                     │
│  - tools and knowledge bases referenced inside nodes            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Critical Issues

### 1. "Sender" is a confusing name for "Agent"

A "Sender" is really an **Agent** with a WhatsApp number attached. The naming conflates:
- **Channel** (WhatsApp number, web chat, SMS)
- **Agent** (the AI personality, prompts, capabilities)

This will cause problems when you want:
- Same agent on multiple channels (WhatsApp + web)
- Swap numbers without recreating agent config
- Analytics per agent vs per channel

**Solution:**
```
Agent (id, name, persona, classification, tools, knowledgeBases, flows)
  └── Channel (WhatsAppSender, WebChat, SMS) → references Agent
```

---

### 2. Persona is buried inside Sender

`persona: { systemPrompt, greeting, fallback, tone }` is nested in Sender. But:
- Can't reuse personas across agents
- Can't A/B test different personas
- Can't have a "library" of proven personas

**Solution:** `Persona` as a first-class entity that `Agent` references.

---

### 3. Transcriber config on text-based channel

`transcriber` is configured per Sender. But WhatsApp chat is text-based. Transcriber is for:
- Voice calls (Livekit)
- Voice messages (if supported)

**Solution:** Transcriber should be:
- On the **Agent** (if agent handles voice calls)
- Or on a **VoiceChannel** config
- Not on text-based WhatsApp

---

### 4. Flow ownership is bidirectional and confusing

- `WhatsAppFlow.agentId` → flow belongs to agent
- `WhatsAppSender.flowId` → sender points to flow

Which is the source of truth? Can multiple senders share a flow? Can an agent have multiple flows?

**Solution:** 
```
Agent
  └── flows: Flow[] (one-to-many)
       └── Each flow is standalone, agent owns it

Channel (WhatsAppSender)
  └── activeFlowId (which flow is currently active for this channel)
```

---

### 5. Tools and Knowledge Bases are only in flows

Tools and KBs are referenced inside flow nodes (`toolIds`, `knowledgeBaseIds`). But:
- Some tools should be agent-wide (e.g., "check customer status")
- Some KBs should be agent-wide (e.g., product docs)
- Repeating them in every flow node is error-prone

**Solution:**
```
Agent
  ├── tools: Tool[] (agent-level tools, always available)
  ├── knowledgeBases: KnowledgeBase[] (agent-level KBs)
  └── flows: Flow[] (flows can reference agent tools + flow-specific tools)
```

---

## Design Gaps

### 6. No Agent → Assistants relationship

You have `SupportAgent` type but it's not connected to the WhatsApp system. Is `WhatsAppSender` the same as `SupportAgent`? Different?

**Solution:** Clarify the terminology:
- `Agent` = the AI entity (for voice calls, WhatsApp, web, etc.)
- `Assistant` = legacy voice-specific agent (or deprecate)

---

### 7. No versioning / publishing for flows

Flows have `status: 'active' | 'draft' | 'archived'` but no versioning. What happens when you edit an active flow mid-conversation?

**Solution:**
```
Flow
  ├── version: number
  ├── publishedAt: timestamp
  └── draft: FlowNode[] (working copy)
```

---

### 8. No conversation state management

The store has flows, senders, templates — but no `Conversation` state. Where is:
- Current node position?
- Variable values?
- Conversation history?

This is probably handled in the backend (Livekit/your API), but the types should reflect it.

---

## Suggested Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                          Agent                                    │
├──────────────────────────────────────────────────────────────────┤
│  id, name, classification (support, sales, etc.)                 │
│  personaId → Persona                                              │
│  toolIds: string[] (agent-wide tools)                            │
│  knowledgeBaseIds: string[] (agent-wide KBs)                     │
│  flows: Flow[]                                                    │
│  model, temperature (defaults)                                   │
│  sessionTimeout, maxConcurrentSessions                           │
└──────────────────────────────────────────────────────────────────┘
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Persona    │    │    Flow      │    │   Channel    │
├──────────────┤    ├──────────────┤    ├──────────────┤
│ systemPrompt │    │ nodes, edges │    │ WhatsAppSender│
│ greeting     │    │ variables    │    │ WebChatConfig │
│ fallback     │    │ version      │    │ SMSConfig     │
│ tone         │    │ publishedAt  │    │ (points to    │
│ language     │    │              │    │  Agent)       │
└──────────────┘    └──────────────┘    └──────────────┘
```

---

## Summary Table

| Issue | Current | Better |
|-------|---------|--------|
| **Naming** | Sender = Agent | Separate Channel from Agent |
| **Persona** | Nested in Sender | First-class entity, reusable |
| **Transcriber** | On text channel | On voice channel or agent |
| **Flow ownership** | Bidirectional, confusing | Agent owns flows, channel points to active flow |
| **Tools/KBs** | Only in flow nodes | Agent-level + flow-level |
| **Versioning** | None | Flow versioning with draft/published |
| **Conversation state** | Not in types | Should be reflected in frontend types |

---

## Files Referenced

- `/src/types/index.ts` — Core types
- `/src/stores/whatsapp.ts` — Zustand store
- `/src/pages/WhatsApp/tabs/SendersTab.tsx` — Agent configuration UI
- `/src/pages/WhatsApp/demoFlow.ts` — Demo flow definition

---

## Next Steps

When implementing:
1. Refactor `WhatsAppSender` → split into `Agent` + `Channel`
2. Extract `Persona` as first-class entity
3. Move transcriber to appropriate location (voice agent or voice channel)
4. Add flow versioning
5. Clarify Agent vs Assistant terminology
