import AgentActivityIndicator from '@/app/chat/components/AgentActivityIndicator'
import PerAgentSection from '@/app/chat/components/PerAgentSection'
import type { MessageBubbleProps } from '@/lib/types'

export default function MessageBubble({ message }: Readonly<MessageBubbleProps>) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="hud-bevel-reverse max-w-[80%] border border-cyan-400/30 bg-cyan-500/10 px-4 py-2.5 text-sm whitespace-pre-wrap text-cyan-50">
          {message.content}
        </div>
      </div>
    )
  }

  const sections = message.sections ?? []

  return (
    <div className="flex justify-start">
      <div className="w-full max-w-[92%] space-y-2">
        <AgentActivityIndicator sections={sections} />

        <div className="hud-bevel hud-glow-border relative space-y-3 border border-cyan-400/20 bg-black/40 p-4 backdrop-blur-sm">
          {/* Persona readout header */}
          {(message.greeting || message.intro) && (
            <div className="space-y-1 border-b border-cyan-400/10 pb-2 font-mono text-xs text-cyan-300/90">
              {message.greeting && (
                <p className="hud-glow-text">
                  <span className="text-cyan-500/60">{'>> '}</span>
                  {message.greeting}
                </p>
              )}
              {message.intro && (
                <p>
                  <span className="text-cyan-500/60">{'>> '}</span>
                  {message.intro}
                </p>
              )}
            </div>
          )}

          {sections.length === 0 ? (
            <p className="font-mono text-sm text-gray-500">Processing…</p>
          ) : (
            sections.map((section) => <PerAgentSection key={section.agent} section={section} />)
          )}

          {/* Persona readout footer */}
          {message.outro && (
            <p className="border-t border-cyan-400/10 pt-2 font-mono text-xs text-cyan-300/90">
              <span className="text-cyan-500/60">{'>> '}</span>
              {message.outro}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
