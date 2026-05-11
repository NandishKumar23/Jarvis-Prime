import { type NextRequest, NextResponse } from 'next/server'
import { KnowledgeAgent } from '@/lib/agents/knowledge'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { task } = body

    if (!task) {
      return NextResponse.json({ error: 'Task is required' }, { status: 400 })
    }

    const response = await KnowledgeAgent.execute(task)

    return NextResponse.json({
      agent: 'knowledge',
      response,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Knowledge agent error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
