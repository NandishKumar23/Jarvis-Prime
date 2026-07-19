'use client'

import { useCallback, useRef, useState } from 'react'
import { useSpeechRecognition } from '@/app/chat/components/useSpeechRecognition'
import VoiceOrb, { type OrbState } from '@/app/chat/components/VoiceOrb'
import type { VoiceControlProps } from '@/lib/types'

function resolveOrbState(
  isSupported: boolean,
  busy: boolean,
  isListening: boolean,
  speaking: boolean,
): OrbState {
  if (!isSupported) return 'disabled'
  if (speaking) return 'speaking'
  if (busy) return 'thinking'
  return isListening ? 'listening' : 'idle'
}

function Caption({
  isListening,
  busy,
  speaking,
  display,
}: Readonly<{ isListening: boolean; busy: boolean; speaking: boolean; display: string }>) {
  if (isListening) {
    return display ? (
      <p className="text-base text-white">{display}</p>
    ) : (
      <p className="text-sm text-gray-400">Listening…</p>
    )
  }
  if (speaking) return <p className="text-sm text-amber-300">Jarvis is speaking…</p>
  if (busy) return <p className="text-sm text-gray-400">Jarvis is responding…</p>
  return <p className="text-sm text-gray-500">Tap the orb and speak</p>
}

function StatusLine({
  isSupported,
  error,
  isListening,
}: Readonly<{ isSupported: boolean; error: string | null; isListening: boolean }>) {
  if (!isSupported) {
    return (
      <p className="text-xs text-amber-400/80">
        Voice input isn&apos;t supported in this browser. Try Chrome or Edge.
      </p>
    )
  }
  if (error) return <p className="text-xs text-red-400">Mic error: {error}</p>
  if (isListening) return <p className="text-xs text-blue-400">Tap again to send</p>
  return null
}

export default function VoiceControl({
  onSend,
  busy,
  speaking = false,
  onCancelSpeaking,
  size = 220,
}: Readonly<VoiceControlProps>) {
  const [display, setDisplay] = useState('')
  const finalRef = useRef('')
  const interimRef = useRef('')

  const { isSupported, isListening, error, start, stop } = useSpeechRecognition({
    onFinal: (text) => {
      finalRef.current = `${finalRef.current} ${text}`.trim()
      interimRef.current = ''
      setDisplay(finalRef.current)
    },
    onInterim: (text) => {
      interimRef.current = text
      setDisplay(`${finalRef.current} ${text}`.trim())
    },
  })

  const reset = useCallback(() => {
    finalRef.current = ''
    interimRef.current = ''
    setDisplay('')
  }, [])

  const handleOrbClick = useCallback(() => {
    if (speaking) {
      onCancelSpeaking?.()
      return
    }
    if (busy || !isSupported) return

    if (isListening) {
      const text = `${finalRef.current} ${interimRef.current}`.trim()
      stop()
      reset()
      if (text) onSend(text)
    } else {
      reset()
      start()
    }
  }, [busy, isSupported, isListening, speaking, onCancelSpeaking, start, stop, reset, onSend])

  const orbState = resolveOrbState(isSupported, busy, isListening, speaking)

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <div className="min-h-[2.5rem] max-w-2xl px-4 text-center">
        <Caption isListening={isListening} busy={busy} speaking={speaking} display={display} />
      </div>

      <VoiceOrb state={orbState} onClick={handleOrbClick} size={size} />

      <div className="min-h-[1.25rem] text-center">
        <StatusLine isSupported={isSupported} error={error} isListening={isListening} />
      </div>
    </div>
  )
}
