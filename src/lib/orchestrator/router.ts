import { z } from 'zod'
import { GROQ_FAST_MODEL, groq } from '@/lib/groq-client'
import type { Agent, OrchestratorResponse } from '@/lib/types'

// Zod schema for LLM response validation
const RouterResponseSchema = z.object({
  agents: z.array(z.enum(['knowledge', 'finance', 'fitness', 'health', 'comms'])),
  tasks: z.record(z.string(), z.string()),
  reasoning: z.string().optional(),
})

/**
 * Router: Classifies user intent and dispatches to appropriate agents
 * This is the orchestrator's brain - it decides which agents need to handle the request
 */
export async function route(userMessage: string): Promise<OrchestratorResponse> {
  console.log('🔍 Routing message:', userMessage)

  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_FAST_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are Jarvis, a personal AI orchestrator routing assistant.

Your job is to analyze user messages and determine which specialized agents should handle the request.

Available agents:
- knowledge: Tech news, research papers (arXiv), bookmarks, learning resources, AI/ML content
- finance: Expense tracking, budgets, savings goals, market data, financial insights
- fitness: Workout logging, nutrition tracking, macro calculations, meal planning
- health: Habit tracking, focus timers (Pomodoro), sleep logs, wellness routines
- comms: Email management (Gmail), calendar queries (Google Calendar), scheduling

Rules:
1. A message can require multiple agents (e.g., "Find AI papers and check my budget" = knowledge + finance)
2. For each agent, create a focused, specific task based on the user's message
3. Only include agents that are directly relevant to the request
4. If unsure, default to the most relevant single agent

Respond ONLY with valid JSON in this exact format:
{
  "agents": ["agent1", "agent2"],
  "tasks": {
    "agent1": "specific task for agent 1",
    "agent2": "specific task for agent 2"
  },
  "reasoning": "brief explanation of routing decision"
}`,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3, // Lower temperature for more consistent routing
      max_tokens: 500,
    })

    const responseContent = completion.choices[0]?.message?.content
    if (!responseContent) {
      throw new Error('No response from LLM')
    }

    // Parse and validate the response
    const parsed = JSON.parse(responseContent)
    const validated = RouterResponseSchema.parse(parsed)

    console.log('✅ Routing decision:', {
      agents: validated.agents,
      reasoning: validated.reasoning,
    })

    return {
      agents: validated.agents,
      tasks: validated.tasks as Record<Agent, string>,
    }
  } catch (error) {
    console.error('❌ Router error:', error)

    // Fallback: route to knowledge agent as default
    console.log('⚠️  Falling back to knowledge agent')
    return {
      agents: ['knowledge'],
      tasks: {
        knowledge: userMessage,
      } as Record<Agent, string>,
    }
  }
}
