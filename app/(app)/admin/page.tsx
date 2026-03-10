import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Header from '@/components/layout/Header'
import WhitelistManager from '@/components/admin/WhitelistManager'
import UserList from '@/components/admin/UserList'

function checkAdmin(user: Awaited<ReturnType<typeof currentUser>>): boolean {
  if (!user) return false
  const adminEmail = process.env.ADMIN_EMAIL
  const email = user.emailAddresses[0]?.emailAddress
  return (
    user.publicMetadata?.role === 'admin' ||
    (!!adminEmail && email === adminEmail)
  )
}

export default async function AdminPage() {
  const user = await currentUser()

  if (!user || !checkAdmin(user)) {
    redirect('/')
  }

  return (
    <>
      <Header title="Admin" />
      <div className="p-6 space-y-6">
        <WhitelistManager />
        <UserList />
      </div>
    </>
  )
}
