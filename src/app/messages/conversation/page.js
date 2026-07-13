'use client'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { ArrowLeft, Send } from 'lucide-react'

function ConversationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const otherUserId = searchParams.get('id')

  const [user, setUser] = useState(null)
  const [otherUser, setOtherUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [debugInfo, setDebugInfo] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!otherUserId) { setLoading(false); return }
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      if (user.id === otherUserId) { router.push('/messages'); return }
      setUser(user)

      const { data: otherProf, error: otherProfError } = await supabase.from('profiles').select('id, full_name, account_type').eq('id', otherUserId).single()
      setOtherUser(otherProf)
      setDebugInfo({ otherUserId, otherProfError: otherProfError?.message })

      await fetchMessages(user.id)
      await markAsRead(user.id)
      setLoading(false)
    }
    init()
  }, [otherUserId])

  const fetchMessages = async (uid) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${uid},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${uid})`)
      .order('created_at', { ascending: true })
    setMessages(data || [])
  }

  const markAsRead = async (uid) => {
    await supabase.from('messages').update({ is_read: true }).eq('sender_id', otherUserId).eq('receiver_id', uid).eq('is_read', false)
  }

  // Real-time: listen for new incoming messages from this specific conversation
  useEffect(() => {
    if (!user || !otherUserId) return
    const channel = supabase
      .channel('messages-' + user.id + '-' + otherUserId)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` }, (payload) => {
        if (payload.new.sender_id === otherUserId) {
          setMessages(prev => [...prev, payload.new])
          supabase.from('messages').update({ is_read: true }).eq('id', payload.new.id)
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user, otherUserId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending || !otherUserId) return
    setSending(true)
    setInput('')

    const optimistic = {
      id: 'temp-' + Date.now(),
      sender_id: user.id,
      receiver_id: otherUserId,
      content: text,
      is_read: false,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimistic])

    const { data, error } = await supabase.from('messages').insert({
      sender_id: user.id, receiver_id: otherUserId, content: text
    }).select().single()

    if (!error && data) {
      setMessages(prev => prev.map(m => m.id === optimistic.id ? data : m))
    }
    setSending(false)
  }

  const formatTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  if (loading) return <div><Navbar /><div className="loading-wrap"><div className="spinner" /> Loading conversation...</div></div>

  if (!otherUserId) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <Navbar />
        <div className="page-wrap">
          <div className="alert alert-error">No conversation selected. Go back to <a href="/messages" style={{ color: 'var(--brand)', fontWeight: 700 }}>Messages</a> and pick someone to chat with.</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ maxWidth: 680, margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', padding: '1.5rem 1.5rem 0' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border)', marginBottom: '1.25rem' }}>
          <a href="/messages" style={{ color: 'var(--text-2)', display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={18} />
          </a>
          <a href={'/profile?id=' + otherUserId} style={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, var(--brand), var(--brand-mid))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700
          }}>
            {otherUser?.full_name?.[0]?.toUpperCase() || '?'}
          </a>
          <div>
            <a href={'/profile?id=' + otherUserId} style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>{otherUser?.full_name || 'Unknown User'}</a>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{otherUser?.account_type}</div>
          </div>
        </div>

        {!otherUser && (
          <div className="alert alert-error" style={{ fontSize: '0.78rem', fontFamily: 'monospace' }}>
            Debug: could not find a profile for this conversation.<br />
            otherUserId param = "{String(debugInfo?.otherUserId)}"<br />
            {debugInfo?.otherProfError && <>Supabase error: {debugInfo.otherProfError}<br /></>}
          </div>
        )}

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingBottom: '1rem' }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: '0.85rem', padding: '3rem 1rem' }}>
              No messages yet. Say hello to {otherUser?.full_name?.split(' ')[0] || 'them'}!
            </div>
          ) : (
            messages.map(msg => {
              const isMine = msg.sender_id === user.id
              return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '75%', padding: '0.65rem 0.95rem', borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    background: isMine ? 'var(--brand)' : 'var(--surface-2)',
                    color: isMine ? 'white' : 'var(--text)',
                    border: isMine ? 'none' : '1px solid var(--border)',
                  }}>
                    <div style={{ fontSize: '0.875rem', lineHeight: 1.5, wordBreak: 'break-word' }}>{msg.content}</div>
                    <div style={{ fontSize: '0.65rem', marginTop: '0.3rem', opacity: 0.7, textAlign: 'right' }}>{formatTime(msg.created_at)}</div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} style={{ display: 'flex', gap: '0.625rem', padding: '1rem 0', borderTop: '1px solid var(--border)', background: 'var(--bg)', position: 'sticky', bottom: 0 }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message..."
            className="form-input"
            style={{ flex: 1 }}
          />
          <button type="submit" disabled={!input.trim() || sending} className="btn btn-primary btn-icon" style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', flexShrink: 0 }}>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  )
}

export default function ConversationPage() {
  return (
    <Suspense fallback={<div><Navbar /><div className="loading-wrap"><div className="spinner" /> Loading...</div></div>}>
      <ConversationContent />
    </Suspense>
  )
}
