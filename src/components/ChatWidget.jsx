'use client'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { CHAT_FAQS } from '@/lib/chatFaq'
import { MessageCircle, X, Send, ArrowLeft, Loader2 } from 'lucide-react'

const SESSION_STORAGE_KEY = 'eh_chat_session_id'

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState('faq') // 'faq' | 'live'
  const [unread, setUnread] = useState(0)

  // FAQ thread: locally-built conversation of clicked questions + canned answers
  const [faqThread, setFaqThread] = useState([
    { type: 'bot', text: "Hi! I'm the ElevateHours assistant. Pick a question below, or talk to a real person any time." },
  ])
  const [answeredIds, setAnsweredIds] = useState([])

  // Live chat state
  const [authUser, setAuthUser] = useState(null)
  const [session, setSession] = useState(null) // { id, status }
  const [messages, setMessages] = useState([])
  const [needsContactInfo, setNeedsContactInfo] = useState(false)
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [draft, setDraft] = useState('')
  const [starting, setStarting] = useState(false)
  const [sending, setSending] = useState(false)

  const scrollRef = useRef(null)
  const channelRef = useRef(null)
  const openRef = useRef(open)
  const viewRef = useRef(view)

  useEffect(() => { openRef.current = open }, [open])
  useEffect(() => { viewRef.current = view }, [view])

  // Resume an existing session (same browser / same anon auth user) on load
  useEffect(() => {
    let cancelled = false

    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (cancelled) return
        setAuthUser(user || null)

        const storedId = typeof window !== 'undefined' ? localStorage.getItem(SESSION_STORAGE_KEY) : null
        if (!storedId || !user) return

        const { data: existing } = await supabase
          .from('chat_sessions')
          .select('id, status, visitor_uid')
          .eq('id', storedId)
          .maybeSingle()

        if (cancelled || !existing || existing.visitor_uid !== user.id) return

        setSession(existing)
        setView('live')
        loadMessages(existing.id)
        subscribeToSession(existing.id)
      } catch (err) {
        console.error('ChatWidget init failed', err)
      }
    }

    init()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [faqThread, messages, open, view])

  useEffect(() => {
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current)
    }
  }, [])

  async function loadMessages(sessionId) {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
      if (error) throw error
      setMessages(data || [])
    } catch (err) {
      console.error('Could not load chat messages', err)
    }
  }

  function subscribeToSession(sessionId) {
    if (channelRef.current) supabase.removeChannel(channelRef.current)

    const channel = supabase
      .channel(`chat_session_${sessionId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new])
          const isViewingLive = viewRef.current === 'live'
          if (payload.new.sender === 'admin' && (!openRef.current || !isViewingLive)) {
            setUnread((u) => u + 1)
          }
        }
      )
      .subscribe()

    channelRef.current = channel
  }

  function handleFaqClick(faq) {
    setFaqThread((prev) => [...prev, { type: 'user', text: faq.question }, { type: 'bot', text: faq.answer }])
    setAnsweredIds((prev) => [...prev, faq.id])
  }

  async function beginLiveChat() {
    if (session) {
      setView('live')
      setUnread(0)
      return
    }

    // Show the contact form immediately so the button always visibly does
    // something, even if the auth check below is slow or fails.
    setView('live')
    setNeedsContactInfo(true)

    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error

      if (user && !user.is_anonymous) {
        // Real logged-in platform user — skip the contact form
        setAuthUser(user)
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle()
        await createSession(user, profile?.full_name || '', user.email || '')
      }
    } catch (err) {
      // Fall back to the guest contact form, which is already showing.
      console.error('Auth check failed, falling back to guest form', err)
    }
  }

  async function createSession(user, name, email) {
    setStarting(true)
    try {
      const { data: newSession, error } = await supabase
        .from('chat_sessions')
        .insert({
          visitor_uid: user.id,
          visitor_name: name || null,
          visitor_email: email || null,
          source_page: typeof window !== 'undefined' ? window.location.pathname : null,
          status: 'open',
        })
        .select()
        .single()

      if (error) throw error
      if (!newSession) return

      localStorage.setItem(SESSION_STORAGE_KEY, newSession.id)
      setSession(newSession)
      setNeedsContactInfo(false)
      setView('live')
      setUnread(0)
      loadMessages(newSession.id)
      subscribeToSession(newSession.id)
    } catch (err) {
      console.error('Could not start chat session', err)
    } finally {
      setStarting(false)
    }
  }

  async function handleContactSubmit(e) {
    e.preventDefault()
    if (!guestName.trim() || !guestEmail.trim()) return

    setStarting(true)
    try {
      let { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously()
        if (anonError || !anonData?.user) {
          throw anonError || new Error('Anonymous sign-in returned no user — is it enabled in Supabase Auth settings?')
        }
        user = anonData.user
      }

      setAuthUser(user)
      await createSession(user, guestName.trim(), guestEmail.trim())
    } catch (err) {
      console.error('Could not start guest session', err)
      setStarting(false)
    }
  }

  async function handleSend(e) {
    e.preventDefault()
    if (!draft.trim() || !session || sending) return

    setSending(true)
    const content = draft.trim()
    setDraft('')

    try {
      const { error } = await supabase.from('chat_messages').insert({
        session_id: session.id,
        sender: 'visitor',
        content,
      })
      if (error) throw error
    } catch (err) {
      console.error('Message failed to send', err)
    } finally {
      setSending(false)
    }
  }

  function togglePanel() {
    setOpen((o) => {
      const next = !o
      if (next && view === 'live') setUnread(0)
      return next
    })
  }

  return (
    <>
      <button
        onClick={togglePanel}
        aria-label={open ? 'Close chat' : 'Open chat'}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 998,
          width: 56, height: 56, borderRadius: '50%',
          background: 'var(--brand)', color: 'white', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-brand, 0 8px 24px rgba(13,115,119,0.3))',
          cursor: 'pointer', transition: 'transform 0.18s ease',
        }}
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
        {!open && unread > 0 && (
          <span style={{
            position: 'absolute', top: -2, right: -2, background: 'var(--red)', color: 'white',
            fontSize: '0.68rem', fontWeight: 800, minWidth: 18, height: 18, borderRadius: 9,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px',
            border: '2px solid var(--bg)',
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'fixed', bottom: 92, right: 24, zIndex: 998,
          width: 360, maxWidth: 'calc(100vw - 32px)', height: 520, maxHeight: 'calc(100vh - 140px)',
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg, 16px)',
          boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
          fontFamily: 'Inter, -apple-system, sans-serif',
        }}>
          {/* Header */}
          <div style={{
            padding: '0.9rem 1rem', background: 'var(--brand)', color: 'white',
            display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0,
          }}>
            {view === 'live' && session && (
              <button
                onClick={() => setView('faq')}
                aria-label="Back to FAQ"
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', padding: 0 }}
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>ElevateHours Assistant</div>
              <div style={{ fontSize: '0.72rem', opacity: 0.85 }}>
                {view === 'live' && session ? (session.status === 'closed' ? 'Chat closed' : "We'll reply as soon as we can") : 'Ask a quick question'}
              </div>
            </div>
          </div>

          {/* Body */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {view === 'faq' && (
              <>
                {faqThread.map((m, i) => (
                  <ChatBubble key={i} fromUser={m.type === 'user'} text={m.text} />
                ))}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.3rem' }}>
                  {CHAT_FAQS.filter((f) => !answeredIds.includes(f.id)).map((f) => (
                    <button
                      key={f.id}
                      onClick={() => handleFaqClick(f)}
                      style={{
                        textAlign: 'left', padding: '0.55rem 0.8rem', borderRadius: 10,
                        border: '1px solid var(--border)', background: 'var(--surface-2)',
                        color: 'var(--text-2)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      {f.question}
                    </button>
                  ))}
                </div>
              </>
            )}

            {view === 'live' && !session && needsContactInfo && (
              <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <ChatBubble fromUser={false} text="Sure — just need your name and email so we can follow up if you step away." />
                <input
                  required value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Your name"
                  style={inputStyle}
                />
                <input
                  required type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="Your email"
                  style={inputStyle}
                />
                <button
                  type="submit" disabled={starting}
                  style={{
                    padding: '0.6rem', borderRadius: 10, border: 'none', background: 'var(--brand)', color: 'white',
                    fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: '0.4rem',
                  }}
                >
                  {starting ? <Loader2 size={14} className="eh-spin" /> : 'Start chat'}
                </button>
              </form>
            )}

            {view === 'live' && session && messages.map((m) => (
              <ChatBubble key={m.id} fromUser={m.sender === 'visitor'} text={m.content} />
            ))}
          </div>

          {/* Footer */}
          {view === 'faq' && (
            <div style={{ padding: '0.8rem 1rem', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
              <button
                onClick={beginLiveChat}
                style={{
                  width: '100%', padding: '0.65rem', borderRadius: 10, border: '1px solid var(--brand)',
                  background: 'var(--brand-light)', color: 'var(--brand-dark)', fontWeight: 700,
                  fontSize: '0.82rem', cursor: 'pointer',
                }}
              >
                Talk to a real person
              </button>
            </div>
          )}

          {view === 'live' && session && session.status !== 'closed' && (
            <form onSubmit={handleSend} style={{ padding: '0.7rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
              <input
                value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type a message..."
                style={{ ...inputStyle, margin: 0, flex: 1 }}
              />
              <button
                type="submit" disabled={sending || !draft.trim()}
                style={{
                  width: 40, height: 40, borderRadius: 10, border: 'none', background: 'var(--brand)', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
                  opacity: sending || !draft.trim() ? 0.6 : 1,
                }}
              >
                <Send size={16} />
              </button>
            </form>
          )}

          {view === 'live' && session && session.status === 'closed' && (
            <div style={{ padding: '0.8rem 1rem', borderTop: '1px solid var(--border)', fontSize: '0.78rem', color: 'var(--text-3)', textAlign: 'center', flexShrink: 0 }}>
              This chat was closed. Reopen the widget any time to start a new one.
            </div>
          )}
        </div>
      )}

      <style jsx global>{`
        .eh-spin { animation: eh-chat-spin 0.8s linear infinite; }
        @keyframes eh-chat-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  )
}

function ChatBubble({ fromUser, text }) {
  return (
    <div style={{ display: 'flex', justifyContent: fromUser ? 'flex-end' : 'flex-start' }}>
      <div style={{
        maxWidth: '80%', padding: '0.55rem 0.8rem', borderRadius: 12,
        fontSize: '0.82rem', lineHeight: 1.5,
        background: fromUser ? 'var(--brand)' : 'var(--surface-2)',
        color: fromUser ? 'white' : 'var(--text-2)',
        borderBottomRightRadius: fromUser ? 4 : 12,
        borderBottomLeftRadius: fromUser ? 12 : 4,
      }}>
        {text}
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '0.6rem 0.8rem', borderRadius: 10,
  border: '1px solid var(--border)', fontSize: '0.82rem', boxSizing: 'border-box',
  background: 'var(--bg-2)', color: 'var(--text)', outline: 'none',
}
