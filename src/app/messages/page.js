'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { MessageSquare, Search } from 'lucide-react'

export default function MessagesInbox() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUser(user)
      await fetchConversations(user.id)
      setLoading(false)
    }
    init()
  }, [])

  const fetchConversations = async (uid) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${uid},receiver_id.eq.${uid}`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('fetchConversations error:', error)
      setConversations([])
      return
    }

    // Collect the "other person" id for every message, then fetch all those profiles in one go.
    const otherIds = Array.from(new Set((data || []).map(m => m.sender_id === uid ? m.receiver_id : m.sender_id)))
    let profilesById = {}
    if (otherIds.length > 0) {
      const { data: profilesData } = await supabase.from('profiles').select('id, full_name, account_type').in('id', otherIds)
      profilesById = Object.fromEntries((profilesData || []).map(p => [p.id, p]))
    }

    const map = new Map()
    for (const msg of data || []) {
      const otherId = msg.sender_id === uid ? msg.receiver_id : msg.sender_id
      const other = profilesById[otherId]
      if (!other) continue
      if (!map.has(otherId)) {
        map.set(otherId, {
          otherId,
          otherName: other.full_name,
          otherType: other.account_type,
          lastMessage: msg.content,
          lastAt: msg.created_at,
          unread: 0,
        })
      }
      const entry = map.get(otherId)
      if (msg.receiver_id === uid && !msg.is_read) entry.unread += 1
    }
    setConversations(Array.from(map.values()))
  }

  const timeAgo = (ts) => {
    const diff = new Date() - new Date(ts)
    const mins = Math.floor(diff / 60000), hours = Math.floor(diff / 3600000), days = Math.floor(diff / 86400000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m`
    if (hours < 24) return `${hours}h`
    return `${days}d`
  }

  const filtered = conversations.filter(c => !search || c.otherName?.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <div><Navbar /><div className="loading-wrap"><div className="spinner" /> Loading messages...</div></div>

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="page-wrap" style={{ maxWidth: 680 }}>
        <div className="page-header">
          <h1 className="page-title">Messages</h1>
          <p className="page-subtitle">Direct conversations with people on ElevateHours</p>
        </div>

        <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input type="text" placeholder="Search conversations..." value={search} onChange={e => setSearch(e.target.value)} className="form-input" style={{ paddingLeft: '2.5rem' }} />
        </div>

        {filtered.length === 0 ? (
          <div className="card empty-state">
            <MessageSquare size={40} style={{ margin: '0 auto 1rem', color: 'var(--border-2)' }} />
            <h3>No messages yet</h3>
            <p>Visit someone's profile and click "Message" to start a conversation.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {filtered.map(c => (
              <a key={c.otherId} href={'/messages/conversation?id=' + c.otherId} style={{
                display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '1rem 1.125rem',
                background: c.unread > 0 ? 'var(--brand-light)' : 'var(--surface)',
                border: `1px solid ${c.unread > 0 ? 'var(--brand)' : 'var(--border)'}`,
                borderRadius: 'var(--radius)', textDecoration: 'none'
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, var(--brand), var(--brand-mid))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700
                }}>
                  {c.otherName?.[0]?.toUpperCase() || '?'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>{c.otherName}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-3)', flexShrink: 0 }}>{timeAgo(c.lastAt)}</span>
                  </div>
                  <p style={{
                    color: c.unread > 0 ? 'var(--text)' : 'var(--text-2)', fontWeight: c.unread > 0 ? 600 : 400,
                    fontSize: '0.825rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '0.15rem'
                  }}>
                    {c.lastMessage}
                  </p>
                </div>
                {c.unread > 0 && (
                  <span style={{
                    background: 'var(--brand)', color: 'white', borderRadius: '50%',
                    minWidth: 20, height: 20, padding: '0 5px', fontSize: '0.7rem', fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    {c.unread}
                  </span>
                )}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
