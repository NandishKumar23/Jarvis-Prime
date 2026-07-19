import { getAgentMeta } from '@/app/chat/components/agentMeta'
import type { AgentBadgeProps } from '@/lib/types'

export default function AgentBadge({
  agent,
  active,
  loading,
  size = 'md',
}: Readonly<AgentBadgeProps>) {
  const meta = getAgentMeta(agent)
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[0.65rem]' : 'px-3 py-1 text-xs'
  const colorClasses = active ? meta.classes.badgeActive : meta.classes.badge

  return (
    <span
      className={`hud-bevel-sm inline-flex items-center gap-1.5 border font-mono font-semibold tracking-widest uppercase transition-colors ${sizeClasses} ${colorClasses}`}
    >
      <span
        className={`h-1.5 w-1.5 shrink-0 ${loading ? 'animate-pulse' : ''} ${meta.classes.dot}`}
      />
      {meta.label}
    </span>
  )
}
