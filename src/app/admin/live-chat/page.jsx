'use client'
import { useEffect, useRef, useState } from 'react'
import { useAdmin } from '../layout'
import { supabase } from '@/lib/supabase'
import { Send, CheckCircle2, User } from 'lucide-react'

export default function LiveChatPage() {
  const { admin } = useAdmin()
  const permissions = admin?.permissions || []

  const [tab, setTab] = useState('open') // 'open' | 'closed'
  const [sessions, setSessions] = useState([])
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [activeId, setActiveId] = useState(null)
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)

  const scrollRef = useRef(null)
  const sessionsChannelRef = useRef(null)
  const messagesChannelRef = useRef(null)

  const hasAccess = permissions.includes('live_chat')
  const activeSession = sessions.find((s) => s.id === activeId) || null

  // Load session list + subscribe to session-level changes (new chats, status updates)
  useEffect(() => {
    if (!hasAccess) return

    let cancelled = false
    const loadSessions = async () => {
      setLoadingSessions(true)
      const { data } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('last_message_at', { ascending: false })
      if (!cancelled) {
        setSessions(data || [])
        setLoadingSessions(false)
      }
    }
    loadSessions()

    const channel = supabase
      .channel('admin_chat_sessions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_sessions' }, (payload) => {
        setSessions((prev) => {
          if (payload.eventType === 'INSERT') return [payload.new, ...prev]
          if (payload.eventType === 'UPDATE') return prev.map((s) => (s.id === payload.new.id ? payload.new : s))
          if (payload.eventType === 'DELETE') return prev.filter((s) => s.id !== payload.old.id)
          return prev
        })
      })
      .subscribe()
    sessionsChannelRef.current = channel

    return () => {
      cancelled = true
      if (sessionsChannelRef.current) supabase.removeChannel(sessionsChannelRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAccess])

  // Load + subscribe to the active thread
  useEffect(() => {
    if (!activeId) {
      setMessages([])
      return
    }

    let cancelled = false
    supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', activeId)
      .order('created_at', { ascending: true })
      .then(({ data }) => { if (!cancelled) setMessages(data || []) })

    if (messagesChannelRef.current) supabase.removeChannel(messagesChannelRef.current)
    const channel = supabase
      .channel(`admin_chat_messages_${activeId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `session_id=eq.${activeId}` },
        (payload) => setMessages((prev) => [...prev, payload.new])
      )
      .subscribe()
    messagesChannelRef.current = channel

    return () => {
      cancelled = true
      if (messagesChannelRef.current) supabase.removeChannel(messagesChannelRef.current)
    }
  }, [activeId])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  async function handleSend(e) {
    e.preventDefault()
    if (!draft.trim() || !activeSession || sending) return

    setSending(true)
    const content = draft.trim()
    setDraft('')

    const { error } = await supabase.from('chat_messages').insert({
      session_id: activeSession.id,
      sender: 'admin',
      sender_admin_id: admin.id,
      content,
    })
    if (error) console.error('Reply failed', error)
    setSending(false)
  }

  async function handleCloseChat() {
    if (!activeSession) return
    await supabase
      .from('chat_sessions')
      .update({ status: 'closed', closed_at: new Date().toISOString() })
      .eq('id', activeSession.id)
  }

  if (!hasAccess) {
    return (
      <div style={{ color: 'var(--text-3, #888)', fontSize: '0.85rem' }}>
        You don't have access to Live Chat. Ask a super admin to grant you the "live_chat" permission.
      </div>
    )
  }

  const filteredSessions = sessions.filter((s) => s.status === tab)

  return (
    <div>
      <h1 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.25rem' }}>Live Chat</h1>

      <div style={{ display: 'flex', gap: '1.25rem', height: 'calc(100vh - 180px)', minHeight: 420 }}>
        {/* Session list */}
        <div style={{ width: 300, flexShrink: 0, background: 'var(--surface, #fff)', border: '1px solid var(--border, #e2e2e2)', borderRadius: 14, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border, #e2e2e2)', flexShrink: 0 }}>
            {['open', 'closed'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  flex: 1, padding: '0.7rem', border: 'none', background: 'none', cursor: 'pointer',
                  fontSize: '0.8rem', fontWeight: 700, textTransform: 'capitalize',
                  color: tab === t ? 'var(--brand, #0b7375)' : 'var(--text-3, #888)',
                  borderBottom: tab === t ? '2px solid var(--brand, #0b7375)' : '2px solid transparent',
                }}
              >
                {t} {t === 'open' ? `(${sessions.filter((s) => s.status === 'open').length})` : ''}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loadingSessions && <div style={{ padding: '1rem', color: 'var(--text-3, #888)', fontSize: '0.8rem' }}>Loading...</div>}
            {!loadingSessions && filteredSessions.length === 0 && (
              <div style={{ padding: '1rem', color: 'var(--text-3, #888)', fontSize: '0.8rem' }}>No {tab} chats.</div>
            )}
            {filteredSessions.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveId(s.id)}
                style={{
                  width: '100%', textAlign: 'left', padding: '0.8rem 1rem', border: 'none', cursor: 'pointer',
                  background: activeId === s.id ? 'var(--surface-2, #f4f6f5)' : 'transparent',
                  borderBottom: '1px solid var(--border, #eee)', display: 'flex', flexDirection: 'column', gap: '0.15rem',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <User size={13} style={{ color: 'var(--text-3, #888)' }} />
                  {s.visitor_name || 'Guest visitor'}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-3, #888)' }}>
                  {s.visitor_email || 'No email'} · {new Date(s.last_message_at).toLocaleString()}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Thread */}
        <div style={{ flex: 1, background: 'var(--surface, #fff)', border: '1px solid var(--border, #e2e2e2)', borderRadius: 14, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {!activeSession && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3, #888)', fontSize: '0.85rem' }}>
              Select a chat to view the conversation
            </div>
          )}

          {activeSession && (
            <>
              <div style={{ padding: '0.9rem 1.1rem', borderBottom: '1px solid var(--border, #e2e2e2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{activeSession.visitor_name || 'Guest visitor'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-3, #888)' }}>{activeSession.visitor_email || 'No email'} · {activeSession.source_page}</div>
                </div>
                {activeSession.status === 'open' ? (
                  <button
                    onClick={handleCloseChat}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.8rem', borderRadius: 8,
                      border: '1px solid var(--border, #e2e2e2)', background: 'transparent', fontSize: '0.78rem',
                      fontWeight: 700, cursor: 'pointer', color: 'var(--text-2, #555)',
                    }}
                  >
                    <CheckCircle2 size={14} /> Close chat
                  </button>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-3, #888)', fontWeight: 700 }}>Closed</span>
                )}
              </div>

              <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {messages.map((m) => (
                  <div key={m.id} style={{ display: 'flex', justifyContent: m.sender === 'admin' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '70%', padding: '0.55rem 0.8rem', borderRadius: 12, fontSize: '0.84rem', lineHeight: 1.5,
                      background: m.sender === 'admin' ? 'var(--brand, #0b7375)' : 'var(--surface-2, #f4f6f5)',
                      color: m.sender === 'admin' ? 'white' : 'var(--text-2, #444)',
                    }}>
                      {m.content}
                    </div>
                  </div>
                ))}
              </div>

              {activeSession.status === 'open' && (
                <form onSubmit={handleSend} style={{ padding: '0.8rem 1rem', borderTop: '1px solid var(--border, #e2e2e2)', display: 'flex', gap: '0.6rem', flexShrink: 0 }}>
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Type a reply..."
                    style={{ flex: 1, padding: '0.65rem 0.85rem', borderRadius: 10, border: '1px solid var(--border, #e2e2e2)', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                  <button
                    type="submit"
                    disabled={sending || !draft.trim()}
                    style={{
                      width: 42, height: 42, borderRadius: 10, border: 'none', background: 'var(--brand, #0b7375)', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
                      opacity: sending || !draft.trim() ? 0.6 : 1,
                    }}
                  >
                    <Send size={16} />
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
