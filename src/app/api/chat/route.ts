import { type NextRequest, NextResponse } from 'next/server'
import { dispatch } from '@/lib/orchestrator/dispatcher'
import { merge } from '@/lib/orchestrator/merger'
import { route } from '@/lib/orchestrator/router'

/**
 * Main orchestrator endpoint
 * Receives user messages and routes them to appropriate agents
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Step 1: Route the message to determine which agents should handle it
    const routing = await route(message)

    // Step 2: Dispatch tasks to agents in parallel
    const responses = await dispatch(routing)

    // Step 3: Merge agent responses into a coherent answer
    const finalResponse = merge(responses)

    return NextResponse.json({
      message: finalResponse,
      agents: routing.agents,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Orchestrator error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
