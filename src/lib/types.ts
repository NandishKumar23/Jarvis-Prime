// Agent type definitions
export const AGENTS = ['knowledge', 'finance', 'fitness', 'health', 'comms'] as const
export type Agent = (typeof AGENTS)[number]

export interface OrchestratorResponse {
  agents: Agent[]
  tasks: Record<Agent, string>
}

export interface AgentResponse {
  agent: Agent
  response: string
  metadata?: Record<string, unknown>
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
  agent?: Agent
}
