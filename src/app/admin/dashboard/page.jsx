'use client'
import { useEffect, useState } from 'react'
import { useAdmin } from '../layout'
import { supabase } from '@/lib/supabase'
import { MessageSquare, Mail } from 'lucide-react'

export default function AdminDashboardPage() {
  const { admin } = useAdmin()
  const [openChats, setOpenChats] = useState(null)
  const [messageCount, setMessageCount] = useState(null)

  useEffect(() => {
    const permissions = admin?.permissions || []

    if (permissions.includes('live_chat')) {
      supabase
        .from('chat_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'open')
        .then(({ count }) => setOpenChats(count ?? 0))
    }

    if (permissions.includes('contact_messages')) {
      supabase
        .from('contact_messages')
        .select('id', { count: 'exact', head: true })
        .then(({ count }) => setMessageCount(count ?? 0))
    }
  }, [admin])

  return (
    <div>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.3rem' }}>Welcome back, {admin?.name?.split(' ')[0]}</h1>
      <p style={{ color: 'var(--text-3, #888)', fontSize: '0.85rem', marginBottom: '2rem' }}>Here's what's happening on ElevateHours.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', maxWidth: 640 }}>
        {openChats !== null && (
          
            href="/admin/live-chat"
            style={{ display: 'block', textDecoration: 'none', background: 'var(--surface, #fff)', border: '1px solid var(--border, #e2e2e2)', borderRadius: 14, padding: '1.5rem' }}
          >
            <MessageSquare size={20} style={{ color: 'var(--brand, #0b7375)', marginBottom: '0.75rem' }} />
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text, #111)' }}>{openChats}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-3, #888)', fontWeight: 600 }}>Open live chats</div>
          </a>
        )}

        {messageCount !== null && (
          
            href="/admin/messages"
            style={{ display: 'block', textDecoration: 'none', background: 'var(--surface, #fff)', border: '1px solid var(--border, #e2e2e2)', borderRadius: 14, padding: '1.5rem' }}
          >
            <Mail size={20} style={{ color: 'var(--brand, #0b7375)', marginBottom: '0.75rem' }} />
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text, #111)' }}>{messageCount}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-3, #888)', fontWeight: 600 }}>Contact form messages</div>
          </a>
        )}
      </div>
    </div>
  )
}
