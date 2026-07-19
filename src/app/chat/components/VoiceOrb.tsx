'use client'

import Image from 'next/image'

export type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'disabled'

interface VoiceOrbProps {
  state: OrbState
  onClick?: () => void
  size?: number
}

const LABELS: Record<OrbState, string> = {
  idle: 'Tap to speak',
  listening: 'Listening — tap to stop',
  thinking: 'Thinking…',
  speaking: 'Speaking — tap to stop',
  disabled: 'Voice input unavailable',
}

const GLOW: Record<OrbState, string> = {
  idle: 'bg-indigo-500/25 opacity-60',
  listening: 'bg-blue-500/60 opacity-100',
  thinking: 'bg-fuchsia-500/45 opacity-90',
  speaking: 'bg-amber-400/60 opacity-100',
  disabled: 'bg-gray-600/20 opacity-30',
}

export default function VoiceOrb({ state, onClick, size = 160 }: Readonly<VoiceOrbProps>) {
  const isListening = state === 'listening'
  const isSpeaking = state === 'speaking'
  const isDisabled = state === 'disabled'

  const bodyAnimation = isDisabled
    ? ''
    : isListening
      ? 'orb-breathe'
      : isSpeaking
        ? 'orb-speak'
        : 'orb-float'
  const imageScale = isListening || isSpeaking ? 'scale-105' : 'scale-100'
  const imageFilter = isDisabled ? 'opacity-60' : 'opacity-100'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      aria-label={LABELS[state]}
      className="group relative flex items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 disabled:cursor-not-allowed"
      style={{ width: size, height: size }}
    >
      {/* Expanding rings while listening or speaking */}
      {isListening && (
        <>
          <span className="orb-ring absolute inset-0 rounded-full bg-blue-500/30" />
          <span className="orb-ring-delayed absolute inset-0 rounded-full bg-fuchsia-500/20" />
        </>
      )}
      {isSpeaking && (
        <>
          <span className="orb-ring absolute inset-0 rounded-full bg-amber-400/30" />
          <span className="orb-ring-delayed absolute inset-0 rounded-full bg-orange-400/20" />
        </>
      )}

      {/* Reactive glow */}
      <span
        className={`absolute inset-0 rounded-full blur-2xl transition-opacity duration-500 ${GLOW[state]}`}
      />

      {/* Siri orb GIF */}
      <span
        className={`relative overflow-hidden rounded-full ${bodyAnimation}`}
        style={{ width: size * 0.88, height: size * 0.88 }}
      >
        <Image
          src="/siri-orb.gif"
          alt="Voice assistant orb"
          width={size}
          height={size}
          unoptimized
          priority
          className={`h-full w-full rounded-full object-cover transition-all duration-500 ${imageScale} ${imageFilter}`}
        />
      </span>
    </button>
  )
}
