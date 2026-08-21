'use client'
import { useState } from 'react'
import { useAdmin } from '../layout'
import { supabase } from '@/lib/supabase'
import { Zap } from 'lucide-react'

async function authedFetch(url, body) {
  const { data: { session } } = await supabase.auth.getSession()
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
    body: JSON.stringify(body),
  })
  return res.json()
}

export default function SparksPage() {
  const { admin } = useAdmin()
  const permissions = admin?.permissions || []
  const can = admin?.role === 'super_admin' || permissions.includes('sparks')

  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)

  const handleGrant = async (e) => {
    e.preventDefault()
    const parsed = parseInt(amount, 10)
    if (!parsed || parsed <= 0) return
    if (!confirm(`Give ${parsed} SPK to every user on the platform?`)) return

    setSending(true)
    setResult(null)
    const res = await authedFetch('/api/admin/sparks/grant', { all: true, amount: parsed, reason: reason.trim() })
    setSending(false)

    if (res.error) setResult({ error: res.error })
    else {
      setResult({ success: true, count: res.recipientCount })
      setAmount('')
      setReason('')
    }
  }

  if (!can) {
    return (
      <div style={{ color: 'var(--text-3, #888)', fontSize: '0.85rem' }}>
        You don't have access to Sparks. Ask a super admin to grant you the "sparks" permission.
      </div>
    )
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.4rem' }}>Broadcast Sparks</h1>
      <p style={{ fontSize: '0.82rem', color: '#888', marginBottom: '1.25rem' }}>
        Gives every user on the platform the same amount of Sparks. For a single user, use the Give Sparks action on the Users page.
      </p>

      <form onSubmit={handleGrant} style={{ background: '#fff', border: '1px solid #e2e2e2', borderRadius: 14, padding: '1.5rem', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        <input type="number" min="1" placeholder="Amount (SPK)" value={amount} onChange={(e) => setAmount(e.target.value)} required style={inputStyle} />
        <input placeholder="Reason (optional, shown to users)" value={reason} onChange={(e) => setReason(e.target.value)} style={inputStyle} />

        {result?.error && <div style={{ color: '#d33', fontSize: '0.8rem' }}>{result.error}</div>}
        {result?.success && <div style={{ color: '#2a9d5c', fontSize: '0.8rem' }}>Granted to {result.count} users.</div>}

        <button
          type="submit" disabled={sending}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.7rem', borderRadius: 8, background: '#0b7375', color: 'white', border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', opacity: sending ? 0.7 : 1 }}
        >
          <Zap size={15} /> {sending ? 'Sending...' : 'Give to Everyone'}
        </button>
      </form>
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '0.6rem 0.8rem', borderRadius: 8, border: '1px solid #e2e2e2',
  fontSize: '0.85rem', boxSizing: 'border-box',
}
