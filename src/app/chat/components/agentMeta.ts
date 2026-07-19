import type { Agent } from '@/lib/types'

type AgentColor = 'blue' | 'green' | 'orange' | 'red' | 'purple'

interface AgentColorClasses {
  /** Badge / pill container classes. */
  badge: string
  /** Active/highlighted badge classes. */
  badgeActive: string
  /** Section top-accent border + subtle background. */
  section: string
  /** Section glow (box-shadow) tint. */
  glow: string
  /** Small status indicator. */
  dot: string
  /** Text-only accent (e.g. section header label). */
  text: string
}

interface AgentMetaEntry {
  label: string
  color: AgentColor
  classes: AgentColorClasses
}

/**
 * IMPORTANT: Tailwind v4 only generates classes it can see as complete strings,
 * so every class below is written out in full (no runtime interpolation).
 */
const AGENT_META: Record<Agent, AgentMetaEntry> = {
  knowledge: {
    label: 'Knowledge',
    color: 'blue',
    classes: {
      badge: 'bg-blue-500/10 text-blue-300 border-blue-400/40',
      badgeActive: 'bg-blue-500/20 text-blue-200 border-blue-300/60',
      section: 'border-t-blue-400/70 bg-blue-500/[0.04]',
      glow: 'shadow-[0_0_16px_rgba(96,165,250,0.15)]',
      dot: 'bg-blue-400',
      text: 'text-blue-300',
    },
  },
  finance: {
    label: 'Finance',
    color: 'green',
    classes: {
      badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-400/40',
      badgeActive: 'bg-emerald-500/20 text-emerald-200 border-emerald-300/60',
      section: 'border-t-emerald-400/70 bg-emerald-500/[0.04]',
      glow: 'shadow-[0_0_16px_rgba(52,211,153,0.15)]',
      dot: 'bg-emerald-400',
      text: 'text-emerald-300',
    },
  },
  fitness: {
    label: 'Fitness',
    color: 'orange',
    classes: {
      badge: 'bg-orange-500/10 text-orange-300 border-orange-400/40',
      badgeActive: 'bg-orange-500/20 text-orange-200 border-orange-300/60',
      section: 'border-t-orange-400/70 bg-orange-500/[0.04]',
      glow: 'shadow-[0_0_16px_rgba(251,146,60,0.15)]',
      dot: 'bg-orange-400',
      text: 'text-orange-300',
    },
  },
  health: {
    label: 'Health',
    color: 'red',
    classes: {
      badge: 'bg-rose-500/10 text-rose-300 border-rose-400/40',
      badgeActive: 'bg-rose-500/20 text-rose-200 border-rose-300/60',
      section: 'border-t-rose-400/70 bg-rose-500/[0.04]',
      glow: 'shadow-[0_0_16px_rgba(251,113,133,0.15)]',
      dot: 'bg-rose-400',
      text: 'text-rose-300',
    },
  },
  comms: {
    label: 'Comms',
    color: 'purple',
    classes: {
      badge: 'bg-violet-500/10 text-violet-300 border-violet-400/40',
      badgeActive: 'bg-violet-500/20 text-violet-200 border-violet-300/60',
      section: 'border-t-violet-400/70 bg-violet-500/[0.04]',
      glow: 'shadow-[0_0_16px_rgba(167,139,250,0.15)]',
      dot: 'bg-violet-400',
      text: 'text-violet-300',
    },
  },
}

export function getAgentMeta(agent: Agent): AgentMetaEntry {
  return AGENT_META[agent]
}
