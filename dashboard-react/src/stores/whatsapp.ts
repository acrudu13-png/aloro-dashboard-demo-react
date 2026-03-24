import { create } from 'zustand';
import type { WhatsAppFlow, WhatsAppSender, WhatsAppTemplate } from '../types';

interface WhatsAppState {
  // Flows (belong to agents via agentId)
  flows: WhatsAppFlow[];
  isLoadingFlows: boolean;
  setFlows: (flows: WhatsAppFlow[]) => void;
  addFlow: (flow: WhatsAppFlow) => void;
  updateFlow: (id: string, data: Partial<WhatsAppFlow>) => void;
  deleteFlow: (id: string) => void;
  setLoadingFlows: (v: boolean) => void;
  getAgentFlows: (agentId: string) => WhatsAppFlow[];

  // Senders (WhatsApp numbers)
  senders: WhatsAppSender[];
  isLoadingSenders: boolean;
  setSenders: (senders: WhatsAppSender[]) => void;
  updateSender: (id: string, data: Partial<WhatsAppSender>) => void;
  setLoadingSenders: (v: boolean) => void;

  // Templates
  templates: WhatsAppTemplate[];
  isLoadingTemplates: boolean;
  setTemplates: (templates: WhatsAppTemplate[]) => void;
  setLoadingTemplates: (v: boolean) => void;
}

export const useWhatsAppStore = create<WhatsAppState>((set, get) => ({
  // Flows
  flows: [],
  isLoadingFlows: false,
  setFlows: (flows) => set({ flows }),
  addFlow: (flow) => set((s) => ({ flows: [...s.flows, flow] })),
  updateFlow: (id, data) =>
    set((s) => ({ flows: s.flows.map((f) => (f.id === id ? { ...f, ...data } : f)) })),
  deleteFlow: (id) => set((s) => ({ flows: s.flows.filter((f) => f.id !== id) })),
  setLoadingFlows: (v) => set({ isLoadingFlows: v }),
  getAgentFlows: (agentId) => get().flows.filter((f) => f.agentId === agentId),

  // Senders
  senders: [],
  isLoadingSenders: false,
  setSenders: (senders) => set({ senders }),
  updateSender: (id, data) =>
    set((s) => ({
      senders: s.senders.map((sender) => (sender.id === id ? { ...sender, ...data } : sender)),
    })),
  setLoadingSenders: (v) => set({ isLoadingSenders: v }),

  // Templates
  templates: [],
  isLoadingTemplates: false,
  setTemplates: (templates) => set({ templates }),
  setLoadingTemplates: (v) => set({ isLoadingTemplates: v }),
}));
