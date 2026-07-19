'use client'

import { useEffect, useRef } from 'react'
import MessageBubble from '@/app/chat/components/MessageBubble'
import type { MessageListProps } from '@/lib/types'

export default function MessageList({ messages, isStreaming }: Readonly<MessageListProps>) {
  const bottomRef = useRef<HTMLDivElement>(null)

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on new content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="hud-bevel mb-4 inline-flex h-16 w-16 items-center justify-center border border-cyan-400/40 bg-cyan-500/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-8 w-8 text-cyan-400"
            aria-label="Chat"
          >
            <title>Chat</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
            />
          </svg>
        </div>
        <h2 className="hud-glow-text font-mono text-lg font-semibold tracking-widest text-cyan-300 uppercase">
          Systems Online
        </h2>
        <p className="mt-1 font-mono text-xs tracking-wide text-gray-500 uppercase">
          Tap the orb and speak, Boss.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto py-4">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
