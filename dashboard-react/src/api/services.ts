import { apiClient } from './client';
import type { Conversation, WhatsAppSender, WhatsAppTemplate, WhatsAppFlow, KnowledgeBase, Webhook, PhoneNumber } from '../types';

// Conversations
export const conversationsApi = {
  getAll: async (params?: { source?: string; assistantId?: string }) => {
    const { data } = await apiClient.get<{ conversations: Conversation[]; total: number }>('/conversations', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<Conversation>(`/conversations/${id}`);
    return data;
  },

  getMessages: async (id: string) => {
    const { data } = await apiClient.get(`/conversations/${id}/messages`);
    return data;
  },
};

// WhatsApp
export const whatsappApi = {
  getSenders: async () => {
    const { data } = await apiClient.get<WhatsAppSender[]>('/whatsapp/senders');
    return data;
  },

  addSender: async (number: string, displayName: string) => {
    const { data } = await apiClient.post<WhatsAppSender>('/whatsapp/senders', { number, displayName });
    return data;
  },

  verifySender: async (id: string, code: string) => {
    const { data } = await apiClient.post(`/whatsapp/senders/${id}/verify`, { code });
    return data;
  },

  getTemplates: async () => {
    const { data } = await apiClient.get<WhatsAppTemplate[]>('/whatsapp/templates');
    return data;
  },

  createTemplate: async (template: Partial<WhatsAppTemplate> & { body: string }) => {
    const { data } = await apiClient.post<WhatsAppTemplate>('/whatsapp/templates', template);
    return data;
  },

  getFlows: async () => {
    const { data } = await apiClient.get<WhatsAppFlow[]>('/whatsapp/flows');
    return data;
  },

  getFlow: async (id: string) => {
    const { data } = await apiClient.get<WhatsAppFlow>(`/whatsapp/flows/${id}`);
    return data;
  },

  createFlow: async (flow: Partial<WhatsAppFlow>) => {
    const { data } = await apiClient.post<WhatsAppFlow>('/whatsapp/flows', flow);
    return data;
  },

  updateFlow: async (id: string, flow: Partial<WhatsAppFlow>) => {
    const { data } = await apiClient.patch<WhatsAppFlow>(`/whatsapp/flows/${id}`, flow);
    return data;
  },

  deleteFlow: async (id: string) => {
    await apiClient.delete(`/whatsapp/flows/${id}`);
  },
};

// Knowledge Bases
export const knowledgeBasesApi = {
  getAll: async () => {
    const { data } = await apiClient.get<KnowledgeBase[]>('/knowledge-bases');
    return data;
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<KnowledgeBase>(`/knowledge-bases/${id}`);
    return data;
  },

  create: async (name: string, description?: string) => {
    const { data } = await apiClient.post<KnowledgeBase>('/knowledge-bases', { name, description });
    return data;
  },

  uploadDocument: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post(`/knowledge-bases/${id}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/knowledge-bases/${id}`);
  },
};

// Webhooks
export const webhooksApi = {
  getAll: async () => {
    const { data } = await apiClient.get<Webhook[]>('/webhooks');
    return data;
  },

  create: async (webhook: { name: string; url: string; events: string[] }) => {
    const { data } = await apiClient.post<Webhook>('/webhooks', webhook);
    return data;
  },

  update: async (id: string, webhook: Partial<{ name: string; url: string; events: string[]; status: string }>) => {
    const { data } = await apiClient.patch<Webhook>(`/webhooks/${id}`, webhook);
    return data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/webhooks/${id}`);
  },

  test: async (id: string) => {
    const { data } = await apiClient.post(`/webhooks/${id}/test`);
    return data;
  },
};

// Phone Numbers
export const phoneNumbersApi = {
  getAll: async () => {
    const { data } = await apiClient.get<PhoneNumber[]>('/phone-numbers');
    return data;
  },

  search: async (countryCode: string, pattern?: string) => {
    const { data } = await apiClient.get<{ numbers: string[] }>('/phone-numbers/search', {
      params: { countryCode, pattern },
    });
    return data;
  },

  purchase: async (number: string) => {
    const { data } = await apiClient.post<PhoneNumber>('/phone-numbers', { number });
    return data;
  },

  assign: async (id: string, assistantId: string) => {
    const { data } = await apiClient.patch<PhoneNumber>(`/phone-numbers/${id}`, { assistantId });
    return data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/phone-numbers/${id}`);
  },
};
