import { redirect } from 'next/navigation'
import UserProfileDropdown from '@/app/chat/UserProfileDropdown'
import { auth } from '@/auth'

export default async function ChatPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">
            Jarvis <span className="text-blue-500">Prime</span>
          </h1>

          {/* User Profile Dropdown */}
          <UserProfileDropdown user={session.user} />
        </div>

        {/* Chat Interface */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/5 rounded-lg p-8 backdrop-blur-sm">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8 text-blue-400"
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
              <h2 className="text-2xl font-bold text-white">Welcome to Jarvis Prime!</h2>
              <p className="text-gray-400">
                Your AI orchestrator is ready. Chat interface coming soon...
              </p>
              <div className="flex gap-3 justify-center flex-wrap mt-6">
                <AgentBadge name="Knowledge" color="blue" />
                <AgentBadge name="Finance" color="green" />
                <AgentBadge name="Fitness" color="orange" />
                <AgentBadge name="Health" color="red" />
                <AgentBadge name="Comms" color="purple" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AgentBadge({ name, color }: Readonly<{ name: string; color: string }>) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    green: 'bg-green-500/10 text-green-400 border-green-500/30',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    red: 'bg-red-500/10 text-red-400 border-red-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  }

  return (
    <div
      className={`px-3 py-1.5 rounded-full border text-sm ${colorClasses[color as keyof typeof colorClasses]}`}
    >
      {name}
    </div>
  )
}
