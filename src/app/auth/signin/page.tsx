'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'

// Force rebuild - updated styling v2
export default function SignInPage() {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)

  async function handleSignIn(provider: string) {
    setLoadingProvider(provider)
    await signIn(provider, { callbackUrl: '/chat' })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-r from-blue-500 to-blue-600 text-white text-xl font-bold">
            J
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Jarvis Prime</h1>
          <p className="text-sm text-gray-400">Your personal AI orchestrator</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-3 shadow-xl backdrop-blur-sm">
          <button
            type="button"
            onClick={() => handleSignIn('google')}
            disabled={!!loadingProvider}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-gray-800 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loadingProvider === 'google' ? <Spinner /> : <GoogleIcon />}
            <span>Continue with Google</span>
          </button>

          <button
            type="button"
            onClick={() => handleSignIn('github')}
            disabled={!!loadingProvider}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-gray-800 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loadingProvider === 'github' ? <Spinner /> : <GitHubIcon />}
            <span>Continue with GitHub</span>
          </button>
        </div>

        <p className="text-center text-xs text-gray-500">
          Use Google to enable Gmail and Calendar features.
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0" aria-label="Google logo">
      <title>Google</title>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="shrink-0"
      aria-label="GitHub logo"
    >
      <title>GitHub</title>
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

function Spinner() {
  return (
    <svg
      className="animate-spin shrink-0"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-label="Loading"
    >
      <title>Loading</title>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}
