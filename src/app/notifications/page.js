'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { Bell, Trash2, ClipboardList, Check, X, Zap, Info } from 'lucide-react'

const TYPE_CONFIG = {
  application: { bg: 'var(--blue-light)', border: 'var(--blue)', icon: ClipboardList },
  accepted: { bg: 'var(--green-light)', border: 'var(--green)', icon: Check },
  rejected: { bg: 'var(--red-light)', border: 'var(--red)', icon: X },
  confirmed: { bg: 'var(--green-light)', border: 'var(--green)', icon: Check },
  gift: { bg: 'var(--amber-light)', border: 'var(--amber)', icon: Zap },
  general: { bg: 'var(--surface-3)', border: 'var(--border)', icon: Info },
}

export default function NotificationsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUser(user)
      const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      setNotifications(data || [])
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false)
      setLoading(false)
    }
    init()
  }, [])

  const clearAll = async () => {
    await supabase.from('notifications').delete().eq('user_id', user.id)
    setNotifications([])
  }

  const timeAgo = (ts) => {
    const diff = new Date() - new Date(ts)
    const mins = Math.floor(diff / 60000), hours = Math.floor(diff / 3600000), days = Math.floor(diff / 86400000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  if (loading) return <div><Navbar /><div className="loading-wrap"><div className="spinner" /> Loading...</div></div>

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="page-wrap" style={{ maxWidth: 680 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">Notifications</h1>
            <p className="page-subtitle">{notifications.length} total</p>
          </div>
          {notifications.length > 0 && (
            <button onClick={clearAll} className="btn btn-secondary btn-sm">
              <Trash2 size={13} /> Clear all
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="card empty-state">
            <Bell size={40} style={{ margin: '0 auto 1rem', color: 'var(--border-2)' }} />
            <h3>No notifications yet</h3>
            <p>You'll be notified about applications, acceptances, and community activity.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {notifications.map(notif => {
              const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.general
              const Icon = cfg.icon
              const content = (
                <>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: cfg.border, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                    <Icon size={15} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.2rem', color: 'var(--text)' }}>{notif.title}</div>
                    <p style={{ color: 'var(--text-2)', fontSize: '0.825rem', lineHeight: 1.6 }}>{notif.message}</p>
                    <div style={{ color: 'var(--text-3)', fontSize: '0.72rem', marginTop: '0.375rem' }}>{timeAgo(notif.created_at)}</div>
                  </div>
                  {!notif.is_read && (
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--brand)', flexShrink: 0, marginTop: 4 }} />
                  )}
                </>
              )
              const cardStyle = {
                background: notif.is_read ? 'var(--surface)' : cfg.bg,
                border: `1px solid ${notif.is_read ? 'var(--border)' : cfg.border}`,
                borderRadius: 'var(--radius)',
                padding: '1rem 1.125rem',
                display: 'flex', gap: '0.875rem', alignItems: 'flex-start',
                transition: 'all var(--transition)'
              }
              return notif.related_id ? (
                <a key={notif.id} href="/transactions" style={{ ...cardStyle, textDecoration: 'none' }}>{content}</a>
              ) : (
                <div key={notif.id} style={cardStyle}>{content}</div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
