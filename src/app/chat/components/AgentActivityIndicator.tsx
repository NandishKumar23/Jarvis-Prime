import { getAgentMeta } from '@/app/chat/components/agentMeta'
import type { AgentActivityIndicatorProps } from '@/lib/types'

export default function AgentActivityIndicator({
  sections,
}: Readonly<AgentActivityIndicatorProps>) {
  const busy = sections.filter((s) => s.status === 'pending' || s.status === 'streaming')

  if (busy.length === 0) return null

  return (
    <div className="flex items-center gap-2 px-1 font-mono text-[0.65rem] tracking-widest text-cyan-400/70 uppercase">
      <div className="flex -space-x-1">
        {busy.map((s) => {
          const meta = getAgentMeta(s.agent)
          return (
            <span
              key={s.agent}
              className={`h-2 w-2 animate-pulse ring-2 ring-black/60 ${meta.classes.dot}`}
            />
          )
        })}
      </div>
      <span>
        {busy.map((s) => getAgentMeta(s.agent).label).join(', ')} {busy.length === 1 ? 'is' : 'are'}{' '}
        online…
      </span>
    </div>
  )
}
