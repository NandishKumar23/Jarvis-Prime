import { type Event, InMemoryRunner, LlmAgent } from '@google/adk'
import { z } from 'zod'
import type { Agent, OrchestratorResponse } from '@/lib/types'

// Zod schema for the classifier's structured output.
//
// `tasks` is modeled as an array of objects (not a keyed record): Gemini's
// structured-output schema does not support dynamic/record keys and returns an
// empty object for them, so we use a fixed-shape array and rebuild the map.
const AgentEnum = z.enum(['knowledge', 'finance', 'fitness', 'health', 'comms'])

const RouterResponseSchema = z.object({
  agents: z.array(AgentEnum),
  tasks: z.array(
    z.object({
      agent: AgentEnum,
      task: z.string(),
    }),
  ),
  reasoning: z.string().optional(),
})

/**
 * Router agent (Gemini/ADK).
 *
 * A structured-output `LlmAgent` that classifies the user's intent into the set
 * of agents to run plus a focused per-agent task. `outputSchema` forces Gemini
 * to return JSON matching `RouterResponseSchema`. It uses an explicit JSON
 * classifier and preserves the exact parallel multi-agent behavior (rather
 * than ADK-native delegation).
 *
 * The model is referenced by name so `GEMINI_API_KEY` resolves lazily at
 * request time, keeping module import (and `next build`) side-effect free.
 */
const routerAgent = new LlmAgent({
  name: 'router',
  model: 'gemini-flash-latest',
  description: 'Classifies user intent and selects the agents to handle a request.',
  instruction: `You are Jarvis, a personal AI orchestrator routing assistant.

Your job is to analyze user messages and determine which specialized agents should handle the request.

Available agents:
- knowledge: Tech news, research papers (arXiv), bookmarks, learning resources, AI/ML content, and sports news (cricket/football)
- finance: Expense tracking, budgets, savings goals, market data, financial insights
- fitness: Workout logging, nutrition tracking, macro calculations, meal planning
- health: Habit tracking, focus timers (Pomodoro), sleep logs, wellness routines
- comms: Email management (Gmail), calendar queries (Google Calendar), scheduling

Rules:
1. A message can require multiple agents (e.g., "Find AI papers and check my budget" = knowledge + finance)
2. For each agent, create a focused, specific task based on the user's message
3. Only include agents that are directly relevant to the request
4. If unsure, default to the most relevant single agent
5. The 'tasks' array must contain exactly one entry per agent in 'agents', each with the agent name and its specific task

Respond with JSON: an 'agents' array, a 'tasks' array where each item has an
'agent' and its specific 'task', and a brief 'reasoning' string.`,
  outputSchema: RouterResponseSchema,
})

const runner = new InMemoryRunner({ agent: routerAgent, appName: 'jarvis-router' })

function eventText(event: Event): string {
  return event.content?.parts?.map((part) => part.text ?? '').join('') ?? ''
}

/**
 * Router: classifies user intent and decides which agents handle the request.
 * Falls back to the knowledge agent (with the raw message) on any error.
 */
export async function route(userMessage: string): Promise<OrchestratorResponse> {
  try {
    let raw = ''
    const events = runner.runEphemeral({
      userId: 'jarvis-user',
      newMessage: { role: 'user', parts: [{ text: userMessage }] },
    })

    for await (const event of events) {
      if (event.errorMessage) throw new Error(event.errorMessage)
      const text = eventText(event)
      if (text) raw = text
    }

    if (!raw) throw new Error('No response from router')

    const validated = RouterResponseSchema.parse(JSON.parse(raw))

    // Rebuild the per-agent task map, falling back to the raw message for any
    // selected agent the classifier left without a task.
    const taskByAgent = new Map(validated.tasks.map((t) => [t.agent, t.task]))
    const tasks = Object.fromEntries(
      validated.agents.map((agent) => [agent, taskByAgent.get(agent) || userMessage]),
    ) as Record<Agent, string>

    return { agents: validated.agents, tasks }
  } catch {
    return {
      agents: ['knowledge'],
      tasks: { knowledge: userMessage } as Record<Agent, string>,
    }
  }
}
