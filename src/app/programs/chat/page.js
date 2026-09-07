'use client'
import { useEffect, useRef, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import LoadingScreen from '@/components/LoadingScreen'
import { ArrowLeft, Send, Lock, Settings } from 'lucide-react'

function initials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase()
}

function ProgramChatInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const programId = searchParams.get('id')

  const [user, setUser] = useState(null)
  const [program, setProgram] = useState(null)
  const [isCreator, setIsCreator] = useState(false)
  const [messages, setMessages] = useState([])
  const [senders, setSenders] = useState({})
  const [loading, setLoading] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const scrollRef = useRef(null)
  const channelRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      if (!programId) { setAccessDenied(true); setLoading(false); return }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      if (cancelled) return
      setUser(user)

      const { data: prog } = await supabase.from('programs').select('*').eq('id', programId).maybeSingle()
      if (!prog) { setAccessDenied(true); setLoading(false); return }

      const creator = prog.creator_id === user.id
      let enrolled = false
      if (!creator) {
        const { data: enrollment } = await supabase.from('program_enrollments').select('id').eq('program_id', programId).eq('student_id', user.id).maybeSingle()
        enrolled = !!enrollment
      }
      if (!creator && !enrolled) { setAccessDenied(true); setLoading(false); return }
      if (!prog.group_chat_enabled) { setAccessDenied(true); setLoading(false); return }

      setProgram(prog)
      setIsCreator(creator)

      const { data: msgs } = await supabase.from('program_messages').select('*').eq('program_id', programId).order('created_at', { ascending: true })
      setMessages(msgs || [])

      const senderIds = Array.from(new Set((msgs || []).map(m => m.sender_id)))
      if (senderIds.length > 0) {
        const { data: profiles } = await supabase.from('profiles').select('id, full_name, avatar_url').in('id', senderIds)
        setSenders(Object.fromEntries((profiles || []).map(p => [p.id, p])))
      }

      setLoading(false)

      const channel = supabase
        .channel(`program_chat_${programId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'program_messages', filter: `program_id=eq.${programId}` }, async (payload) => {
          setMessages(prev => [...prev, payload.new])
          setSenders(prev => {
            if (prev[payload.new.sender_id]) return prev
            supabase.from('profiles').select('id, full_name, avatar_url').eq('id', payload.new.sender_id).maybeSingle()
              .then(({ data }) => { if (data) setSenders(p => ({ ...p, [data.id]: data })) })
            return prev
          })
        })
        .subscribe()
      channelRef.current = channel
    }

    load()
    return () => {
      cancelled = true
      if (channelRef.current) supabase.removeChannel(channelRef.current)
    }
  }, [programId])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  const canSend = isCreator || program?.chat_students_can_send

  const handleSend = async (e) => {
    e.preventDefault()
    if (!draft.trim() || sending || !canSend) return
    setSending(true)
    const content = draft.trim()
    setDraft('')
    const { error } = await supabase.from('program_messages').insert({ program_id: programId, sender_id: user.id, content })
    if (error) console.error('Message failed to send', error)
    setSending(false)
  }

  const toggleStudentsCanSend = async () => {
    const next = !program.chat_students_can_send
    setProgram(p => ({ ...p, chat_students_can_send: next }))
    await supabase.from('programs').update({ chat_students_can_send: next }).eq('id', programId)
  }

  if (loading) return <div><Navbar /><LoadingScreen text="Loading chat..." /></div>

  if (accessDenied) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <Navbar />
        <div className="page-wrap" style={{ maxWidth: 480, textAlign: 'center', paddingTop: '4rem' }}>
          <Lock size={40} style={{ margin: '0 auto 1rem', color: 'var(--border-2)' }} />
          <h2 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Can't open this chat</h2>
          <p style={{ color: 'var(--text-2)', marginBottom: '1.5rem' }}>
            Either this chat doesn't exist, group chat isn't enabled for it, or you're not enrolled in this program.
          </p>
          <a href="/group-chats" style={{ color: 'var(--brand)', fontWeight: 700, textDecoration: 'none' }}>← Back to Group Chats</a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ maxWidth: 700, margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', padding: '1.25rem 1.5rem' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <a href="/group-chats" style={{ display: 'flex', color: 'var(--text-2)' }}><ArrowLeft size={20} /></a>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{program.title}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Group Chat</div>
          </div>
          {isCreator && (
            <button onClick={() => setShowSettings(s => !s)} title="Chat settings" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', display: 'flex' }}>
              <Settings size={19} />
            </button>
          )}
        </div>

        {isCreator && showSettings && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
            <span>Allow students to send messages</span>
            <button
              onClick={toggleStudentsCanSend}
              style={{
                width: 42, height: 24, borderRadius: 999, border: 'none', cursor: 'pointer', position: 'relative',
                background: program.chat_students_can_send ? 'var(--brand)' : 'var(--border)', transition: 'background 0.15s',
              }}
            >
              <span style={{
                position: 'absolute', top: 2, left: program.chat_students_can_send ? 20 : 2, width: 20, height: 20,
                borderRadius: '50%', background: 'white', transition: 'left 0.15s',
              }} />
            </button>
          </div>
        )}

        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem', paddingBottom: '1rem', minHeight: 300 }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: '0.85rem', marginTop: '2rem' }}>
              No messages yet — {isCreator ? 'say hello to the group!' : 'be the first to say hello!'}
            </div>
          )}
          {messages.map(m => {
            const mine = m.sender_id === user.id
            const sender = senders[m.sender_id]
            return (
              <div key={m.id} style={{ display: 'flex', gap: '0.6rem', flexDirection: mine ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
                  background: sender?.avatar_url ? undefined : 'linear-gradient(135deg, var(--brand), var(--brand-mid, var(--brand)))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.65rem', fontWeight: 700,
                }}>
                  {sender?.avatar_url ? <img src={sender.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials(sender?.full_name)}
                </div>
                <div style={{ maxWidth: '72%' }}>
                  {!mine && <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginBottom: '0.15rem', marginLeft: '0.2rem' }}>{sender?.full_name || 'Someone'}</div>}
                  <div style={{
                    padding: '0.55rem 0.8rem', borderRadius: 14, fontSize: '0.85rem', lineHeight: 1.45,
                    background: mine ? 'var(--brand)' : 'var(--surface-2)', color: mine ? 'white' : 'var(--text)',
                    borderBottomRightRadius: mine ? 4 : 14, borderBottomLeftRadius: mine ? 14 : 4,
                  }}>
                    {m.content}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {canSend ? (
          <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.6rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
            <input
              value={draft} onChange={e => setDraft(e.target.value)} placeholder="Type a message..."
              style={{ flex: 1, padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid var(--border)', fontSize: '0.9rem', background: 'var(--surface)', color: 'var(--text)' }}
            />
            <button
              type="submit" disabled={sending || !draft.trim()}
              style={{ width: 44, height: 44, borderRadius: 10, border: 'none', background: 'var(--brand)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, opacity: sending || !draft.trim() ? 0.6 : 1 }}
            >
              <Send size={17} />
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-3)', padding: '0.75rem', borderTop: '1px solid var(--border)' }}>
            Only the educator can post in this chat right now.
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProgramChatPage() {
  return (
    <Suspense fallback={<div><Navbar /><LoadingScreen text="Loading chat..." /></div>}>
      <ProgramChatInner />
    </Suspense>
  )
}
