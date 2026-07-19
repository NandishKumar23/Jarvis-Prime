import { type Event, InMemoryRunner, type LlmAgent, StreamingMode } from '@google/adk'
import type { Agent, ChatMessage } from '@/lib/types'

/**
 * ADK agent wrapper.
 *
 * Each domain agent is a declarative Gemini `LlmAgent` paired with its own
 * `InMemoryRunner`. `streamAgent` runs one turn and yields text tokens, mapping
 * ADK's SSE event stream onto the plain token stream the dispatcher expects.
 */
export interface AdkAgent {
  name: Agent
  description: string
  /** Streamed response, yielding text tokens as they arrive. */
  streamAgent(task: string, context?: ChatMessage[]): AsyncGenerator<string>
}

/** Concatenates the text of all parts on an ADK event's content. */
function eventText(event: Event): string {
  return event.content?.parts?.map((part) => part.text ?? '').join('') ?? ''
}

/**
 * Flattens prior conversation into a short text preamble.
 *
 * `runEphemeral` takes a single-turn message, so — matching the session-only
 * memory model — we fold recent history into the task text rather than a
 * server-side session store.
 */
function buildInput(task: string, context?: ChatMessage[]): string {
  if (!context || context.length === 0) return task

  const transcript = context
    .filter((msg) => msg.role !== 'system')
    .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n')

  if (!transcript) return task

  return `Conversation so far:\n${transcript}\n\nCurrent request: ${task}`
}

export function createAdkAgent(agent: LlmAgent): AdkAgent {
  const name = agent.name as Agent
  const runner = new InMemoryRunner({ agent, appName: `jarvis-${name}` })

  async function* streamAgent(task: string, context?: ChatMessage[]): AsyncGenerator<string> {
    let streamedPartial = false

    const events = runner.runEphemeral({
      userId: 'jarvis-user',
      newMessage: { role: 'user', parts: [{ text: buildInput(task, context) }] },
      runConfig: { streamingMode: StreamingMode.SSE },
    })

    for await (const event of events) {
      if (event.errorMessage) {
        throw new Error(event.errorMessage)
      }

      const text = eventText(event)
      if (!text) continue

      // Partial (SSE) events carry incremental text; a trailing non-partial
      // event re-sends the full text, so only use it as a fallback.
      if (event.partial) {
        streamedPartial = true
        yield text
      } else if (!streamedPartial) {
        yield text
      }
    }
  }

  return { name, description: agent.description ?? '', streamAgent }
}
