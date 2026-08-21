'use client'
import { useState } from 'react'
import { useAdmin } from '../layout'
import { supabase } from '@/lib/supabase'
import { Send } from 'lucide-react'

async function authedFetch(url, body) {
  const { data: { session } } = await supabase.auth.getSession()
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
    body: JSON.stringify(body),
  })
  return res.json()
}

export default function NotificationsPage() {
  const { admin } = useAdmin()
  const permissions = admin?.permissions || []
  const can = admin?.role === 'super_admin' || permissions.includes('notifications')

  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)

  const handleSend = async (e) => {
    e.preventDefault()
    if (!title.trim() || !message.trim()) return
    if (!confirm('Send this notification to every user on the platform?')) return

    setSending(true)
    setResult(null)
    const res = await authedFetch('/api/admin/notifications/send', { all: true, title: title.trim(), message: message.trim() })
    setSending(false)

    if (res.error) setResult({ error: res.error })
    else {
      setResult({ success: true, count: res.recipientCount })
      setTitle('')
      setMessage('')
    }
  }

  if (!can) {
    return (
      <div style={{ color: 'var(--text-3, #888)', fontSize: '0.85rem' }}>
        You don't have access to Notifications. Ask a super admin to grant you the "notifications" permission.
      </div>
    )
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.4rem' }}>Broadcast Notification</h1>
      <p style={{ fontSize: '0.82rem', color: '#888', marginBottom: '1.25rem' }}>
        Sends to every user on the platform. For a single user, use the Notify action on the Users page.
      </p>

      <form onSubmit={handleSend} style={{ background: '#fff', border: '1px solid #e2e2e2', borderRadius: 14, padding: '1.5rem', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required style={inputStyle} />
        <textarea placeholder="Message" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} required style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />

        {result?.error && <div style={{ color: '#d33', fontSize: '0.8rem' }}>{result.error}</div>}
        {result?.success && <div style={{ color: '#2a9d5c', fontSize: '0.8rem' }}>Sent to {result.count} users.</div>}

        <button
          type="submit" disabled={sending}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.7rem', borderRadius: 8, background: '#0b7375', color: 'white', border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', opacity: sending ? 0.7 : 1 }}
        >
          <Send size={15} /> {sending ? 'Sending...' : 'Send to Everyone'}
        </button>
      </form>
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '0.6rem 0.8rem', borderRadius: 8, border: '1px solid #e2e2e2',
  fontSize: '0.85rem', boxSizing: 'border-box',
}
