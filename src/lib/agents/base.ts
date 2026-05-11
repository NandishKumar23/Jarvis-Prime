import type { Agent, ChatMessage } from '@/lib/types'

/**
 * Base Agent Interface
 * All domain-specific agents implement this interface
 */
export interface BaseAgent {
  name: Agent
  description: string
  execute(task: string, context?: ChatMessage[]): Promise<string>
}

/**
 * Agent Registry
 * Maps agent names to their implementations
 */
export const agentRegistry = new Map<Agent, BaseAgent>()

export function registerAgent(agent: BaseAgent) {
  agentRegistry.set(agent.name, agent)
}

export function getAgent(name: Agent): BaseAgent | undefined {
  return agentRegistry.get(name)
}
