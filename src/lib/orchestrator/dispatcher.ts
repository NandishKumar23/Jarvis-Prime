import { CommsAgent } from '@/lib/adk/agents/comms'
import { FinanceAgent } from '@/lib/adk/agents/finance'
import { FitnessAgent } from '@/lib/adk/agents/fitness'
import { HealthAgent } from '@/lib/adk/agents/health'
import { KnowledgeAgent } from '@/lib/adk/agents/knowledge'
import type { Agent, ChatMessage, OrchestratorResponse, StreamEvent } from '@/lib/types'

// Agent registry (Gemini/ADK agents).
const AGENT_MAP = {
  knowledge: KnowledgeAgent,
  finance: FinanceAgent,
  fitness: FitnessAgent,
  health: HealthAgent,
  comms: CommsAgent,
}

/**
 * Streaming dispatcher: runs all selected agents in parallel and multiplexes
 * their token streams into a single ordered sequence of StreamEvents.
 *
 * Emits: routing -> (agent_start, agent_token*, agent_done | error)* -> done
 */
export async function* dispatchStream(
  routing: OrchestratorResponse,
  context?: ChatMessage[],
): AsyncGenerator<StreamEvent> {
  const { agents, tasks } = routing

  yield { type: 'routing', agents }

  // Shared queue used to interleave events from concurrently-running agents.
  const queue: StreamEvent[] = []
  let active = agents.length
  let resolve: (() => void) | null = null

  const wake = () => {
    const r = resolve
    resolve = null
    r?.()
  }

  const push = (event: StreamEvent) => {
    queue.push(event)
    wake()
  }

  for (const agent of agents) {
    void (async () => {
      push({ type: 'agent_start', agent })
      try {
        const agentImpl = AGENT_MAP[agent as Agent]
        for await (const token of agentImpl.streamAgent(tasks[agent], context)) {
          push({ type: 'agent_token', agent, token })
        }
        push({ type: 'agent_done', agent })
      } catch (error) {
        push({
          type: 'error',
          agent,
          message: error instanceof Error ? error.message : 'Unknown error',
        })
      } finally {
        active -= 1
        wake()
      }
    })()
  }

  // Drain the queue as events arrive until every agent has completed.
  while (true) {
    while (queue.length > 0) {
      const event = queue.shift()
      if (event) yield event
    }
    if (active === 0) break
    await new Promise<void>((r) => {
      resolve = r
    })
  }

  yield { type: 'done' }
}
