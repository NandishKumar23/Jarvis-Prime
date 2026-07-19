import type { SendDriver, StreamEvent } from '@/lib/types'

/** Trailing messages kept when sending history back to the server (sliding window). */
const HISTORY_WINDOW = 8

function parseEvent(line: string): StreamEvent | null {
  const trimmed = line.trim()
  if (!trimmed) return null
  try {
    return JSON.parse(trimmed) as StreamEvent
  } catch {
    return null
  }
}

/** Splits buffered NDJSON text on newlines, returning parsed events and the remainder. */
function drainLines(buffer: string, onEvent: (event: StreamEvent) => void): string {
  let remaining = buffer
  let newlineIndex = remaining.indexOf('\n')

  while (newlineIndex !== -1) {
    const event = parseEvent(remaining.slice(0, newlineIndex))
    if (event) onEvent(event)
    remaining = remaining.slice(newlineIndex + 1)
    newlineIndex = remaining.indexOf('\n')
  }

  return remaining
}

/**
 * Real SendDriver: POSTs to /api/chat and parses the NDJSON stream of
 * StreamEvents as it arrives, forwarding each to `onEvent`.
 */
export const apiDriver: SendDriver = async (input, onEvent, signal) => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: input.message,
      isFirstMessage: input.history.length === 0,
      history: input.history.slice(-HISTORY_WINDOW),
    }),
    signal,
  })

  if (!response.ok || !response.body) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.error || `Request failed with status ${response.status}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer = drainLines(buffer + decoder.decode(value, { stream: true }), onEvent)
  }

  const trailingEvent = parseEvent(buffer)
  if (trailingEvent) onEvent(trailingEvent)
}
