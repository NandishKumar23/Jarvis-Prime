import { dispatchStream } from '@/lib/orchestrator/dispatcher'
import { pickGreeting, pickIntro, pickOutro } from '@/lib/persona/jarvis'
import type { ChatMessage, OrchestratorResponse, StreamEvent } from '@/lib/types'

export interface WithPersonaOptions {
  /** True if this is the user's first message in the session (shows the greeting). */
  isFirstMessage: boolean
  context?: ChatMessage[]
}

/**
 * Wraps `dispatchStream` with JARVIS-style persona framing:
 * (greeting, first message only) -> routing -> intro -> agent events -> outro -> done
 */
export async function* withPersona(
  routing: OrchestratorResponse,
  options: WithPersonaOptions,
): AsyncGenerator<StreamEvent> {
  if (options.isFirstMessage) {
    yield { type: 'persona_greeting', text: pickGreeting() }
  }

  for await (const event of dispatchStream(routing, options.context)) {
    if (event.type === 'routing') {
      yield event
      yield { type: 'persona_intro', text: pickIntro() }
      continue
    }

    if (event.type === 'done') {
      yield { type: 'persona_outro', text: pickOutro() }
      yield event
      continue
    }

    yield event
  }
}
