'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/shared/Card'
import { Users } from 'lucide-react'

type ClerkUser = {
  id: string
  email: string | null
  firstName: string | null
  lastName: string | null
  createdAt: number
  role: string | null
}

export default function UserList() {
  const [users, setUsers] = useState<ClerkUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/users')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setUsers(data)
        else setError(data.error || 'Kunde inte hämta användare')
        setLoading(false)
      })
  }, [])

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-[#ED5821]" />
        <h2 className="text-lg font-semibold text-[#303942]">Registrerade användare</h2>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Laddar...</p>
      ) : error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="pb-2 font-medium pr-4">Namn</th>
                <th className="pb-2 font-medium pr-4">E-post</th>
                <th className="pb-2 font-medium pr-4">Roll</th>
                <th className="pb-2 font-medium">Registrerad</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const name = [u.firstName, u.lastName].filter(Boolean).join(' ') || '–'
                return (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2.5 pr-4 font-medium text-[#303942]">{name}</td>
                    <td className="py-2.5 pr-4 text-gray-600">{u.email || '–'}</td>
                    <td className="py-2.5 pr-4">
                      {u.role === 'admin' ? (
                        <span className="bg-[#ED5821] text-white text-xs px-2 py-0.5 rounded-full">
                          Admin
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">Användare</span>
                      )}
                    </td>
                    <td className="py-2.5 text-gray-400">
                      {new Date(u.createdAt).toISOString().slice(0, 10)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
