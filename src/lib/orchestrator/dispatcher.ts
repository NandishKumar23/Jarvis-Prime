import { CommsAgent } from '@/lib/agents/comms'
import { FinanceAgent } from '@/lib/agents/finance'
import { FitnessAgent } from '@/lib/agents/fitness'
import { HealthAgent } from '@/lib/agents/health'
import { KnowledgeAgent } from '@/lib/agents/knowledge'
import type { Agent, AgentResponse, OrchestratorResponse } from '@/lib/types'

// Agent registry
const AGENT_MAP = {
  knowledge: KnowledgeAgent,
  finance: FinanceAgent,
  fitness: FitnessAgent,
  health: HealthAgent,
  comms: CommsAgent,
}

/**
 * Dispatcher: Executes tasks across multiple agents in parallel
 * Handles agent invocation and collects responses
 */
export async function dispatch(routing: OrchestratorResponse): Promise<AgentResponse[]> {
  const { agents, tasks } = routing

  console.log('📤 Dispatching to agents:', agents)

  // Execute all agent tasks in parallel
  const responses = await Promise.all(
    agents.map(async (agent) => {
      const task = tasks[agent]
      return executeAgent(agent, task)
    }),
  )

  return responses
}

async function executeAgent(agent: Agent, task: string): Promise<AgentResponse> {
  console.log(`🤖 Executing ${agent} agent with task:`, task)

  try {
    const agentImpl = AGENT_MAP[agent]
    const response = await agentImpl.execute(task)

    return {
      agent,
      response,
      metadata: {
        timestamp: new Date().toISOString(),
        status: 'success',
      },
    }
  } catch (error) {
    console.error(`❌ Error executing ${agent} agent:`, error)

    return {
      agent,
      response: `Sorry, I encountered an error while processing your ${agent} request. Please try again.`,
      metadata: {
        timestamp: new Date().toISOString(),
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    }
  }
}
