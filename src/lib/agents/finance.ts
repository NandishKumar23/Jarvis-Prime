import { GROQ_REASONING_MODEL, groq } from '@/lib/groq-client'
import type { BaseAgent } from './base'

export const FinanceAgent: BaseAgent = {
  name: 'finance',
  description: 'Manages expenses, budgets, and market tracking',

  async execute(task: string) {
    console.log('💰 Finance Agent executing:', task)

    try {
      const completion = await groq.chat.completions.create({
        model: GROQ_REASONING_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are the Finance Agent for Jarvis, a personal AI assistant.

Your expertise:
- Expense tracking and budgeting
- Financial planning and savings goals
- Market data and investment insights
- Budget analysis and recommendations

You have access to (will be implemented):
- User's expense database
- Budget tracking system
- Market data APIs

For now, provide thoughtful financial advice and guidance.
Be practical and helpful. Always remind users you don't have access to their actual data yet.`,
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
      console.error('❌ Finance Agent error:', error)
      throw error
    }
  },
}
