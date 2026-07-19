'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export interface UseSpeechSynthesisResult {
  isSupported: boolean
  isSpeaking: boolean
  /** Queues text to be spoken after anything already queued finishes. */
  speak: (text: string) => void
  /** Stops speaking and clears the queue. */
  cancel: () => void
}

function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  // Prefer a measured, "assistant"-sounding English voice if one is available.
  const preferredNames = [
    'Daniel', // en-GB male, calm — closest free system voice to a JARVIS tone
    'Google UK English Male',
    'Microsoft Ryan',
    'Alex',
  ]
  for (const name of preferredNames) {
    const match = voices.find((v) => v.name.includes(name))
    if (match) return match
  }
  return voices.find((v) => v.lang.startsWith('en'))
}

/**
 * Thin, typed wrapper around the browser SpeechSynthesis API. Utterances are
 * queued and played back sequentially so overlapping calls never talk over
 * each other.
 */
export function useSpeechSynthesis(): UseSpeechSynthesisResult {
  const [isSupported, setIsSupported] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const voiceRef = useRef<SpeechSynthesisVoice | undefined>(undefined)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    setIsSupported(true)

    const loadVoices = () => {
      voiceRef.current = pickVoice(window.speechSynthesis.getVoices())
    }
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices

    return () => {
      window.speechSynthesis.onvoiceschanged = null
      window.speechSynthesis.cancel()
    }
  }, [])

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis || !text.trim()) return

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.voice = voiceRef.current ?? null
    utterance.rate = 0.98
    utterance.pitch = 0.9
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    // Queuing is native to speechSynthesis.speak(): calls made while already
    // speaking are appended and played in order.
    window.speechSynthesis.speak(utterance)
  }, [])

  const cancel = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  return { isSupported, isSpeaking, speak, cancel }
}
