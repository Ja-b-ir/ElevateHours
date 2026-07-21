'use client'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { ArrowLeft, Send, Lock } from 'lucide-react'

function ProgramChatContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const programId = searchParams.get('id')

  const [user, setUser] = useState(null)
  const [program, setProgram] = useState(null)
  const [isCreator, setIsCreator] = useState(false)
  const [canSend, setCanSend] = useState(false)
  const [messages, setMessages] = useState([])
  const [sendersById, setSendersById] = useState({})
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!programId) { setLoading(false); return }
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUser(user)

      const { data: prog } = await supabase.from('programs').select('*').eq('id', programId).single()
      if (!prog) { setAccessDenied(true); setLoading(false); return }
      setProgram(prog)

      const creator = prog.creator_id === user.id
      setIsCreator(creator)

      let enrolled = false
      if (!creator) {
        const { data: enrollment } = await supabase.from('program_enrollments').select('id').eq('program_id', programId).eq('student_id', user.id).maybeSingle()
        enrolled = !!enrollment
      }

      if (!creator && !enrolled) { setAccessDenied(true); setLoading(false); return }
      if (!prog.group_chat_enabled) { setAccessDenied(true); setLoading(false); return }

      setCanSend(creator || prog.chat_students_can_send)

      await fetchMessages()
      setLoading(false)
    }
    init()
  }, [programId])

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('program_messages')
      .select('*')
      .eq('program_id', programId)
      .order('created_at', { ascending: true })

    if (error) { console.error(error); return }

    const senderIds = Array.from(new Set((data || []).map(m => m.sender_id)))
    if (senderIds.length > 0) {
      const { data: profiles } = await supabase.from('profiles').select('id, full_name, account_type').in('id', senderIds)
      setSendersById(prev => ({ ...prev, ...Object.fromEntries((profiles || []).map(p => [p.id, p])) }))
    }
    setMessages(data || [])
  }

  useEffect(() => {
    if (!programId || accessDenied) return
    const channel = supabase
      .channel('program-chat-' + programId)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'program_messages', filter: `program_id=eq.${programId}` }, async (payload) => {
        setMessages(prev => [...prev, payload.new])
        if (!sendersById[payload.new.sender_id]) {
          const { data: prof } = await supabase.from('profiles').select('id, full_name, account_type').eq('id', payload.new.sender_id).single()
          if (prof) setSendersById(prev => ({ ...prev, [prof.id]: prof }))
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [programId, accessDenied])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending || !canSend) return
    setSending(true)
    setInput('')

    const optimistic = { id: 'temp-' + Date.now(), program_id: programId, sender_id: user.id, content: text, created_at: new Date().toISOString() }
    setMessages(prev => [...prev, optimistic])

    const { data, error } = await supabase.from('program_messages').insert({ program_id: programId, sender_id: user.id, content: text }).select().single()
    if (!error && data) {
      setMessages(prev => prev.map(m => m.id === optimistic.id ? data : m))
    }
    setSending(false)
  }

  const formatTime = (ts) => new Date(ts).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  if (loading) return <div><Navbar /><div className="loading-wrap"><div className="spinner" /> Loading chat...</div></div>

  if (!programId || accessDenied) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <Navbar />
        <div className="page-wrap">
          <div className="alert alert-error">
            {!programId ? 'No program selected.' : "This chat isn't available — either group chat hasn't been enabled for this program, or you're not enrolled."}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ maxWidth: 720, margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', padding: '1.5rem 1.5rem 0' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border)', marginBottom: '1.25rem' }}>
          <a href={isCreator ? '/my-programs' : '/programs'} style={{ color: 'var(--text-2)', display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={18} />
          </a>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>{program?.title}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Group Chat</div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.625rem', paddingBottom: '1rem' }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: '0.85rem', padding: '3rem 1rem' }}>
              No messages yet. {isCreator ? 'Say hello to your students!' : 'No updates posted yet.'}
            </div>
          ) : (
            messages.map(msg => {
              const isMine = msg.sender_id === user.id
              const sender = sendersById[msg.sender_id]
              const senderIsCreator = program && msg.sender_id === program.creator_id
              return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxWidth: '78%' }}>
                    {!isMine && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontWeight: 600, marginBottom: '0.2rem', paddingLeft: '0.2rem' }}>
                        {sender?.full_name || '...'}{senderIsCreator ? ' (Educator)' : ''}
                      </div>
                    )}
                    <div style={{
                      padding: '0.65rem 0.95rem', borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                      background: isMine ? 'var(--brand)' : (senderIsCreator ? 'var(--amber-light)' : 'var(--surface-2)'),
                      color: isMine ? 'white' : 'var(--text)',
                      border: isMine ? 'none' : '1px solid var(--border)',
                    }}>
                      <div style={{ fontSize: '0.875rem', lineHeight: 1.5, wordBreak: 'break-word' }}>{msg.content}</div>
                      <div style={{ fontSize: '0.65rem', marginTop: '0.3rem', opacity: 0.7, textAlign: 'right' }}>{formatTime(msg.created_at)}</div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={bottomRef} />
        </div>

        {canSend ? (
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
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 0', borderTop: '1px solid var(--border)', color: 'var(--text-3)', fontSize: '0.82rem' }}>
            <Lock size={14} /> Only the educator can post in this chat.
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProgramChatPage() {
  return (
    <Suspense fallback={<div><Navbar /><div className="loading-wrap"><div className="spinner" /> Loading...</div></div>}>
      <ProgramChatContent />
    </Suspense>
  )
}
