'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// ---------------------------------------------------------------------------
// Minimal Web Speech API typings (not in the DOM lib by default)
// ---------------------------------------------------------------------------

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionResult {
  readonly length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionResultList {
  readonly length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number
  readonly results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string
  readonly message: string
}

interface SpeechRecognitionLike extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

interface SpeechWindow extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor
  webkitSpeechRecognition?: SpeechRecognitionConstructor
}

function getRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null
  const w = window as SpeechWindow
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export interface UseSpeechRecognitionOptions {
  lang?: string
  /** Called with each finalized chunk of transcript. */
  onFinal?: (text: string) => void
  /** Called with the current interim (not-yet-final) text. */
  onInterim?: (text: string) => void
}

export interface UseSpeechRecognitionResult {
  isSupported: boolean
  isListening: boolean
  interimTranscript: string
  error: string | null
  start: () => void
  stop: () => void
  toggle: () => void
}

/**
 * Thin, typed wrapper around the browser Web Speech API.
 * Streams finalized chunks via `onFinal` and live text via `onInterim`.
 */
export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {},
): UseSpeechRecognitionResult {
  const { lang = 'en-US', onFinal, onInterim } = options

  // Start `false` so SSR and the first client render agree (avoids hydration
  // mismatch); the real capability is detected after mount.
  const [isSupported, setIsSupported] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const onFinalRef = useRef(onFinal)
  const onInterimRef = useRef(onInterim)
  onFinalRef.current = onFinal
  onInterimRef.current = onInterim

  // Lazily construct the recognition instance once.
  useEffect(() => {
    const Ctor = getRecognitionCtor()
    if (!Ctor) return

    setIsSupported(true)

    const recognition = new Ctor()
    recognition.lang = lang
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setError(null)
      setIsListening(true)
    }

    recognition.onresult = (event) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const text = result[0]?.transcript ?? ''
        if (result.isFinal) {
          onFinalRef.current?.(text)
        } else {
          interim += text
        }
      }
      setInterimTranscript(interim)
      onInterimRef.current?.(interim)
    }

    recognition.onerror = (event) => {
      if (event.error === 'aborted' || event.error === 'no-speech') return
      setError(event.error || 'Speech recognition error')
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
      setInterimTranscript('')
    }

    recognitionRef.current = recognition

    return () => {
      recognition.onresult = null
      recognition.onerror = null
      recognition.onend = null
      recognition.onstart = null
      recognition.abort()
      recognitionRef.current = null
    }
  }, [lang])

  const start = useCallback(() => {
    const recognition = recognitionRef.current
    if (!recognition || isListening) return
    try {
      recognition.start()
    } catch {
      // start() throws if already started; ignore.
    }
  }, [isListening])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  const toggle = useCallback(() => {
    if (isListening) stop()
    else start()
  }, [isListening, start, stop])

  return { isSupported, isListening, interimTranscript, error, start, stop, toggle }
}
