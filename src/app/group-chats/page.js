'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { Users, GraduationCap, Briefcase } from 'lucide-react'

export default function GroupChatsInbox() {
  const router = useRouter()
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      // Programs I created, with chat enabled
      const { data: created } = await supabase
        .from('programs')
        .select('*')
        .eq('creator_id', user.id)
        .eq('group_chat_enabled', true)

      // Programs I'm enrolled in, with chat enabled
      const { data: myEnrollments } = await supabase.from('program_enrollments').select('program_id').eq('student_id', user.id)
      const enrolledIds = (myEnrollments || []).map(e => e.program_id)
      let enrolled = []
      if (enrolledIds.length > 0) {
        const { data } = await supabase
          .from('programs')
          .select('*')
          .in('id', enrolledIds)
          .eq('group_chat_enabled', true)
        enrolled = data || []
      }

      const allPrograms = [...(created || []), ...enrolled]
      const uniquePrograms = Array.from(new Map(allPrograms.map(p => [p.id, p])).values())

      // Get creator names and last message for each
      const creatorIds = Array.from(new Set(uniquePrograms.map(p => p.creator_id)))
      let creatorById = {}
      if (creatorIds.length > 0) {
        const { data: creators } = await supabase.from('profiles').select('id, full_name').in('id', creatorIds)
        creatorById = Object.fromEntries((creators || []).map(c => [c.id, c]))
      }

      const enriched = await Promise.all(uniquePrograms.map(async (p) => {
        const { data: lastMsg } = await supabase
          .from('program_messages')
          .select('content, created_at')
          .eq('program_id', p.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        return {
          ...p,
          creatorName: creatorById[p.creator_id]?.full_name,
          isCreator: p.creator_id === user.id,
          lastMessage: lastMsg?.content || null,
          lastAt: lastMsg?.created_at || p.created_at,
        }
      }))

      enriched.sort((a, b) => new Date(b.lastAt) - new Date(a.lastAt))
      setChats(enriched)
      setLoading(false)
    }
    init()
  }, [])

  const timeAgo = (ts) => {
    const diff = new Date() - new Date(ts)
    const mins = Math.floor(diff / 60000), hours = Math.floor(diff / 3600000), days = Math.floor(diff / 86400000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m`
    if (hours < 24) return `${hours}h`
    return `${days}d`
  }

  if (loading) return <div><Navbar /><div className="loading-wrap"><div className="spinner" /> Loading group chats...</div></div>

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="page-wrap" style={{ maxWidth: 680 }}>
        <div className="page-header">
          <h1 className="page-title">Group Chats</h1>
          <p className="page-subtitle">Updates and discussion from your courses and internships</p>
        </div>

        {chats.length === 0 ? (
          <div className="card empty-state">
            <Users size={40} style={{ margin: '0 auto 1rem', color: 'var(--border-2)' }} />
            <h3>No group chats yet</h3>
            <p>Join a program with group chat enabled, or enable it for one you created.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {chats.map(chat => {
              const TypeIcon = chat.program_type === 'Internship' ? Briefcase : GraduationCap
              return (
                <a key={chat.id} href={'/programs/chat?id=' + chat.id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '1rem 1.125rem',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)', textDecoration: 'none'
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: 'linear-gradient(135deg, var(--brand), var(--brand-mid))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                  }}>
                    <TypeIcon size={19} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>{chat.title}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-3)', flexShrink: 0 }}>{timeAgo(chat.lastAt)}</span>
                    </div>
                    <p style={{
                      color: 'var(--text-2)', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap', marginTop: '0.15rem'
                    }}>
                      {chat.lastMessage || (chat.isCreator ? 'No messages yet — say hello!' : `by ${chat.creatorName || 'Unknown'}`)}
                    </p>
                  </div>
                  {chat.isCreator && (
                    <span className="badge badge-brand" style={{ flexShrink: 0 }}>Educator</span>
                  )}
                </a>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
