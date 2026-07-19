import AgentBadge from '@/app/chat/components/AgentBadge'
import { getAgentMeta } from '@/app/chat/components/agentMeta'
import type { PerAgentSectionProps } from '@/lib/types'

export default function PerAgentSection({ section }: Readonly<PerAgentSectionProps>) {
  const meta = getAgentMeta(section.agent)
  const isStreaming = section.status === 'streaming'
  const isPending = section.status === 'pending'

  return (
    <div
      className={`hud-bevel-sm relative overflow-hidden border-t-2 border-white/5 bg-black/30 px-4 py-3 ${meta.classes.section} ${meta.classes.glow}`}
    >
      {isStreaming && <div className="hud-scanline absolute inset-0" />}

      <div className="relative mb-2 flex items-center gap-2">
        <AgentBadge agent={section.agent} active loading={isStreaming || isPending} size="sm" />
        {isPending && (
          <span className="font-mono text-[0.65rem] tracking-widest text-gray-500 uppercase">
            standby…
          </span>
        )}
      </div>

      {section.status === 'error' ? (
        <p className="relative font-mono text-sm text-rose-400">
          {section.error || 'Something went wrong.'}
        </p>
      ) : (
        <p className="relative text-sm leading-relaxed whitespace-pre-wrap text-gray-200">
          {section.text}
          {isStreaming && (
            <span
              className={`hud-caret ml-0.5 inline-block h-4 w-1.5 align-middle ${meta.classes.dot}`}
            />
          )}
        </p>
      )}
    </div>
  )
}
