import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/supabase-admin'
import { getSupabase } from '@/lib/supabase'

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
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('whitelist')
    .select('*')
    .order('added_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const user = await currentUser()
  if (!checkAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'E-post krävs' }, { status: 400 })

  const supabase = getAdminSupabase()
  const { data, error } = await supabase
    .from('whitelist')
    .insert({
      email: email.toLowerCase().trim(),
      added_by: user!.emailAddresses[0]?.emailAddress,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: Request) {
  const user = await currentUser()
  if (!checkAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'E-post krävs' }, { status: 400 })

  const supabase = getAdminSupabase()
  const { error } = await supabase.from('whitelist').delete().eq('email', email)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
