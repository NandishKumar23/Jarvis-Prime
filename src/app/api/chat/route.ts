import { type NextRequest, NextResponse } from 'next/server'
import { toChatContext } from '@/lib/orchestrator/history'
import { route } from '@/lib/orchestrator/router'
import { withPersona } from '@/lib/orchestrator/withPersona'
import type { StreamEvent } from '@/lib/types'

// The ADK agents rely on Node APIs, so this route must run on the Node.js runtime.
export const runtime = 'nodejs'

/**
 * Main orchestrator endpoint (streaming).
 *
 * Routes the user message to the relevant agents and streams their output back
 * (wrapped in JARVIS-style persona framing) as newline-delimited JSON (NDJSON)
 * StreamEvents, one per line.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const message = body?.message
  const isFirstMessage = Boolean(body?.isFirstMessage)

  if (!message || typeof message !== 'string') {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  // Session-only memory: the client resends recent history each request (no
  // server-side store), which we flatten into plain chat context for agents.
  const context = toChatContext(body?.history)

  // Determine which agents should handle the request before streaming begins.
  const routing = await route(message)

  const encoder = new TextEncoder()
  const send = (controller: ReadableStreamDefaultController, event: StreamEvent) => {
    controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`))
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of withPersona(routing, { isFirstMessage, context })) {
          send(controller, event)
        }
      } catch (error) {
        send(controller, {
          type: 'error',
          message: error instanceof Error ? error.message : 'Internal server error',
        })
        send(controller, { type: 'done' })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
