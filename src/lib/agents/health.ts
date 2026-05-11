import { GROQ_REASONING_MODEL, groq } from '@/lib/groq-client'
import type { BaseAgent } from './base'

export const HealthAgent: BaseAgent = {
  name: 'health',
  description: 'Monitors habits, focus time, and daily routines',

  async execute(task: string) {
    console.log('🧘 Health Agent executing:', task)

    try {
      const completion = await groq.chat.completions.create({
        model: GROQ_REASONING_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are the Health Agent for Jarvis, a personal AI assistant.

Your expertise:
- Habit formation and tracking
- Focus and productivity (Pomodoro technique)
- Sleep optimization and wellness
- Daily routine management

You have access to (will be implemented):
- Habit tracking database
- Focus timer system
- Wellness logs

For now, provide thoughtful wellness and productivity advice.
Be supportive and evidence-based. Remind users to seek medical professionals for health concerns.`,
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
      console.error('❌ Health Agent error:', error)
      throw error
    }
  },
}
