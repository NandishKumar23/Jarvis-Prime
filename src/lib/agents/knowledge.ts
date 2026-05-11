import { GROQ_REASONING_MODEL, groq } from '@/lib/groq-client'
import type { BaseAgent } from './base'

export const KnowledgeAgent: BaseAgent = {
  name: 'knowledge',
  description: 'Handles tech news, research papers, bookmarks, and learning resources',

  async execute(task: string) {
    console.log('📚 Knowledge Agent executing:', task)

    try {
      const completion = await groq.chat.completions.create({
        model: GROQ_REASONING_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are the Knowledge Agent for Jarvis, a personal AI assistant.

Your expertise:
- Technology news and trends
- Research papers and academic content
- Learning resources and recommendations
- Technical explanations and summaries
- Bookmark management and content curation

You have access to (will be implemented):
- HackerNews API for tech news
- arXiv API for research papers
- Bookmark database for saved content

For now, provide thoughtful, accurate responses about technology, learning, and knowledge management.
Be concise but informative. Use markdown formatting when helpful.`,
          },
          {
            role: 'user',
            content: task,
          },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      })

      const response = completion.choices[0]?.message?.content

      if (!response) {
        throw new Error('No response from LLM')
      }

      return response
    } catch (error) {
      console.error('❌ Knowledge Agent error:', error)
      throw error
    }
  },
}
