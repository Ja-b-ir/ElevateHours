'use client'
import { useAdmin } from '../layout'
import AdminLiveChat from '@/components/AdminLiveChat'

export default function LiveChatPage() {
  const { admin } = useAdmin()
  const permissions = admin?.permissions || []

  if (!permissions.includes('live_chat')) {
    return (
      <div style={{ color: 'var(--text-3, #888)', fontSize: '0.85rem' }}>
        You don't have access to Live Chat. Ask a super admin to grant you the "live_chat" permission.
      </div>
    )
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.25rem' }}>Live Chat</h1>
      <AdminLiveChat />
    </div>
  )
}
