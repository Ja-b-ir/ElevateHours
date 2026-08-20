'use client'
import { useEffect, useState } from 'react'
import { useAdmin } from '../layout'
import { supabase } from '@/lib/supabase'

export default function MessagesPage() {
  const { admin } = useAdmin()
  const permissions = admin?.permissions || []
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    if (!permissions.includes('contact_messages')) {
      setLoading(false)
      return
    }
    supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setMessages(data || [])
        setLoading(false)
      })
  }, [admin])

  if (!permissions.includes('contact_messages')) {
    return (
      <div style={{ color: 'var(--text-3, #888)', fontSize: '0.85rem' }}>
        You don't have access to Contact Messages. Ask a super admin to grant you the "contact_messages" permission.
      </div>
    )
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.25rem' }}>Contact Messages</h1>

      {loading && <div style={{ color: 'var(--text-3, #888)', fontSize: '0.85rem' }}>Loading...</div>}
      {!loading && messages.length === 0 && (
        <div style={{ color: 'var(--text-3, #888)', fontSize: '0.85rem' }}>No messages yet.</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxWidth: 720 }}>
        {messages.map((m) => {
          const expanded = expandedId === m.id
          return (
            <div key={m.id} style={{ background: 'var(--surface, #fff)', border: '1px solid var(--border, #e2e2e2)', borderRadius: 12, overflow: 'hidden' }}>
              <button
                onClick={() => setExpandedId(expanded ? null : m.id)}
                style={{ width: '100%', textAlign: 'left', padding: '0.9rem 1.1rem', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{m.name} <span style={{ fontWeight: 500, color: 'var(--text-3, #888)' }}>— {m.subject}</span></div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-3, #888)' }}>{m.email}</div>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-3, #888)', whiteSpace: 'nowrap' }}>
                  {new Date(m.created_at).toLocaleDateString()}
                </div>
              </button>
              {expanded && (
                <div style={{ padding: '0 1.1rem 1rem', fontSize: '0.82rem', lineHeight: 1.6, color: 'var(--text-2, #444)', borderTop: '1px solid var(--border, #e2e2e2)', paddingTop: '0.8rem' }}>
                  {m.message}
                  <div style={{ marginTop: '0.75rem' }}>
                    <a href={`mailto:${m.email}`} style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--brand, #0b7375)' }}>Reply by email →</a>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

