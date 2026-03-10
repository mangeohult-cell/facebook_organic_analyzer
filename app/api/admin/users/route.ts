import { currentUser, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

function checkAdmin(user: Awaited<ReturnType<typeof currentUser>>): boolean {
  if (!user) return false
  const adminEmail = process.env.ADMIN_EMAIL
  const email = user.emailAddresses[0]?.emailAddress
  return (
    user.publicMetadata?.role === 'admin' ||
    (!!adminEmail && email === adminEmail)
  )
}

export async function GET() {
  const user = await currentUser()
  if (!checkAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const client = await clerkClient()
  const response = await client.users.getUserList({ limit: 100 })

  const users = response.data.map((u) => ({
    id: u.id,
    email: u.emailAddresses[0]?.emailAddress ?? null,
    firstName: u.firstName,
    lastName: u.lastName,
    createdAt: u.createdAt,
    role: (u.publicMetadata?.role as string) ?? null,
  }))

  return NextResponse.json(users)
}
