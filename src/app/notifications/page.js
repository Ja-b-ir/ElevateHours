'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

const TYPE_ICONS = {
  application: '📋',
  accepted: '🎉',
  rejected: '❌',
  confirmed: '✅',
  gift: '🎁',
  general: '📢'
}

const TYPE_COLORS = {
  application: '#dbeafe',
  accepted: '#dcfce7',
  rejected: '#fee2e2',
  confirmed: '#dcfce7',
  gift: '#fef3c7',
  general: '#f1f5f9'
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
      await fetchNotifications(user.id)
      setLoading(false)
    }
    init()
  }, [])

  const fetchNotifications = async (uid) => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
    setNotifications(data || [])
    // Mark all as read
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', uid)
      .eq('is_read', false)
  }

  const clearAll = async () => {
    await supabase.from('notifications').delete().eq('user_id', user.id)
    setNotifications([])
  }

  const timeAgo = (timestamp) => {
    const diff = new Date() - new Date(timestamp)
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  if (loading) return <div><Navbar /><div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: '#64748b' }}>Loading...</div></div>

  return (
    <div style={{ background: '#F8F9FA', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Notifications</h1>
            <p style={{ color: '#64748b', marginTop: '0.25rem' }}>{notifications.length} total notifications</p>
          </div>
          {notifications.length > 0 && (
            <button onClick={clearAll} style={{
              background: '#fee2e2', color: '#991b1b', padding: '0.5rem 1rem',
              borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem'
            }}>
              Clear All
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: 16, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔔</div>
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No notifications yet</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>You'll be notified when someone applies to your requests or responds to your applications.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {notifications.map(notif => (
              <div key={notif.id} style={{
                background: notif.is_read ? 'white' : TYPE_COLORS[notif.type] || '#f1f5f9',
                borderRadius: 14, padding: '1.25rem',
                border: `1px solid ${notif.is_read ? '#e2e8f0' : '#cbd5e1'}`,
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                display: 'flex', gap: '1rem', alignItems: 'flex-start'
              }}>
                <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>
                  {TYPE_ICONS[notif.type] || '📢'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                    {notif.title}
                  </div>
                  <p style={{ color: '#374151', fontSize: '0.875rem', lineHeight: 1.6 }}>
                    {notif.message}
                  </p>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                    {timeAgo(notif.created_at)}
                  </div>
                </div>
                {!notif.is_read && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0D7377', flexShrink: 0, marginTop: 4 }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
