import type { AgentSection, ChatMessage, UIMessage } from '@/lib/types'

/** Default number of trailing messages kept when building agent context. */
export const DEFAULT_HISTORY_WINDOW = 8

/** Flattens an assistant message's per-agent sections into plain text for LLM context. */
function flattenAssistantSections(sections: AgentSection[] | undefined): string {
  if (!sections || sections.length === 0) return ''
  if (sections.length === 1) return sections[0].text.trim()
  return sections
    .filter((s) => s.text.trim().length > 0)
    .map((s) => `[${s.agent}] ${s.text.trim()}`)
    .join('\n')
}

/** Converts a single history entry to a ChatMessage, or null if it has no usable content. */
function toContextMessage(message: UIMessage): ChatMessage | null {
  if (!message || typeof message !== 'object') return null

  if (message.role === 'user') {
    const content = typeof message.content === 'string' ? message.content.trim() : ''
    return content ? { role: 'user', content } : null
  }

  if (message.role === 'assistant') {
    const content = flattenAssistantSections(message.sections)
    return content ? { role: 'assistant', content } : null
  }

  return null
}

/**
 * Converts client-side conversation history into the plain `ChatMessage[]`
 * context threaded into each agent's prompt. Caps to the last N messages
 * (a "sliding window") to keep prompts small in this session-only memory
 * model — there is no persistent store, so only what the client sends back
 * is available.
 */
export function toChatContext(
  history: UIMessage[],
  windowSize: number = DEFAULT_HISTORY_WINDOW,
): ChatMessage[] {
  if (!Array.isArray(history) || history.length === 0) return []

  return history
    .slice(-windowSize)
    .map(toContextMessage)
    .filter((m): m is ChatMessage => m !== null)
}
