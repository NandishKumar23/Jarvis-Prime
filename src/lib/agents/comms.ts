import { GROQ_REASONING_MODEL, groq } from '@/lib/groq-client'
import type { BaseAgent } from './base'

export const CommsAgent: BaseAgent = {
  name: 'comms',
  description: 'Manages email triage, calendar, and communications',

  async execute(task: string) {
    console.log('📧 Comms Agent executing:', task)

    try {
      const completion = await groq.chat.completions.create({
        model: GROQ_REASONING_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are the Communications Agent for Jarvis, a personal AI assistant.

Your expertise:
- Email management and triage
- Calendar queries and scheduling
- Meeting coordination
- Communication summarization

You have access to (will be implemented):
- Gmail API (via MCP)
- Google Calendar API (via MCP)
- Email summaries and priorities

For now, provide guidance on email and calendar management.
Be professional and organized. Remind users that email/calendar integration is coming soon.`,
          },
          {
            role: 'user',
            content: task,
          },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      })

      return completion.choices[0]?.message?.content || 'No response generated'
    } catch (error) {
      console.error('❌ Comms Agent error:', error)
      throw error
    }
  },
}
