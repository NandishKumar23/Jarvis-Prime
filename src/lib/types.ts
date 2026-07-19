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

// ---------------------------------------------------------------------------
// Streaming contract (shared by the API stream and the client driver)
// ---------------------------------------------------------------------------

/**
 * Newline-delimited JSON events emitted by the orchestrator stream.
 * `routing` carries the selected agent list only (per-agent tasks stay server-side).
 */
export type StreamEvent =
  | { type: 'routing'; agents: Agent[] }
  | { type: 'agent_start'; agent: Agent }
  | { type: 'agent_token'; agent: Agent; token: string }
  | { type: 'agent_done'; agent: Agent }
  | { type: 'persona_greeting'; text: string }
  | { type: 'persona_intro'; text: string }
  | { type: 'persona_outro'; text: string }
  | { type: 'done' }
  | { type: 'error'; agent?: Agent; message: string }

// ---------------------------------------------------------------------------
// UI state models
// ---------------------------------------------------------------------------

export type SectionStatus = 'pending' | 'streaming' | 'done' | 'error'

/** One agent's contribution to an assistant message (streams independently). */
export interface AgentSection {
  agent: Agent
  text: string
  status: SectionStatus
  error?: string
}

/** A single message in the chat transcript. */
export interface UIMessage {
  id: string
  role: 'user' | 'assistant'
  /** Present on user messages. */
  content?: string
  /** Present on assistant messages (one section per responding agent). */
  sections?: AgentSection[]
  /** Persona framing (assistant messages only). */
  greeting?: string
  intro?: string
  outro?: string
  createdAt: number
}

// ---------------------------------------------------------------------------
// Send driver (decouples the UI from the transport)
// ---------------------------------------------------------------------------

/**
 * Drives a single send: given the message + history, invokes `onEvent` for each
 * streamed event until completion. Phase 1 uses a scripted driver; Phase 3 a
 * real fetch-based driver. `ChatContainer` depends only on this interface.
 */
export type SendDriver = (
  input: { message: string; history: UIMessage[] },
  onEvent: (event: StreamEvent) => void,
  signal: AbortSignal,
) => Promise<void>

// ---------------------------------------------------------------------------
// Component prop types (centralized)
// ---------------------------------------------------------------------------

export type BadgeSize = 'sm' | 'md'

export interface AgentBadgeProps {
  agent: Agent
  active?: boolean
  loading?: boolean
  size?: BadgeSize
}

export interface PerAgentSectionProps {
  section: AgentSection
}

export interface AgentActivityIndicatorProps {
  sections: AgentSection[]
}

export interface MessageBubbleProps {
  message: UIMessage
}

export interface MessageListProps {
  messages: UIMessage[]
  isStreaming: boolean
}

export interface VoiceControlProps {
  onSend: (text: string) => void
  /** True while the assistant is responding (orb shows a "thinking" state). */
  busy: boolean
  /** True while Jarvis is speaking the response aloud (orb shows a "speaking" state). */
  speaking?: boolean
  /** Called when the user taps the orb while Jarvis is speaking (barge-in / mute). */
  onCancelSpeaking?: () => void
  /** Orb diameter in pixels. */
  size?: number
}

export interface ChatContainerProps {
  driver?: SendDriver
}
