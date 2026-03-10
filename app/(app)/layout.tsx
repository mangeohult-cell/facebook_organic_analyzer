import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import Sidebar from '@/components/layout/Sidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser()

  if (user) {
    const email = user.emailAddresses[0]?.emailAddress ?? ''

    // Allow @sverigeslarare.se domain automatically
    const allowedDomain = email.endsWith('@sverigeslarare.se')

    if (!allowedDomain) {
      // Fall back to individual whitelist for exceptions (e.g. mangeohult@gmail.com)
      const supabase = getSupabase()
      const { data: whitelist } = await supabase.from('whitelist').select('email')
      const isWhitelisted = whitelist?.some((w: { email: string }) => w.email === email) ?? false
      if (!isWhitelisted) {
        redirect('/unauthorized')
      }
    }
  }

  return (
    <div className="flex min-h-screen bg-[#F5F5F0]">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        {children}
      </main>
    </div>
  )
}
