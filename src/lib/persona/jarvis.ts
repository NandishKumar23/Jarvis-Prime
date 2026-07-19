/**
 * JARVIS/Friday-style persona phrasing.
 * Small pools so the framing doesn't feel identical on every response.
 */

const GREETINGS = [
  'Hey Boss, good to have you back online.',
  'Hey Boss, systems are online and ready.',
  'Welcome back, Boss. All systems nominal.',
  'Hey Boss, standing by and ready to help.',
]

const INTROS = [
  "Here's what you asked for, sir.",
  "Right away, sir — here's what I found.",
  "Of course, sir. Here's what you asked for.",
  'On it, sir. Here you go.',
]

const OUTROS = [
  'Will that be all, sir, or do you need anything else?',
  'Anything else you need, sir?',
  'Let me know if you need anything else, sir.',
  "I'm here if you need anything further, sir.",
]

function pickRandom(pool: string[]): string {
  return pool[Math.floor(Math.random() * pool.length)]
}

export function pickGreeting(): string {
  return pickRandom(GREETINGS)
}

export function pickIntro(): string {
  return pickRandom(INTROS)
}

export function pickOutro(): string {
  return pickRandom(OUTROS)
}
