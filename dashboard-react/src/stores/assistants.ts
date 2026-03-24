import { create } from 'zustand';
import type { SupportAgent } from '../types';

interface AssistantsState {
  agents: SupportAgent[];
  selectedAgent: SupportAgent | null;
  isLoading: boolean;
  error: string | null;

  setAgents: (agents: SupportAgent[]) => void;
  selectAgent: (agent: SupportAgent | null) => void;
  addAgent: (agent: SupportAgent) => void;
  updateAgent: (id: string, data: Partial<SupportAgent>) => void;
  removeAgent: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAssistantsStore = create<AssistantsState>((set) => ({
  agents: [],
  selectedAgent: null,
  isLoading: false,
  error: null,

  setAgents: (agents) => set({ agents }),
  selectAgent: (agent) => set({ selectedAgent: agent }),
  addAgent: (agent) =>
    set((state) => ({ agents: [...state.agents, agent] })),
  updateAgent: (id, data) =>
    set((state) => ({
      agents: state.agents.map((a) => (a.id === id ? { ...a, ...data } : a)),
      selectedAgent:
        state.selectedAgent?.id === id
          ? { ...state.selectedAgent, ...data }
          : state.selectedAgent,
    })),
  removeAgent: (id) =>
    set((state) => ({
      agents: state.agents.filter((a) => a.id !== id),
      selectedAgent: state.selectedAgent?.id === id ? null : state.selectedAgent,
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
