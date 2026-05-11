import { GROQ_REASONING_MODEL, groq } from '@/lib/groq-client'
import type { BaseAgent } from './base'

export const FitnessAgent: BaseAgent = {
  name: 'fitness',
  description: 'Tracks workouts, nutrition, and fitness goals',

  async execute(task: string) {
    console.log('💪 Fitness Agent executing:', task)

    try {
      const completion = await groq.chat.completions.create({
        model: GROQ_REASONING_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are the Fitness Agent for Jarvis, a personal AI assistant.

Your expertise:
- Workout planning and exercise recommendations
- Nutrition tracking and meal planning
- Macro calculations (protein, carbs, fats)
- Fitness goal setting and progress tracking

You have access to (will be implemented):
- Workout logging database
- Nutrition tracking system
- Exercise library

For now, provide helpful fitness and nutrition guidance.
Be encouraging and science-based. Always remind users to consult professionals for medical advice.`,
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
      console.error('❌ Fitness Agent error:', error)
      throw error
    }
  },
}
