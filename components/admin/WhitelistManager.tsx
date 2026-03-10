'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/shared/Card'
import Button from '@/components/shared/Button'
import { Trash2, Plus, Mail } from 'lucide-react'

type WhitelistEntry = {
  id: string
  email: string
  added_by: string | null
  added_at: string
}

export default function WhitelistManager() {
  const [entries, setEntries] = useState<WhitelistEntry[]>([])
  const [newEmail, setNewEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    const res = await fetch('/api/admin/whitelist')
    const data = await res.json()
    setEntries(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function addEmail() {
    if (!newEmail.trim()) return
    setAdding(true)
    setError('')
    const res = await fetch('/api/admin/whitelist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newEmail.trim() }),
    })
    if (res.ok) {
      setNewEmail('')
      load()
    } else {
      const d = await res.json()
      setError(d.error || 'Något gick fel')
    }
    setAdding(false)
  }

  async function removeEmail(email: string) {
    await fetch('/api/admin/whitelist', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    load()
  }

  return (
    <Card>
      <div className="flex items-center gap-2 mb-1">
        <Mail className="w-5 h-5 text-[#ED5821]" />
        <h2 className="text-lg font-semibold text-[#303942]">E-post whitelist</h2>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Endast e-postadresser i listan kan logga in. Lämnas listan tom har alla autentiserade användare tillgång.
      </p>

      <div className="flex gap-2 mb-3">
        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addEmail()}
          placeholder="namn@foretag.se"
          className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ED5821]"
        />
        <Button onClick={addEmail} disabled={adding} size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Lägg till
        </Button>
      </div>

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-400">Laddar...</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-gray-400 italic">Listan är tom – alla inloggade användare har tillgång</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-center justify-between py-2.5">
              <div>
                <p className="text-sm font-medium text-[#303942]">{entry.email}</p>
                <p className="text-xs text-gray-400">
                  Tillagd {new Date(entry.added_at).toISOString().slice(0, 10)}
                  {entry.added_by && ` av ${entry.added_by}`}
                </p>
              </div>
              <button
                onClick={() => removeEmail(entry.email)}
                className="text-red-400 hover:text-red-600 transition-colors p-1 rounded"
                title="Ta bort"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
