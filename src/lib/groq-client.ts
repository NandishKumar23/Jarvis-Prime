import Groq from 'groq-sdk'
import { env } from './env'

export const groq = new Groq({
  apiKey: env.GROQ_API_KEY,
})

// Default model configuration
export const GROQ_CONFIG = {
  model: 'llama-3.3-70b-versatile',
  temperature: 0.7,
  max_tokens: 2048,
} as const

// Fast model for quick responses
export const GROQ_FAST_MODEL = 'llama-3.1-8b-instant'

// Reasoning model for complex tasks
export const GROQ_REASONING_MODEL = 'llama-3.3-70b-versatile'
