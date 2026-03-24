import { apiClient } from './client';
import type { SupportAgent } from '../types';

export interface CreateAgentDto {
  name: string;
  description?: string;
  language: string;
  systemPrompt?: string;
  greetingMessage?: string;
  model?: string;
  temperature?: number;
  toolIds?: string[];
  knowledgeBaseIds?: string[];
}

export interface UpdateAgentDto extends Partial<CreateAgentDto> {
  status?: SupportAgent['status'];
  activeFlowId?: string;
}

export const assistantsApi = {
  getAll: async () => {
    const { data } = await apiClient.get<SupportAgent[]>('/agents');
    return data;
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<SupportAgent>(`/agents/${id}`);
    return data;
  },

  create: async (dto: CreateAgentDto) => {
    const { data } = await apiClient.post<SupportAgent>('/agents', dto);
    return data;
  },

  update: async (id: string, dto: UpdateAgentDto) => {
    const { data } = await apiClient.patch<SupportAgent>(`/agents/${id}`, dto);
    return data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/agents/${id}`);
  },

  test: async (id: string, message: string) => {
    const { data } = await apiClient.post<{ response: string }>(`/agents/${id}/test`, { message });
    return data;
  },
};
