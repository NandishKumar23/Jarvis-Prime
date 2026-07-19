import { redirect } from 'next/navigation'
import ChatContainer from '@/app/chat/components/ChatContainer'
import UserProfileDropdown from '@/app/chat/UserProfileDropdown'
import { auth } from '@/auth'

export default async function ChatPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  return (
    <div className="hud-grid-bg min-h-screen bg-linear-to-br from-gray-900 via-gray-950 to-black">
      <div className="container mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">
            Jarvis <span className="text-blue-500">Prime</span>
          </h1>

          {/* User Profile Dropdown */}
          <UserProfileDropdown user={session.user} />
        </div>

        {/* Chat Interface */}
        <ChatContainer />
      </div>
    </div>
  )
}
