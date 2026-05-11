import type { AgentResponse } from '@/lib/types'

/**
 * Merger: Combines responses from multiple agents into a coherent answer
 * Handles formatting and prioritization of multi-agent responses
 */
export function merge(responses: AgentResponse[]): string {
  if (responses.length === 0) {
    return 'No response from agents.'
  }

  if (responses.length === 1) {
    return responses[0].response
  }

  // Multiple agents responded - format their responses clearly
  const formatted = responses
    .map((r) => `**${r.agent.toUpperCase()}**\n${r.response}`)
    .join('\n\n---\n\n')

  return formatted
}
