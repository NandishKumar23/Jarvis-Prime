import { redirect } from 'next/navigation'
import { auth } from '@/auth'

export default async function Home() {
  const session = await auth()

  // Redirect to sign-in if not authenticated
  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Redirect to chat if authenticated
  redirect('/chat')
}
