import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Jarvis Prime - AI Orchestrator',
  description: 'Personal AI orchestrator with domain-specific agents',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
