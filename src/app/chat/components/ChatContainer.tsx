'use client'

import { useCallback, useRef, useState } from 'react'
import { apiDriver } from '@/app/chat/components/apiDriver'
import MessageList from '@/app/chat/components/MessageList'
import { useSpeechSynthesis } from '@/app/chat/components/useSpeechSynthesis'
import VoiceControl from '@/app/chat/components/VoiceControl'
import type { Agent, AgentSection, ChatContainerProps, StreamEvent, UIMessage } from '@/lib/types'

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export default function ChatContainer({ driver }: Readonly<ChatContainerProps>) {
  const [messages, setMessages] = useState<UIMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)

  // An explicit `driver` prop (e.g. tests) overrides the default fetch driver.
  const activeDriver = driver ?? apiDriver
  const abortRef = useRef<AbortController | null>(null)
  const { isSpeaking, speak, cancel: cancelSpeech } = useSpeechSynthesis()

  // Tracks each agent's finalized text for the in-flight assistant message, so
  // we can speak a section as soon as it completes without depending on
  // (possibly stale) React state timing.
  const sectionTextRef = useRef<Partial<Record<Agent, string>>>({})

  const applyEvent = useCallback((assistantId: string, event: StreamEvent) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== assistantId) return msg
        const sections = msg.sections ?? []

        switch (event.type) {
          case 'routing': {
            const next: AgentSection[] = event.agents.map((agent) => ({
              agent,
              text: '',
              status: 'pending',
            }))
            return { ...msg, sections: next }
          }
          case 'agent_start':
            return {
              ...msg,
              sections: sections.map((s) =>
                s.agent === event.agent ? { ...s, status: 'streaming' } : s,
              ),
            }
          case 'agent_token':
            return {
              ...msg,
              sections: sections.map((s) =>
                s.agent === event.agent
                  ? { ...s, text: s.text + event.token, status: 'streaming' }
                  : s,
              ),
            }
          case 'agent_done':
            return {
              ...msg,
              sections: sections.map((s) =>
                s.agent === event.agent ? { ...s, status: 'done' } : s,
              ),
            }
          case 'error':
            return {
              ...msg,
              sections: event.agent
                ? sections.map((s) =>
                    s.agent === event.agent ? { ...s, status: 'error', error: event.message } : s,
                  )
                : sections,
            }
          case 'persona_greeting':
            return { ...msg, greeting: event.text }
          case 'persona_intro':
            return { ...msg, intro: event.text }
          case 'persona_outro':
            return { ...msg, outro: event.text }
          default:
            return msg
        }
      }),
    )
  }, [])

  const handleSend = useCallback(
    async (text: string) => {
      if (isStreaming) return

      const userMessage: UIMessage = {
        id: makeId(),
        role: 'user',
        content: text,
        createdAt: Date.now(),
      }
      const assistantId = makeId()
      const assistantMessage: UIMessage = {
        id: assistantId,
        role: 'assistant',
        sections: [],
        createdAt: Date.now(),
      }

      const history = messages
      sectionTextRef.current = {}
      setMessages((prev) => [...prev, userMessage, assistantMessage])
      setIsStreaming(true)

      const controller = new AbortController()
      abortRef.current = controller

      const onEvent = (event: StreamEvent) => {
        applyEvent(assistantId, event)

        // Speak persona framing and each agent's finalized answer, in order.
        switch (event.type) {
          case 'persona_greeting':
          case 'persona_intro':
          case 'persona_outro':
            speak(event.text)
            break
          case 'agent_token':
            sectionTextRef.current[event.agent] =
              (sectionTextRef.current[event.agent] ?? '') + event.token
            break
          case 'agent_done': {
            const finalText = sectionTextRef.current[event.agent]
            if (finalText) speak(finalText)
            break
          }
          default:
            break
        }
      }

      try {
        await activeDriver({ message: text, history }, onEvent, controller.signal)
      } catch (error) {
        applyEvent(assistantId, {
          type: 'error',
          message: error instanceof Error ? error.message : 'Request failed',
        })
      } finally {
        setIsStreaming(false)
        abortRef.current = null
      }
    },
    [activeDriver, isStreaming, messages, applyEvent, speak],
  )

  const hasMessages = messages.length > 0

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      {hasMessages ? (
        <>
          <MessageList messages={messages} isStreaming={isStreaming} />
          <div className="border-t border-white/10 pt-3">
            <VoiceControl
              onSend={handleSend}
              busy={isStreaming}
              speaking={isSpeaking}
              onCancelSpeaking={cancelSpeech}
              size={100}
            />
          </div>
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <VoiceControl
            onSend={handleSend}
            busy={isStreaming}
            speaking={isSpeaking}
            onCancelSpeaking={cancelSpeech}
            size={240}
          />
        </div>
      )}
    </div>
  )
}
