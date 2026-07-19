import { type NextRequest, NextResponse } from 'next/server'
import { KnowledgeAgent } from '@/lib/adk/agents/knowledge'

// The ADK agent relies on Node APIs, so this route must run on the Node.js runtime.
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { task } = body

    if (!task) {
      return NextResponse.json({ error: 'Task is required' }, { status: 400 })
    }

    let response = ''
    for await (const token of KnowledgeAgent.streamAgent(task)) {
      response += token
    }

    return NextResponse.json({
      agent: 'knowledge',
      response: response || 'No response generated',
      timestamp: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
